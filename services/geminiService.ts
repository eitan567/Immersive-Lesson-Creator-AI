import { GoogleGenAI, Type, Modality, Part } from "@google/genai";
import type { LessonFormData, LessonPlan, Screen, LessonPart, SuggestionField, ChatMessage, ChatSuggestion } from '../types';
import { TEACHING_STYLES, TONES, SCREEN_TYPES, SPACE_USAGE_OPTIONS, PLACEMENT_IN_CONTENT_OPTIONS } from "../constants";

const screenSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: SCREEN_TYPES.filter(t => t !== 'בחר סוג') },
        description: { type: Type.STRING, description: "תיאור מפורט של תוכן המסך והשימוש בו." }
    },
    required: ['type', 'description']
};

const lessonPartSchema = {
    type: Type.OBJECT,
    properties: {
        content: { type: Type.STRING, description: "תיאור מפורט של הפעילויות והתוכן בחלק זה של השיעור." },
        spaceUsage: { type: Type.STRING, enum: SPACE_USAGE_OPTIONS, description: "אופן השימוש במרחב הלמידה." },
        screens: {
            type: Type.ARRAY,
            items: screenSchema,
            description: "רשימה של עד 3 מסכים לשימוש בחלק זה. יכול להיות ריק.",
            maxItems: 3
        }
    },
    required: ['content', 'spaceUsage', 'screens']
};

const lessonPlanSchema = {
  type: Type.OBJECT,
  properties: {
    lessonTitle: { type: Type.STRING, description: "כותרת מרתקת ומסקרנת לשיעור, מבוססת על נושא היחידה." },
    unitTopic: { type: Type.STRING, description: "נושא היחידה כפי שסופק." },
    category: { type: Type.STRING, description: "הקטגוריה המקצועית של השיעור." },
    generalDescription: { type: Type.STRING, description: "תיאור כללי ותמציתי של השיעור ומהלכו." },
    priorKnowledge: { type: Type.STRING, description: "תיאור הידע המקדים הנדרש מהתלמידים." },
    placementInContent: { type: Type.STRING, description: "מיקום השיעור ברצף הלמידה." },
    contentGoals: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "רשימה של 2-3 מטרות תוכן ברורות ומדידות."
    },
    skillGoals: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "רשימה של 1-2 מטרות מיומנות (למשל, עבודת צוות, חשיבה ביקורתית)."
    },
    opening: lessonPartSchema,
    main: lessonPartSchema,
    summary: lessonPartSchema,
    targetAudience: { type: Type.STRING, description: "קהל היעד של השיעור (שכבת הגיל)." },
    lessonDuration: { type: Type.INTEGER, description: "משך השיעור הכולל בדקות." },
    learningObjectives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "רשימה מסכמת של 3-5 מטרות למידה כלליות (שילוב של תוכן ומיומנויות)."
    },
    materials: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "רשימת חומרים וציוד הנדרשים לשיעור, כולל דיגיטליים ופיזיים."
    },
    immersiveExperienceIdea: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "שם רעיון החוויה האימרסיבית." },
        description: { type: Type.STRING, description: "תיאור מפורט של רעיון יצירתי לחוויה אימרסיבית." }
      },
      required: ["title", "description"],
    },
    assessment: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "שם פעילות ההערכה." },
            description: { type: Type.STRING, description: "כיצד תיבדק הבנת התלמידים והשגת המטרות." }
        },
        required: ["title", "description"],
    }
  },
  required: [
    "lessonTitle", "unitTopic", "category", "generalDescription", "priorKnowledge", "placementInContent",
    "contentGoals", "skillGoals", "opening", "main", "summary", "targetAudience",
    "lessonDuration", "learningObjectives", "materials", "immersiveExperienceIdea", "assessment"
  ],
};

const getStyleForGradeLevel = (gradeLevel: string): string => {
    switch (gradeLevel) {
        case 'גן ילדים':
        case 'יסודי (א-ג)':
            return "Simple, vibrant, colorful, whimsical and fun cartoon style. Engaging and clear for young children.";
        case 'יסודי (ד-ו)':
            return "Bright and engaging comic book style illustration. Clear, educational, and dynamic.";
        case 'חטיבת ביניים':
            return "Modern digital illustration style. Clean lines, educational, and visually appealing for teenagers.";
        case 'תיכון':
            return "Infographic style, clean and schematic. Visually represents the concept clearly and accurately. Minimalist.";
        case 'אקדמיה':
            return "Realistic and detailed educational illustration. Schematic or diagrammatic style, professional and informative.";
        default:
            return "Clear, engaging, and colorful educational illustration.";
    }
};

const generateImageForScreen = async (
    ai: GoogleGenAI,
    description: string,
    gradeLevel: string
): Promise<string> => {
    const style = getStyleForGradeLevel(gradeLevel);
    const prompt = `Generate a high-quality educational illustration for a screen described as: "${description}", suitable for the following target audience: **${gradeLevel}**.

**Mandatory Visual Style Guidelines:**
- The style must be: **${style}**.
- The image must be perfectly adapted for the specified age group (${gradeLevel}).

**Crucial instruction:** The final image must not contain any text, letters, numbers, or words whatsoever. It must be a purely visual representation.`;

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
        console.error(`Error generating image for screen "${description}":`, error);
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
    ? `בהתבסס **אך ורק** על תוכן המסמך המצורף, צור מערך שיעור אימרסיבי ויצירתי.`
    : `צור מערך שיעור אימרסיבי ויצירתי המבוסס על הפרטים הבאים.`;

    const getScreensForPart = (partPrefix: 'opening' | 'main' | 'summary'): string => {
        let screensText = '';
        for (let i = 1; i <= 3; i++) {
            const type = formData[`${partPrefix}Screen${i}Type` as keyof LessonFormData];
            const desc = formData[`${partPrefix}Screen${i}Desc` as keyof LessonFormData];
            if (type && desc && type !== 'בחר סוג') {
                screensText += `- סוג: ${type}, תיאור: ${desc}\n`;
            }
        }
        return screensText || 'לא צוין';
    }


  return `
    ${basePrompt}
    התנהג כמומחה לעיצוב הדרכה ופדגוגיה חדשנית.
    הפלט חייב להיות אובייקט JSON התואם לסכמה שסופקה.
    הקפד למלא את כל השדות בסכמה בצורה מפורטת, יצירתית ומותאמת פדגוגית לקהל היעד. במידת האפשר, שלב 1-2 מסכים מסוג 'תמונה' עם תיאורים עשירים כדי להמחיש מושגים ויזואלית.

    --- תוכנית השיעור ---
    קטגוריה: ${formData.category}
    נושא היחידה: ${formData.unitTopic}
    שכבת גיל: ${formData.gradeLevel}
    זמן כולל (דקות): ${formData.duration || 45}
    ידע קודם נדרש: ${formData.priorKnowledge || 'לא צוין'}
    מיקום בתוכן: ${formData.placementInContent || 'לא צוין'}
    מטרות ברמת התוכן: ${formData.contentGoals || 'יש להגדיר על סמך נושא היחידה'}
    מטרות ברמת המיומנויות: ${formData.skillGoals || 'יש להגדיר על סמך נושא היחידה'}
    תיאור כללי: ${formData.generalDescription || 'יש לכתוב תיאור כללי'}

    --- חלקי השיעור (הנחיות מהמשתמש) ---
    פתיחה:
      - תוכן: ${formData.openingContent || 'יש לתכנן פתיחה מסקרנת'}
      - אופן שימוש במרחב: ${formData.openingSpaceUsage || 'לא צוין'}
      - מסכים: ${getScreensForPart('opening')}
    עיקר:
      - תוכן: ${formData.mainContent || 'יש לתכנן את גוף השיעור עם פעילויות מגוונות'}
      - אופן שימוש במרחב: ${formData.mainSpaceUsage || 'לא צוין'}
      - מסכים: ${getScreensForPart('main')}
    סיכום:
      - תוכן: ${formData.summaryContent || 'יש לתכנן סיכום ממצה ומשמעותי'}
      - אופן שימוש במרחב: ${formData.summarySpaceUsage || 'לא צוין'}
      - מסכים: ${getScreensForPart('summary')}

    --- הנחיות נוספות (שדות מדור קודם) ---
    נושא השיעור (כותרת כללית): ${formData.topic}
    מטרות עיקריות נוספות: ${formData.objectives || 'לא צוין'}
    מושגי מפתח: ${formData.keyConcepts || (isFile ? 'יש לזהות מתוך תוכן המסמך' : 'לא צוין')}
    סגנון הוראה מועדף: ${formData.teachingStyle || 'גמיש'}
    טון השיעור: ${formData.tone || 'ניטרלי'}
    מדדי הצלחה: ${formData.successMetrics || 'לא צוין'}
    הנחיות הכללה והתאמה: ${formData.inclusion || 'לא צוין'}
    רעיון לחוויה אימרסיבית (אם סופק): ${formData.immersiveExperienceTitle ? `כותרת: ${formData.immersiveExperienceTitle}, תיאור: ${formData.immersiveExperienceDescription}` : 'לא סופק, יש ליצור רעיון מקורי.'}
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
    lessonPlan.topic = formData.topic; // Preserve the original topic

    if (generateImages) {
        const allParts: LessonPart[] = [lessonPlan.opening, lessonPlan.main, lessonPlan.summary];
        const imagePromises: Promise<void>[] = [];

        allParts.forEach(part => {
            if (part && part.screens) {
                part.screens.forEach(screen => {
                    if (screen.type === 'תמונה') {
                        const promise = generateImageForScreen(ai, screen.description, lessonPlan.targetAudience)
                            .then(imageUrl => {
                                if (imageUrl) {
                                    screen.imageUrl = imageUrl;
                                }
                            });
                        imagePromises.push(promise);
                    }
                });
            }
        });
        await Promise.all(imagePromises);
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

export const generateFullFormSuggestions = async (unitTopic: string, gradeLevel: string): Promise<Partial<LessonFormData>> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const suggestionSchema = {
        type: Type.OBJECT,
        properties: {
            topic: { type: Type.STRING, description: "הצעת כותרת כללית לשיעור, קשורה לנושא היחידה." },
            priorKnowledge: { type: Type.STRING, description: "טקסט קצר המתאר את הידע המקדים הנדרש מהתלמידים." },
            placementInContent: { type: Type.STRING, enum: PLACEMENT_IN_CONTENT_OPTIONS, description: "מיקום השיעור המתאים ביותר ברצף הלמידה." },
            contentGoals: { type: Type.STRING, description: "טקסט המתאר 2-3 מטרות תוכן עיקריות, מופרדות בשורות חדשות." },
            skillGoals: { type: Type.STRING, description: "טקסט המתאר 1-2 מטרות מיומנות, מופרדות בשורות חדשות." },
            generalDescription: { type: Type.STRING, description: "תיאור כללי קצר וקולע של מהלך השיעור." },
            openingContent: { type: Type.STRING, description: "תיאור קצר ומרתק לפעילות פתיחה." },
            openingSpaceUsage: { type: Type.STRING, enum: SPACE_USAGE_OPTIONS, description: "אופן השימוש במרחב המתאים ביותר לפתיחה." },
            mainContent: { type: Type.STRING, description: "תיאור קצר לגוף השיעור, כולל רעיון לפעילות מרכזית." },
            mainSpaceUsage: { type: Type.STRING, enum: SPACE_USAGE_OPTIONS, description: "אופן השימוש במרחב המתאים ביותר לגוף השיעור." },
            summaryContent: { type: Type.STRING, description: "תיאור קצר לפעילות סיכום משמעותית." },
            summarySpaceUsage: { type: Type.STRING, enum: SPACE_USAGE_OPTIONS, description: "אופן השימוש במרחב המתאים ביותר לסיכום." },
            openingScreen1Type: { type: Type.STRING, enum: SCREEN_TYPES.filter(t => t !== 'בחר סוג'), description: "סוג מסך מתאים לפתיחה (למשל 'תמונה' או 'סרטון')." },
            openingScreen1Desc: { type: Type.STRING, description: "תיאור קצר למסך הפתיחה." },
            mainScreen1Type: { type: Type.STRING, enum: SCREEN_TYPES.filter(t => t !== 'בחר סוג'), description: "סוג מסך מתאים לגוף השיעור." },
            mainScreen1Desc: { type: Type.STRING, description: "תיאור קצר למסך גוף השיעור." },
            summaryScreen1Type: { type: Type.STRING, enum: SCREEN_TYPES.filter(t => t !== 'בחר סוג'), description: "סוג מסך מתאים לסיכום." },
            summaryScreen1Desc: { type: Type.STRING, description: "תיאור קצר למסך הסיכום." },
            objectives: { type: Type.STRING, description: "טקסט קצר וברור המתאר 2-3 מטרות עיקריות לשיעור." },
            keyConcepts: { type: Type.STRING, description: "רשימה של 3-5 מושגי מפתח עיקריים, מופרדים בפסיקים." },
            teachingStyle: { type: Type.STRING, enum: TEACHING_STYLES, description: "סגנון ההוראה המתאים ביותר לנושא ולגיל." },
            tone: { type: Type.STRING, enum: TONES, description: "הטון המתאים ביותר לשיעור." },
            successMetrics: { type: Type.STRING, description: "טקסט קצר המתאר דרך אחת או שתיים למדוד את הצלחת השיעור." },
            inclusion: { type: Type.STRING, description: "טקסט קצר עם רעיון אחד להתאמת השיעור לתלמידים שונים." },
            immersiveExperienceTitle: { type: Type.STRING, description: "כותרת קצרה ומושכת לרעיון החוויה האימרסיבית." },
            immersiveExperienceDescription: { type: Type.STRING, description: "תיאור קצר של רעיון יצירתי לחוויה אימרסיבית." },
        },
        required: [
            "topic", "priorKnowledge", "placementInContent", "contentGoals", "skillGoals", "generalDescription",
            "openingContent", "openingSpaceUsage", "mainContent", "mainSpaceUsage", "summaryContent", "summarySpaceUsage",
            "openingScreen1Type", "openingScreen1Desc", "mainScreen1Type", "mainScreen1Desc", "summaryScreen1Type", "summaryScreen1Desc",
            "objectives", "keyConcepts", "teachingStyle", "tone", "successMetrics", "inclusion", 
            "immersiveExperienceTitle", "immersiveExperienceDescription"
        ],
    };

    const prompt = `
        אתה עוזר פדגוגי יצירתי. המטרה שלך היא למלא באופן מלא טופס ליצירת שיעור.
        בהינתן נושא היחידה ושכבת הגיל, אנא ספק תוכן מתאים לכל אחד מהשדות המוגדרים בסכמה בעברית.
        התוכן צריך להיות ממוקד, מעשי, יצירתי ומתאים להקשר החינוכי. מלא את כל השדות בצורה מקיפה.

        --- פרטי השיעור ---
        נושא היחידה: ${unitTopic}
        שכבת גיל: ${gradeLevel}

        החזר אובייקט JSON בלבד, שתואם באופן מלא לסכמה. התשובה חייבת להיות בעברית.
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
        - נושא: ${context.unitTopic || context.topic || 'לא צוין'}
        - שכבת גיל: ${context.gradeLevel}
    `;

    const fieldPrompts: Record<SuggestionField, string> = {
        topic: `הצע נושאים יצירתיים לשיעורים המתאימים ל${context.gradeLevel}.`,
        objectives: `הצע מטרות למידה ברורות ומדידות.`,
        keyConcepts: `הצע מושגי מפתח לכיסוי בשיעור. רשום אותם כמחרוזת אחת, מופרדים בפסיקים.`,
        teachingStyle: `הצע סגנונות הוראה מתאימים. בחר מתוך הרשימה הזו: ${TEACHING_STYLES.join(', ')}.`,
        tone: `הצע טונים מתאימים לשיעור. בחר מתוך הרשימה הזו: ${TONES.join(', ')}.`,
        successMetrics: `הצע דרכים למדוד את הצלחת השיעור.`,
        inclusion: `הצע אסטרטגיות הכללה והתאמה ללומדים מגוונים.`,
        immersiveExperience: `הצע רעיונות יצירתיים לחוויה אימרסיבית. כל הצעה חייבת להיות בפורמט הבא, בשתי שורות נפרדות:
כותרת: [כותרת ההצעה כאן]
תיאור: [תיאור ההצעה כאן]`,
        priorKnowledge: `בהתבסס על נושא היחידה "${context.unitTopic || context.topic}", הצע 3-4 נקודות תמציתיות המתארות ידע קודם נדרש מהתלמידים.`,
        contentGoals: `בהתבסס על נושא היחידה "${context.unitTopic || context.topic}", הצע 3-4 מטרות תוכן ספציפיות. כל מטרה צריכה להיות מנוסחת כפריט ברשימה (למשל, - להגדיר...).`,
        skillGoals: `בהתבסס על נושא היחידה "${context.unitTopic || context.topic}", הצע 2-3 מטרות מיומנות (למשל, עבודת צוות, חשיבה ביקורתית, פתרון בעיות) מנוסחות כפריטים ברשימה.`,
        generalDescription: `כתוב 3-4 הצעות לתיאור כללי קצר ומרתק עבור שיעור בנושא "${context.unitTopic || context.topic}".`,
        openingContent: `הצע 3-4 רעיונות לפעילויות פתיחה מסקרנות וקצרות עבור שיעור בנושא "${context.unitTopic || context.topic}".`,
        mainContent: `הצע 3-4 רעיונות לפעילויות מרכזיות ומגוונות עבור גוף השיעור בנושא "${context.unitTopic || context.topic}".`,
        summaryContent: `הצע 3-4 רעיונות לפעילויות סיכום ממצות ומשמעותיות עבור שיעור בנושא "${context.unitTopic || context.topic}".`
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
                    enum: [
                        'topic', 'objectives', 'keyConcepts', 'teachingStyle', 'tone', 
                        'successMetrics', 'inclusion', 'immersiveExperience', 'priorKnowledge', 'contentGoals', 
                        'skillGoals', 'generalDescription', 'openingContent', 
                        'mainContent', 'summaryContent'
                    ],
                    description: "מפתח השדה באנגלית עבורו ניתנות ההצעות."
                },
                fieldName: {
                    type: Type.STRING,
                    description: "שם השדה המלא והמדויק בעברית, כפי שמופיע בטופס."
                },
                values: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "מערך של 3 הצעות טקסט קצרות."
                }
            },
            required: ['field', 'fieldName', 'values']
        }
    }
};

const fullFieldNames: Record<SuggestionField, string> = {
    topic: 'נושא השיעור (כותרת כללית)',
    objectives: 'מטרות עיקריות',
    keyConcepts: 'מושגי מפתח',
    teachingStyle: 'סגנון הוראה',
    tone: 'טון השיעור',
    successMetrics: 'מדדי הצלחה',
    inclusion: 'הכללה והתאמות',
    immersiveExperience: 'חוויה אימרסיבית',
    priorKnowledge: 'ידע קודם נדרש',
    contentGoals: 'מטרות ברמת התוכן',
    skillGoals: 'מטרות ברמת המיומנויות',
    generalDescription: 'תיאור כללי',
    openingContent: 'תוכן פתיחה',
    mainContent: 'תוכן עיקר',
    summaryContent: 'תוכן סיכום'
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

        --- שמות השדות האפשריים בטופס (מפתח באנגלית, שם מלא בעברית) ---
        ${Object.entries(fullFieldNames).map(([key, value]) => `- ${key}: "${value}"`).join('\n')}
        ---

        --- הקשר השיעור הנוכחי (ייתכן שחלק מהשדות ריקים) ---
        קטגוריה: ${context.category || 'לא הוגדר'}
        נושא היחידה: ${context.unitTopic || 'לא הוגדר'}
        שכבת גיל: ${context.gradeLevel || 'לא הוגדר'}
        ידע קודם: ${context.priorKnowledge || 'לא הוגדר'}
        מיקום בתוכן: ${context.placementInContent || 'לא הוגדר'}
        מטרות תוכן: ${context.contentGoals || 'לא הוגדר'}
        מטרות מיומנות: ${context.skillGoals || 'לא הוגדר'}
        תיאור כללי: ${context.generalDescription || 'לא הוגדר'}
        תוכן פתיחה: ${context.openingContent || 'לא הוגדר'}
        תוכן עיקרי: ${context.mainContent || 'לא הוגדר'}
        תוכן סיכום: ${context.summaryContent || 'לא הוגדר'}
        סגנון הוראה: ${context.teachingStyle || 'לא הוגדר'}
        טון: ${context.tone || 'לא הוגדר'}
        ---

        המשתמש שאל: "${message}"

        --- הנחיות לתגובה ---
        1.  נתח את שאלת המשתמש. האם זו שאלה כללית או בקשה להצעות עבור שדה ספציפי בטופס?
        2.  **אם זו שאלה כללית:** ענה תשובה מועילה ותמציתית. החזר JSON עם שדה "text" בלבד.
        3.  **אם זו בקשה להצעות לשדה מסוים (למשל "תן לי רעיונות למטרות"):**
            - זהה לאיזה שדה מהרשימה למעלה המשתמש מתכוון.
            - החזר את **מפתח השדה באנגלית** בשדה 'field'.
            - החזר את **השם המלא והמדויק של השדה בעברית** מהרשימה בשדה 'fieldName'. זה קריטי להשתמש בשם המלא והמדויק. לדוגמה, אם המשתמש ביקש "ידע קודם", השתמש ב-"ידע קודם נדרש".
            - צור 3 הצעות קצרות ורלוונטיות בהתבסס על הקשר השיעור שסופק.
            - החזר JSON עם אובייקט "suggestions" המכיל את 'field', 'fieldName', ו-'values'.
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

const supportChatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: {
            type: Type.STRING,
            description: "A helpful and concise response to the user's support query, written in Hebrew.",
        }
    },
    required: ["responseText"],
};

export const getSupportChatResponse = async (message: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
        אתה נציג תמיכה טכנית עבור אפליקציה בשם "יוצר השיעורים AI".
        התפקיד שלך הוא לסייע למשתמשים, לענות על שאלות, לקבל תלונות ולספק תמיכה.
        התשובות שלך חייבות להיות בעברית בלבד, ובטון ידידותי, מקצועי וסבלני.

        --- הנחיות להתנהגות ---
        1.  **זיהוי כוונות:** נתח את בקשת המשתמש. האם זו שאלה על שימוש באפליקציה? תלונה? בקשה לפרטי קשר?
        2.  **שאלות על שימוש ("איך עושים..."):** ספק תשובות ברורות ותמציתיות. הדריכו את המשתמש צעד אחר צעד במידת הצורך.
        3.  **תלונות או בעיות טכניות:**
            -   התחל בהבעת אמפתיה ("אני מבין את התסכול", "אני מצטער לשמוע שנתקלת בבעיה").
            -   אם חסר מידע, בקש פרטים נוספים כדי להבין את הבעיה (למשל: "תוכל/י לתאר לי בדיוק מה קרה?", "באיזה שלב הבעיה הופיעה?").
            -   אם נראה שהבעיה דורשת טיפול של צוות התמיכה, אמור למשתמש שתעביר את הפרטים הלאה ובקש ממנו את שמו וכתובת האימייל שלו כדי שיוכלו לחזור אליו. אל תמציא פתרונות טכניים מורכבים.
        4.  **בקשת פרטי קשר:** אם המשתמש מבקש לדבר עם נציג אנושי או לקבל פרטי קשר, ספק את הפרטים הבאים:
            -   אימייל: support@lessoncreator.ai
            -   טלפון: 1-800-555-LESSON
            -   הסבר שאלו הדרכים ליצור קשר עם צוות התמיכה האנושי.
        5.  **שאלות כלליות:** ענה בצורה אינפורמטיבית על האפליקציה ותכונותיה.

        שמור על תשובות קצרות יחסית, המתאימות לחלון צ'אט.

        --- בקשת המשתמש הנוכחית ---
        "${message}"

        --- הנחיה ---
        החזר אובייקט JSON התואם לסכמה שסופקה עם תשובה ישירה לבקשת המשתמש.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: supportChatResponseSchema,
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.responseText || "מצטער, לא הצלחתי להבין את הבקשה. אפשר לנסח מחדש?";
    } catch (error) {
        console.error("Error in support chat:", error);
         if (error instanceof Error) {
            throw new Error(`Chat error: ${error.message}`);
        }
        throw new Error("An unknown error occurred in support chat.");
    }
};