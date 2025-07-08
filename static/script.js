const input = document.getElementById('chat-input');
const micBtn = document.getElementById("mic-button");
const chatContent = document.getElementById('chat-content');
const inputMode = document.getElementById("input-mode");

let messages = [];

function appendMessage(text, className = 'chat-message') {
  const messageEl = document.createElement('div');
  messageEl.className = className;
  messageEl.textContent = text;
  chatContent.appendChild(messageEl);
  chatContent.scrollTop = chatContent.scrollHeight;
}

function sendMessage(userInput) {
  messages.push({ role: 'user', content: userInput });
  appendMessage(userInput, 'chat-message user');

  fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userInput }),
  })
    .then((res) => res.json())
    .then((data) => {
      appendMessage(data.reply);
      const utterance = new SpeechSynthesisUtterance(data.reply);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
      messages.push({ role: 'assistant', content: data.reply });
    })
    .catch((err) => {
      appendMessage("Error talking to AI.");
      console.error(err);
    });
}

// Text Input Handler
input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && input.value.trim() !== '' && inputMode.value === 'text') {
    sendMessage(input.value.trim());
    input.value = '';
  }
});

// Voice Recognition Setup
const recognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

if (recognitionApi) {
  const recognizer = new recognitionApi();
  recognizer.lang = 'en-US';

  micBtn.addEventListener("click", () => {
    if (inputMode.value === "voice") {
      recognizer.start();
      micBtn.textContent = "🎙️";
    }
  });

  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sendMessage(transcript);
    micBtn.textContent = "🎤";
  };

  recognizer.onerror = () => {
    micBtn.textContent = "🎤";
    alert("Speech failed. Try again.");
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "Speech Recognition not supported in your browser.";
}
