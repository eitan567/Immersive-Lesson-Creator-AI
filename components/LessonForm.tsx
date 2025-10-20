import React, { useState, useContext, useEffect } from 'react';
import type { LessonFormData, SuggestionField, ChatMessage, LessonPlan } from '../types';
import { GRADE_LEVELS, LESSON_TOPICS, TEACHING_STYLES, TONES } from '../constants';
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
  onBack: () => void;
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
  topic: '',
  gradeLevel: GRADE_LEVELS[3],
  duration: '45',
  objectives: '',
  keyConcepts: '',
  file: null,
  teachingStyle: TEACHING_STYLES[0],
  tone: TONES[0],
  successMetrics: '',
  inclusion: '',
  immersiveExperienceTitle: '',
  immersiveExperienceDescription: '',
};

const LessonForm: React.FC<LessonFormProps> = ({ onSubmit, isLoading, onBack, error, initialData }) => {
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
            gradeLevel: initialData.targetAudience,
            duration: String(initialData.lessonDuration),
            objectives: initialData.learningObjectives.join('\n'),
            // These fields are not stored in the lesson plan, so they are reset on edit.
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
    if (!formData.topic || !formData.gradeLevel) {
      alert("יש למלא 'נושא השיעור' ו'שכבת גיל' לפני הפעלת המילוי האוטומטי.");
      return;
    }
    setIsAutoFilling(true);
    try {
      const suggestions = await generateFullFormSuggestions(formData.topic, formData.gradeLevel);
      setFormData(prev => ({ ...prev, ...suggestions }));
    } catch (err) {
      alert(`שגיאה במילוי האוטומטי: ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}`);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleRequestSuggestion = async (field: SuggestionField, title: string) => {
    if (!formData.topic && field !== 'topic') {
        alert("יש למלא 'נושא השיעור' תחילה.");
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
               if (field === 'keyConcepts' && prev[field]) {
                   return {...prev, [field]: `${prev[field]}, ${suggestion}`};
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
  
  const chatButtonClasses = `fixed bottom-8 text-black dark:text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 z-40 ${settings.chatPosition === 'left' ? 'left-8' : 'right-8'}`;

  const isPinnedAndOpen = settings.isChatPinned && isChatOpen;
  const isEditing = !!initialData;

  const FormContent = (
      <div className="flex-grow">
        <div className="rounded-2xl">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{isEditing ? 'עריכת שיעור' : 'יצירת שיעור חדש'}</h2>
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
              <button onClick={onBack} className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline">
                &rarr; חזרה למסך הראשי
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 text-center">
                  {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              {/* Right Column (First in RTL) */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="topic" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <span>נושא השיעור</span>
                    <AiSuggestionButton field="topic" title="נושא השיעור" />
                  </label>
                  <CustomSelect
                    id="topic"
                    name="topic"
                    value={formData.topic || ''}
                    onChange={handleChange}
                    options={LESSON_TOPICS}
                    className="bg-white dark:bg-zinc-800"
                    isEditable={true}
                    required
                    placeholder="לדוגמה: מערכת השמש"
                  />
                </div>
                
                <div>
                    <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        בסס שיעור על קובץ (אופציונלי)
                    </label>
                    {formData.file ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-200 truncate font-medium">{formData.file.name}</span>
                            <button type="button" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <label htmlFor="file-upload" className="cursor-pointer w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-zinc-800 transition-colors">
                                <PaperClipIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 ml-2" />
                                <span className="text-gray-700 dark:text-gray-300 font-semibold">לחץ לבחירת קובץ</span>
                            </label>
                            <input id="file-upload" name="file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.txt" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">סוגי קבצים נתמכים: PDF, TXT. גודל מקסימלי: 10MB.</p>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="gradeLevel" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      שכבת גיל
                    </label>
                    <CustomSelect
                      id="gradeLevel"
                      name="gradeLevel"
                      value={formData.gradeLevel}
                      onChange={handleChange}
                      options={GRADE_LEVELS}
                      className="bg-gray-50 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      משך השיעור (בדקות)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      min="10"
                      max="180"
                      step="5"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="objectives" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <span>מטרות עיקריות (אופציונלי)</span>
                    <AiSuggestionButton field="objectives" title="מטרות עיקריות" />
                  </label>
                  <textarea
                    id="objectives"
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleChange}
                    rows={3}
                    placeholder="מה תרצו שהתלמידים ידעו או יוכלו לעשות בסוף השיעור?"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="keyConcepts" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <span>מושגי מפתח (אופציונלי)</span>
                    <AiSuggestionButton field="keyConcepts" title="מושגי מפתח" />
                  </label>
                  <textarea
                    id="keyConcepts"
                    name="keyConcepts"
                    value={formData.keyConcepts}
                    onChange={handleChange}
                    rows={3}
                    placeholder="מושגים חשובים שתרצו לכלול בשיעור, מופרדים בפסיקים."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  ></textarea>
                </div>
              </div>

              {/* Left Column (Second in RTL) */}
              <div className="space-y-6">
                <div>
                    <label htmlFor="teachingStyle" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span>סגנון הוראה (אופציונלי)</span>
                      <AiSuggestionButton field="teachingStyle" title="סגנון הוראה" />
                    </label>
                    <CustomSelect
                      id="teachingStyle"
                      name="teachingStyle"
                      value={formData.teachingStyle || ''}
                      onChange={handleChange}
                      options={TEACHING_STYLES}
                      className="bg-gray-50 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label htmlFor="tone" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span>טון השיעור (אופציונלי)</span>
                      <AiSuggestionButton field="tone" title="טון השיעור" />
                    </label>
                    <CustomSelect
                      id="tone"
                      name="tone"
                      value={formData.tone || ''}
                      onChange={handleChange}
                      options={TONES}
                      className="bg-gray-50 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label htmlFor="successMetrics" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span>מדדי הצלחה (אופציונלי)</span>
                      <AiSuggestionButton field="successMetrics" title="מדדי הצלחה" />
                    </label>
                    <textarea
                      id="successMetrics"
                      name="successMetrics"
                      value={formData.successMetrics}
                      onChange={handleChange}
                      rows={3}
                      placeholder="איך תדעו שהשיעור הצליח? (למשל: תלמידים ידעו להסביר, יבנו מודל וכו')"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="inclusion" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span>הכללה והתאמות (אופציונלי)</span>
                      <AiSuggestionButton field="inclusion" title="הכללה והתאמות" />
                    </label>
                    <textarea
                      id="inclusion"
                      name="inclusion"
                      value={formData.inclusion}
                      onChange={handleChange}
                      rows={3}
                      placeholder="הערות לגבי התאמת השיעור לתלמידים עם צרכים מיוחדים או רמות שונות."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    ></textarea>
                  </div>

                 <div>
                    <label htmlFor="immersiveExperienceDescription" className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <SparklesIcon className="w-5 h-5 text-pink-500" />
                        <span>רעיון לחוויה אימרסיבית (אופציונלי)</span>
                        <AiSuggestionButton field="immersiveExperience" title="רעיון לחוויה אימרסיבית" />
                    </label>
                    <div className="space-y-3">
                        <input
                        type="text"
                        id="immersiveExperienceTitle"
                        name="immersiveExperienceTitle"
                        value={formData.immersiveExperienceTitle}
                        onChange={handleChange}
                        placeholder="כותרת החוויה (למשל: סיור וירטואלי במערכת השמש)"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <textarea
                        id="immersiveExperienceDescription"
                        name="immersiveExperienceDescription"
                        value={formData.immersiveExperienceDescription}
                        onChange={handleChange}
                        rows={3}
                        placeholder="תארו את הרעיון שלכם לחוויה שתכניס את התלמידים לעולם התוכן."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        ></textarea>
                    </div>
                 </div>

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