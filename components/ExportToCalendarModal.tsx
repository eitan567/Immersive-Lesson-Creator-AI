import React, { useState, useEffect } from 'react';
import type { LessonPlan } from '../types';
import { generateIcsContent } from '../utils/calendar';
import XIcon from './icons/XIcon';
import CalendarIcon from './icons/CalendarIcon';

interface ExportToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonPlan | null;
}

const ExportToCalendarModal: React.FC<ExportToCalendarModalProps> = ({ isOpen, onClose, lesson }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');

  useEffect(() => {
    if (isOpen) {
      // Set default date to today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const dd = String(today.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lesson || !date || !time) {
        alert("נא למלא תאריך ושעה.");
        return;
    }
    
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, hours, minutes);

    const icsContent = generateIcsContent(lesson, startDate);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    // Sanitize title for filename
    const filename = `${lesson.lessonTitle.replace(/[^a-z0-9]/gi, '_')}.ics`;
    link.setAttribute("download", filename);
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="div-cta rounded-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8">
          <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10">
              <XIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center mb-6">
            <CalendarIcon className="w-7 h-7 text-pink-600 dark:text-pink-400 ml-3" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ייצוא שיעור ליומן</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
                בחר תאריך ושעת התחלה עבור השיעור <span className="font-semibold text-gray-800 dark:text-gray-100">"{lesson?.lessonTitle}"</span> כדי ליצור קובץ יומן (.ics) שניתן לייבא ל-Google Calendar, Outlook ועוד.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="lessonDate" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  תאריך
                </label>
                <input
                  type="date"
                  id="lessonDate"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label htmlFor="lessonTime" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  שעת התחלה
                </label>
                <input
                  type="time"
                  id="lessonTime"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="btn-cta w-full flex items-center justify-center px-6 py-3 text-black dark:text-white text-lg font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all"
              >
                <CalendarIcon className="w-6 h-6 ml-3" />
                צור קובץ והורד
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExportToCalendarModal;