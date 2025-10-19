import React from 'react';
import XIcon from './icons/XIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="div-cta rounded-2xl w-full max-w-md relative" 
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl p-6">
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 ml-4">
                            <AlertTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-grow text-right">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100" id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-md text-gray-600 dark:text-gray-300">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-start gap-3">
                        <button
                            type="button"
                            className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={onConfirm}
                        >
                            מחק
                        </button>
                        <button
                            type="button"
                            className="px-6 py-2.5 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border border-gray-300 dark:border-zinc-600 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={onClose}
                        >
                            בטל
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;