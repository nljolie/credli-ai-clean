// Ask Credli Chatbot - AI Trust Consultant
class CredliChatbot {
    constructor() {
        this.isOpen = false;
        this.sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.googleSheetUrl = 'https://script.google.com/macros/s/AKfycbwc5bnDNuUBaRmw69ar2KuGVGzmTL9E9hnBoDwvzGO_kDljK308r8HL6iryR9TmHj-s/exec';
        this.init();
    }

    init() {
        console.log('Initializing Ask Credli chatbot...'); // Debug log
        this.createChatbot();
        this.loadFAQs();
        this.setupEventListeners();
        console.log('Ask Credli chatbot initialized!'); // Debug log
    }

    createChatbot() {
        // Create chatbot HTML
        const chatbotHTML = `
            <div id="credli-chatbot" class="credli-chatbot">
                <div id="chat-bubble" class="chat-bubble">
                    <div class="bubble-content">
                        <div class="credli-logo">
                            <span class="logo-text">Credli</span>
                            <span class="logo-ai">.ai</span>
                        </div>
                        <div class="bubble-text">Ask</div>
                    </div>
                </div>
                
                <div id="chat-window" class="chat-window">
                    <div class="chat-header">
                        <div class="header-left">
                            <div class="credli-logo-small">
                                <span class="logo-text">Credli</span>
                                <span class="logo-ai">.ai</span>
                            </div>
                            <span class="header-title">AI Trust Consultant</span>
                        </div>
                        <button id="close-chat" class="close-btn">×</button>
                    </div>
                    
                    <div id="chat-messages" class="chat-messages">
                        <div class="message bot-message">
                            <div class="message-content">
                                <p>Hi, thanks for visiting Credli! 👋</p>
                                <p>I'm here to answer questions about AI Trust Consulting and our Beta Concierge Program.</p>
                                <p><strong>Popular questions:</strong></p>
                                <div class="quick-questions">
                                    <button class="quick-btn" data-question="What is a Cred Score?">What is a Cred Score?</button>
                                    <button class="quick-btn" data-question="How much does the Beta Program cost?">How much does the Beta Program cost?</button>
                                    <button class="quick-btn" data-question="What is AEO and GEO?">What is AEO and GEO?</button>
                                    <button class="quick-btn" data-question="Who is this program for?">Who is this program for?</button>
                                    <button class="quick-btn" data-question="How do you detect AI impersonators?">How do you detect AI impersonators?</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input-container">
                        <input type="text" id="chat-input" placeholder="Ask me anything about Credli..." />
                        <button id="send-btn" class="send-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        this.addStyles();
    }

    addStyles() {
        const styles = `
            <style>
                .credli-chatbot {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 999999;
                    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    pointer-events: auto;
                }

                .chat-bubble {
                    width: 160px;
                    height: 60px;
                    background: linear-gradient(135deg, #3454D1, #2d4db3);
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(52, 84, 209, 0.3);
                    transition: all 0.3s ease;
                    color: white;
                    pointer-events: auto;
                    user-select: none;
                    position: relative;
                    z-index: 1000000;
                }

                .chat-bubble:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(52, 84, 209, 0.4);
                }

                .bubble-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .credli-logo {
                    font-weight: 700;
                    font-size: 16px;
                }

                .logo-text {
                    color: white;
                }

                .logo-ai {
                    color: #F77F00;
                }

                .bubble-text {
                    font-size: 13px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.9);
                }

                .chat-window {
                    position: absolute;
                    bottom: 70px;
                    right: 0;
                    width: 380px;
                    height: 500px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid #e3e6ec;
                }

                .chat-window.open {
                    display: flex;
                    animation: chatSlideIn 0.3s ease-out;
                }

                @keyframes chatSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .chat-header {
                    background: linear-gradient(135deg, #3454D1, #2d4db3);
                    color: white;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .credli-logo-small {
                    font-weight: 700;
                    font-size: 18px;
                }

                .header-title {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s ease;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    background: #f8fafc;
                }

                .message {
                    max-width: 85%;
                    animation: messageSlideIn 0.3s ease-out;
                }

                @keyframes messageSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .bot-message {
                    align-self: flex-start;
                }

                .user-message {
                    align-self: flex-end;
                }

                .message-content {
                    padding: 12px 16px;
                    border-radius: 12px;
                    line-height: 1.4;
                    font-size: 14px;
                }

                .bot-message .message-content {
                    background: white;
                    border: 1px solid #e3e6ec;
                    color: #070707;
                }

                .user-message .message-content {
                    background: linear-gradient(135deg, #3454D1, #2d4db3);
                    color: white;
                }

                .quick-questions {
                    margin-top: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .quick-btn {
                    background: #f0f4ff;
                    border: 1px solid #3454D1;
                    color: #3454D1;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }

                .quick-btn:hover {
                    background: #3454D1;
                    color: white;
                }

                .chat-input-container {
                    padding: 20px;
                    background: white;
                    border-top: 1px solid #e3e6ec;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                #chat-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #e3e6ec;
                    border-radius: 25px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s ease;
                }

                #chat-input:focus {
                    border-color: #3454D1;
                }

                .send-btn {
                    background: linear-gradient(135deg, #3454D1, #2d4db3);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .send-btn:hover {
                    transform: scale(1.05);
                }

                .send-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .credli-chatbot {
                        bottom: 15px;
                        right: 15px;
                    }

                    .chat-bubble {
                        width: 140px;
                        height: 50px;
                    }

                    .bubble-content {
                        gap: 6px;
                    }

                    .credli-logo {
                        font-size: 14px;
                    }

                    .bubble-text {
                        font-size: 11px;
                    }

                    .chat-window {
                        width: 320px;
                        height: 450px;
                        bottom: 60px;
                        right: -10px;
                    }

                    .chat-header {
                        padding: 12px 16px;
                    }

                    .credli-logo-small {
                        font-size: 16px;
                    }

                    .chat-messages {
                        padding: 15px;
                    }

                    .message-content {
                        padding: 10px 12px;
                        font-size: 13px;
                    }

                    .chat-input-container {
                        padding: 15px;
                    }
                }

                @media (max-width: 480px) {
                    .chat-window {
                        width: calc(100vw - 30px);
                        right: -5px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    loadFAQs() {
        this.faqs = {
            "what is a cred score": {
                answer: "Your Cred Score measures how often AI engines like ChatGPT, Perplexity, and Gemini recognize you as a trusted authority in your field. It's scored 0-100, with higher scores meaning better AI visibility and authority recognition.",
                type: "cred_score_info"
            },
            "how much does the beta program cost": {
                answer: "The Beta Concierge Program is a 3-month commitment: $4,000 to begin (includes first month + $1,500 onboarding), then $2,500/month for months 2 and 3. Total investment: $9,000. Limited to 20 participants.",
                type: "pricing_info"
            },
            "what is aeo and geo": {
                answer: "AEO (Ask Engine Optimization) is how AI engines optimize for ask queries and search your relevance to those specific queries. GEO (Generative Engine Optimization) is how you get listed among the top peers when AI engines respond to queries in your expertise area.",
                type: "service_explanation"
            },
            "who is this program for": {
                answer: "This program is exclusively for leaders in high-trust industries: finance, sustainability, healthcare, law, and executive thought leadership. You need to be an established expert who is concerned about AI visibility and authority recognition.",
                type: "target_audience"
            },
            "how do you detect ai impersonators": {
                answer: "We scan AI engines for profiles using similar names and expertise claims that could dilute your authority. We identify fake profiles and help neutralize them before they damage your reputation. Our detection methods are proprietary to protect their effectiveness.",
                type: "imposter_protection"
            },
            "what makes credli different": {
                answer: "Credli.ai is the only AI Trust Consultant specializing in AEO and GEO specifically for high-trust industries. We don't just analyze - we embed with your team to build sustainable AI authority protocols. It's about building long-term authority, not just temporary performance.",
                type: "differentiation"
            },
            "how long does it take to see results": {
                answer: "AI authority building is a gradual process. You'll see initial positioning within 3 months, stronger authority recognition by 6 months, and established expert status by 12+ months. We track your progress across all major AI engines throughout the process.",
                type: "timeline_expectations"
            },
            "what happens after beta": {
                answer: "Beta participants help shape the future standards for AEO and GEO. You'll have first access to new features, continued support, and join our collaborative community of AI authority leaders in high-trust industries.",
                type: "post_beta"
            },
            "do you guarantee results": {
                answer: "No, we do not guarantee results. Credli.ai provides collaborative consulting with NO GUARANTEES of results, earnings, or Cred Score improvements. Your success depends entirely on your efforts, consistency, and market factors beyond our control.",
                type: "disclaimers"
            },
            "how do i get started": {
                answer: "Start by getting your free Cred Score to understand your current AI authority baseline. Then, if you qualify for our Beta Concierge Program, we'll schedule a consultation to discuss your specific AI authority needs.",
                type: "getting_started"
            }
        };
    }

    setupEventListeners() {
        // Add a small delay to ensure elements are fully rendered
        setTimeout(() => {
            const bubble = document.getElementById('chat-bubble');
            const closeBtn = document.getElementById('close-chat');
            const sendBtn = document.getElementById('send-btn');
            const chatInput = document.getElementById('chat-input');
            const quickBtns = document.querySelectorAll('.quick-btn');

            if (bubble) {
                bubble.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Chat bubble clicked!'); // Debug log
                    this.toggleChat();
                });
                
                // Also add touch event for mobile
                bubble.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleChat();
                });
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeChat());
            }

            if (sendBtn) {
                sendBtn.addEventListener('click', () => this.sendMessage());
            }

            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });
            }

            quickBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const question = btn.dataset.question;
                    this.handleUserMessage(question, true);
                });
            });
        }, 100);
    }

    toggleChat() {
        const chatWindow = document.getElementById('chat-window');
        if (this.isOpen) {
            this.closeChat();
        } else {
            chatWindow.classList.add('open');
            this.isOpen = true;
            document.getElementById('chat-input').focus();
        }
    }

    closeChat() {
        const chatWindow = document.getElementById('chat-window');
        chatWindow.classList.remove('open');
        this.isOpen = false;
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.handleUserMessage(message);
            input.value = '';
        }
    }

    handleUserMessage(message, isQuickQuestion = false) {
        this.addUserMessage(message);
        
        // Find best matching response
        const response = this.findBestResponse(message);
        
        setTimeout(() => {
            this.addBotMessage(response.answer);
        }, 600);

        // Track in Google Sheets
        this.trackChat(message, response.type);
    }

    findBestResponse(message) {
        const normalizedMessage = message.toLowerCase();
        
        // Check for exact matches first
        for (const [key, faq] of Object.entries(this.faqs)) {
            if (normalizedMessage === key) {
                return faq;
            }
        }
        
        // Check for partial matches with better logic
        for (const [key, faq] of Object.entries(this.faqs)) {
            if (normalizedMessage.includes(key)) {
                return faq;
            }
        }

        // Check for specific keyword patterns to avoid conflicts
        if (normalizedMessage.includes('aeo') || normalizedMessage.includes('geo')) {
            return this.faqs["what is aeo and geo"];
        }
        
        if (normalizedMessage.includes('impersonator') || normalizedMessage.includes('detect ai impersonators')) {
            return this.faqs["how do you detect ai impersonators"];
        }
        
        if (normalizedMessage.includes('cost') || normalizedMessage.includes('price') || normalizedMessage.includes('beta program cost')) {
            return this.faqs["how much does the beta program cost"];
        }
        
        if (normalizedMessage.includes('cred score') || (normalizedMessage.includes('score') && !normalizedMessage.includes('cost'))) {
            return this.faqs["what is a cred score"];
        }
        
        // Check for other keyword matches
        const keywords = {
            'fake': this.faqs["how do you detect ai impersonators"],
            'who': this.faqs["who is this program for"],
            'industry': this.faqs["who is this program for"],
            'results': this.faqs["how long does it take to see results"],
            'time': this.faqs["how long does it take to see results"],
            'start': this.faqs["how do i get started"],
            'begin': this.faqs["how do i get started"],
            'guarantee': this.faqs["do you guarantee results"]
        };

        for (const [keyword, response] of Object.entries(keywords)) {
            if (normalizedMessage.includes(keyword)) {
                return response;
            }
        }

        // Default response
        return {
            answer: "That's a great question! For detailed information about Credli.ai's AI Trust Consulting services, I'd recommend getting your free Cred Score or scheduling a consultation. You can also check our main pages for more specific information about AEO, GEO, and our Beta Concierge Program.",
            type: "general_inquiry"
        };
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.escapeHtml(message)}
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async trackChat(question, responseType) {
        try {
            const data = {
                question: question,
                response: responseType,
                pageUrl: window.location.href,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            };

            await fetch(this.googleSheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

        } catch (error) {
            console.log('Chat tracking failed:', error);
            // Continue chat functionality even if tracking fails
        }
    }
}

// Initialize chatbot when page loads
function initCredliChatbot() {
    console.log('Starting chatbot initialization...');
    if (document.getElementById('credli-chatbot')) {
        console.log('Chatbot already exists, skipping...');
        return;
    }
    try {
        window.credliChatbot = new CredliChatbot();
        console.log('Chatbot created successfully!');
    } catch (error) {
        console.error('Error creating chatbot:', error);
    }
}

// Multiple initialization strategies to ensure it works
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCredliChatbot);
} else {
    // DOM already loaded
    setTimeout(initCredliChatbot, 100);
}

// Backup initialization
window.addEventListener('load', function() {
    if (!document.getElementById('credli-chatbot')) {
        setTimeout(initCredliChatbot, 200);
    }
});