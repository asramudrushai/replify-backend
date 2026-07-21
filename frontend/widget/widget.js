(function() {
    const script = document.currentScript;
    const businessId = script.getAttribute('data-business-id');
    const backendUrl = 'http://localhost:3001'; // Default port from backend code

    // Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #replify-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #replify-toggle {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: #4f46e5;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        #replify-toggle:hover { transform: scale(1.05); }
        #replify-toggle svg { fill: white; width: 30px; height: 30px; }
        
        #replify-chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(20px);
        }
        #replify-chat-window.open {
            display: flex;
            opacity: 1;
            transform: translateY(0);
        }
        
        #replify-header {
            background: #4f46e5;
            color: white;
            padding: 15px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #replify-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background: #f9fafb;
        }
        .replify-msg {
            margin-bottom: 12px;
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
        }
        .replify-msg.bot {
            background: #e5e7eb;
            color: #1f2937;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }
        .replify-msg.user {
            background: #4f46e5;
            color: white;
            align-self: flex-end;
            margin-left: auto;
            border-bottom-right-radius: 2px;
        }
        
        #replify-input-container {
            padding: 15px;
            border-top: 1px solid #e5e7eb;
            display: flex;
        }
        #replify-input {
            flex: 1;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 8px 12px;
            outline: none;
        }
        #replify-input:focus { border-color: #4f46e5; }
        #replify-send {
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 6px;
            margin-left: 8px;
            padding: 0 12px;
            cursor: pointer;
        }
        
        #replify-lead-form {
            display: none;
            padding: 15px;
            background: white;
            border-top: 1px solid #e5e7eb;
        }
        #replify-lead-form input {
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            box-sizing: border-box;
        }
        #replify-lead-form button {
            width: 100%;
            background: #10b981;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // HTML Structure
    const container = document.createElement('div');
    container.id = 'replify-widget-container';
    container.innerHTML = `
        <div id="replify-chat-window">
            <div id="replify-header">
                <span>Chat with us</span>
                <button id="replify-close" style="background:none;border:none;color:white;cursor:pointer;font-size:20px;">&times;</button>
            </div>
            <div id="replify-messages" style="display:flex; flex-direction:column;">
                <div class="replify-msg bot">Hello! How can we help you today?</div>
            </div>
            <div id="replify-lead-form">
                <p style="font-size:12px; margin-bottom:10px; color:#6b7280;">Please leave your details and we'll get back to you.</p>
                <input type="text" id="replify-lead-name" placeholder="Your Name">
                <input type="email" id="replify-lead-email" placeholder="Your Email">
                <button id="replify-submit-lead">Send</button>
            </div>
            <div id="replify-input-container">
                <input type="text" id="replify-input" placeholder="Type a message...">
                <button id="replify-send">Send</button>
            </div>
        </div>
        <div id="replify-toggle">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
    `;
    document.body.appendChild(container);

    // Logic
    const toggle = document.getElementById('replify-toggle');
    const chatWindow = document.getElementById('replify-chat-window');
    const closeBtn = document.getElementById('replify-close');
    const input = document.getElementById('replify-input');
    const sendBtn = document.getElementById('replify-send');
    const messages = document.getElementById('replify-messages');
    const leadForm = document.getElementById('replify-lead-form');
    const inputContainer = document.getElementById('replify-input-container');
    
    let sessionId = null;

    toggle.onclick = () => {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open') && !sessionId) {
            initSession();
        }
    };
    closeBtn.onclick = () => chatWindow.classList.remove('open');

    async function initSession() {
        try {
            const resp = await fetch(\`\${backendUrl}/api/chat/session\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId })
            });
            const data = await resp.json();
            sessionId = data.sessionId;
        } catch (e) { console.error('Failed to init Replify session', e); }
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        try {
            const resp = await fetch(\`\${backendUrl}/api/chat/\${businessId}/answer?question=\${encodeURIComponent(text)}\`);
            const data = await resp.json();
            
            addMessage(data.answer, 'bot');

            if (data.answer.includes('leave your details')) {
                showLeadForm();
            }
        } catch (e) {
            addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
        }
    }

    function addMessage(text, side) {
        const msg = document.createElement('div');
        msg.className = \`replify-msg \${side}\`;
        msg.innerText = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function showLeadForm() {
        leadForm.style.display = 'block';
        inputContainer.style.display = 'none';
    }

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    document.getElementById('replify-submit-lead').onclick = async () => {
        const name = document.getElementById('replify-lead-name').value;
        const email = document.getElementById('replify-lead-email').value;

        if (!email) {
            alert('Email is required');
            return;
        }

        try {
            await fetch(\`\${backendUrl}/api/leads\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId, name, email, sessionId })
            });
            leadForm.innerHTML = '<p style="text-align:center; color:#10b981;">Thank you! We\\'ll be in touch.</p>';
            setTimeout(() => {
                leadForm.style.display = 'none';
                inputContainer.style.display = 'flex';
            }, 3000);
        } catch (e) {
            alert('Failed to save lead. Please try again.');
        }
    };
})();
