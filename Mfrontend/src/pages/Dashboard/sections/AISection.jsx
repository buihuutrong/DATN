import React, { useState } from 'react';
import './AISection.css';
import { chatWithAI } from '../../../services/api';

const AISection = ({ user }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        {
            role: 'ai',
            content: 'Xin chào! Tôi là trợ lý dinh dưỡng AI. Tôi có thể giúp gì cho bạn?'
        }
    ]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message to chat
        const userMessage = {
            role: 'user',
            content: message
        };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');

        try {
            const aiAnswer = await chatWithAI([...chatHistory, userMessage], user); // user là hồ sơ người dùng
            const aiResponse = {
                role: 'ai',
                content: aiAnswer
            };
            setChatHistory(prev => [...prev, aiResponse]);
        } catch (err) {
            setChatHistory(prev => [...prev, {
                role: 'ai',
                content: 'Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.'
            }]);
        }
    };

    return (
        <div className="ai-section">
            <div className="section-header">
                <h2>Tư vấn dinh dưỡng AI</h2>
            </div>

            <div className="chat-container">
                <div className="chat-messages">
                    {chatHistory.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.role === 'ai' ? 'ai-message' : 'user-message'}`}
                        >
                            <div className="message-content">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>

                <form className="chat-input" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập câu hỏi của bạn..."
                    />
                    <button type="submit">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>

            <div className="ai-features">
                <h3>Các tính năng sắp tới</h3>
                <div className="feature-grid">
                    <div className="feature-card">
                        <i className="fas fa-utensils"></i>
                        <h4>Tư vấn thực đơn</h4>
                        <p>Nhận gợi ý thực đơn phù hợp với mục tiêu và sở thích của bạn</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-chart-line"></i>
                        <h4>Phân tích dinh dưỡng</h4>
                        <p>Phân tích chi tiết về chế độ ăn và đề xuất cải thiện</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-heartbeat"></i>
                        <h4>Tư vấn sức khỏe</h4>
                        <p>Nhận lời khuyên về dinh dưỡng dựa trên tình trạng sức khỏe</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-lightbulb"></i>
                        <h4>Mẹo dinh dưỡng</h4>
                        <p>Khám phá các mẹo và thông tin hữu ích về dinh dưỡng</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISection; 