import React, { useState } from 'react';
import type { LessonFormData, LessonPlan } from './types';
import { generateLessonPlan } from './services/geminiService';
import Dashboard from './components/Dashboard';
import LessonForm from './components/LessonForm';
import LessonDisplay from './components/LessonDisplay';
import LessonGenerationLoader from './components/LessonGenerationLoader';
import QuickCreateModal from './components/QuickCreateModal';

type AppView = 'dashboard' | 'form' | 'display' | 'loading';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('dashboard');
    const [lessons, setLessons] = useState<LessonPlan[]>([]);
    const [currentLesson, setCurrentLesson] = useState<LessonPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);

    const handleCreateNew = () => {
        setCurrentLesson(null);
        setError(null);
        setView('form');
    };

    const handleCreateQuick = () => {
        setError(null);
        setIsQuickModalOpen(true);
    };
    
    const handleBackToDashboard = () => {
        setCurrentLesson(null);
        setError(null);
        setView('dashboard');
    };

    const handleSelectLesson = (lesson: LessonPlan) => {
        setCurrentLesson(lesson);
        setError(null);
        setView('display');
    };

    const handleSubmit = async (formData: LessonFormData) => {
        setIsLoading(true);
        setError(null);
        setView('loading');
        if (isQuickModalOpen) setIsQuickModalOpen(false);

        try {
            const newLessonPlan = await generateLessonPlan(formData);
            const lessonWithIdAndStatus: LessonPlan = {
                ...newLessonPlan,
                id: `lesson-${Date.now()}`,
                topic: formData.topic,
                status: 'טיוטה',
                creationDate: new Date().toISOString(),
            };
            setLessons(prev => [lessonWithIdAndStatus, ...prev]);
            setCurrentLesson(lessonWithIdAndStatus);
            setView('display');
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`שגיאה ביצירת מערך השיעור: ${errorMessage}`);
            setView('form'); // Go back to the form on error
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'loading':
                return <LessonGenerationLoader />;
            case 'form':
                return (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                        <div className="w-full max-w-6xl">
                            <LessonForm onSubmit={handleSubmit} isLoading={isLoading} onBack={handleBackToDashboard} error={error} />
                        </div>
                    </div>
                );
            case 'display':
                if (currentLesson) {
                    return (
                        <div className="flex flex-col h-screen bg-white" dir="rtl">
                             <div className="flex-shrink-0 p-4 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-800">תצוגת שיעור</h2>
                                <button onClick={handleBackToDashboard} className="text-sm font-semibold text-blue-600 hover:underline">
                                    &larr; חזרה לרשימת השיעורים
                                </button>
                            </div>
                            <div className="flex-grow">
                                <LessonDisplay lessonPlan={currentLesson} />
                            </div>
                        </div>
                    );
                }
                // Fallback if no lesson is selected, go to dashboard
                setView('dashboard');
                return null;
            case 'dashboard':
            default:
                return (
                    <div dir="rtl">
                        <Dashboard 
                            lessons={lessons}
                            onSelectLesson={handleSelectLesson}
                            onCreateNew={handleCreateNew}
                            onCreateQuick={handleCreateQuick}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="font-sans text-gray-900" dir="rtl">
             <main className="w-full">
                {renderContent()}
             </main>
             <QuickCreateModal 
                isOpen={isQuickModalOpen}
                onClose={() => setIsQuickModalOpen(false)}
                onSubmit={handleSubmit}
                isLoading={isLoading}
             />
        </div>
    );
};

export default App;