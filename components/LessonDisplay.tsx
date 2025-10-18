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

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center mb-4">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full ml-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        {children}
    </div>
);

const ActivityCard: React.FC<{ activity: LessonActivity, index: number }> = ({ activity, index }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {activity.imageUrl ? (
            <img src={activity.imageUrl} alt={activity.title} className="w-full h-40 object-cover mb-4 rounded-lg" />
        ) : (
            <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                <BookOpenIcon className="w-12 h-12 text-gray-400" />
            </div>
        )}
        <div className="flex items-start">
             <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold text-sm ml-4">
                {index + 1}
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-gray-900">{activity.title}</h4>
                <div className="flex items-center text-sm text-gray-500 mt-1 mb-2">
                    <ClockIcon className="w-4 h-4 ml-1.5" />
                    <span>{activity.duration} דקות</span>
                    <span className="mx-2">|</span>
                    <span className="font-medium text-blue-600">{activity.type}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">{activity.description}</p>
            </div>
        </div>
    </div>
);


const LessonDisplay: React.FC<LessonDisplayProps> = ({ lessonPlan }) => {
  return (
    <div className="p-8 bg-gray-50 rounded-2xl h-full overflow-y-auto">
      <header className="mb-8 pb-4 border-b-2 border-blue-200">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{lessonPlan.lessonTitle}</h2>
        <div className="flex items-center space-x-4 space-x-reverse text-gray-600">
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
            <ul className="list-disc list-inside space-y-2 text-gray-700">
                {lessonPlan.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
            </ul>
        </InfoCard>

        <InfoCard icon={<ClipboardListIcon className="w-6 h-6" />} title="חומרים וציוד">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
                {lessonPlan.materials.map((mat, i) => <li key={i}>{mat}</li>)}
            </ul>
        </InfoCard>

        <div>
            <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full ml-4"><BookOpenIcon className="w-6 h-6" /></div>
                <h3 className="text-2xl font-bold text-gray-800">מהלך השיעור</h3>
            </div>
            <div className="space-y-4">
                {lessonPlan.lessonActivities.map((activity, i) => <ActivityCard key={i} activity={activity} index={i} />)}
            </div>
        </div>
        
        <InfoCard icon={<SparklesIcon className="w-6 h-6" />} title="חוויה אימרסיבית">
            <h4 className="font-bold text-lg text-gray-900 mb-2">{lessonPlan.immersiveExperienceIdea.title}</h4>
            <p className="text-gray-700 leading-relaxed">{lessonPlan.immersiveExperienceIdea.description}</p>
        </InfoCard>

        <InfoCard icon={<LightbulbIcon className="w-6 h-6" />} title="הערכה ומדידה">
            <h4 className="font-bold text-lg text-gray-900 mb-2">{lessonPlan.assessment.title}</h4>
            <p className="text-gray-700 leading-relaxed">{lessonPlan.assessment.description}</p>
        </InfoCard>
      </div>
    </div>
  );
};

export default LessonDisplay;