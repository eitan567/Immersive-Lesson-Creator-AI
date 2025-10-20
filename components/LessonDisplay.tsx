import React, { useState } from 'react';
import type { LessonPlan, LessonPart, Screen } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import ClockIcon from './icons/ClockIcon';
import TargetIcon from './icons/TargetIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import SparklesIcon from './icons/SparklesIcon';
import XIcon from './icons/XIcon';
import UsersIcon from './icons/UsersIcon';
import MonitorIcon from './icons/MonitorIcon';


interface LessonDisplayProps {
  lessonPlan: LessonPlan;
}

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="div-cta rounded-xl">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-md h-full">
            <div className="flex items-center mb-4">
                <div className="bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 p-2 rounded-full ml-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            </div>
            {children}
        </div>
    </div>
);

const ScreenDisplay: React.FC<{ screen: Screen, onImageClick: (url: string) => void }> = ({ screen, onImageClick }) => {
    const isImage = screen.type === 'תמונה' && screen.imageUrl;
    return (
        <div className={`p-4 rounded-lg border border-gray-200 dark:border-zinc-800 ${isImage ? 'flex flex-col md:flex-row gap-4 items-start' : ''}`}>
             <div className="flex-grow">
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    <span className="bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-md text-sm">{screen.type}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{screen.description}</p>
            </div>
            {isImage && (
                <div className="w-full md:w-1/4 flex-shrink-0 mt-2 md:mt-0">
                    <button onClick={() => onImageClick(screen.imageUrl!)} className="w-full group" aria-label={`הצג תמונה במלואה: ${screen.description}`}>
                        <img 
                          src={screen.imageUrl} 
                          alt={screen.description} 
                          className="w-full h-auto object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300" 
                        />
                    </button>
                </div>
            )}
        </div>
    );
};


const LessonPartDisplay: React.FC<{ part: LessonPart; title: string; onImageClick: (url: string) => void }> = ({ part, title, onImageClick }) => (
    <div className="div-cta rounded-xl">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
                <div className="bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 p-2 rounded-full ml-4"><BookOpenIcon className="w-6 h-6" /></div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            </div>
            <div className="space-y-4">
                <div className="flex items-center text-md text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg">
                    <UsersIcon className="w-5 h-5 ml-3 text-pink-600 dark:text-pink-400" />
                    <strong>אופן שימוש במרחב:</strong>
                    <span className="mr-2">{part.spaceUsage}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{part.content}</p>
                {part.screens && part.screens.length > 0 && (
                    <div className="space-y-3 pt-3">
                         <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center"><MonitorIcon className="w-5 h-5 ml-2 text-pink-600 dark:text-pink-400"/>מסכים</h4>
                        {part.screens.map((screen, i) => <ScreenDisplay key={i} screen={screen} onImageClick={onImageClick} />)}
                    </div>
                )}
            </div>
        </div>
    </div>
);


const LessonDisplay: React.FC<LessonDisplayProps> = ({ lessonPlan }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <div className="pt-6 pb-6 px-6 md:px-4 lg:px-4">
      <header className="mb-8 pb-4 border-b-2 border-pink-200 dark:border-pink-800">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">{lessonPlan.lessonTitle}</h2>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-gray-600 dark:text-gray-300">
          <span className="font-semibold text-pink-600 dark:text-pink-400">{lessonPlan.category}</span>
          <span>&bull;</span>
          <span>{lessonPlan.targetAudience}</span>
          <span>&bull;</span>
          <div className="flex items-center">
            <ClockIcon className="w-5 h-5 ml-1.5" />
            <span>{lessonPlan.lessonDuration} דקות</span>
          </div>
        </div>
         <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{lessonPlan.generalDescription}</p>
      </header>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoCard icon={<TargetIcon className="w-6 h-6" />} title="מטרות תוכן">
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    {lessonPlan.contentGoals.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
            </InfoCard>
            <InfoCard icon={<SparklesIcon className="w-6 h-6" />} title="מטרות מיומנות">
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    {lessonPlan.skillGoals.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
            </InfoCard>
        </div>
        
        <LessonPartDisplay part={lessonPlan.opening} title="פתיחה" onImageClick={setFullscreenImage} />
        <LessonPartDisplay part={lessonPlan.main} title="עיקר השיעור" onImageClick={setFullscreenImage} />
        <LessonPartDisplay part={lessonPlan.summary} title="סיכום" onImageClick={setFullscreenImage} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <InfoCard icon={<ClipboardListIcon className="w-6 h-6" />} title="חומרים וציוד">
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    {lessonPlan.materials.map((mat, i) => <li key={i}>{mat}</li>)}
                </ul>
            </InfoCard>
            <InfoCard icon={<LightbulbIcon className="w-6 h-6" />} title="הערכה ומדידה">
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{lessonPlan.assessment.title}</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{lessonPlan.assessment.description}</p>
            </InfoCard>
        </div>
        
        <InfoCard icon={<SparklesIcon className="w-6 h-6" />} title="חוויה אימרסיבית">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{lessonPlan.immersiveExperienceIdea.title}</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{lessonPlan.immersiveExperienceIdea.description}</p>
        </InfoCard>
      </div>

       {fullscreenImage && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" 
                onClick={() => setFullscreenImage(null)}
                dir="ltr"
                role="dialog"
                aria-modal="true"
                aria-label="תצוגת תמונה במסך מלא"
            >
                <button 
                    onClick={() => setFullscreenImage(null)} 
                    className="absolute top-5 right-5 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors"
                    aria-label="סגור תצוגת מסך מלא"
                >
                    <XIcon className="w-8 h-8" />
                </button>
                <figure className="max-w-full max-h-full" onClick={e => e.stopPropagation()}>
                    <img 
                        src={fullscreenImage} 
                        alt="Fullscreen view" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                </figure>
            </div>
        )}
    </div>
  );
};

export default LessonDisplay;