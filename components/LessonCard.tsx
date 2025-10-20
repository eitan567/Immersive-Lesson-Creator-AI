import React from 'react';
import type { LessonPlan } from '../types';
import ClockIcon from './icons/ClockIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';

interface LessonCardProps {
    lesson: LessonPlan;
    onSelect: (lesson: LessonPlan) => void;
    onDelete: (lessonId: string) => void;
    onPublish: (lessonId: string) => void;
    onEdit: (lesson: LessonPlan) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onSelect, onDelete, onPublish, onEdit }) => {
    const statusColor = lesson.status === 'פורסם' 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div 
            className="div-cta rounded-xl h-full"
            onClick={() => onSelect(lesson)}
        >
            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 h-full">
                <div className="cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 pr-2">{lesson.lessonTitle}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColor}`}>
                            {lesson.status}
                        </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{lesson.targetAudience}</p>
                </div>
                <div className="border-t border-gray-200 dark:border-zinc-700 pt-3 mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <ClockIcon className="w-4 h-4 ml-2" />
                        <span>משך: {lesson.lessonDuration} דקות</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        {lesson.status === 'טיוטה' && (
                            <button 
                                onClick={(e) => handleActionClick(e, () => onPublish(lesson.id))}
                                className="px-3 py-1 text-xs font-semibold text-black dark:text-white rounded-md transition-colors"
                            >
                                פרסם
                            </button>
                        )}
                        <button 
                            onClick={(e) => handleActionClick(e, () => onEdit(lesson))}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            title="ערוך שיעור"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={(e) => handleActionClick(e, () => onDelete(lesson.id))}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            title="מחק שיעור"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonCard;