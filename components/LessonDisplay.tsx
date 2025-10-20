import React from 'react';
import type { LessonPlan, LessonActivity } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import ClockIcon from './icons/ClockIcon';
import TargetIcon from './icons/TargetIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import SparklesIcon from './icons/SparklesIcon';

interface LessonDisplayProps {
  lessonPlan: LessonPlan;
}

const activityTypeTranslations: Record<LessonActivity['type'], string> = {
    Introduction: 'פתיחה',
    Activity: 'פעילות',
    Discussion: 'דיון',
    Assessment: 'הערכה',
    Conclusion: 'סיכום',
};

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="div-cta rounded-xl">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
                <div className="bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 p-2 rounded-full ml-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            </div>
            {children}
        </div>
    </div>
);

const ActivityCard: React.FC<{ activity: LessonActivity, index: number }> = ({ activity, index }) => (
    <div className="p-5 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800">
        {activity.imageUrl && (
            <img src={activity.imageUrl} alt={activity.title} className="w-full h-40 object-cover mb-4 rounded-lg" />
        )}
        <div className="flex items-start">
            <div className="bg-pink-500 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold text-sm ml-4">
                {index + 1}
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{activity.title}</h4>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">
                    <ClockIcon className="w-4 h-4 ml-1.5" />
                    <span>{activity.duration} דקות</span>
                    <span className="mx-2">|</span>
                    <span className="font-medium text-pink-600 dark:text-pink-400">{activityTypeTranslations[activity.type] || activity.type}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{activity.description}</p>
            </div>
        </div>
    </div>
);


const LessonDisplay: React.FC<LessonDisplayProps> = ({ lessonPlan }) => {
  return (
    <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl">
      <header className="mb-8 pb-4 border-b-2 border-pink-200 dark:border-pink-800">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">{lessonPlan.lessonTitle}</h2>
        <div className="flex items-center space-x-4 space-x-reverse text-gray-600 dark:text-gray-300">
          <span>{lessonPlan.targetAudience}</span>
          <span>&bull;</span>
          <div className="flex items-center">
            <ClockIcon className="w-5 h-5 ml-1.5" />
            <span>{lessonPlan.lessonDuration} דקות</span>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <InfoCard icon={<TargetIcon className="w-6 h-6" />} title="מטרות למידה">
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {lessonPlan.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
            </ul>
        </InfoCard>

        <InfoCard icon={<ClipboardListIcon className="w-6 h-6" />} title="חומרים וציוד">
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {lessonPlan.materials.map((mat, i) => <li key={i}>{mat}</li>)}
            </ul>
        </InfoCard>

        <div className="div-cta rounded-xl">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
                <div className="bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 p-2 rounded-full ml-4"><BookOpenIcon className="w-6 h-6" /></div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">מהלך השיעור</h3>
            </div>
            <div className="space-y-4">
                {lessonPlan.lessonActivities.map((activity, i) => <ActivityCard key={i} activity={activity} index={i} />)}
            </div>
          </div>
        </div>
        
        <InfoCard icon={<SparklesIcon className="w-6 h-6" />} title="חוויה אימרסיבית">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{lessonPlan.immersiveExperienceIdea.title}</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{lessonPlan.immersiveExperienceIdea.description}</p>
        </InfoCard>

        <InfoCard icon={<LightbulbIcon className="w-6 h-6" />} title="הערכה ומדידה">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{lessonPlan.assessment.title}</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{lessonPlan.assessment.description}</p>
        </InfoCard>
      </div>
    </div>
  );
};

export default LessonDisplay;