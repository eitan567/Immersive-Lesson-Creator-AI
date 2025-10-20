import React from 'react';
import XIcon from './icons/XIcon';

interface Feature {
    icon: React.ReactNode;
    title: string;
    modalContent: {
        detailedDescription: string;
        example: React.ReactNode;
    };
}

interface FeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: Feature | null;
}

const FeatureModal: React.FC<FeatureModalProps> = ({ isOpen, onClose, feature }) => {
    if (!isOpen || !feature) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="div-cta rounded-2xl w-full max-w-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full p-6 max-h-[90vh] flex flex-col">
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10 p-1 bg-white/10 rounded-full"
                        aria-label="סגור חלון"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center mb-4 pl-8">
                        <div className="bg-pink-100 dark:bg-pink-900 text-black dark:text-white p-3 rounded-full ml-4">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl lg:text-2xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{feature.title}</h3>
                    </div>
                    
                    <div className="overflow-y-auto pr-2 space-y-6">
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            {feature.modalContent.detailedDescription}
                        </p>
                        
                        <div>
                            <h4 className="text-lg font-semibold text-pink-600 dark:text-pink-400 mb-3">דוגמה לשימוש:</h4>
                            <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800">
                                {feature.modalContent.example}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureModal;
