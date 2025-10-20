import React, { useState } from 'react';
import type { LessonPlan } from '../types';
import LessonCard from './LessonCard';
import PlusIcon from './icons/PlusIcon';
import BoltIcon from './icons/BoltIcon';

interface DashboardProps {
    lessons: LessonPlan[];
    onSelectLesson: (lesson: LessonPlan) => void;
    onCreateNew: () => void;
    onCreateQuick: () => void;
    onDelete: (lessonId: string) => void;
    onPublish: (lessonId: string) => void;
    onEdit: (lesson: LessonPlan) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    lessons,
    onSelectLesson,
    onCreateNew,
    onCreateQuick,
    onDelete,
    onPublish,
    onEdit,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, draft, published

    const filteredLessons = lessons.filter(lesson => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = lesson.lessonTitle.toLowerCase().includes(lowerSearchTerm) || 
                              lesson.topic.toLowerCase().includes(lowerSearchTerm) ||
                              lesson.category.toLowerCase().includes(lowerSearchTerm) ||
                              (lesson.unitTopic && lesson.unitTopic.toLowerCase().includes(lowerSearchTerm));
        
        const matchesFilter = filter === 'all' || 
                              (filter === 'draft' && lesson.status === 'טיוטה') ||
                              (filter === 'published' && lesson.status === 'פורסם');

        return matchesSearch && matchesFilter;
    });

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">מערכי השיעור שלי</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onCreateQuick}
                        className="btn-cta flex items-center gap-2 px-4 py-2 text-black dark:text-white font-semibold rounded-full transition-colors"
                    >
                        <BoltIcon className="w-5 h-5" />
                        יצירה מהירה
                    </button>
                    <button
                        onClick={onCreateNew}
                        className="btn-cta flex items-center gap-2 px-4 py-2 text-black dark:text-white font-semibold rounded-full transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        צור שיעור חדש
                    </button>
                </div>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="חפש שיעור לפי כותרת, נושא או קטגוריה..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:flex-grow px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
                 <div className="flex items-center gap-2 bg-gray-200 dark:bg-zinc-800 p-1 rounded-full">
                    <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-50 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-zinc-700/50'}`}>
                        הכל
                    </button>
                    <button onClick={() => setFilter('draft')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'draft' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-50 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-zinc-700/50'}`}>
                        טיוטות
                    </button>
                    <button onClick={() => setFilter('published')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'published' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-50 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-zinc-700/50'}`}>
                        פורסמו
                    </button>
                </div>
            </div>

            {filteredLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredLessons.map(lesson => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            onSelect={onSelectLesson}
                            onDelete={onDelete}
                            onPublish={onPublish}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">לא נמצאו מערכי שיעור.</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {lessons.length === 0 ? "עדיין לא יצרת שיעורים. לחץ על 'צור שיעור חדש' כדי להתחיל!" : "נסה מילת חיפוש או פילטר אחר."}
                    </p>
                </div>
            )}
        </main>
    );
};

export default Dashboard;