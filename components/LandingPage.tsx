import React, { useState, useContext, useEffect } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import BookOpenIcon from './icons/BookOpenIcon';
import CpuChipIcon from './icons/CpuChipIcon';
import EyeIcon from './icons/EyeIcon';
import AdjustmentsHorizontalIcon from './icons/AdjustmentsHorizontalIcon';
import PhotoIcon from './icons/PhotoIcon';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import FeatureModal from './FeatureModal';

interface LandingPageProps {
    onEnter: () => void;
    onNavigateHome: () => void;
}

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    modalContent: {
        detailedDescription: string;
        example: React.ReactNode;
    };
}

const featuresData: Feature[] = [
    {
        icon: <CpuChipIcon className="w-8 h-8" />,
        title: "יצירה חכמה מבוססת AI",
        description: "קבלו מערך שיעור שלם, כולל מטרות, פעילויות והערכה, על בסיס נושא פשוט או קובץ קיים.",
        modalContent: {
            detailedDescription: "הכלי מאפשר לכם להפוך רעיון גולמי למערך שיעור מובנה ומפורט. כל מה שצריך לעשות הוא להזין נושא, כמו 'מערכת השמש', או פשוט להעלות קובץ PDF או טקסט קיים. הבינה המלאכותית תנתח את המידע ותבנה עבורכם שיעור שלם, עם מטרות, פעילויות, חומרים נדרשים ואפילו רעיונות להערכה.",
            example: (
                <div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400">// הקלט שלכם:</p>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded my-2">
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">נושא השיעור:</span> מחזור המים בטבע</p>
                    </div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-4">// הפלט שנוצר על ידי AI:</p>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded my-2">
                        <h5 className="font-bold text-gray-800 dark:text-gray-200">מטרות השיעור:</h5>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mt-1">
                            <li>התלמידים ידעו להסביר את שלבי מחזור המים.</li>
                            <li>התלמידים יוכלו לזהות דוגמאות לאידוי, התעבות ומשקעים.</li>
                        </ul>
                    </div>
                </div>
            )
        }
    },
    {
        icon: <EyeIcon className="w-8 h-8" />,
        title: "רעיונות לחוויה אימרסיבית",
        description: "הכניסו את התלמידים לעולם התוכן עם הצעות יצירתיות לסימולציות, משחקי תפקידים ועוד.",
        modalContent: {
            detailedDescription: "מעבר לשיעור רגיל, המערכת מציעה רעיונות מקוריים להפוך את הלמידה לחוויה בלתי נשכחת. אלו יכולות להיות פעילויות אינטראקטיביות, סימולציות, משחקי תפקידים, או סיורים וירטואליים. המטרה היא להכניס את התלמידים לעולם התוכן ולגרום להם 'לחיות' את הנושא.",
            example: (
                <div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400">// נושא: חקר החלל</p>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded my-2">
                        <h5 className="font-bold text-pink-600 dark:text-pink-400">רעיון לחוויה אימרסיבית: "משימה למאדים"</h5>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            הכיתה הופכת לצוות אסטרונאוטים במשימה למאדים. התלמידים יצטרכו לתכנן את המסע, 'לנחות' על הכוכב (באמצעות סיור וירטואלי 360°), לאסוף 'דגימות' (פתרון בעיות הקשורות למאדים) ולדווח חזרה ל'בסיס האם' (הצגת הממצאים לכיתה).
                        </p>
                    </div>
                </div>
            )
        }
    },
    {
        icon: <AdjustmentsHorizontalIcon className="w-8 h-8" />,
        title: "התאמה אישית מלאה",
        description: "שנו והתאימו כל חלק במערך השיעור, החל מסגנון ההוראה ועד לטון, כדי שיתאים בדיוק לכם ולכיתה.",
        modalContent: {
            detailedDescription: "כל מערך שיעור שנוצר הוא רק נקודת התחלה. יש לכם שליטה מלאה להתאים כל פרט ופרט. אתם יכולים לשנות את סגנון ההוראה (למשל, מלמידת חקר להרצאה פרונטלית), להתאים את הטון (ממשחקי ומהנה לרציני ואקדמי), ולהוסיף דגשים משלכם, כמו הנחיות לתלמידים עם צרכים מיוחדים.",
            example: (
                <div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400">// הגדרות אופציונליות בטופס:</p>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded my-2 space-y-2">
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">סגנון הוראה:</span> <span className="bg-pink-100 dark:bg-pink-900/50 p-1 rounded">מבוסס פרויקטים</span></p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">טון השיעור:</span> <span className="bg-pink-100 dark:bg-pink-900/50 p-1 rounded">יצירתי ומעורר השראה</span></p>
                        <p><span className="font-semibold text-gray-700 dark:text-gray-300">הכללה והתאמות:</span> <span className="bg-pink-100 dark:bg-pink-900/50 p-1 rounded">יש להכין כרטיסיות עם מושגים מרכזיים עבור תלמידים מתקשים.</span></p>
                    </div>
                </div>
            )
        }
    },
    {
        icon: <PhotoIcon className="w-8 h-8" />,
        title: "יצירת תמונות אוטומטית",
        description: "הפיחו חיים בכל פעילות עם תמונות מקוריות שנוצרות אוטומטית על ידי AI כדי להמחיש את התוכן.",
        modalContent: {
            detailedDescription: "תמונה אחת שווה אלף מילים, במיוחד בחינוך. על ידי הפעלת אפשרות זו, המערכת תיצור באופן אוטומטי תמונות מקוריות וצבעוניות עבור כל אחת מהפעילויות בשיעור. התמונות מותאמות לתיאור הפעילות ולגיל התלמידים, ועוזרות להמחיש מושגים, לעורר עניין ולהפוך את חומרי הלימוד למושכים יותר ויזואלית.",
            example: (
                <div>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400">// תיאור פעילות: "בניית הר געש מתפרץ"</p>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded my-2 text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-2">תמונה שנוצרה אוטומטית:</p>
                        <div className="w-full h-40 bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            )
        }
    }
];

const FeatureCard: React.FC<{ feature: Feature; onClick: () => void }> = ({ feature, onClick }) => (
    <button
        onClick={onClick}
        className="div-cta rounded-xl transform hover:-translate-y-2 transition-transform duration-300 h-full text-right w-full"
    >
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl shadow-lg text-center h-full">
            <div className="flex justify-center items-center mb-4">
                <div className="bg-pink-100 dark:bg-pink-900 text-black dark:text-white p-4 rounded-full">{feature.icon}</div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
        </div>
    </button>
);

const StepCard: React.FC<{ number: string; title: string; description: string }> = ({ number, title, description }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 text-black dark:text-white font-bold text-2xl rounded-full">
            {number}
        </div>
        <div className="mr-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{description}</p>
        </div>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; }> = ({ quote, author, role }) => (
    <div className="div-cta bg-white dark:bg-zinc-950 p-8 rounded-xl shadow-lg border border-pink-300 dark:border-pink-800">
        <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-4">"{quote}"</p>
        <p className="font-bold text-gray-800 dark:text-gray-100">{author}</p>
        <p className="text-gray-500 dark:text-gray-400">{role}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onNavigateHome }) => {
    const { settings, setSettings } = useContext(SettingsContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

     useEffect(() => {
        const root = window.document.documentElement;
        const observer = new MutationObserver(() => {
            setIsDarkMode(root.classList.contains('dark'));
        });
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        setIsDarkMode(root.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    const handleThemeToggle = () => {
        setSettings({ theme: isDarkMode ? 'light' : 'dark' });
    };

    const handleScrollTo = (id: string) => {
        setIsMenuOpen(false); // Close menu on navigation
        const element = document.getElementById(id);
        if (element) {
            // A slight delay can help the UI feel smoother
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const navLinks = (
        <>
            <button onClick={() => handleScrollTo('features')} className="text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">פיצ'רים</button>
            <button onClick={() => handleScrollTo('how-it-works')} className="text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">איך זה עובד?</button>
            <button onClick={() => handleScrollTo('testimonials')} className="text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-2 md:py-0">המלצות</button>
        </>
    );

    const ThemeToggleButton = () => (
        <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title={isDarkMode ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
        >
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
    );

    return (
        <div className="bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-200" dir="rtl">
            {/* Header */}
            <header className="border-b-[0.1px] border-[#3d3d3d] border-solid backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center cursor-pointer" onClick={onNavigateHome}>
                        <BookOpenIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 ml-3" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">יוצר השיעורים AI</h1>
                    </div>

                    <nav className="hidden md:flex space-x-8 space-x-reverse items-center">
                        {navLinks}
                    </nav>

                    <div className="flex items-center gap-2">
                        <ThemeToggleButton />
                         <button
                            onClick={onEnter}
                            className="btn-cta hidden md:inline-block px-6 py-2 text-black dark:text-white font-semibold rounded-full transition-colors"
                        >
                            התחברות / כניסה
                        </button>
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 z-50 relative">
                                {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
                 {/* Mobile Menu */}
                {isMenuOpen && (
                     <div className="md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
                        <nav className="flex flex-col items-center space-y-4 py-4 border-t border-gray-200 dark:border-zinc-800">
                            {navLinks}
                            <button
                                onClick={onEnter}
                                className="btn-cta w-4/5 mt-4 px-6 py-3 text-black dark:text-white font-semibold rounded-full transition-colors"
                            >
                                התחברות / כניסה
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="py-10 md:py-32 text-center bg-white dark:bg-zinc-900">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight">
                        הפכו כל נושא לחווית למידה <span className="gradient-text">מרתקת</span>
                    </h2>
                    <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        עם כלי ה-AI המתקדם שלנו, תוכלו ליצור מערכי שיעור אימרסיביים, יצירתיים ומותאמים אישית בכמה דקות בודדות. חסכו זמן יקר והעשירו את עולמם של התלמידים.
                    </p>
                    <button
                        onClick={onEnter}
                        className="btn-cta mt-10 px-10 py-4 text-black dark:text-white text-xl font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 transform hover:scale-105"
                    >
                        התחילו ליצור בחינם
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-10 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">כל מה שצריך כדי ליצור שיעור מושלם</h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">כלים חכמים שהופכים רעיונות למציאות.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuresData.map((feature, index) => (
                            <FeatureCard 
                                key={index} 
                                feature={feature} 
                                onClick={() => setSelectedFeature(feature)} 
                            />
                        ))}
                    </div>
                </div>
            </section>
            
            {/* How It Works Section */}
            <section id="how-it-works" className="py-10 md:py-20 bg-white dark:bg-zinc-900">
                 <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">יצירת שיעור ב-3 צעדים פשוטים</h2>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-12">
                        <StepCard
                            number="1"
                            title="הגדירו את הבסיס"
                            description="הזינו את נושא השיעור, שכבת הגיל ומשך הזמן הרצוי. אתם יכולים גם להעלות קובץ כדי לבסס עליו את השיעור."
                        />
                        <StepCard
                            number="2"
                            title="הוסיפו את הטאץ' שלכם"
                            description="דייקו את הבקשה עם מטרות, מושגים וסגנון הוראה מועדף. השתמשו ביועץ ה-AI לקבלת רעיונות נוספים."
                        />
                        <StepCard
                            number="3"
                            title="צרו והתאימו"
                            description="לחצו על כפתור היצירה וקבלו מערך שיעור מלא תוך שניות. עברו על התוצאה, ערכו אותה במידת הצורך ופרסמו אותה."
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-10 md:py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">מה אומרים עלינו?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="הכלי הזה שינה את הדרך בה אני מכינה שיעורים. אני חוסכת שעות עבודה והתלמידים שלי מעולם לא היו כל כך מעורבים."
                            author="דנה כהן"
                            role="מורה למדעים, חטיבת ביניים"
                        />
                        <TestimonialCard
                            quote="פשוט גאוני! היכולת לקבל רעיונות לחוויה אימרסיבית היא משהו שתמיד חיפשתי. מומלץ בחום."
                            author="יוסי לוי"
                            role="רכז פדגוגי, בית ספר יסודי"
                        />
                         <TestimonialCard
                            quote="אני משתמשת באפליקציה כדי להכין סדנאות והדרכות. התוצרים מקצועיים, יצירתיים וחוסכים לי המון זמן."
                            author="מיכל שחר"
                            role="מדריכה ומפתחת הדרכה"
                        />
                    </div>
                </div>
            </section>
            
            {/* Final CTA Section */}
            <section className="py-10 md:py-20 bg-white dark:bg-zinc-900">
                 <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">מוכנים להפוך את ההוראה שלכם לחוויה?</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        הצטרפו למאות אנשי חינוך שכבר משתמשים בכוח של AI כדי ליצור שיעורים שהתלמידים לא ישכחו.
                    </p>
                    <button
                        onClick={onEnter}
                        className="btn-cta mt-10 px-10 py-4 text-black dark:text-white text-xl font-bold rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 transform hover:scale-105"
                    >
                        בנו את השיעור הראשון שלכם
                    </button>
                 </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 dark:bg-zinc-950 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center md:text-right">
                        {/* Column 1: Brand */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-center md:justify-start">
                                <BookOpenIcon className="w-8 h-8 text-pink-600 dark:text-pink-400 ml-3" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">יוצר השיעורים AI</h2>
                            </div>
                            <p className="text-sm">
                                הופכים כל נושא לחווית למידה מרתקת באמצעות כוחה של בינה מלאכותית.
                            </p>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">קישורים מהירים</h3>
                            <ul className="space-y-3">
                                <li><button onClick={() => handleScrollTo('features')} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">פיצ'רים</button></li>
                                <li><button onClick={() => handleScrollTo('how-it-works')} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">איך זה עובד?</button></li>
                                <li><button onClick={() => handleScrollTo('testimonials')} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">המלצות</button></li>
                                <li><button onClick={onEnter} className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">כניסה למערכת</button></li>
                            </ul>
                        </div>

                        {/* Column 3: Legal */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">מידע נוסף</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">מדיניות פרטיות</a></li>
                                <li><a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">תנאי שימוש</a></li>
                                <li><a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors">צור קשר</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Social */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">עקבו אחרינו</h3>
                            <div className="flex space-x-4 space-x-reverse justify-center md:justify-start">
                                <a href="#" className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title="Facebook">
                                    <span className="sr-only">Facebook</span>
                                    <svg fill="currentColor" className="w-6 h-6" viewBox="0 0 24 24">
                                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title="Twitter/X">
                                    <span className="sr-only">Twitter</span>
                                     <svg fill="currentColor" className="w-6 h-6" viewBox="0 0 16 16">
                                        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75zM11.46 13.825h1.39L4.322 2.155H2.865l8.595 11.67z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title="LinkedIn">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg fill="currentColor" className="w-6 h-6" viewBox="0 0 24 24">
                                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-800 text-center text-sm">
                        <p>&copy; {new Date().getFullYear()} יוצר השיעורים AI. כל הזכויות שמורות.</p>
                    </div>
                </div>
            </footer>

            <FeatureModal
                isOpen={!!selectedFeature}
                onClose={() => setSelectedFeature(null)}
                feature={selectedFeature}
            />
        </div>
    );
};

export default LandingPage;