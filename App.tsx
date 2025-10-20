import React, { useState, useEffect, useContext } from 'react';
import type { LessonFormData, LessonPlan } from './types';
import { generateLessonPlan } from './services/geminiService';
import Dashboard from './components/Dashboard';
import LessonForm from './components/LessonForm';
import LessonDisplay from './components/LessonDisplay';
import LessonGenerationLoader from './components/LessonGenerationLoader';
import QuickCreateModal from './components/QuickCreateModal';
import Settings from './components/Settings';
import ConfirmModal from './components/ConfirmModal';
import LandingPage from './components/LandingPage';
import { SettingsContext } from './contexts/SettingsContext';

type AppView = 'landing' | 'dashboard' | 'form' | 'display' | 'loading' | 'settings';

const App: React.FC = () => {
    const { settings } = useContext(SettingsContext);
    const [view, setView] = useState<AppView>('landing');
    const [lessons, setLessons] = useState<LessonPlan[]>([]);
    const [currentLesson, setCurrentLesson] = useState<LessonPlan | null>(null);
    const [editingLesson, setEditingLesson] = useState<LessonPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
    
     useEffect(() => {
        const root = window.document.documentElement;
        const isDark = settings.theme === 'dark';
        const isSystem = settings.theme === 'system';

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = () => {
            if (isDark || (isSystem && mediaQuery.matches)) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applyTheme();

        mediaQuery.addEventListener('change', applyTheme);
        return () => mediaQuery.removeEventListener('change', applyTheme);
    }, [settings.theme]);
    
    useEffect(() => {
        try {
            console.log('[Storage] Attempting to load lessons from localStorage.');
            const savedLessons = localStorage.getItem('lessonPlanHistory');
            if (savedLessons) {
                const parsedLessons = JSON.parse(savedLessons);
                console.log(`[Storage] Loaded ${parsedLessons.length} lessons.`, parsedLessons);
                setLessons(parsedLessons);
            } else {
                console.log('[Storage] No saved lessons found in localStorage.');
            }
        } catch (e) {
            console.error("Failed to parse lessons from localStorage", e);
        }
    }, []);

    const saveLessons = (lessonsToSave: LessonPlan[]) => {
        try {
            console.log(`[Storage] Attempting to save ${lessonsToSave.length} lessons.`);
            localStorage.setItem('lessonPlanHistory', JSON.stringify(lessonsToSave));
            console.log('[Storage] Successfully saved lessons.', lessonsToSave);
        } catch (e) {
            console.error('Failed to save lessons to localStorage', e);
        }
    };

    const handleNavigateToDashboard = () => {
        setView('dashboard');
    };

    const handleNavigateHome = () => {
        setView('landing');
    };

    const handleCreateNew = () => {
        setCurrentLesson(null);
        setEditingLesson(null);
        setError(null);
        setView('form');
    };

    const handleCreateQuick = () => {
        setError(null);
        setEditingLesson(null);
        setIsQuickModalOpen(true);
    };
    
    const handleBackToDashboard = () => {
        setCurrentLesson(null);
        setEditingLesson(null);
        setError(null);
        setView('dashboard');
    };

    const handleSelectLesson = (lesson: LessonPlan) => {
        setCurrentLesson(lesson);
        setError(null);
        setView('display');
    };
    
    const handleNavigate = (targetView: AppView) => {
        setView(targetView);
    };

    const handleDeleteLesson = (lessonId: string) => {
        console.log(`[Delete] Initiating deletion for lesson ID: ${lessonId}`);
        setLessonToDelete(lessonId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!lessonToDelete) return;

        console.log(`[Delete] User confirmed deletion for lesson ID: ${lessonToDelete}`);
        const newLessons = lessons.filter(l => l.id !== lessonToDelete);
        console.log(`[Delete] Lessons count before: ${lessons.length}, after: ${newLessons.length}`);
        setLessons(newLessons);
        saveLessons(newLessons);

        setIsConfirmModalOpen(false);
        setLessonToDelete(null);
    };

    const handleCancelDelete = () => {
        console.log(`[Delete] User cancelled deletion for lesson ID: ${lessonToDelete}`);
        setIsConfirmModalOpen(false);
        setLessonToDelete(null);
    };

    const handlePublishLesson = (lessonId: string) => {
        const updatedLessons = lessons.map(l => l.id === lessonId ? { ...l, status: 'פורסם' as const } : l);
        setLessons(updatedLessons);
        saveLessons(updatedLessons);
        if (currentLesson?.id === lessonId) {
            setCurrentLesson(prev => prev ? { ...prev, status: 'פורסם' } : null);
        }
    };
    
    const handleStartEdit = (lesson: LessonPlan) => {
        setEditingLesson(lesson);
        setView('form');
    };

    const handleSubmit = async (formData: LessonFormData) => {
        setIsLoading(true);
        setError(null);
        setView('loading');
        if (isQuickModalOpen) setIsQuickModalOpen(false);

        try {
            const isUpdate = !!formData.id;
            const newLessonPlanContent = await generateLessonPlan(formData, settings.aiModel, settings.generateImages);
            
            if (isUpdate) {
                const originalLesson = lessons.find(l => l.id === formData.id);
                const updatedLessonWithImages = {
                    ...newLessonPlanContent,
                    id: formData.id!,
                    topic: formData.topic,
                    creationDate: originalLesson?.creationDate || new Date().toISOString(),
                    status: 'טיוטה' as 'טיוטה' | 'פורסם',
                };
                
                const updatedLessonForHistory = {
                    ...updatedLessonWithImages,
                    lessonActivities: updatedLessonWithImages.lessonActivities.map(({ imageUrl, ...activity }) => activity),
                };

                const newLessons = lessons.map(l => l.id === formData.id ? updatedLessonForHistory : l);
                setLessons(newLessons);
                saveLessons(newLessons);
                setCurrentLesson(updatedLessonWithImages);

            } else {
                const lessonWithIdAndStatus: LessonPlan = {
                    ...newLessonPlanContent,
                    id: `lesson-${Date.now()}`,
                    topic: formData.topic,
                    status: 'טיוטה',
                    creationDate: new Date().toISOString(),
                };

                const lessonForHistory = {
                    ...lessonWithIdAndStatus,
                    lessonActivities: lessonWithIdAndStatus.lessonActivities.map(({ imageUrl, ...activity }) => activity),
                };
                
                const newLessons = [lessonForHistory, ...lessons];
                setLessons(newLessons);
                saveLessons(newLessons);
                setCurrentLesson(lessonWithIdAndStatus);
            }

            setView('display');
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`שגיאה ביצירת מערך השיעור: ${errorMessage}`);
            setView(editingLesson ? 'form' : 'dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'landing':
                return <LandingPage onEnter={handleNavigateToDashboard} onNavigateHome={handleNavigateHome} />;
            case 'loading':
                return <LessonGenerationLoader />;
            case 'settings':
                return <Settings onBack={handleBackToDashboard} />;
            case 'form':
                return (
                    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4" dir="rtl">
                        <div className="container mx-auto">
                            <LessonForm 
                                onSubmit={handleSubmit} 
                                isLoading={isLoading} 
                                onBack={handleBackToDashboard} 
                                error={error}
                                initialData={editingLesson}
                            />
                        </div>
                    </div>
                );
            case 'display':
                if (currentLesson) {
                    return (
                        <div className="flex flex-col h-screen bg-white dark:bg-zinc-950" dir="rtl">
                             <div className="flex-shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">תצוגת שיעור</h2>
                                    <div className="flex items-center gap-4">
                                        {currentLesson.status === 'טיוטה' && (
                                            <button 
                                                onClick={() => handlePublishLesson(currentLesson.id)}
                                                className="px-4 py-2 text-black dark:text-white text-sm font-semibold rounded-lg transition-colors"
                                            >
                                                פרסם
                                            </button>
                                        )}
                                        <button onClick={handleBackToDashboard} className="text-sm font-semibold text-pink-600 hover:underline dark:text-pink-400 dark:hover:text-pink-300">
                                            &larr; חזרה לרשימת השיעורים
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto">
                                <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                                    <LessonDisplay lessonPlan={currentLesson} />
                                </div>
                            </div>
                        </div>
                    );
                }
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
                            onNavigateToSettings={() => handleNavigate('settings')}
                            onDelete={handleDeleteLesson}
                            onPublish={handlePublishLesson}
                            onEdit={handleStartEdit}
                            onNavigateHome={handleNavigateHome}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="text-gray-900 dark:text-gray-100" dir="rtl">
             <main className="w-full">
                {renderContent()}
             </main>
             <QuickCreateModal 
                isOpen={isQuickModalOpen}
                onClose={() => setIsQuickModalOpen(false)}
                onSubmit={handleSubmit}
                isLoading={isLoading}
             />
             <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="אישור מחיקה"
                message="האם אתה בטוח שברצונך למחוק את השיעור? לא ניתן לשחזר פעולה זו."
             />
        </div>
    );
};

export default App;