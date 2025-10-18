import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, SuggestionField } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import XIcon from './icons/XIcon';

interface LessonChatProps {
    isOpen: boolean;
    onClose: () => void;
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    onSelectSuggestion: (field: SuggestionField, value: string) => void;
}

const LessonChat: React.FC<LessonChatProps> = ({ isOpen, onClose, chatHistory, onSendMessage, isLoading, onSelectSuggestion }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [chatHistory, isLoading]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 left-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                    <SparklesIcon className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800 ml-2">יועץ השיעורים AI</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {msg.text && <p>{msg.text}</p>}
                            {msg.suggestions && (
                                <div>
                                    <p className="font-semibold mb-2">מצאתי כמה רעיונות עבור "{msg.suggestions.field}":</p>
                                    <div className="space-y-2">
                                        {msg.suggestions.values.map((value, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onSelectSuggestion(msg.suggestions!.field, value)}
                                                className="w-full text-right p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm text-gray-700 font-medium"
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce ml-1" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce ml-1" style={{animationDelay: '0.3s'}}></div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
                <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder="שאלו אותי כל דבר על השיעור..."
                        className="flex-1 px-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                        שלח
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonChat;
