import os
import pickle
import json
import re
import ast
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
import faiss
import sqlite3
import uuid
from werkzeug.middleware.proxy_fix import ProxyFix

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Gemini setup
if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY not found in environment variables.")
    print("   Please create a .env file in the backend directory with your GEMINI_API_KEY")
    print("   Example: GEMINI_API_KEY=your_actual_api_key_here")
    # Don't raise error, let it continue with fallback responses
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        print("✅ Gemini API configured successfully")
    except Exception as e:
        print(f"❌ Error configuring Gemini API: {e}")

# --- App Setup ---
app = Flask(__name__)
# Enhanced CORS configuration
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

# --- Path Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'src', 'components')
CACHE_DIR = os.path.join(BASE_DIR, 'quiz_cache')
os.makedirs(CACHE_DIR, exist_ok=True)

# --- Load AI Components ---
print("🧠 Loading AI components...")

# Embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("✅ Embedding Model ('all-MiniLM-L6-v2') loaded.")

# Load Knowledge Bases
knowledge_bases = {}
kb_paths = {
    'chemistry': os.path.join(MODELS_DIR, 'chem1.pkl'),
    'biology': os.path.join(MODELS_DIR, 'biology_knowledge_base.pkl'),
    'physics': os.path.join(MODELS_DIR, 'physics_knowledge_base.pkl')
}

for subject, path in kb_paths.items():
    try:
        with open(path, 'rb') as f:
            kb = pickle.load(f)
            knowledge_bases[subject] = kb
        print(f"✅ Knowledge Base for '{subject}' loaded.")
    except Exception as e:
        print(f"❌ Could not load KB for '{subject}'. Error: {e}")

# --- Database Setup ---
DB_PATH = os.path.join(BASE_DIR, 'users.db')

def get_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise

def init_db():
    with get_db() as conn:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            quiz_id TEXT,
            subject TEXT,
            standard TEXT,
            score INTEGER,
            total_questions INTEGER,
            timestamp DATETIME
        )''')
        c.execute('''CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id TEXT,
            user_id TEXT,
            user_name TEXT,
            subject TEXT,
            standard TEXT,
            score INTEGER,
            coin_type TEXT,
            timestamp DATETIME
        )''')
        c.execute('''CREATE TABLE IF NOT EXISTS user_streaks (
            user_id TEXT PRIMARY KEY,
            current_streak INTEGER,
            last_attempt_date DATE
        )''')
        conn.commit()

init_db()

# --- Streak Logic ---
def update_streak(user_id, timestamp):
    with get_db() as conn:
        c = conn.cursor()
        c.execute('SELECT current_streak, last_attempt_date FROM user_streaks WHERE user_id=?', (user_id,))
        row = c.fetchone()
        today = timestamp.date()
        streak = 1  # Default for new users

        if row:
            try:
                last_attempt = datetime.strptime(row['last_attempt_date'], '%Y-%m-%d').date()
            except ValueError:
                last_attempt = datetime.strptime(row['last_attempt_date'], '%Y-%m-%d %H:%M:%S').date()
            
            days_diff = (today - last_attempt).days
            if days_diff == 1:
                streak = row['current_streak'] + 1
            elif days_diff > 1:
                streak = 1  # Reset streak
            else:
                streak = row['current_streak']  # Same day, no change

        c.execute('INSERT OR REPLACE INTO user_streaks (user_id, current_streak, last_attempt_date) VALUES (?, ?, ?)',
                  (user_id, streak, timestamp))
        conn.commit()
        return streak

# --- Leaderboard Logic ---
def update_leaderboard(quiz_id, user_id, user_name, subject, standard, score, timestamp):
    with get_db() as conn:
        c = conn.cursor()
        c.execute('INSERT OR REPLACE INTO leaderboard (quiz_id, user_id, user_name, subject, standard, score, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  (quiz_id, user_id, user_name, subject, standard, score, timestamp))
        conn.commit()

        c.execute('SELECT id, score, timestamp FROM leaderboard WHERE quiz_id=? AND subject=? AND standard=? ORDER BY score DESC, timestamp ASC LIMIT 10',
                  (quiz_id, subject, standard))
        top_entries = c.fetchall()

        for idx, entry in enumerate(top_entries[:3]):
            coin = 'gold' if idx == 0 else 'silver' if idx == 1 else 'bronze'
            c.execute('UPDATE leaderboard SET coin_type=? WHERE id=?', (coin, entry['id']))
        for entry in top_entries[3:]:
            c.execute('UPDATE leaderboard SET coin_type=NULL WHERE id=?', (entry['id']))
        conn.commit()

# --- Health Check Endpoint ---
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        with get_db() as conn:
            c = conn.cursor()
            c.execute('SELECT 1')
            c.fetchone()
        
        # Test knowledge bases
        kb_status = {}
        for subject, kb in knowledge_bases.items():
            kb_status[subject] = {
                'loaded': kb is not None,
                'has_index': hasattr(kb, 'faiss_index') if kb else False
            }
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'knowledge_bases': kb_status,
            'gemini_api': 'configured' if GEMINI_API_KEY else 'missing'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

# --- Chat Endpoint ---
@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data provided.'}), 400

        user_message = data.get('message', '')
        subject = data.get('subject', 'biology').lower()

        # Handle ping message for server status check
        if user_message == 'ping':
            return jsonify({'response': 'pong', 'status': 'connected'})

        if not user_message:
            return jsonify({'error': 'No message provided.'}), 400

        if subject == 'maths':
            if not GEMINI_API_KEY:
                return jsonify({'response': "I'm sorry, but I'm currently not able to provide detailed maths explanations. Please check your Gemini API configuration.", 'confidence': 0.0})
            
            try:
                prompt = (
                    f"You are an expert maths tutor for high school students. Answer the following question in a clear, step-by-step manner using simple language. "
                    f"Include examples or analogies where helpful to make the explanation student-friendly.\nQuestion: {user_message}"
                )
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                answer = response.text.strip()
                return jsonify({'response': answer, 'confidence': 0.98})
            except Exception as e:
                return jsonify({'response': f"I'm sorry, I encountered an error while processing your maths question. Please try again later. Error: {str(e)}", 'confidence': 0.0})

        kb = knowledge_bases.get(subject)
        if not kb or not hasattr(kb, 'faiss_index'):
            # Fallback to direct Gemini response if knowledge base is not available
            if not GEMINI_API_KEY:
                return jsonify({'response': f"I'm sorry, but I'm currently not able to provide detailed {subject} explanations. Please check your Gemini API configuration.", 'confidence': 0.0})
            
            try:
                prompt = (
                    f"You are an expert tutor for high school {subject}. Answer the following question in a clear, concise, and student-friendly way. "
                    f"Use simple language, analogies, and real-world examples to help the student understand the concept better.\nQuestion: {user_message}"
                )
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                answer = response.text.strip()
                return jsonify({'response': answer, 'confidence': 0.95})
            except Exception as e:
                return jsonify({'response': f"I'm sorry, I encountered an error while processing your {subject} question. Please try again later. Error: {str(e)}", 'confidence': 0.0})

        try:
            question_embedding = embedding_model.encode([user_message]).astype('float32')
            faiss.normalize_L2(question_embedding)
            distances, indices = kb.faiss_index.search(question_embedding, 5)
            context = " ".join([kb.chunks[i] for i in indices[0] if i != -1])

            if not context:
                # Fallback to direct response if no context found
                if not GEMINI_API_KEY:
                    return jsonify({'response': f"I'm sorry, but I'm currently not able to provide detailed {subject} explanations. Please check your Gemini API configuration.", 'confidence': 0.0})
                
                try:
                    prompt = (
                        f"You are an expert tutor for high school {subject}. Answer the following question in a clear, concise, and student-friendly way. "
                        f"Use simple language, analogies, and real-world examples to help the student understand the concept better.\nQuestion: {user_message}"
                    )
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    response = model.generate_content(prompt)
                    answer = response.text.strip()
                    return jsonify({'response': answer, 'confidence': 0.90})
                except Exception as e:
                    return jsonify({'response': f"I'm sorry, I encountered an error while processing your {subject} question. Please try again later. Error: {str(e)}", 'confidence': 0.0})

            if not GEMINI_API_KEY:
                return jsonify({'response': f"I'm sorry, but I'm currently not able to provide detailed {subject} explanations. Please check your Gemini API configuration.", 'confidence': 0.0})
            
            try:
                prompt = (
                    f"You are an expert tutor for high school {subject}. Using the provided context, answer the student's question in a clear, concise, and student-friendly way. "
                    f"Use simple language, analogies, and real-world examples to help the student understand the concept better. "
                    f"Make the explanation engaging and relatable to everyday life.\nContext: {context}\nQuestion: {user_message}"
                )
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                answer = response.text.strip()
                return jsonify({'response': answer, 'confidence': 0.98})
            except Exception as e:
                return jsonify({'response': f"I'm sorry, I encountered an error while processing your {subject} question. Please try again later. Error: {str(e)}", 'confidence': 0.0})
        except Exception as kb_error:
            # Fallback if knowledge base search fails
            if not GEMINI_API_KEY:
                return jsonify({'response': f"I'm sorry, but I'm currently not able to provide detailed {subject} explanations. Please check your Gemini API configuration.", 'confidence': 0.0})
            
            try:
                prompt = (
                    f"You are an expert tutor for high school {subject}. Answer the following question in a clear, concise, and student-friendly way. "
                    f"Use simple language, analogies, and real-world examples to help the student understand the concept better.\nQuestion: {user_message}"
                )
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                answer = response.text.strip()
                return jsonify({'response': answer, 'confidence': 0.85})
            except Exception as e:
                return jsonify({'response': f"I'm sorry, I encountered an error while processing your {subject} question. Please try again later. Error: {str(e)}", 'confidence': 0.0})
    except Exception as e:
        app.logger.error(f"Chat endpoint error: {str(e)}")
        return jsonify({'error': f"Internal server error: {str(e)}"}), 500

# --- Quiz Submission Endpoint ---
@app.route('/api/quiz/submit', methods=['POST', 'OPTIONS'])
def submit_quiz():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.json
        user_id = data.get('user_id')
        user_name = data.get('user_name', 'Anonymous')
        quiz_id = data.get('quiz_id', str(uuid.uuid4()))
        subject = data.get('subject')
        standard = data.get('standard')
        score = data.get('score')
        total_questions = data.get('total_questions', 10)
        timestamp = datetime.utcnow()

        if not all([user_id, subject, standard, score is not None]):
            return jsonify({'error': 'Missing required fields.'}), 400

        with get_db() as conn:
            c = conn.cursor()
            c.execute('INSERT INTO quiz_attempts (user_id, quiz_id, subject, standard, score, total_questions, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
                      (user_id, quiz_id, subject, standard, score, total_questions, timestamp))
            conn.commit()

        streak = update_streak(user_id, timestamp)
        update_leaderboard(quiz_id, user_id, user_name, subject, standard, score, timestamp)
        return jsonify({'success': True, 'streak': streak})
    except Exception as e:
        app.logger.error(f"Quiz submission error: {str(e)}")
        return jsonify({'error': f"Failed to submit quiz: {str(e)}"}), 500

# --- Leaderboard Endpoint ---
@app.route('/api/quiz/leaderboard', methods=['GET', 'OPTIONS'])
def get_leaderboard():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        quiz_id = request.args.get('quiz_id')
        subject = request.args.get('subject')
        standard = request.args.get('standard')

        if not all([quiz_id, subject, standard]):
            return jsonify({'error': 'Missing required parameters.'}), 400

        with get_db() as conn:
            c = conn.cursor()
            c.execute('SELECT user_name, score, coin_type FROM leaderboard WHERE quiz_id=? AND subject=? AND standard=? ORDER BY score DESC, timestamp ASC LIMIT 10',
                      (quiz_id, subject, standard))
            rows = c.fetchall()
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        app.logger.error(f"Leaderboard error: {str(e)}")
        return jsonify({'error': f"Failed to fetch leaderboard: {str(e)}"}), 500

# --- Streak Endpoint ---
@app.route('/api/quiz/streak', methods=['GET', 'OPTIONS'])
def get_streak():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'Missing user_id.'}), 400

        with get_db() as conn:
            c = conn.cursor()
            c.execute('SELECT current_streak FROM user_streaks WHERE user_id=?', (user_id,))
            row = c.fetchone()
        return jsonify({'streak': row['current_streak'] if row else 0})
    except Exception as e:
        app.logger.error(f"Streak error: {str(e)}")
        return jsonify({'error': f"Failed to fetch streak: {str(e)}"}), 500

# --- Progress Endpoint ---
@app.route('/api/quiz/progress', methods=['GET', 'OPTIONS'])
def get_progress():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'Missing user_id.'}), 400

        with get_db() as conn:
            c = conn.cursor()
            c.execute('''
                SELECT subject, standard, COUNT(*) as attempts, 
                       AVG(score) as avg_score, MAX(score) as best_score
                FROM quiz_attempts 
                WHERE user_id=? 
                GROUP BY subject, standard
            ''', (user_id,))
            rows = c.fetchall()
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        app.logger.error(f"Progress error: {str(e)}")
        return jsonify({'error': f"Failed to fetch progress: {str(e)}"}), 500

# --- Quiz Generation Endpoint ---
@app.route('/api/quiz/generate', methods=['POST', 'OPTIONS'])
def generate_quiz():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.json
        subject = data.get('subject')
        module_title = data.get('module_title')
        if not all([subject, module_title]):
            return jsonify({'error': 'Missing subject or module_title.'}), 400

        cache_file = os.path.join(CACHE_DIR, f'{subject}_{module_title}.json')
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))

        prompt = (
            f"Generate 10 multiple-choice questions for high school {subject}, module: '{module_title}'. "
            f"Each question should have 4 options and specify the correct answer. "
            f"Return as a JSON array of objects with fields: question, options (array), correct (string)."
        )
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        match = re.search(r'(\[.*\])', text, re.DOTALL)
        questions = json.loads(match.group(1)) if match else ast.literal_eval(text)

        if not (isinstance(questions, list) and all('question' in q and 'options' in q and 'correct' in q for q in questions)):
            raise ValueError('Invalid question format from Gemini')

        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        return jsonify(questions)
    except Exception as e:
        app.logger.error(f"Quiz generation error: {str(e)}")
        return jsonify({'error': f"Failed to generate quiz: {str(e)}"}), 500

# --- Module Explanation Endpoint ---
@app.route('/api/module/explanation', methods=['POST', 'OPTIONS'])
def module_explanation():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.json
        subject = data.get('subject')
        module_title = data.get('module_title')
        if not all([subject, module_title]):
            return jsonify({'error': 'Missing subject or module_title.'}), 400

        cache_file = os.path.join(CACHE_DIR, f'{subject}_{module_title}_explanation.txt')
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                return jsonify({'explanation': f.read()})

        prompt = (
            f"Explain the high school {subject} module '{module_title}' in a clear, concise, and student-friendly way. "
            f"Focus on key concepts, use simple language, and include real-world relevance or examples."
        )
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        explanation = response.text.strip()
        with open(cache_file, 'w', encoding='utf-8') as f:
            f.write(explanation)
        return jsonify({'explanation': explanation})
    except Exception as e:
        app.logger.error(f"Module explanation error: {str(e)}")
        return jsonify({'error': f"Failed to generate explanation: {str(e)}"}), 500

# --- Important Topics Endpoint ---
@app.route('/api/module/important_topics', methods=['POST', 'OPTIONS'])
def module_important_topics():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.json
        subject = data.get('subject')
        module_title = data.get('module_title')
        if not all([subject, module_title]):
            return jsonify({'error': 'Missing subject or module_title.'}), 400

        cache_file = os.path.join(CACHE_DIR, f'{subject}_{module_title}_important_topics.txt')
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                return jsonify({'important_topics': f.read()})

        prompt = (
            f"List the most important topics and subtopics for high school {subject} module '{module_title}'. "
            f"Present as a concise bullet list in plain text, using student-friendly language."
        )
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        topics = response.text.strip()
        with open(cache_file, 'w', encoding='utf-8') as f:
            f.write(topics)
        return jsonify({'important_topics': topics})
    except Exception as e:
        app.logger.error(f"Important topics error: {str(e)}")
        return jsonify({'error': f"Failed to generate important topics: {str(e)}"}), 500

# --- Previous Year Questions Endpoint ---
@app.route('/api/module/previous_year_questions', methods=['POST', 'OPTIONS'])
def module_previous_year_questions():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.json
        subject = data.get('subject')
        module_title = data.get('module_title')
        if not all([subject, module_title]):
            return jsonify({'error': 'Missing subject or module_title.'}), 400

        cache_file = os.path.join(CACHE_DIR, f'{subject}_{module_title}_pyqs.txt')
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                return jsonify({'previous_year_questions': f.read()})

        prompt = (
            f"Provide 5 previous year exam questions (with answers) for high school {subject} module '{module_title}'. "
            f"Format as a numbered list in plain text, each with question and answer."
        )
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)  # Generate model's response
        pyqs = response.text.strip()
        with open(cache_file, 'w', encoding='utf-8') as f:
            f.write(pyqs)
        return jsonify({'previous_year_questions': pyqs})
    except Exception as e:
        app.logger.error(f"Previous year questions error: {str(e)}")
        return jsonify({'error': f"Failed to generate previous year questions: {str(e)}"}), 500

# --- Start Server ---
if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')