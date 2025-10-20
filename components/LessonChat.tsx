import React, { useState, useRef, useEffect, useContext } from 'react';
import type { ChatMessage, SuggestionField, LessonFormData } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import XIcon from './icons/XIcon';
import { SettingsContext } from '../contexts/SettingsContext';
import { chatWithLessonAssistant } from '../services/geminiService';
import SendIcon from './icons/SendIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ChevronDoubleLeftIcon from './icons/ChevronDoubleLeftIcon';
import ChevronDoubleRightIcon from './icons/ChevronDoubleRightIcon';
import AiAvatarIcon from './icons/AiAvatarIcon';
import UserAvatarIcon from './icons/UserAvatarIcon';

interface LessonChatProps {
    isOpen: boolean;
    onClose: () => void;
    formData: LessonFormData;
    onUpdateForm: (field: SuggestionField, value: string) => void;
}

const MAX_CHARS = 250;

const fieldTranslations: Record<SuggestionField, string> = {
    topic: 'נושא השיעור',
    objectives: 'מטרות עיקריות',
    keyConcepts: 'מושגי מפתח',
    teachingStyle: 'סגנון הוראה',
    tone: 'טון השיעור',
    successMetrics: 'מדדי הצלחה',
    inclusion: 'הכללה והתאמות',
    // FIX: Add missing 'immersiveExperience' property to satisfy the Record<SuggestionField, string> type.
    immersiveExperience: 'חוויה אימרסיבית',
};

const LessonChat: React.FC<LessonChatProps> = ({ isOpen, onClose, formData, onUpdateForm }) => {
    const { settings, setSettings } = useContext(SettingsContext);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { role: 'ai', text: 'שלום! אני כאן כדי לעזור לכם לבנות את השיעור המושלם. שאלו אותי כל דבר, או בקשו ממני רעיונות לשדה ספציפי (למשל, "הצע לי מטרות לשיעור").' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Draggable state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

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
                const response = await chatWithLessonAssistant(message, formData);
                setChatHistory(prev => [...prev, { role: 'ai', ...response }]);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setChatHistory(prev => [...prev, { role: 'ai', text: `מצטער, אירעה שגיאה: ${errorMessage}` }]);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const onSelectSuggestion = (field: SuggestionField, value: string) => {
        onUpdateForm(field, value);
        if (settings.closeChatOnSuggestion) {
            onClose();
        }
    };

    // Draggable handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!settings.isChatFloating) return;
        if ((e.target as HTMLElement).closest('button')) return;

        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initialX: position.x,
            initialY: position.y,
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setPosition({
                x: dragStartRef.current.initialX + dx,
                y: dragStartRef.current.initialY + dy,
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);
    
    const handleQuickSuggestionClick = (prompt: string) => {
        setInput(prompt);
        inputRef.current?.focus();
    };
    
    const getCounterColor = () => {
        if (input.length > MAX_CHARS) return 'text-red-500 font-semibold';
        if (input.length > MAX_CHARS * 0.9) return 'text-yellow-500';
        return 'text-gray-500 dark:text-gray-400';
    };


    if (!isOpen) return null;
    
    const ChatContent = (
        <>
            <header 
                className={`relative flex items-center justify-center p-4 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 ${!settings.isChatPinned && settings.isChatFloating ? 'cursor-grab' : ''}`}
                onMouseDown={!settings.isChatPinned ? handleMouseDown : undefined}
            >
                {/* Left Controls (for RTL, this is the end) */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {settings.isChatPinned ? (
                        settings.chatPosition === 'right' ? (
                            // Pinned Right -> Show Switch-to-Left arrow on the left side
                            <button 
                                onClick={() => setSettings({ chatPosition: 'left' })}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                                title='העבר לשמאל'
                            >
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>
                        ) : (
                            // Pinned Left -> Show Collapse-to-Left arrow on the left side
                             <button
                                onClick={() => setSettings({ isChatCollapsed: true })}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                                title="הסתר צ'אט"
                            >
                                <ChevronDoubleLeftIcon className="w-6 h-6" />
                            </button>
                        )
                    ) : (
                         <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                            <XIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Center Title */}
                <div className="flex items-center gap-2">
                    <SparklesIcon className={`text-pink-500 dark:text-pink-400 ml-2 ${settings.isChatPinned ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    <h3 className={`font-bold text-gray-800 dark:text-white ${settings.isChatPinned ? 'text-base' : 'text-lg'}`}>יועץ השיעורים AI</h3>
                </div>
                
                {/* Right Controls (for RTL, this is the start) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {settings.isChatPinned && (
                         settings.chatPosition === 'left' ? (
                            // Pinned Left -> Show Switch-to-Right arrow on the right side
                             <button 
                                onClick={() => setSettings({ chatPosition: 'right' })}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                                title='העבר לימין'
                            >
                                <ChevronRightIcon className="w-6 h-6" />
                            </button>
                         ) : (
                            // Pinned Right -> Show Collapse-to-Right arrow on the right side
                             <button
                                onClick={() => setSettings({ isChatCollapsed: true })}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                                title="הסתר צ'אט"
                            >
                                <ChevronDoubleRightIcon className="w-6 h-6" />
                            </button>
                         )
                    )}
                </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white dark:bg-zinc-900">
                {chatHistory.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'ai' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 dark:bg-zinc-700 flex items-center justify-center">
                                <AiAvatarIcon className="w-5 h-5 text-white dark:text-pink-300" />
                            </div>
                        )}
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200'} ${settings.isChatPinned ? 'text-sm' : ''}`}>
                            {msg.text && <p>{msg.text}</p>}
                            {msg.suggestions && (
                                <div>
                                    <p className={`mb-2 ${settings.isChatPinned ? 'font-semibold text-sm' : 'font-semibold'}`}>מצאתי כמה רעיונות עבור "{fieldTranslations[msg.suggestions.field]}":</p>
                                    <div className="space-y-2">
                                        {msg.suggestions.values.map((value, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onSelectSuggestion(msg.suggestions!.field, value)}
                                                className={`w-full text-right p-2 bg-gray-50 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-zinc-600 hover:bg-pink-100 dark:hover:bg-pink-600/50 hover:border-pink-400 dark:hover:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all font-medium ${settings.isChatPinned ? 'text-xs' : 'text-sm'}`}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                         <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 dark:bg-zinc-700 flex items-center justify-center">
                            <AiAvatarIcon className="w-5 h-5 text-white dark:text-pink-300" />
                        </div>
                         <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-500 flex items-center">
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce ml-1" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce ml-1" style={{animationDelay: '0.3s'}}></div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-gray-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-2 px-1 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">נסו:</span>
                    <button onClick={() => handleQuickSuggestionClick('הצע לי פעילויות פתיחה')} className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-pink-100 dark:bg-zinc-950 rounded-full hover:bg-pink-200 dark:hover:bg-zinc-600 transition-colors">
                        פעילויות פתיחה
                    </button>
                    <button onClick={() => handleQuickSuggestionClick('איך אפשר להפוך את השיעור לחוויתי יותר?')} className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-pink-100 dark:bg-zinc-950 rounded-full hover:bg-pink-200 dark:hover:bg-zinc-600 transition-colors">
                        הפוך לחוויתי
                    </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mx-2 my-4">
                    <div className="div-cta rounded-full transition-shadow duration-300">
                        <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-full">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="שאלו אותי כל דבר על השיעור..."
                                className={`w-full pl-12 pr-4 py-1.5 bg-transparent rounded-full focus:outline-none transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-right ${settings.isChatPinned ? 'text-sm' : ''}`}
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
                <div className={`text-left text-xs mt-1.5 pr-3 ${getCounterColor()}`}>
                    {input.length} / {MAX_CHARS}
                </div>
            </div>
        </>
    );

    if (settings.isChatPinned) {
        return (
            <div className="w-full h-[calc(100vh-4rem)] max-h-[850px] bg-white dark:bg-zinc-900 rounded-2xl shadow-lg flex flex-col overflow-hidden border border-gray-200 dark:border-zinc-700">
                {ChatContent}
            </div>
        );
    }
    
    const positionProp = settings.chatPosition === 'right' ? { right: '1rem' } : { left: '1rem' };

    const chatContainerClasses = `fixed w-96 h-[600px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200 dark:border-zinc-700`
    
    const chatPositionStyle: React.CSSProperties = settings.isChatFloating 
            ? { ...positionProp, bottom: '1rem', transform: `translate(${position.x}px, ${position.y}px)` } 
            : { ...positionProp, bottom: '1rem' };


    return (
        <div 
         className={chatContainerClasses}
         style={chatPositionStyle}
        >
            {ChatContent}
        </div>
    );
};

export default LessonChat;