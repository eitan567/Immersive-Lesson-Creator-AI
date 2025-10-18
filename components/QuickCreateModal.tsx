import React, { useState } from 'react';
import type { LessonFormData } from '../types';
import { GRADE_LEVELS, LESSON_TOPICS } from '../constants';
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
    gradeLevel: GRADE_LEVELS[3],
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
    if (!formData.topic && !formData.file) {
        alert("יש להזין נושא שיעור או לבחור קובץ.");
        return;
    }
    const fullFormData: LessonFormData = {
      topic: formData.topic,
      gradeLevel: formData.gradeLevel,
      file: formData.file,
      duration: formData.duration,
      objectives: '',
      keyConcepts: '',
      teachingStyle: 'אינטראקטיבי ומעורב',
      tone: 'יצירתי ומעורר השראה',
      successMetrics: '',
      inclusion: '',
    };
    onSubmit(fullFormData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">יצירת שיעור מהיר</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="quick-topic" className="block text-lg font-semibold text-gray-700 mb-2">
              נושא השיעור
            </label>
            <CustomSelect
              id="quick-topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              options={LESSON_TOPICS}
              className="bg-white"
              isEditable={true}
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
                      <label htmlFor="quick-file-upload" className="cursor-pointer w-full flex items-center justify-center px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                          <PaperClipIcon className="w-5 h-5 text-gray-500 ml-2" />
                          <span className="text-gray-700 font-semibold">לחץ לבחירת קובץ</span>
                      </label>
                      <input id="quick-file-upload" name="file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                  </>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="quick-gradeLevel" className="block text-lg font-semibold text-gray-700 mb-2">
                שכבת גיל
              </label>
              <CustomSelect
                id="quick-gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                options={GRADE_LEVELS}
                className="bg-gray-50"
              />
            </div>
            <div>
               <label htmlFor="quick-duration" className="block text-lg font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
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
                  צור שיעור
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickCreateModal;