import React, { useState, useMemo } from 'react';
import type { LessonPlan } from '../types';
import { GRADE_LEVELS, LESSON_TOPICS } from '../constants';
import Header from './Header';
import LessonCard from './LessonCard';
import PlusIcon from './icons/PlusIcon';
import BoltIcon from './icons/BoltIcon';
import CustomSelect from './CustomSelect';

interface DashboardProps {
  lessons: LessonPlan[];
  onSelectLesson: (lesson: LessonPlan) => void;
  onCreateNew: () => void;
  onCreateQuick: () => void;
}

const DURATION_OPTIONS = [
    { value: '', label: 'כל משך זמן' },
    { value: 'short', label: 'פחות מ-30 דקות' },
    { value: 'medium', label: '30-60 דקות' },
    { value: 'long', label: 'יותר מ-60 דקות' },
];

const Dashboard: React.FC<DashboardProps> = ({ lessons, onSelectLesson, onCreateNew, onCreateQuick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const [gradeLevelFilter, setGradeLevelFilter] = useState('');
    const [durationFilter, setDurationFilter] = useState('');

    const filteredLessons = useMemo(() => {
        return lessons.filter(lesson => {
            const matchesSearch = lesson.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTopic = !topicFilter || lesson.topic === topicFilter;
            const matchesGrade = !gradeLevelFilter || lesson.targetAudience.includes(gradeLevelFilter);
            
            const matchesDuration = !durationFilter || (
                (durationFilter === 'short' && lesson.lessonDuration < 30) ||
                (durationFilter === 'medium' && lesson.lessonDuration >= 30 && lesson.lessonDuration <= 60) ||
                (durationFilter === 'long' && lesson.lessonDuration > 60)
            );

            return matchesSearch && matchesTopic && matchesGrade && matchesDuration;
        });
    }, [lessons, searchTerm, topicFilter, gradeLevelFilter, durationFilter]);

    const handleDurationChange = (e: { target: { name: string; value: string } }) => {
        const selectedLabel = e.target.value;
        const selectedOption = DURATION_OPTIONS.find(opt => opt.label === selectedLabel);
        setDurationFilter(selectedOption ? selectedOption.value : '');
    };

    const currentDurationLabel = DURATION_OPTIONS.find(opt => opt.value === durationFilter)?.label || 'כל משך זמן';

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">סינון שיעורים</h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="חיפוש חופשי..."
                            className="w-full md:flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <CustomSelect
                            id="topic-filter"
                            name="topicFilter"
                            value={topicFilter || 'כל הנושאים'}
                            onChange={(e) => setTopicFilter(e.target.value === 'כל הנושאים' ? '' : e.target.value)}
                            options={['כל הנושאים', ...LESSON_TOPICS]}
                            className="w-full md:w-48 bg-gray-50"
                        />
                        <CustomSelect
                            id="grade-level-filter"
                            name="gradeLevelFilter"
                            value={gradeLevelFilter || 'כל השכבות'}
                            onChange={(e) => setGradeLevelFilter(e.target.value === 'כל השכבות' ? '' : e.target.value)}
                            options={['כל השכבות', ...GRADE_LEVELS]}
                            className="w-full md:w-48 bg-gray-50"
                        />
                        <CustomSelect
                            id="duration-filter"
                            name="durationFilter"
                            value={currentDurationLabel}
                            onChange={handleDurationChange}
                            options={DURATION_OPTIONS.map(opt => opt.label)}
                            className="w-full md:w-48 bg-gray-50"
                        />
                    </div>
                </div>

                {filteredLessons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLessons.map(lesson => (
                            <LessonCard key={lesson.id} lesson={lesson} onSelect={onSelectLesson} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-2xl font-bold text-gray-700">לא נמצאו שיעורים</h3>
                        <p className="text-gray-500 mt-2">נסה לשנות את תנאי הסינון או צור שיעור חדש.</p>
                    </div>
                )}
                
                <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button 
                        onClick={onCreateNew}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
                    >
                        <PlusIcon className="w-6 h-6 ml-3" />
                        יצירת שיעור חדש
                    </button>
                     <button 
                        onClick={onCreateQuick}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 text-xl font-bold rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
                    >
                        <BoltIcon className="w-6 h-6 ml-3" />
                        יצירת שיעור מהיר
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;