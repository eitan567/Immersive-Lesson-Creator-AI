import React, { useState, useContext, useEffect } from 'react';
import type { LessonFormData, SuggestionField, ChatMessage, LessonPlan } from '../types';
import { GRADE_LEVELS, LESSON_TOPICS, TEACHING_STYLES, TONES, CATEGORIES, PLACEMENT_IN_CONTENT_OPTIONS, SPACE_USAGE_OPTIONS, SCREEN_TYPES } from '../constants';
import { generateFullFormSuggestions, generateFieldSuggestion } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import CustomSelect from './CustomSelect';
import PaperClipIcon from './icons/PaperClipIcon';
import TrashIcon from './icons/TrashIcon';
import SuggestionModal from './SuggestionModal';
import LessonChat from './LessonChat';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import { SettingsContext } from '../contexts/SettingsContext';
import ChevronDoubleLeftIcon from './icons/ChevronDoubleLeftIcon';
import ChevronDoubleRightIcon from './icons/ChevronDoubleRightIcon';


interface LessonFormProps {
  onSubmit: (formData: LessonFormData) => void;
  isLoading: boolean;
  error?: string | null;
  initialData?: LessonPlan | null;
}

interface SuggestionState {
    isOpen: boolean;
    isLoading: boolean;
    field: SuggestionField | null;
    title: string;
    suggestions: string[];
}

const defaultFormData: LessonFormData = {
  // New required fields
  category: '',
  unitTopic: '',

  // New optional fields
  priorKnowledge: '',
  placementInContent: '',
  contentGoals: '',
  skillGoals: '',
  generalDescription: '',

  openingContent: '',
  openingSpaceUsage: SPACE_USAGE_OPTIONS[0],
  mainContent: '',
  mainSpaceUsage: SPACE_USAGE_OPTIONS[0],
  summaryContent: '',
  summarySpaceUsage: SPACE_USAGE_OPTIONS[0],

  // Defaulting screens
  openingScreen1Type: SCREEN_TYPES[0], openingScreen1Desc: '',
  openingScreen2Type: SCREEN_TYPES[0], openingScreen2Desc: '',
  openingScreen3Type: SCREEN_TYPES[0], openingScreen3Desc: '',
  mainScreen1Type: SCREEN_TYPES[0], mainScreen1Desc: '',
  mainScreen2Type: SCREEN_TYPES[0], mainScreen2Desc: '',
  mainScreen3Type: SCREEN_TYPES[0], mainScreen3Desc: '',
  summaryScreen1Type: SCREEN_TYPES[0], summaryScreen1Desc: '',
  summaryScreen2Type: SCREEN_TYPES[0], summaryScreen2Desc: '',
  summaryScreen3Type: SCREEN_TYPES[0], summaryScreen3Desc: '',

  // Original fields
  topic: '',
  gradeLevel: '',
  duration: '45',
  objectives: '',
  keyConcepts: '',
  file: null,
  teachingStyle: '',
  tone: '',
  successMetrics: '',
  inclusion: '',
  immersiveExperienceTitle: '',
  immersiveExperienceDescription: '',
};

const LessonPartFormSection: React.FC<{
    partName: 'opening' | 'main' | 'summary';
    partLabel: string;
    formData: LessonFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => void;
    handleRequestSuggestion: (field: SuggestionField, title: string) => void;
}> = ({ partName, partLabel, formData, handleChange, handleRequestSuggestion }) => {
    
    const AiSuggestionButton: React.FC<{field: SuggestionField, title: string}> = ({ field, title }) => (
      <button
          type="button"
          onClick={() => handleRequestSuggestion(field, `הצעות עבור: ${title}`)}
          className="text-pink-500 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
          title={`קבל הצעות AI עבור ${title}`}
      >
          <SparklesIcon className="w-5 h-5" />
      </button>
    );
    
    const contentField = `${partName}Content` as const;

    return (
        <fieldset className="border border-gray-300 dark:border-zinc-700 p-4 rounded-lg">
            <legend className="text-xl font-bold text-pink-600 dark:text-pink-400 px-2">{partLabel}</legend>
            <div className="space-y-4">
                <div>
                    <label htmlFor={contentField} className="flex items-center gap-2 block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span>תוכן</span>
                        <AiSuggestionButton field={contentField} title={`תוכן ל${partLabel}`} />
                    </label>
                    <textarea
                        id={contentField}
                        name={contentField}
                        value={formData[contentField] || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder={`תאר את הפעילויות והתוכן עבור חלק ה${partLabel}...`}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
                <div>
                    <label htmlFor={`${partName}SpaceUsage`} className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">אופן השימוש במרחב</label>
                    <CustomSelect
                        id={`${partName}SpaceUsage`}
                        name={`${partName}SpaceUsage`}
                        value={formData[`${partName}SpaceUsage` as keyof LessonFormData] as string || SPACE_USAGE_OPTIONS[0]}
                        onChange={handleChange}
                        options={SPACE_USAGE_OPTIONS}
                        className="bg-gray-50 dark:bg-zinc-800"
                    />
                </div>
                <div>
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">מסכים (עד 3)</label>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md border border-gray-200 dark:border-zinc-700/50">
                                <CustomSelect
                                    id={`${partName}Screen${i}Type`}
                                    name={`${partName}Screen${i}Type`}
                                    value={formData[`${partName}Screen${i}Type` as keyof LessonFormData] as string || SCREEN_TYPES[0]}
                                    onChange={handleChange}
                                    options={SCREEN_TYPES}
                                    className="bg-white dark:bg-zinc-800"
                                />
                                <input
                                    type="text"
                                    name={`${partName}Screen${i}Desc`}
                                    value={formData[`${partName}Screen${i}Desc` as keyof LessonFormData] as string || ''}
                                    onChange={handleChange}
                                    placeholder={`תיאור מסך ${i}...`}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </fieldset>
    );
};


const LessonForm: React.FC<LessonFormProps> = ({ onSubmit, isLoading, error, initialData }) => {
  const { settings, setSettings } = useContext(SettingsContext);
  const [formData, setFormData] = useState<LessonFormData>(defaultFormData);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [suggestionState, setSuggestionState] = useState<SuggestionState>({
      isOpen: false,
      isLoading: false,
      field: null,
      title: '',
      suggestions: [],
  });
  const [isChatOpen, setIsChatOpen] = useState(settings.isChatPinned);

  useEffect(() => {
    if (initialData) {
        setFormData({
            id: initialData.id,
            topic: initialData.topic,
            unitTopic: initialData.unitTopic,
            category: initialData.category,
            gradeLevel: initialData.targetAudience,
            duration: String(initialData.lessonDuration),
            priorKnowledge: initialData.priorKnowledge,
            placementInContent: initialData.placementInContent,
            contentGoals: initialData.contentGoals.join('\n'),
            skillGoals: initialData.skillGoals.join('\n'),
            generalDescription: initialData.generalDescription,

            openingContent: initialData.opening.content,
            openingSpaceUsage: initialData.opening.spaceUsage,
            openingScreen1Type: initialData.opening.screens[0]?.type || SCREEN_TYPES[0],
            openingScreen1Desc: initialData.opening.screens[0]?.description || '',
            openingScreen2Type: initialData.opening.screens[1]?.type || SCREEN_TYPES[0],
            openingScreen2Desc: initialData.opening.screens[1]?.description || '',
            openingScreen3Type: initialData.opening.screens[2]?.type || SCREEN_TYPES[0],
            openingScreen3Desc: initialData.opening.screens[2]?.description || '',

            mainContent: initialData.main.content,
            mainSpaceUsage: initialData.main.spaceUsage,
            mainScreen1Type: initialData.main.screens[0]?.type || SCREEN_TYPES[0],
            mainScreen1Desc: initialData.main.screens[0]?.description || '',
            mainScreen2Type: initialData.main.screens[1]?.type || SCREEN_TYPES[0],
            mainScreen2Desc: initialData.main.screens[1]?.description || '',
            mainScreen3Type: initialData.main.screens[2]?.type || SCREEN_TYPES[0],
            mainScreen3Desc: initialData.main.screens[2]?.description || '',

            summaryContent: initialData.summary.content,
            summarySpaceUsage: initialData.summary.spaceUsage,
            summaryScreen1Type: initialData.summary.screens[0]?.type || SCREEN_TYPES[0],
            summaryScreen1Desc: initialData.summary.screens[0]?.description || '',
            summaryScreen2Type: initialData.summary.screens[1]?.type || SCREEN_TYPES[0],
            summaryScreen2Desc: initialData.summary.screens[1]?.description || '',
            summaryScreen3Type: initialData.summary.screens[2]?.type || SCREEN_TYPES[0],
            summaryScreen3Desc: initialData.summary.screens[2]?.description || '',

            // These fields are not stored in the lesson plan, so they are reset on edit.
            objectives: initialData.learningObjectives.join('\n'),
            keyConcepts: '',
            file: null,
            teachingStyle: TEACHING_STYLES[0],
            tone: TONES[0],
            successMetrics: '',
            inclusion: '',
            immersiveExperienceTitle: initialData.immersiveExperienceIdea.title,
            immersiveExperienceDescription: initialData.immersiveExperienceIdea.description,
        });
    } else {
        setFormData(defaultFormData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
      alert("הקובץ גדול מדי. הגודל המקסימלי הוא 10MB.");
      return;
    }
    setFormData(prev => ({ ...prev, file }));
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAutoFill = async () => {
    if (!formData.unitTopic || !formData.gradeLevel) {
      alert("יש למלא 'נושא היחידה' ו'שכבת גיל' לפני הפעלת המילוי האוטומטי.");
      return;
    }
    setIsAutoFilling(true);
    try {
      const suggestions = await generateFullFormSuggestions(formData.unitTopic, formData.gradeLevel);
      setFormData(prev => ({ ...prev, ...suggestions }));
    } catch (err) {
      alert(`שגיאה במילוי האוטומטי: ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}`);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleRequestSuggestion = async (field: SuggestionField, title: string) => {
    if (!formData.unitTopic) {
        alert("יש למלא 'נושא היחידה' תחילה.");
        return;
    }
    setSuggestionState({ isOpen: true, isLoading: true, field, title, suggestions: [] });
    try {
        const suggestions = await generateFieldSuggestion(field, formData);
        setSuggestionState(prev => ({ ...prev, isLoading: false, suggestions }));
    } catch (err) {
        alert(`שגיאה בקבלת הצעות: ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}`);
        setSuggestionState({ isOpen: false, isLoading: false, field: null, title: '', suggestions: [] });
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (suggestionState.field) {
        const field = suggestionState.field;
        
        if (field === 'immersiveExperience') {
            const lines = suggestion.split('\n');
            const titleLine = lines.find(line => line.toLowerCase().startsWith('כותרת:'));
            const descriptionLine = lines.find(line => line.toLowerCase().startsWith('תיאור:'));

            const title = titleLine ? titleLine.substring('כותרת:'.length).trim() : '';
            const description = descriptionLine ? descriptionLine.substring('תיאור:'.length).trim() : 
                (title ? lines.slice(1).join('\n').replace(/^תיאור:\s*/i, '').trim() : suggestion);

            setFormData(prev => ({
                ...prev,
                immersiveExperienceTitle: title,
                immersiveExperienceDescription: description,
            }));
        } else {
            setFormData(prev => {
               if ((field === 'keyConcepts' || field === 'contentGoals' || field === 'skillGoals' || field === 'objectives') && prev[field]) {
                   return {...prev, [field]: `${prev[field]}\n${suggestion}`};
               }
               return {...prev, [field]: suggestion};
            });
        }
    }
  };

  const handleUpdateFormFromChat = (field: SuggestionField, value: string) => {
      setFormData(prev => {
          const currentFieldValue = prev[field] || '';
          const newValue = currentFieldValue ? `${currentFieldValue}\n- ${value}` : value;
          return { ...prev, [field]: newValue };
      });
  };

  const AiSuggestionButton: React.FC<{field: SuggestionField, title: string}> = ({ field, title }) => (
    <button
        type="button"
        onClick={() => handleRequestSuggestion(field, `הצעות עבור: ${title}`)}
        className="text-pink-500 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
        title={`קבל הצעות AI עבור ${title}`}
    >
        <SparklesIcon className="w-5 h-5" />
    </button>
  );
  
  const chatButtonClasses = `fixed bottom-8 text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-110 z-40 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 ${settings.chatPosition === 'left' ? 'left-8' : 'right-8'}`;

  const isPinnedAndOpen = settings.isChatPinned && isChatOpen;
  const isEditing = !!initialData;

  const FormContent = (
      <div className="flex-grow">
        <div className="rounded-2xl">
          <div className="bg-white dark:bg-zinc-900">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{isEditing ? 'עריכת שיעור' : 'יצירת שיעור חדש'}</h2>
                  <button
                      type="button"
                      onClick={handleAutoFill}
                      disabled={isAutoFilling}
                      className="p-1 rounded-full text-pink-600 dark:text-pink-400 disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:bg-pink-100 dark:hover:bg-zinc-800"
                      title="מילוי אוטומטי באמצעות AI"
                  >
                      {isAutoFilling ? (
                          <svg className="animate-spin h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                        <SparklesIcon className="w-7 h-7" />
                      )}
                  </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 text-center">
                  {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Main lesson plan details */}
              <fieldset className="border border-gray-300 dark:border-zinc-700 p-6 rounded-lg">
                <legend className="text-2xl font-bold text-pink-600 dark:text-pink-400 px-2">תוכנית השיעור</legend>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 mt-4">
                  <div className="space-y-6">
                      <div>
                        <label htmlFor="category" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">קטגוריה <span className="text-red-500">*</span></label>
                        <CustomSelect id="category" name="category" value={formData.category} onChange={handleChange} options={CATEGORIES} className="bg-gray-50 dark:bg-zinc-800" required placeholder="בחרו קטגוריה..." />
                      </div>
                      <div>
                        <label htmlFor="unitTopic" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">נושא היחידה <span className="text-red-500">*</span></label>
                        <input type="text" id="unitTopic" name="unitTopic" value={formData.unitTopic} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100" required placeholder="לדוגמה: מבוא לאלגברה, המהפכה הצרפתית" />
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="gradeLevel" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">שכבת גיל</label>
                            <CustomSelect id="gradeLevel" name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} options={GRADE_LEVELS} className="bg-gray-50 dark:bg-zinc-800" placeholder="בחרו שכבת גיל..." />
                          </div>
                          <div>
                            <label htmlFor="duration" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">זמן כולל (בדקות)</label>
                            <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleChange} min="10" max="180" step="5" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100" required />
                          </div>
                        </div>
                         <div>
                            <label htmlFor="placementInContent" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">מיקום בתוכן</label>
                            <CustomSelect id="placementInContent" name="placementInContent" value={formData.placementInContent || ''} onChange={handleChange} options={PLACEMENT_IN_CONTENT_OPTIONS} className="bg-gray-50 dark:bg-zinc-800" placeholder="בחרו מיקום ברצף הלמידה..." />
                        </div>
                  </div>
                  <div className="space-y-6">
                     <div>
                        <label htmlFor="priorKnowledge" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <span>ידע קודם נדרש</span>
                            <AiSuggestionButton field="priorKnowledge" title="ידע קודם נדרש" />
                        </label>
                        <textarea id="priorKnowledge" name="priorKnowledge" value={formData.priorKnowledge} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100" placeholder="מה התלמידים צריכים לדעת לפני השיעור?"></textarea>
                      </div>
                      <div>
                        <label htmlFor="contentGoals" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <span>מטרות ברמת התוכן</span>
                            <AiSuggestionButton field="contentGoals" title="מטרות ברמת התוכן" />
                        </label>
                        <textarea id="contentGoals" name="contentGoals" value={formData.contentGoals} onChange={handleChange} rows={2} placeholder="מה התלמידים ידעו?" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100"></textarea>
                      </div>
                      <div>
                        <label htmlFor="skillGoals" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <span>מטרות ברמת המיומנויות</span>
                            <AiSuggestionButton field="skillGoals" title="מטרות ברמת המיומנויות" />
                        </label>
                        <textarea id="skillGoals" name="skillGoals" value={formData.skillGoals} onChange={handleChange} rows={2} placeholder="מה התלמידים יוכלו לעשות?" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100"></textarea>
                      </div>
                      <div>
                        <label htmlFor="generalDescription" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <span>תיאור כללי</span>
                             <AiSuggestionButton field="generalDescription" title="תיאור כללי" />
                        </label>
                        <textarea id="generalDescription" name="generalDescription" value={formData.generalDescription} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100" placeholder="תארו בקצרה את מהלך השיעור והפעילויות המרכזיות."></textarea>
                      </div>
                  </div>
                </div>
              </fieldset>

              {/* Lesson Parts */}
               <h2 className="text-2xl font-bold text-pink-600 dark:text-pink-400 px-2 text-center">חלקי השיעור</h2>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <LessonPartFormSection partName="opening" partLabel="פתיחה" formData={formData} handleChange={handleChange} handleRequestSuggestion={handleRequestSuggestion} />
                    <LessonPartFormSection partName="main" partLabel="עיקר" formData={formData} handleChange={handleChange} handleRequestSuggestion={handleRequestSuggestion} />
                    <LessonPartFormSection partName="summary" partLabel="סיכום" formData={formData} handleChange={handleChange} handleRequestSuggestion={handleRequestSuggestion} />
               </div>

              {/* Additional Details & Legacy fields */}
              <fieldset className="border border-gray-300 dark:border-zinc-700 p-6 rounded-lg">
                <legend className="text-2xl font-bold text-pink-600 dark:text-pink-400 px-2">פרטים נוספים (אופציונלי)</legend>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 mt-4">
                  <div className="space-y-6">
                     <div>
                      <label htmlFor="topic" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span>נושא השיעור (כותרת כללית)</span>
                        <AiSuggestionButton field="topic" title="נושא השיעור" />
                      </label>
                      <CustomSelect id="topic" name="topic" value={formData.topic || ''} onChange={handleChange} options={LESSON_TOPICS} className="bg-white dark:bg-zinc-800" isEditable={true} placeholder="לדוגמה: מערכת השמש" />
                    </div>
                     <div>
                        <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">בסס שיעור על קובץ</label>
                        {formData.file ? (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg">
                                <span className="text-gray-700 dark:text-gray-200 truncate font-medium">{formData.file.name}</span>
                                <button type="button" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        ) : (
                            <>
                                <label htmlFor="file-upload" className="cursor-pointer w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-zinc-800 transition-colors">
                                    <PaperClipIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 ml-2" />
                                    <span className="text-gray-700 dark:text-gray-300 font-semibold">לחץ לבחירת קובץ</span>
                                </label>
                                <input id="file-upload" name="file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.txt" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">PDF, TXT. מקסימום 10MB.</p>
                            </>
                        )}
                    </div>
                     <div>
                      <label htmlFor="objectives" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span>מטרות עיקריות</span>
                        <AiSuggestionButton field="objectives" title="מטרות עיקריות" />
                      </label>
                      <textarea id="objectives" name="objectives" value={formData.objectives} onChange={handleChange} rows={3} placeholder="מה תרצו שהתלמידים ידעו או יוכלו לעשות בסוף השיעור?" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"></textarea>
                    </div>
                    <div>
                      <label htmlFor="keyConcepts" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span>מושגי מפתח</span>
                        <AiSuggestionButton field="keyConcepts" title="מושגי מפתח" />
                      </label>
                      <textarea id="keyConcepts" name="keyConcepts" value={formData.keyConcepts} onChange={handleChange} rows={3} placeholder="מושגים חשובים שתרצו לכלול בשיעור, מופרדים בפסיקים." className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"></textarea>
                    </div>
                  </div>
                  <div className="space-y-6">
                     <div>
                        <label htmlFor="teachingStyle" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          <span>סגנון הוראה</span>
                          <AiSuggestionButton field="teachingStyle" title="סגנון הוראה" />
                        </label>
                        <CustomSelect id="teachingStyle" name="teachingStyle" value={formData.teachingStyle || ''} onChange={handleChange} options={TEACHING_STYLES} className="bg-gray-50 dark:bg-zinc-800" placeholder="בחרו סגנון הוראה..." />
                      </div>
                      <div>
                        <label htmlFor="tone" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          <span>טון השיעור</span>
                          <AiSuggestionButton field="tone" title="טון השיעור" />
                        </label>
                        <CustomSelect id="tone" name="tone" value={formData.tone || ''} onChange={handleChange} options={TONES} className="bg-gray-50 dark:bg-zinc-800" placeholder="בחרו טון לשיעור..." />
                      </div>
                      <div>
                        <label htmlFor="successMetrics" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          <span>מדדי הצלחה</span>
                          <AiSuggestionButton field="successMetrics" title="מדדי הצלחה" />
                        </label>
                        <textarea id="successMetrics" name="successMetrics" value={formData.successMetrics} onChange={handleChange} rows={3} placeholder="איך תדעו שהשיעור הצליח?" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"></textarea>
                      </div>
                      <div>
                        <label htmlFor="inclusion" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          <span>הכללה והתאמות</span>
                          <AiSuggestionButton field="inclusion" title="הכללה והתאמות" />
                        </label>
                        <textarea id="inclusion" name="inclusion" value={formData.inclusion} onChange={handleChange} rows={3} placeholder="הערות לגבי התאמת השיעור לתלמידים שונים." className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"></textarea>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <span>חוויה אימרסיבית</span>
                            <AiSuggestionButton field="immersiveExperience" title="חוויה אימרסיבית" />
                        </label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                name="immersiveExperienceTitle"
                                value={formData.immersiveExperienceTitle || ''}
                                onChange={handleChange}
                                placeholder="כותרת לחוויה האימרסיבית"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <textarea
                                id="immersiveExperienceDescription"
                                name="immersiveExperienceDescription"
                                value={formData.immersiveExperienceDescription || ''}
                                onChange={handleChange}
                                rows={3}
                                placeholder="תיאור החוויה האימרסיבית..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            ></textarea>
                        </div>
                      </div>
                  </div>
                  </div>
              </fieldset>
              
              <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-cta w-full flex items-center justify-center px-6 py-4 text-black dark:text-white text-xl font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:bg-pink-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isEditing ? 'מעדכן שיעור...' : 'יוצר שיעור...'}
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-6 h-6 ml-3" />
                          {isEditing ? 'עדכן שיעור' : 'צרו לי שיעור חווייתי'}
                        </>
                      )}
                    </button>
                  </div>
            </form>
          </div>
        </div>
      </div>
  );

    const PinnedChat = (isPinnedAndOpen && !settings.isChatCollapsed) ? (
      <div className="w-80 flex-shrink-0 transition-all duration-300">
          <div className="sticky top-8">
              <LessonChat
                  isOpen={isChatOpen}
                  onClose={() => setIsChatOpen(false)}
                  formData={formData}
                  onUpdateForm={handleUpdateFormFromChat}
              />
          </div>
      </div>
    ) : null;
    
    const CollapsedChatHandle = (isPinnedAndOpen && settings.isChatCollapsed) ? (
        <div className={`sticky top-8 flex items-center h-full ${settings.chatPosition === 'left' ? 'justify-start' : 'justify-end'}`}>
             <button
                onClick={() => setSettings({ isChatCollapsed: false })}
                className={`flex items-center p-2 text-black dark:text-white shadow-lg transition-colors h-12
                    ${settings.chatPosition === 'left' ? 'rounded-r-lg' : 'rounded-l-lg'}`}
                title="הצג צ'אט"
             >
                {settings.chatPosition === 'left' ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
             </button>
        </div>
    ) : null;


  return (
    <>
      <div className={`flex ${settings.isChatCollapsed ? 'gap-2' : 'gap-8'}`}>
          {settings.chatPosition === 'right' && (PinnedChat || CollapsedChatHandle)}
          {FormContent}
          {settings.chatPosition === 'left' && (PinnedChat || CollapsedChatHandle)}
      </div>
      
      {!settings.isChatPinned && !isChatOpen && (
        <button 
            onClick={() => setIsChatOpen(true)}
            className={chatButtonClasses}
            title="פתח את יועץ השיעורים AI"
        >
            <ChatBubbleIcon className="w-8 h-8" />
        </button>
      )}

      {!settings.isChatPinned && (
          <LessonChat
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              formData={formData}
              onUpdateForm={handleUpdateFormFromChat}
          />
      )}

      <SuggestionModal
          isOpen={suggestionState.isOpen}
          onClose={() => setSuggestionState(prev => ({ ...prev, isOpen: false }))}
          onSelect={handleSelectSuggestion}
          title={suggestionState.title}
          suggestions={suggestionState.suggestions}
          isLoading={suggestionState.isLoading}
      />
    </>
  );
};

export default LessonForm;
