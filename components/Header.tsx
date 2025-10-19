import React from 'react';
import BookOpenIcon from './icons/BookOpenIcon';

interface HeaderProps {
    onNavigateHome: () => void;
    onNavigateToSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onNavigateToSettings }) => {
    return (
        <header className="border-b border-gray-200 dark:border-zinc-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center cursor-pointer" onClick={onNavigateHome}>
                        <BookOpenIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 ml-3" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">יוצר השיעורים</h1>
                    </div>
                    <nav className="hidden md:flex space-x-6 space-x-reverse items-center text-lg font-semibold text-gray-600 dark:text-gray-300">
                        <button onClick={onNavigateHome} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">דף הבית</button>
                        <button onClick={onNavigateToSettings} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">הגדרות</button>
                        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">חומרי עזר</a>
                        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">המלצות</a>
                        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">כתבות</a>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;