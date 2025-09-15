# backend/train_model.py
import os
import pickle
import fitz  # PyMuPDF
import nltk
from nltk.tokenize import sent_tokenize
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss  # The library for our vector database
import warnings
from models_def import PDFKnowledgeBase

warnings.filterwarnings('ignore')

try:
    # 'punkt' is the correct data package for sentence tokenization
    nltk.download('punkt', quiet=True)
    print("NLTK 'punkt' tokenizer is available.")
except Exception as e:
    print(f"Warning: Could not download NLTK 'punkt' data: {e}")

class PDFKnowledgeBaseBuilder:
    """
    This class builds a complete, searchable knowledge base from a folder of PDFs.
    It extracts text, creates smart chunks, and generates a FAISS index for fast search.
    """
    def __init__(self, subject_name, pdf_folder_path):
        self.kb = PDFKnowledgeBase(subject_name, pdf_folder_path)
        # Use a model specifically designed for semantic search and retrieval
        self.embedding_model = SentenceTransformer('msmarco-distilbert-base-v4')

    def _extract_text_from_pdfs(self):
        """Extracts and cleans text from all PDFs in the specified folder."""
        full_text = ""
        print(f"  -> Scanning folder: {self.kb.pdf_folder_path}")
        if not os.path.isdir(self.kb.pdf_folder_path):
            print(f"  -> ❌ ERROR: Folder not found.")
            return None
        
        pdf_files = [f for f in os.listdir(self.kb.pdf_folder_path) if f.lower().endswith('.pdf')]
        if not pdf_files:
            print(f"  -> ❌ ERROR: No PDF files found in '{self.kb.subject_name}'.")
            return None

        print(f"  -> Found {len(pdf_files)} PDF(s). Extracting text...")
        for pdf_filename in pdf_files:
            pdf_path = os.path.join(self.kb.pdf_folder_path, pdf_filename)
            try:
                with fitz.open(pdf_path) as doc:
                    for page in doc:
                        # Replace newlines with spaces for cleaner sentence tokenization
                        full_text += page.get_text().replace('\n', ' ') + " "
            except Exception as e:
                print(f"     -> Warning: Could not read {pdf_filename}. Error: {e}")
        return full_text

    def _chunk_text(self, text, sentences_per_chunk=10, overlap=3):
        """Splits text into overlapping chunks of N sentences to preserve meaning and context."""
        print(f"  -> Splitting text into chunks of ~{sentences_per_chunk} sentences with {overlap} overlap...")
        
        sentences = sent_tokenize(text)
        chunks = []
        i = 0
        while i < len(sentences):
            chunk = " ".join(sentences[i:i + sentences_per_chunk])
            if len(chunk.split()) > 10:
                chunks.append(chunk)
            i += sentences_per_chunk - overlap  # Move forward with overlap
        self.kb.chunks = chunks
        print(f"  -> Created {len(self.kb.chunks)} overlapping chunks.")

    def build(self):
        """The main method to build the entire knowledge base."""
        print(f"\n--- Building Knowledge Base for: {self.kb.subject_name.upper()} ---")
        
        full_text = self._extract_text_from_pdfs()
        if not full_text or not full_text.strip():
            print("  -> ❌ ERROR: No text could be extracted from PDFs.")
            return None
            
        self._chunk_text(full_text)
        if not self.kb.chunks:
            print("  -> ❌ ERROR: Failed to create valid text chunks.")
            return None
        
        print(f"  -> Creating semantic embeddings for {len(self.kb.chunks)} chunks...")
        chunk_embeddings_np = self.embedding_model.encode(self.kb.chunks, show_progress_bar=True)
        
        print("  -> Building FAISS index for ultra-fast search...")
        embedding_dim = chunk_embeddings_np.shape[1]
        self.kb.faiss_index = faiss.IndexFlatIP(embedding_dim)
        
        # Normalize vectors for accurate Inner Product similarity search
        faiss.normalize_L2(chunk_embeddings_np)
        self.kb.faiss_index.add(chunk_embeddings_np.astype('float32'))
        
        print(f"--- ✅ Knowledge Base for {self.kb.subject_name.upper()} built successfully! ---")
        return self.kb

def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    KNOWLEDGE_BASE_DIR = os.path.join(BASE_DIR, 'knowledge_base')
    MODELS_OUTPUT_DIR = os.path.join(BASE_DIR, '..', 'src', 'components')
    os.makedirs(MODELS_OUTPUT_DIR, exist_ok=True)

    subjects_to_train = {
        'chemistry': 'chem1.pkl',
        'biology': 'biology_knowledge_base.pkl',
        'physics': 'physics_knowledge_base.pkl'
    }

    for subject, pkl_name in subjects_to_train.items():
        subject_pdf_folder = os.path.join(KNOWLEDGE_BASE_DIR, subject)
        
        builder = PDFKnowledgeBaseBuilder(subject, subject_pdf_folder)
        knowledge_base_object = builder.build()
        
        if knowledge_base_object:
            output_path = os.path.join(MODELS_OUTPUT_DIR, pkl_name)
            print(f"  -> 💾 Saving indexed knowledge base to: {output_path}")
            with open(output_path, 'wb') as f:
                pickle.dump(knowledge_base_object, f)
            print("  -> ✅ Save complete.")
        else:
            print(f"--- ⚠️  Skipping {subject.upper()} due to errors. ---")

    print("\n🎉 All knowledge bases have been built. You can now run your app.py server. 🎉")

if __name__ == '__main__':
    main()