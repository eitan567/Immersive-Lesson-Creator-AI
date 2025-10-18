import React from 'react';
import BookOpenIcon from './icons/BookOpenIcon';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <BookOpenIcon className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900 ml-3">יוצר השיעורים</h1>
                    </div>
                    <nav className="hidden md:flex space-x-6 space-x-reverse items-center text-lg font-semibold text-gray-600">
                        <a href="#" className="hover:text-blue-600 transition-colors">הגדרות</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">חומרי עזר</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">המלצות</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">כתבות</a>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
