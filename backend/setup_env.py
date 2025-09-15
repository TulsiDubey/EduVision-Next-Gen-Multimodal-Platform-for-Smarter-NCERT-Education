#!/usr/bin/env python3
"""
Setup script to help create the .env file with GEMINI_API_KEY
"""

import os

def create_env_file():
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_file_path):
        print("✅ .env file already exists!")
        return
    
    print("🔧 Setting up .env file for Gemini API...")
    print("📝 Please enter your Gemini API key:")
    print("   You can get it from: https://makersuite.google.com/app/apikey")
    print()
    
    api_key = input("Enter your GEMINI_API_KEY: ").strip()
    
    if not api_key:
        print("❌ No API key provided. Please run this script again with a valid API key.")
        return
    
    try:
        with open(env_file_path, 'w') as f:
            f.write(f"GEMINI_API_KEY={api_key}\n")
        
        print("✅ .env file created successfully!")
        print("🚀 You can now start the backend server with: python app.py")
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")

if __name__ == "__main__":
    create_env_file() 