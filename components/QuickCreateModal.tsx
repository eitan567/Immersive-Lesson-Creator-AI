import React, { useState } from 'react';
import type { LessonFormData } from '../types';
import { GRADE_LEVELS, LESSON_TOPICS, CATEGORIES } from '../constants';
import CustomSelect from './CustomSelect';
import PaperClipIcon from './icons/PaperClipIcon';
import TrashIcon from './icons/TrashIcon';
import SparklesIcon from './icons/SparklesIcon';
import XIcon from './icons/XIcon';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LessonFormData) => void;
  isLoading: boolean;
}

const QuickCreateModal: React.FC<QuickCreateModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    topic: '',
    category: '',
    unitTopic: '',
    gradeLevel: '',
    file: null as File | null,
    duration: '45',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
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
    if (!formData.unitTopic) {
        alert("יש להזין נושא יחידה.");
        return;
    }
     if (!formData.category) {
        alert("יש לבחור קטגוריה.");
        return;
    }
    
    // Construct a full LessonFormData object for submission
    const fullFormData: LessonFormData = {
      ...formData,
      topic: formData.topic || formData.unitTopic, // Use unit topic if main topic is empty
    };
    onSubmit(fullFormData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="div-cta rounded-2xl w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8">
          <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10">
              <XIcon className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">יצירת שיעור מהיר</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label htmlFor="quick-category" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">קטגוריה <span className="text-red-500">*</span></label>
                <CustomSelect id="quick-category" name="category" value={formData.category} onChange={handleChange} options={CATEGORIES} className="bg-gray-50 dark:bg-zinc-800" required placeholder="בחרו קטגוריה..." />
              </div>
               <div>
                <label htmlFor="quick-unitTopic" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">נושא היחידה <span className="text-red-500">*</span></label>
                <input type="text" id="quick-unitTopic" name="unitTopic" value={formData.unitTopic} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100" required placeholder="לדוגמה: מבוא לאלגברה" />
              </div>
            </div>
             <div>
              <label htmlFor="quick-topic" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                נושא השיעור (כותרת כללית, אופציונלי)
              </label>
              <CustomSelect
                id="quick-topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                options={LESSON_TOPICS}
                className="bg-white dark:bg-zinc-800"
                isEditable={true}
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
                        <label htmlFor="quick-file-upload" className="cursor-pointer w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-zinc-800 transition-colors">
                            <PaperClipIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 ml-2" />
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">לחץ לבחירת קובץ</span>
                        </label>
                        <input id="quick-file-upload" name="file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.txt" />
                    </>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="quick-gradeLevel" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  שכבת גיל
                </label>
                <CustomSelect
                  id="quick-gradeLevel"
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  options={GRADE_LEVELS}
                  className="bg-gray-50 dark:bg-zinc-800"
                  placeholder="בחרו שכבת גיל..."
                />
              </div>
              <div>
                <label htmlFor="quick-duration" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  משך השיעור (בדקות)
                </label>
                <input
                  type="number"
                  id="quick-duration"
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-cta w-full flex items-center justify-center px-6 py-4 text-black dark:text-white text-xl font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:bg-pink-300 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    יוצר שיעור...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6 ml-3" />
                    צור שיעור
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickCreateModal;
