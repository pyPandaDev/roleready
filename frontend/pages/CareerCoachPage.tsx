import React, { useState, useRef, useEffect } from 'react';
import { PageProps } from '../types';
import {
    Send, Loader2, Sparkles, Plus, Trash2,
    MessageSquare, Menu, X, Clock
} from 'lucide-react';
import { auth } from '../firebase/client';
import {
    getCurrentCoachConversation,
    saveCoachConversation,
    startNewCoachConversation,
    getAllCoachConversations,
    deleteCoachConversation,
    loadCoachConversation
} from '../services/dataService';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: string;
}

const CareerCoachPage: React.FC<PageProps> = ({ setView }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationLoaded, setConversationLoaded] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    // Load saved conversations on mount
    useEffect(() => {
        if (!user || conversationLoaded) return;
        const loadConversations = async () => {
            try {
                // Load current conversation
                const convo = await getCurrentCoachConversation() as { id?: string; messages?: Message[] };
                if (convo.messages && convo.messages.length > 0) {
                    setMessages(convo.messages as Message[]);
                    setActiveSessionId(convo.id || null);
                }

                // Load all conversations for history
                const allConvos = await getAllCoachConversations();
                if (allConvos && allConvos.length > 0) {
                    setChatHistory(allConvos.map((c: { id: string; messages: Message[]; updatedAt: string }) => ({
                        id: c.id,
                        title: c.messages[0]?.content?.slice(0, 30) + '...' || 'New chat',
                        messages: c.messages as Message[],
                        updatedAt: c.updatedAt
                    })));
                }
            } catch (e) {
                // Conversation not found - user starting fresh
            } finally {
                setConversationLoaded(true);
            }
        };
        loadConversations();
    }, [user, conversationLoaded]);

    // Save conversation after each message
    useEffect(() => {
        if (!user || messages.length < 1) return;
        const saveConvo = async () => {
            try {
                await saveCoachConversation({ messages });
            } catch (e) {
                console.error('Failed to save conversation:', e);
            }
        };
        saveConvo();
    }, [messages, user]);

    const handleNewConversation = async () => {
        if (!user) return;
        try {
            const newSession = await startNewCoachConversation() as { id?: string } | undefined;
            setMessages([]);
            setActiveSessionId(newSession?.id || null);
        } catch (e) {
            console.error('Failed to start new conversation:', e);
            setMessages([]);
        }
    };

    const handleDeleteChat = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteCoachConversation(sessionId);
            setChatHistory(prev => prev.filter(c => c.id !== sessionId));
            if (activeSessionId === sessionId) {
                setMessages([]);
                setActiveSessionId(null);
            }
        } catch (e) {
            console.error('Failed to delete conversation:', e);
        }
    };

    const handleLoadChat = async (session: ChatSession) => {
        try {
            await loadCoachConversation(session.id);
            setMessages(session.messages);
            setActiveSessionId(session.id);
        } catch (e) {
            console.error('Failed to load conversation:', e);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PDF or image file (PNG, JPG, WebP)');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result as string;
            setUploadedFile({ name: file.name, content });
            // Add context to input
            if (file.type === 'application/pdf') {
                setInput(prev => prev + ` [Attached: ${file.name}]`);
            }
        };

        if (file.type === 'application/pdf') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsDataURL(file);
        }

        // Reset file input
        e.target.value = '';
    };

    const clearAttachment = () => {
        setUploadedFile(null);
        setInput(prev => prev.replace(/\s*\[Attached:.*?\]/, ''));
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getAuthToken = async (): Promise<string | null> => {
        const currentUser = auth.currentUser;
        if (!currentUser) return null;
        return currentUser.getIdToken();
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const token = await getAuthToken();
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE}/api/ai/career-coach`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages.map(m => ({
                        role: m.role === 'assistant' ? 'assistant' : 'user',
                        content: m.content
                    }))
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Request failed' }));
                throw new Error(error.detail || 'Failed to get response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || "I couldn't process that. Please try again."
            }]);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Connection error. Please try again.\n\n*${errorMessage}*`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Format AI response with proper markdown
    const formatMessage = (content: string): string => {
        let html = content;

        // Replace * at line start with bullet (with optional leading whitespace)
        html = html.replace(/(^|\n)\s*\* /g, '$1• ');
        html = html.replace(/(^|\n)\s*- /g, '$1• ');

        // Bold (**text**)
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Numbered lists
        html = html.replace(/(^|\n)(\d+)\. /g, '$1<strong>$2.</strong> ');

        // Headers
        html = html.replace(/^#### (.+)$/gm, '<h4 class="msg-h4">$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3 class="msg-h3">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 class="msg-h2">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 class="msg-h1">$1</h1>');

        // Code blocks
        html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre class="msg-code"><code>$2</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code class="msg-inline-code">$1</code>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Newlines to HTML
        html = html.replace(/\n\n+/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        html = '<p>' + html + '</p>';

        return html;
    };

    const userName = user?.displayName?.split(' ')[0] || 'there';

    return (
        <div className="coach-layout">
            {/* Sidebar */}
            <aside className={`coach-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <button className="new-chat-btn" onClick={handleNewConversation}>
                        <Plus size={18} />
                        <span>New chat</span>
                    </button>
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <div className="sidebar-section">
                    <h3 className="sidebar-label">Your Chats</h3>
                    <div className="chat-history">
                        {chatHistory.length === 0 ? (
                            <p className="no-history">No chat history yet</p>
                        ) : (
                            chatHistory.map(chat => (
                                <div
                                    key={chat.id}
                                    className={`history-item ${activeSessionId === chat.id ? 'active' : ''}`}
                                    onClick={() => handleLoadChat(chat)}
                                >
                                    <MessageSquare size={14} />
                                    <span className="history-title">{chat.title}</span>
                                    <button
                                        className="delete-chat-btn"
                                        onClick={(e) => handleDeleteChat(chat.id, e)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar-small">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <span>{user?.displayName || 'User'}</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="coach-main">
                {/* Mobile sidebar toggle */}
                {!sidebarOpen && (
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu size={20} />
                    </button>
                )}

                {/* Empty State - Welcome */}
                {messages.length === 0 && (
                    <div className="coach-welcome">
                        <div className="welcome-icon">
                            <Sparkles size={32} />
                        </div>
                        <h1 className="welcome-greeting">
                            Hey, {userName}. Ready to dive in?
                        </h1>
                        <p className="welcome-hint">
                            Ask me anything about your career
                        </p>
                    </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                    <div className="coach-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role}`}>
                                {msg.role === 'user' ? (
                                    // User message - just a colored bubble on right
                                    <div className="user-bubble">
                                        {msg.content}
                                    </div>
                                ) : (
                                    // AI message - plain text on left
                                    <div className="ai-response">
                                        <div
                                            className="ai-text"
                                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-msg assistant">
                                <div className="ai-response">
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}

                {/* Input Area */}
                <div className="coach-input-area">
                    {/* File Attachment Card - Above input like ChatGPT */}
                    {uploadedFile && (
                        <div className="file-attachment-card">
                            <div className="file-icon">📄</div>
                            <div className="file-info">
                                <span className="file-name">{uploadedFile.name}</span>
                                <span className="file-type">PDF</span>
                            </div>
                            <button className="file-remove" onClick={clearAttachment}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="coach-input-wrapper">
                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pdf,.png,.jpg,.jpeg,.webp"
                            style={{ display: 'none' }}
                        />

                        {/* Textarea for multiline input */}
                        <textarea
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                // Auto-resize
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Ask anything"
                            disabled={isLoading}
                            className="coach-textarea"
                            rows={1}
                        />

                        {/* Action buttons */}
                        <div className="input-actions">
                            <button
                                className="attach-btn"
                                onClick={() => fileInputRef.current?.click()}
                                title="Upload PDF or image"
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !input.trim()}
                                className="send-btn"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                    <p className="input-hint">
                        AI advice is for guidance only. Always verify important career decisions.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default CareerCoachPage;
