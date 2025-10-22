import React, { useState, useContext, useEffect } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import BookOpenIcon from './icons/BookOpenIcon';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';


interface HeaderProps {
    onNavigateHome: () => void;
    onNavigateToDashboard: () => void;
    onNavigateToSettings: () => void;
    
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onNavigateToDashboard, onNavigateToSettings }) => {
    const { setSettings } = useContext(SettingsContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        const observer = new MutationObserver(() => {
            setIsDarkMode(root.classList.contains('dark'));
        });
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        setIsDarkMode(root.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    const handleThemeToggle = () => {
        setSettings({ theme: isDarkMode ? 'light' : 'dark' });
    };

    const handleNavigate = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    };

    const navLinks = (
        <>
            <button onClick={() => handleNavigate(onNavigateHome)} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">דף הבית</button>
            <button onClick={() => handleNavigate(onNavigateToSettings)} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">הגדרות</button>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">חומרי עזר</a>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">המלצות</a>
            <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">כתבות</a>
        </>
    );

    const ThemeToggleButton = () => (
        <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title={isDarkMode ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
        >
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
    );


    return (
        <header className="border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4 md:grid md:grid-cols-3">
                    {/* Col 1: Logo */}
                    <div className="flex items-center cursor-pointer md:justify-self-start" onClick={() => handleNavigate(onNavigateToDashboard)}>
                        <BookOpenIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 ml-3" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">לוח בקרה</h1>
                    </div>

                    {/* Col 2: Desktop Nav */}
                    <nav className="hidden md:flex md:justify-self-center space-x-6 space-x-reverse items-center text-lg font-semibold text-gray-600 dark:text-gray-300">
                        {navLinks}
                    </nav>

                    {/* Col 3: Right side buttons (desktop) and all mobile buttons */}
                    <div className="md:justify-self-end">
                        <div className="hidden md:flex items-center">
                            <ThemeToggleButton />
                        </div>
                        <div className="md:hidden flex items-center gap-2">
                            <ThemeToggleButton />
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 z-50 relative">
                                {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <nav className="flex flex-col items-center space-y-4 py-4 border-t border-gray-200 dark:border-zinc-800 text-lg font-semibold text-gray-600 dark:text-gray-300">
                        {navLinks}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
