import type { LessonPlan } from '../types';

// Helper to format date to YYYYMMDDTHHMMSSZ format
const toIcsDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const generateIcsContent = (lesson: LessonPlan, startDate: Date): string => {
    const endDate = new Date(startDate.getTime() + lesson.lessonDuration * 60000);
    const now = new Date();

    const description = `מטרות למידה:\n${lesson.learningObjectives.map(obj => `- ${obj}`).join('\n')}\n\nנושא: ${lesson.topic}`;

    // Escape characters for ICS format
    const escape = (str: string) => str.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ImmersiveLessonCreator//EN',
        'BEGIN:VEVENT',
        `UID:${lesson.id}@immersive-lesson-creator.com`,
        `DTSTAMP:${toIcsDate(now)}`,
        `DTSTART:${toIcsDate(startDate)}`,
        `DTEND:${toIcsDate(endDate)}`,
        `SUMMARY:${escape(lesson.lessonTitle)}`,
        `DESCRIPTION:${escape(description)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return content;
};
