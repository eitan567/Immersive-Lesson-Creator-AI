import React, { useState } from 'react';
import type { LessonFormData, SuggestionField, ChatMessage } from '../types';
import { GRADE_LEVELS, LESSON_TOPICS, TEACHING_STYLES, TONES } from '../constants';
import { generateFullFormSuggestions, generateFieldSuggestion, chatWithLessonAssistant } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import CustomSelect from './CustomSelect';
import PaperClipIcon from './icons/PaperClipIcon';
import TrashIcon from './icons/TrashIcon';
import SuggestionModal from './SuggestionModal';
import LessonChat from './LessonChat';
import ChatBubbleIcon from './icons/ChatBubbleIcon';

interface LessonFormProps {
  onSubmit: (formData: LessonFormData) => void;
  isLoading: boolean;
  onBack: () => void;
  error?: string | null;
}

interface SuggestionState {
    isOpen: boolean;
    isLoading: boolean;
    field: SuggestionField | null;
    title: string;
    suggestions: string[];
}

const LessonForm: React.FC<LessonFormProps> = ({ onSubmit, isLoading, onBack, error }) => {
  const [formData, setFormData] = useState<LessonFormData>({
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
  });
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [suggestionState, setSuggestionState] = useState<SuggestionState>({
      isOpen: false,
      isLoading: false,
      field: null,
      title: '',
      suggestions: [],
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
      { role: 'ai', text: 'שלום! אני כאן כדי לעזור לכם לבנות את השיעור המושלם. שאלו אותי כל דבר, או בקשו ממני רעיונות לשדה ספציפי (למשל, "הצע לי מטרות לשיעור").' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

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
        setFormData(prev => ({ ...prev, [suggestionState.field as string]: suggestion }));
    }
  };

  const handleSendMessageToChat = async (message: string) => {
    setChatHistory(prev => [...prev, { role: 'user', text: message }]);
    setIsChatLoading(true);
    try {
        const response = await chatWithLessonAssistant(message, formData);
        setChatHistory(prev => [...prev, { role: 'ai', ...response }]);
    } catch (err) {
         const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setChatHistory(prev => [...prev, { role: 'ai', text: `מצטער, 발생한 오류: ${errorMessage}` }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleSelectSuggestionFromChat = (field: SuggestionField, value: string) => {
      setFormData(prev => {
          const currentFieldValue = prev[field] || '';
          const newValue = currentFieldValue ? `${currentFieldValue}\n- ${value}` : value;
          return { ...prev, [field]: newValue };
      });
      setIsChatOpen(false);
  };

  const AiSuggestionButton: React.FC<{field: SuggestionField, title: string}> = ({ field, title }) => (
    <button
        type="button"
        onClick={() => handleRequestSuggestion(field, `הצעות עבור: ${title}`)}
        className="text-blue-500 hover:text-blue-700 transition-colors"
        title={`קבל הצעות AI עבור ${title}`}
    >
        <SparklesIcon className="w-5 h-5" />
    </button>
  );

  return (
    <>
    <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-800">יצירת שיעור חדש</h2>
            <button
                type="button"
                onClick={handleAutoFill}
                disabled={isAutoFilling}
                className="p-1 rounded-full text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:bg-blue-100"
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
        <button onClick={onBack} className="text-sm font-semibold text-blue-600 hover:underline">
          &rarr; חזרה למסך הראשי
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 text-center">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
        {/* Right Column (First in RTL) */}
        <div className="space-y-6">
          <div>
            <label htmlFor="topic" className="flex items-center justify-between text-lg font-semibold text-gray-700 mb-2">
              <span>נושא השיעור</span>
              <AiSuggestionButton field="topic" title="נושא השיעור" />
            </label>
            <CustomSelect
              id="topic"
              name="topic"
              value={formData.topic || ''}
              onChange={handleChange}
              options={LESSON_TOPICS}
              className="bg-white"
              isEditable={true}
              required
              placeholder="לדוגמה: מערכת השמש"
            />
          </div>
          
          <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                  בסס שיעור על קובץ (אופציונלי)
              </label>
              {formData.file ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className="text-gray-700 truncate font-medium">{formData.file.name}</span>
                      <button type="button" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700">
                          <TrashIcon className="w-5 h-5" />
                      </button>
                  </div>
              ) : (
                  <>
                      <label htmlFor="file-upload" className="cursor-pointer w-full flex items-center justify-center px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                          <PaperClipIcon className="w-5 h-5 text-gray-500 ml-2" />
                          <span className="text-gray-700 font-semibold">לחץ לבחירת קובץ</span>
                      </label>
                      <input id="file-upload" name="file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                      <p className="text-sm text-gray-500 mt-1.5">סוגי קבצים נתמכים: PDF, DOCX, TXT. גודל מקסימלי: 10MB.</p>
                  </>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gradeLevel" className="block text-lg font-semibold text-gray-700 mb-2">
                שכבת גיל
              </label>
              <CustomSelect
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                options={GRADE_LEVELS}
                className="bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-lg font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="objectives" className="flex items-center justify-between text-lg font-semibold text-gray-700 mb-2">
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
            ></textarea>
          </div>

          <div>
            <label htmlFor="keyConcepts" className="flex items-center justify-between text-lg font-semibold text-gray-700 mb-2">
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
            ></textarea>
          </div>
        </div>

        {/* Left Column (Second in RTL) */}
        <div className="space-y-6">
           <div>
              <label htmlFor="teachingStyle" className="flex items-center justify-between text-lg font-semibold text-gray-700 mb-2">
                <span>סגנון הוראה (אופציונלי)</span>
                <AiSuggestionButton field="teachingStyle" title="סגנון הוראה" />
              </label>
              <CustomSelect
                id="teachingStyle"
                name="teachingStyle"
                value={formData.teachingStyle || ''}
                onChange={handleChange}
                options={TEACHING_STYLES}
                className="bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="tone" className="flex items-center justify-between text-lg font-semibold text-gray-700 mb-2">
                <span>טון השיעור (אופציונלי)</span>
                <AiSuggestionButton field="tone" title="טון השיעור" />
              </label>
              <CustomSelect
                id="tone"
                name="tone"
                value={formData.tone || ''}
                onChange={handleChange}
                options={TONES}
                className="bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="successMetrics" className="flex items-center justify-between text-lg font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
              ></textarea>
            </div>

             <div>
              <label htmlFor="inclusion" className="flex items-center justify-between text-lg font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    יוצר שיעור...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6 mr-3" />
                    צרו לי שיעור חווייתי
                  </>
                )}
              </button>
            </div>
        </div>
      </form>
    </div>
    
    <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 left-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 z-40"
        title="פתח את יועץ השיעורים AI"
    >
        <ChatBubbleIcon className="w-8 h-8" />
    </button>

    <LessonChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatHistory={chatHistory}
        onSendMessage={handleSendMessageToChat}
        isLoading={isChatLoading}
        onSelectSuggestion={handleSelectSuggestionFromChat}
    />

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
