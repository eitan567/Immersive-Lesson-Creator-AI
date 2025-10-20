import React, { useState, useEffect } from 'react';
import SparklesIcon from './icons/SparklesIcon';

const loadingMessages = [
    "מגייסים רעיונות יצירתיים...",
    "מרכיבים פעילויות מהנות...",
    "מוודאים שהשיעור יהיה בלתי נשכח...",
    "מוסיפים קורטוב של קסם...",
    "כמעט מוכן! הפתעה בדרך..."
];

const LessonGenerationLoader: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-zinc-900 text-center p-4">
            <div className="relative mb-8">
                <div className="w-24 h-24 bg-pink-500 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                    <SparklesIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute top-0 left-0 w-24 h-24 border-4 border-pink-200 rounded-full animate-ping flex-shrink-0"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">יוצרים עבורך שיעור חווייתי...</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-opacity duration-500 ease-in-out">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};

export default LessonGenerationLoader;