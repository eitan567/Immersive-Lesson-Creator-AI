// FIX: Removed self-import of `LessonActivity` which caused a conflict with the local declaration.
export interface LessonActivity {
  title: string;
  description: string;
  duration: number;
  type: 'Introduction' | 'Activity' | 'Discussion' | 'Assessment' | 'Conclusion';
  imageUrl?: string;
}

export interface LessonPlan {
  id: string;
  topic: string;
  lessonTitle: string;
  targetAudience: string;
  lessonDuration: number;
  learningObjectives: string[];
  materials: string[];
  lessonActivities: LessonActivity[];
  immersiveExperienceIdea: {
    title: string;
    description: string;
  };
  assessment: {
    title: string;
    description: string;
  };
  status: 'טיוטה' | 'פורסם';
  creationDate: string;
}

export type SuggestionField = 'topic' | 'objectives' | 'keyConcepts' | 'teachingStyle' | 'tone' | 'successMetrics' | 'inclusion' | 'immersiveExperience';

export interface ChatSuggestion {
    field: SuggestionField;
    values: string[];
}

export interface ChatMessage {
    role: 'user' | 'ai';
    text?: string;
    suggestions?: ChatSuggestion;
}

export interface LessonFormData {
  id?: string;
  topic: string;
  gradeLevel: string;
  duration?: string;
  objectives?: string;
  keyConcepts?: string;
  file?: File | null;
  teachingStyle?: string;
  tone?: string;
  successMetrics?: string;
  inclusion?: string;
  immersiveExperienceTitle?: string;
  immersiveExperienceDescription?: string;
}

export interface AppSettings {
  closeChatOnSuggestion: boolean;
  chatPosition: 'left' | 'right';
  isChatFloating: boolean;
  isChatPinned: boolean;
  isChatCollapsed: boolean;
  aiModel: string;
  generateImages: boolean;
  theme: 'light' | 'dark' | 'system';
  _previousChatSettings?: {
    isChatFloating: boolean;
    closeChatOnSuggestion: boolean;
  } | null;
}