import React, { useState, useEffect, useContext, useRef } from 'react';
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
import ExportToCalendarModal from './components/ExportToCalendarModal';
import CalendarIcon from './components/icons/CalendarIcon';
import SendIcon from './components/icons/SendIcon';
import DocumentArrowDownIcon from './components/icons/DocumentArrowDownIcon';
import QuickCreatePage from './components/QuickCreatePage';
import Header from './components/Header';
import SupportChat from './components/SupportChat';
import ChatBubbleIcon from './components/icons/ChatBubbleIcon';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

type AppView = 'landing' | 'dashboard' | 'form' | 'display' | 'loading' | 'settings' | 'quickForm';

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
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [lessonToExport, setLessonToExport] = useState<LessonPlan | null>(null);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
    
    const lessonDisplayRef = useRef<HTMLDivElement>(null);
    
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
        setCurrentLesson(null);
        setEditingLesson(null);
        setError(null);
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
        if (window.innerWidth < 768) { // md breakpoint
            setView('quickForm');
        } else {
            setIsQuickModalOpen(true);
        }
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

    // FIX: Added the missing handleCancelDelete function to handle closing the confirmation modal.
    const handleCancelDelete = () => {
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

    const handleExportLesson = (lesson: LessonPlan) => {
        setLessonToExport(lesson);
        setIsExportModalOpen(true);
    };

    const handleExportToPdf = async () => {
        const element = lessonDisplayRef.current;
        if (!element || !currentLesson) return;

        setIsExportingPdf(true);
        document.body.classList.add('pdf-export-active');

        try {
            // A small delay helps ensure CSS changes are applied before capture
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await window.html2canvas(element, { 
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff', // Force a white background for consistency
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new window.jspdf.jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            const filename = `${currentLesson.lessonTitle.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_')}.pdf`;

            pdf.save(filename);
        } catch (err) {
            console.error("Error exporting to PDF", err);
            setError("שגיאה בייצוא ל-PDF. נסה לרענן את הדף.");
        } finally {
            // Ensure the class is always removed
            document.body.classList.remove('pdf-export-active');
            setIsExportingPdf(false);
        }
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
                
                // FIX: The 'lessonActivities' property is deprecated. The new data model uses a three-part structure.
                // This code now strips the 'imageUrl' from each screen in the 'opening', 'main', and 'summary' parts
                // before saving to local storage to avoid storing large base64 strings.
                const updatedLessonForHistory = {
                    ...updatedLessonWithImages,
                    opening: {
                        ...updatedLessonWithImages.opening,
                        screens: updatedLessonWithImages.opening.screens.map(({ imageUrl, ...rest }) => rest),
                    },
                    main: {
                        ...updatedLessonWithImages.main,
                        screens: updatedLessonWithImages.main.screens.map(({ imageUrl, ...rest }) => rest),
                    },
                    summary: {
                        ...updatedLessonWithImages.summary,
                        screens: updatedLessonWithImages.summary.screens.map(({ imageUrl, ...rest }) => rest),
                    },
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

                // FIX: The 'lessonActivities' property is deprecated. The new data model uses a three-part structure.
                // This code now strips the 'imageUrl' from each screen in the 'opening', 'main', and 'summary' parts
                // before saving to local storage to avoid storing large base64 strings.
                const lessonForHistory = {
                    ...lessonWithIdAndStatus,
                    opening: {
                        ...lessonWithIdAndStatus.opening,
                        screens: lessonWithIdAndStatus.opening.screens.map(({ imageUrl, ...rest }) => rest),
                    },
                    main: {
                        ...lessonWithIdAndStatus.main,
                        screens: lessonWithIdAndStatus.main.screens.map(({ imageUrl, ...rest }) => rest),
                    },
                    summary: {
                        ...lessonWithIdAndStatus.summary,
                        screens: lessonWithIdAndStatus.summary.screens.map(({ imageUrl, ...rest }) => rest),
                    },
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

    const renderSupportChat = () => {
        const supportChatViews: AppView[] = ['landing', 'dashboard', 'display', 'settings'];
        if (!supportChatViews.includes(view)) {
            return null;
        }

        return (
            <>
                {!isSupportChatOpen && (
                    <button
                        onClick={() => setIsSupportChatOpen(true)}
                        className="fixed bottom-8 right-8 z-40 p-2 text-white rounded-full shadow-lg transition-transform transform hover:scale-110 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
                        title="פתח צ'אט תמיכה"
                    >
                        <ChatBubbleIcon className="w-8 h-8" />
                    </button>
                )}
                <SupportChat
                    isOpen={isSupportChatOpen}
                    onClose={() => setIsSupportChatOpen(false)}
                />
            </>
        )
    }

    const renderContent = () => {
        const mainAppViews: AppView[] = ['dashboard', 'form', 'display', 'settings'];
        const isMainAppView = mainAppViews.includes(view);

        let pageContent;

        switch (view) {
            case 'landing':
                return <LandingPage onEnter={handleNavigateToDashboard} onNavigateHome={handleNavigateHome} />;
            case 'loading':
                return <LessonGenerationLoader />;
            case 'quickForm':
                 return (
                    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4" dir="rtl">
                        <div className="container mx-auto">
                            <QuickCreatePage
                                onSubmit={handleSubmit}
                                isLoading={isLoading}
                                onBack={handleBackToDashboard}
                                error={error}
                            />
                        </div>
                    </div>
                );
            case 'form':
                pageContent = (
                    <div className="flex items-center justify-center p-4">
                        <div className="container mx-auto">
                            <LessonForm 
                                onSubmit={handleSubmit} 
                                isLoading={isLoading} 
                                error={error}
                                initialData={editingLesson}
                            />
                        </div>
                    </div>
                );
                break;
            case 'display':
                if (currentLesson) {
                    pageContent = (
                        <div className="flex flex-col bg-white dark:bg-zinc-950">
                             <div className="px-4 flex-shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                                <div className="container mx-auto py-4 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">תצוגת שיעור</h2>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleExportToPdf}
                                            disabled={isExportingPdf}
                                            className="flex items-center gap-2 px-4 py-2 text-black dark:text-white text-sm font-semibold rounded-lg transition-colors bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isExportingPdf ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    מייצא...
                                                </>
                                            ) : (
                                                <>
                                                    <DocumentArrowDownIcon className="w-5 h-5" />
                                                    ייצא ל-PDF
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleExportLesson(currentLesson)}
                                            className="flex items-center gap-2 px-4 py-2 text-black dark:text-white text-sm font-semibold rounded-lg transition-colors bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600"
                                        >
                                            <CalendarIcon className="w-5 h-5" />
                                            ייצא ליומן
                                        </button>
                                        {currentLesson.status === 'טיוטה' && (
                                            <button 
                                                onClick={() => handlePublishLesson(currentLesson.id)}
                                                className="flex items-center gap-2 px-4 py-2 text-black dark:text-white text-sm font-semibold rounded-lg transition-colors bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600"
                                            >
                                            <SendIcon className="w-5 h-5" />
                                            פרסם
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow" ref={lessonDisplayRef}>
                                <div className="container mx-auto">
                                    <LessonDisplay lessonPlan={currentLesson} />
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    setView('dashboard');
                    return null;
                }
                break;
            case 'settings':
                pageContent = <Settings />;
                break;
            case 'dashboard':
            default:
                pageContent = (
                    <Dashboard 
                        lessons={lessons}
                        onSelectLesson={handleSelectLesson}
                        onCreateNew={handleCreateNew}
                        onCreateQuick={handleCreateQuick}
                        onDelete={handleDeleteLesson}
                        onPublish={handlePublishLesson}
                        onEdit={handleStartEdit}
                    />
                );
                break;
        }

        if (isMainAppView) {
            return (
                 <div className="bg-gray-50 dark:bg-zinc-900 min-h-screen" dir="rtl">
                    <Header
                        onNavigateHome={handleNavigateHome}
                        onNavigateToDashboard={handleNavigateToDashboard}
                        onNavigateToSettings={() => handleNavigate('settings')}
                    />
                    {pageContent}
                </div>
            )
        }

        return pageContent;
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
             <ExportToCalendarModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                lesson={lessonToExport}
             />
             <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="אישור מחיקה"
                message="האם אתה בטוח שברצונך למחוק את השיעור? לא ניתן לשחזר פעולה זו."
             />
             {renderSupportChat()}
        </div>
    );
};

export default App;