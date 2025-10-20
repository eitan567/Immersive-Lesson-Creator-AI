import React from 'react';
import XIcon from './icons/XIcon';
import SparklesIcon from './icons/SparklesIcon';

interface SuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (suggestion: string) => void;
    title: string;
    suggestions: string[];
    isLoading: boolean;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose, onSelect, title, suggestions, isLoading }) => {
    if (!isOpen) return null;

    const handleSelect = (suggestion: string) => {
        onSelect(suggestion);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="div-cta rounded-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full p-6">
                    <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10">
                        <XIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center mb-4">
                        <SparklesIcon className="w-6 h-6 text-pink-500 dark:text-pink-400 ml-3" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <svg className="animate-spin h-8 w-8 text-pink-600 dark:text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(suggestion)}
                                    className="w-full text-right p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-pink-100 dark:hover:bg-zinc-700 hover:border-pink-400 dark:hover:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all text-gray-700 dark:text-gray-200"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuggestionModal;