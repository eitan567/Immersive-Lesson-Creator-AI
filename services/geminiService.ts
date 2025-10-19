import { GoogleGenAI, Type, Modality, Part } from "@google/genai";
import type { LessonFormData, LessonPlan, LessonActivity, SuggestionField, ChatMessage, ChatSuggestion } from '../types';
import { TEACHING_STYLES, TONES } from "../constants";

const lessonPlanSchema = {
  type: Type.OBJECT,
  properties: {
    lessonTitle: { type: Type.STRING, description: "כותרת מרתקת ומסקרנת לשיעור." },
    targetAudience: { type: Type.STRING, description: "קהל היעד של השיעור, כפי שצוין על ידי המשתמש." },
    lessonDuration: { type: Type.INTEGER, description: "משך השיעור הכולל בדקות, כפי שצוין על ידי המשתמש." },
    learningObjectives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "רשימה של 3-5 מטרות למידה ברורות ומדידות שהתלמידים ישיגו בסוף השיעור."
    },
    materials: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "רשימת חומרים וציוד הנדרשים לשיעור. יש לכלול גם חומרים דיגיטליים וגם פיזיים."
    },
    lessonActivities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "שם הפעילות." },
          description: { type: Type.STRING, description: "הסבר מפורט על הפעילות, מה התלמידים צריכים לעשות." },
          duration: { type: Type.INTEGER, description: "משך הפעילות בדקות." },
          type: {
            type: Type.STRING,
            enum: ['Introduction', 'Activity', 'Discussion', 'Assessment', 'Conclusion'],
            description: "סוג הפעילות."
          },
        },
        required: ["title", "description", "duration", "type"],
      },
      description: "מערך פעילויות מפורט, מחולק לשלבים הגיוניים (פתיחה, גוף, סיכום)."
    },
    immersiveExperienceIdea: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "שם רעיון החוויה האימרסיבית." },
        description: { type: Type.STRING, description: "תיאור מפורט של רעיון יצירתי לחוויה אימרסיבית הקשורה לנושא השיעור (למשל, סימולציה, משחק תפקידים, סיור וירטואלי)." }
      },
      required: ["title", "description"],
    },
    assessment: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "שם פעילות ההערכה." },
            description: { type: Type.STRING, description: "כיצד תיבדק הבנת התלמידים והשגת מטרות הלמידה." }
        },
        required: ["title", "description"],
    }
  },
  required: [
    "lessonTitle",
    "targetAudience",
    "lessonDuration",
    "learningObjectives",
    "materials",
    "lessonActivities",
    "immersiveExperienceIdea",
    "assessment"
  ],
};

const generateImageForActivity = async (
    ai: GoogleGenAI,
    activity: LessonActivity,
    gradeLevel: string
): Promise<string> => {
    const prompt = `An educational illustration for a classroom activity for ${gradeLevel}.
Activity Title: "${activity.title}".
Description: "${activity.description}".
Style: Simple, vibrant, colorful, engaging, and clear illustration. Whimsical and fun. No text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:image/png;base64,${base64ImageBytes}`;
                }
            }
        }
        return ''; 
    } catch (error) {
        console.error(`Error generating image for activity "${activity.title}":`, error);
        return '';
    }
};

const fileToGenerativePart = (file: File): Promise<Part> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64Data = dataUrl.split(',')[1];
            resolve({
                inlineData: {
                    mimeType: file.type,
                    data: base64Data
                }
            });
        };
        reader.onerror = error => reject(error);
    });
};

const buildPrompt = (formData: LessonFormData, isFile: boolean): string => {
  const basePrompt = isFile
    ? `בהתבסס **אך ורק** על תוכן המסמך המצורף, צור מערך שיעור אימרסיבי ויצירתי.
       השתמש בשדה 'נושא השיעור' הבא רק עבור הכותרת של מערך השיעור, אך בנה את כל התוכן (מטרות, פעילויות, וכו') מהמסמך.`
    : `צור מערך שיעור אימרסיבי ויצירתי המבוסס על הפרטים הבאים.`;

  return `
    ${basePrompt}
    התנהג כמומחה לעיצוב הדרכה ופדגוגיה חדשנית.
    הפלט חייב להיות אובייקט JSON התואם לסכמה שסופקה.

    --- פרטי השיעור ---
    נושא השיעור: ${formData.topic}
    שכבת גיל: ${formData.gradeLevel}
    משך השיעור (דקות): ${formData.duration || 45}
    
    --- תוכן והנחיות נוספות ---
    מטרות למידה רצויות: ${formData.objectives || (isFile ? 'יש להגדיר על סמך תוכן המסמך' : 'לא צוין')}
    מושגי מפתח לכיסוי: ${formData.keyConcepts || (isFile ? 'יש לזהות מתוך תוכן המסמך' : 'לא צוין')}
    סגנון הוראה מועדף: ${formData.teachingStyle || 'גמיש'}
    טון השיעור: ${formData.tone || 'ניטרלי'}
    מדדי הצלחה: ${formData.successMetrics || 'לא צוין'}
    הנחיות הכללה והתאמה: ${formData.inclusion || 'לא צוין'}
  `;
};

export const generateLessonPlan = async (formData: LessonFormData, aiModel: string, generateImages: boolean): Promise<LessonPlan> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let modelName = formData.file ? "gemini-2.5-pro" : aiModel;
  let contents: string | { parts: Part[] };

  if (formData.file) {
    const filePart = await fileToGenerativePart(formData.file);
    const textPart = buildPrompt(formData, true);
    contents = { parts: [filePart, { text: textPart }] };
  } else {
    contents = buildPrompt(formData, false);
  }
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: lessonPlanSchema,
      },
    });

    const jsonText = response.text.trim();
    const lessonPlan: LessonPlan = JSON.parse(jsonText);
    
    lessonPlan.lessonDuration = parseInt(formData.duration || '45', 10);

    if (generateImages) {
        const imagePromises = lessonPlan.lessonActivities.map(activity => 
            generateImageForActivity(ai, activity, lessonPlan.targetAudience)
        );
        const imageUrls = await Promise.all(imagePromises);

        lessonPlan.lessonActivities = lessonPlan.lessonActivities.map((activity, index) => ({
            ...activity,
            imageUrl: imageUrls[index],
        }));
    }
    
    return lessonPlan;
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate lesson plan: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the lesson plan.");
  }
};

export const generateFullFormSuggestions = async (topic: string, gradeLevel: string): Promise<Partial<LessonFormData>> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const suggestionSchema = {
        type: Type.OBJECT,
        properties: {
            objectives: { type: Type.STRING, description: "טקסט קצר וברור המתאר 2-3 מטרות עיקריות לשיעור." },
            keyConcepts: { type: Type.STRING, description: "רשימה של 3-5 מושגי מפתח עיקריים, מופרדים בפסיקים." },
            teachingStyle: { type: Type.STRING, enum: TEACHING_STYLES, description: "סגנון ההוראה המתאים ביותר לנושא ולגיל." },
            tone: { type: Type.STRING, enum: TONES, description: "הטון המתאים ביותר לשיעור." },
            successMetrics: { type: Type.STRING, description: "טקסט קצר המתאר דרך אחת או שתיים למדוד את הצלחת השיעור." },
            inclusion: { type: Type.STRING, description: "טקסט קצר עם רעיון אחד להתאמת השיעור לתלמידים שונים." },
        },
        required: ["objectives", "keyConcepts", "teachingStyle", "tone", "successMetrics", "inclusion"],
    };

    const prompt = `
        אתה עוזר פדגוגי יצירתי. המטרה שלך היא למלא טופס ליצירת שיעור.
        בהינתן נושא השיעור ושכבת הגיל, אנא ספק תוכן מתאים לכל אחד מהשדות הבאים בעברית.
        התוכן צריך להיות ממוקד, מעשי ומתאים להקשר.

        --- פרטי השיעור ---
        נושא השיעור: ${topic}
        שכבת גיל: ${gradeLevel}

        החזר אובייקט JSON בלבד, שתואם לסכמה. התשובה חייבת להיות בעברית.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating form suggestions:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate suggestions: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating suggestions.");
    }
};

const singleFieldSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "רשימה של 3-4 הצעות תמציתיות בעברית עבור השדה המבוקש."
        }
    },
    required: ["suggestions"],
};

const getSuggestionPrompt = (field: SuggestionField, context: LessonFormData): string => {
    const basePrompt = `
        אתה עוזר פדגוגי יצירתי. המטרה שלך היא לספק הצעות תמציתיות ורלוונטיות עבור שדה בטופס מערך שיעור.
        ספק 3-4 הצעות. התשובה חייבת להיות אובייקט JSON התואם לסכמה שסופקה.
        **חשוב מאוד: כל ההצעות חייבות להיות בעברית בלבד.**

        הקשר השיעור:
        - נושא: ${context.topic || 'לא צוין'}
        - שכבת גיל: ${context.gradeLevel}
    `;

    const fieldPrompts: Record<SuggestionField, string> = {
        topic: `הצע נושאים יצירתיים לשיעורים המתאימים ל${context.gradeLevel}.`,
        objectives: `הצע מטרות למידה ברורות ומדידות.`,
        keyConcepts: `הצע מושגי מפתח לכיסוי בשיעור. רשום אותם כמחרוזת אחת, מופרדים בפסיקים.`,
        teachingStyle: `הצע סגנונות הוראה מתאימים. בחר מתוך הרשימה הזו: ${TEACHING_STYLES.join(', ')}.`,
        tone: `הצע טונים מתאימים לשיעור. בחר מתוך הרשימה הזו: ${TONES.join(', ')}.`,
        successMetrics: `הצע דרכים למדוד את הצלחת השיעור.`,
        inclusion: `הצע אסטרטגיות הכללה והתאמה ללומדים מגוונים.`
    };

    return `${basePrompt}\n\nשדה לקבלת הצעות עבורו: '${field}'\nהנחיה: ${fieldPrompts[field]}`;
};

export const generateFieldSuggestion = async (field: SuggestionField, context: LessonFormData): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = getSuggestionPrompt(field, context);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: singleFieldSuggestionSchema,
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.suggestions || [];
    } catch (error) {
        console.error(`Error generating suggestions for field ${field}:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to get suggestions: ${error.message}`);
        }
        throw new Error("An unknown error occurred while getting suggestions.");
    }
};

const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        text: {
            type: Type.STRING,
            description: "תגובה טקסטואלית לשאלת המשתמש. השתמש בשדה זה לתשובות כלליות.",
            nullable: true,
        },
        suggestions: {
            type: Type.OBJECT,
            description: "השתמש בשדה זה אם המשתמש מבקש הצעות לשדה ספציפי.",
            nullable: true,
            properties: {
                field: {
                    type: Type.STRING,
                    enum: ['topic', 'objectives', 'keyConcepts', 'teachingStyle', 'tone', 'successMetrics', 'inclusion'],
                    description: "השדה עבורו ניתנות ההצעות."
                },
                values: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "מערך של 3 הצעות טקסט קצרות."
                }
            }
        }
    }
};


export const chatWithLessonAssistant = async (message: string, context: LessonFormData): Promise<Partial<ChatMessage>> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
        אתה יועץ פדגוגי מומחה המובנה בממשק ליצירת שיעורים.
        התפקיד שלך הוא לסייע למורה שיוצר/ת שיעור.
        התשובות שלך חייבות להיות בעברית בלבד.

        --- הקשר השיעור הנוכחי (ייתכן שחלק מהשדות ריקים) ---
        נושא: ${context.topic || 'לא הוגדר'}
        שכבת גיל: ${context.gradeLevel || 'לא הוגדר'}
        מטרות: ${context.objectives || 'לא הוגדר'}
        מושגי מפתח: ${context.keyConcepts || 'לא הוגדר'}
        סגנון הוראה: ${context.teachingStyle || 'לא הוגדר'}
        ---

        המשתמש שאל: "${message}"

        --- הנחיות לתגובה ---
        1.  נתח את שאלת המשתמש. האם זו שאלה כללית או בקשה להצעות עבור שדה ספציפי בטופס?
        2.  **אם זו שאלה כללית:** ענה תשובה מועילה ותמציתית. החזר JSON עם שדה "text" בלבד.
        3.  **אם זו בקשה להצעות לשדה מסוים (למשל "תן לי רעיונות למטרות"):** זהה את השדה המבוקש (למשל, 'objectives'). צור 3 הצעות קצרות ורלוונטיות. החזר JSON עם שדה "suggestions" בלבד.
        4.  התשובה שלך חייבת להיות אובייקט JSON שתואם לסכמה שסופקה.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: chatResponseSchema,
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (!result.text && !result.suggestions) {
            return { text: "מצטער, לא הצלחתי להבין את הבקשה. אפשר לנסח מחדש?" };
        }

        return result;

    } catch (error) {
        console.error("Error in chat assistant:", error);
         if (error instanceof Error) {
            throw new Error(`Chat error: ${error.message}`);
        }
        throw new Error("An unknown error occurred in chat assistant.");
    }
};
