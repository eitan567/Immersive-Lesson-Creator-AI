import React from 'react';
import type { LessonPlan } from '../types';
import ClockIcon from './icons/ClockIcon';

interface LessonCardProps {
    lesson: LessonPlan;
    onSelect: (lesson: LessonPlan) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onSelect }) => {
    const statusColor = lesson.status === 'פורסם' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

    return (
        <div 
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col justify-between hover:shadow-lg hover:border-blue-400 transition-all duration-300 cursor-pointer"
            onClick={() => onSelect(lesson)}
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800 pr-2">{lesson.lessonTitle}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColor}`}>
                        {lesson.status}
                    </span>
                </div>
                <p className="text-gray-500 mb-4">{lesson.targetAudience}</p>
            </div>
            <div className="flex items-center text-sm text-gray-600 border-t border-gray-200 pt-3">
                <ClockIcon className="w-4 h-4 ml-2" />
                <span>משך השיעור: {lesson.lessonDuration} דקות</span>
            </div>
        </div>
    );
};

export default LessonCard;
