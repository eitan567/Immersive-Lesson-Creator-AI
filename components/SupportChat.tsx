import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import XIcon from './icons/XIcon';
import { getSupportChatResponse } from '../services/geminiService';
import SendIcon from './icons/SendIcon';
import AiAvatarIcon from './icons/AiAvatarIcon';
import UserAvatarIcon from './icons/UserAvatarIcon';
import LifebuoyIcon from './icons/LifebuoyIcon';

interface SupportChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const MAX_CHARS = 250;

const SupportChat: React.FC<SupportChatProps> = ({ isOpen, onClose }) => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { role: 'ai', text: 'שלום! אני כאן כדי לעזור. איך אפשר לסייע היום עם "יוצר השיעורים AI"?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [chatHistory, isLoading]);

    useEffect(() => {
        if (isOpen && !isLoading) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, isLoading]);

    const handleSendMessage = async () => {
        const message = input.trim();
        if (message && message.length <= MAX_CHARS) {
            setChatHistory(prev => [...prev, { role: 'user', text: message }]);
            setInput('');
            setIsLoading(true);
            try {
                const responseText = await getSupportChatResponse(message);
                setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setChatHistory(prev => [...prev, { role: 'ai', text: `מצטער, אירעה שגיאה: ${errorMessage}` }]);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleQuickSuggestionClick = (prompt: string) => {
        setInput(prompt);
        inputRef.current?.focus();
    };
    
    const getCounterColor = () => {
        if (input.length > MAX_CHARS) return 'text-red-500 font-semibold';
        if (input.length > MAX_CHARS * 0.9) return 'text-yellow-500';
        return 'text-gray-500 dark:text-gray-400';
    };
    
    const ChatContent = (
        <>
            <header className="relative flex items-center justify-between p-4 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                    <LifebuoyIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">תמיכה ועזרה</h3>
                </div>
                <button onClick={onClose} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white dark:bg-zinc-900">
                {chatHistory.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'ai' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-zinc-700 flex items-center justify-center">
                                <AiAvatarIcon className="w-5 h-5 text-white dark:text-blue-300" />
                            </div>
                        )}
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200'}`}>
                            {msg.text && <p>{msg.text}</p>}
                        </div>
                        {msg.role === 'user' && (
                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                                <UserAvatarIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start items-start gap-2">
                         <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-zinc-700 flex items-center justify-center">
                            <AiAvatarIcon className="w-5 h-5 text-white dark:text-blue-300" />
                        </div>
                         <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-500 flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce ml-1" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce ml-1" style={{animationDelay: '0.3s'}}></div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-gray-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-2 px-1 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">הצעות:</span>
                    <button onClick={() => handleQuickSuggestionClick('איך אני עורך שיעור קיים?')} className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-blue-100 dark:bg-zinc-950 rounded-full hover:bg-blue-200 dark:hover:bg-zinc-600 transition-colors">
                        עריכת שיעור
                    </button>
                    <button onClick={() => handleQuickSuggestionClick('נתקלתי בבעיה טכנית')} className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-blue-100 dark:bg-zinc-950 rounded-full hover:bg-blue-200 dark:hover:bg-zinc-600 transition-colors">
                        דיווח על בעיה
                    </button>
                     <button onClick={() => handleQuickSuggestionClick('אני רוצה ליצור קשר עם התמיכה')} className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-blue-100 dark:bg-zinc-950 rounded-full hover:bg-blue-200 dark:hover:bg-zinc-600 transition-colors">
                        צור קשר
                    </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mx-2 my-4 mb-0">
                    <div className="div-cta rounded-full transition-shadow duration-300">
                        <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-full">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="כתבו את שאלתכם כאן..."
                                className="w-full pl-12 pr-4 py-1.5 bg-transparent rounded-full focus:outline-none transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-right"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || input.trim().length === 0 || input.length > MAX_CHARS}
                                className="absolute left-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full text-[#1876e1] disabled:cursor-not-allowed transition-colors focus:outline-none"
                            >
                                <SendIcon className="w-5 h-5 transform rotate-180" />
                            </button>
                        </div>
                    </div>
                </form>
                <div className={`text-left text-xs mt-1.5 pl-3 ${getCounterColor()}`}>
                    {input.length} / {MAX_CHARS}
                </div>
            </div>
        </>
    );

    if (!isOpen) return null;
    
    // Desktop: Bottom right corner, fixed size. No dragging/resizing for simplicity.
    const chatContainerClasses = `fixed bottom-8 right-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-blue-400 dark:border-zinc-700 transition-transform duration-300 ease-in-out`;
    
    return (
       <>
            {/* Desktop Floating Window */}
            <div className="hidden md:flex">
                <div 
                    className={`${chatContainerClasses} ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
                    style={{width: '384px', height: '600px'}}
                    dir="rtl"
                >
                    {ChatContent}
                </div>
            </div>

            {/* Mobile Drawer */}
            <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
                <div 
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={onClose}
                ></div>
                
                <div className={`fixed inset-y-0 right-0 flex max-w-full transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="relative w-screen max-w-sm">
                        <div className="h-full flex flex-col bg-white dark:bg-zinc-900 shadow-xl">
                            {ChatContent}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SupportChat;