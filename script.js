document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modal = document.getElementById('setup-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const clearBtn = document.getElementById('clear-btn');

    let API_KEY = localStorage.getItem('gemini_api_key');

    // 1. Check for API Key
    if (!API_KEY) {
        modal.style.display = 'flex';
    }

    // 2. Save API Key
    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            API_KEY = key;
            modal.style.display = 'none';
        } else {
            alert("Please enter a valid API Key!");
        }
    });

    // 3. Helper: Add Message to UI
    const addMessage = (text, sender) => {
        const div = document.createElement('div');
        div.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        // Basic Markdown parsing for bold text
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        div.innerHTML = formattedText;
        
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    // 4. Call Gemini API
    const generateResponse = async (userMessage) => {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userMessage }] }]
                })
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error?.message || "API Error");

            const botText = data.candidates[0].content.parts[0].text;
            return botText;

        } catch (error) {
            console.error(error);
            return `Error: ${error.message}. (Check your API Key or connection)`;
        }
    };

    // 5. Handle Send
    const handleSend = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        // UI Updates
        addMessage(text, 'user');
        userInput.value = '';
        sendBtn.disabled = true;
        
        // Loading State
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot-message');
        loadingDiv.innerText = "Thinking...";
        chatContainer.appendChild(loadingDiv);

        // Fetch Response
        const reply = await generateResponse(text);
        
        // Remove Loading and Add Reply
        chatContainer.removeChild(loadingDiv);
        addMessage(reply, 'bot');
        sendBtn.disabled = false;
        userInput.focus();
    };

    // 6. Event Listeners
    sendBtn.addEventListener('click', handleSend);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    clearBtn.addEventListener('click', () => {
        localStorage.removeItem('gemini_api_key');
        location.reload(); // Reload to force API key entry again
    });
});
