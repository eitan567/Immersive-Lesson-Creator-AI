// FIX: Removed self-import of `LessonActivity` which caused a conflict with the local declaration.

// This interface is kept for compatibility but the new `LessonPlan` structure uses a three-part model.
export interface LessonActivity {
  title: string;
  description: string;
  duration: number;
  type: 'Introduction' | 'Activity' | 'Discussion' | 'Assessment' | 'Conclusion';
  imageUrl?: string;
}

// New types for the three-part lesson structure
export interface Screen {
    type: 'סרטון' | 'תמונה' | 'פדלט' | 'אתר' | 'ג\'ניאלי' | 'מצגת';
    description: string;
    imageUrl?: string;
}

export interface LessonPart {
    content: string;
    spaceUsage: 'מליאה' | 'עבודה בקבוצות' | 'עבודה אישית' | 'משולב';
    screens: Screen[];
}

export interface LessonPlan {
  id: string;
  topic: string; // Kept 'נושא השיעור' for context
  unitTopic: string;
  category: string;
  lessonTitle: string;
  targetAudience: string;
  lessonDuration: number;
  priorKnowledge: string;
  placementInContent: string;
  contentGoals: string[];
  skillGoals: string[];
  generalDescription: string;
  
  // Existing fields
  learningObjectives: string[];
  materials: string[];
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

  // New three-part lesson structure
  opening: LessonPart;
  main: LessonPart;
  summary: LessonPart;
}


export type SuggestionField = 
  'topic' | 
  'objectives' | 
  'keyConcepts' | 
  'teachingStyle' | 
  'tone' | 
  'successMetrics' | 
  'inclusion' | 
  'immersiveExperience' |
  'priorKnowledge' |
  'contentGoals' |
  'skillGoals' |
  'generalDescription' |
  'openingContent' |
  'mainContent' |
  'summaryContent';

export interface ChatSuggestion {
    field: SuggestionField;
    fieldName: string;
    values: string[];
}

export interface ChatMessage {
    role: 'user' | 'ai';
    text?: string;
    suggestions?: ChatSuggestion;
}

export interface LessonFormData {
  id?: string;

  // "תוכנית השיעור" section
  category: string;
  unitTopic: string;
  duration?: string; // זמן כולל
  gradeLevel: string; // שכבת גיל
  priorKnowledge?: string;
  placementInContent?: string;
  contentGoals?: string;
  skillGoals?: string;
  generalDescription?: string;

  // "חלקי השיעור" section
  openingContent?: string;
  openingSpaceUsage?: string;
  mainContent?: string;
  mainSpaceUsage?: string;
  summaryContent?: string;
  summarySpaceUsage?: string;
  
  // Flattened screens for easier form state management
  openingScreen1Type?: string;
  openingScreen1Desc?: string;
  openingScreen2Type?: string;
  openingScreen2Desc?: string;
  openingScreen3Type?: string;
  openingScreen3Desc?: string;

  mainScreen1Type?: string;
  mainScreen1Desc?: string;
  mainScreen2Type?: string;
  mainScreen2Desc?: string;
  mainScreen3Type?: string;
  mainScreen3Desc?: string;

  summaryScreen1Type?: string;
  summaryScreen1Desc?: string;
  summaryScreen2Type?: string;
  summaryScreen2Desc?: string;
  summaryScreen3Type?: string;
  summaryScreen3Desc?: string;

  // Existing fields from the original form, kept as requested
  topic: string;
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