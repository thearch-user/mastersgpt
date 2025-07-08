from flask import Flask, request, jsonify, render_template
import requests
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("API_KEY")  # Replace with your real API key
chat_history = []  # Global message history

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    global chat_history
    user_input = request.json.get('message')
    chat_history.append({"role": "user", "content": user_input})

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Referer": "http://localhost:5050"
    }

    data = {
        "model": "mistralai/mistral-small-3.2-24b-instruct",
        "messages": chat_history
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)

    if response.status_code == 200:
        reply = response.json()['choices'][0]['message']['content']
        chat_history.append({"role": "assistant", "content": reply})
        return jsonify({"reply": reply})
    else:
        return jsonify({"reply": "Error from OpenRouter: " + response.text}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5050)  # Changed to avoid port conflict
