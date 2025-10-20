import React, { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import type { AppSettings } from '../types';
import { AI_MODELS } from '../constants';
import CogIcon from './icons/CogIcon';
import CustomSelect from './CustomSelect';

interface SettingsProps {
    onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
    const { settings, setSettings } = useContext(SettingsContext);

    const handleToggle = (key: keyof AppSettings) => {
        if (key === '_previousChatSettings' || key === 'theme') return;

        const newValue = !settings[key];

        if (key === 'isChatPinned') {
            if (newValue === true) {
                setSettings({
                    isChatPinned: true,
                    isChatFloating: false,
                    closeChatOnSuggestion: false,
                    _previousChatSettings: {
                        isChatFloating: settings.isChatFloating,
                        closeChatOnSuggestion: settings.closeChatOnSuggestion,
                    },
                });
            } else {
                setSettings({
                    isChatPinned: false,
                    isChatFloating: settings._previousChatSettings?.isChatFloating ?? true,
                    closeChatOnSuggestion: settings._previousChatSettings?.closeChatOnSuggestion ?? true,
                    _previousChatSettings: null,
                });
            }
        } else {
            setSettings({ [key]: newValue });
        }
    };

    const handleCustomSelectChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setSettings({ [name]: value });
    };
    
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings({ [name]: value });
    };

    const ToggleSwitch: React.FC<{ label: string; description: string; settingKey: keyof AppSettings; disabled?: boolean; }> = ({ label, description, settingKey, disabled = false }) => (
        <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
            <div>
                <p className={`text-lg font-semibold ${disabled ? 'text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
            </div>
            <label htmlFor={String(settingKey)} className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                    type="checkbox"
                    id={String(settingKey)}
                    className="sr-only peer"
                    checked={!!settings[settingKey]}
                    onChange={() => !disabled && handleToggle(settingKey)}
                    disabled={disabled}
                />
                <div className="w-14 h-8 bg-gray-300 dark:bg-zinc-600 rounded-full peer transition-colors peer-checked:bg-pink-600"></div>
                <div className="absolute top-1 left-1 bg-white border-gray-300 border rounded-full h-6 w-6 transition-transform peer-checked:translate-x-6 peer-checked:border-white"></div>
            </label>
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-zinc-900 min-h-screen" dir="rtl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="rounded-2xl">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center mb-8">
                             <div className="flex items-center gap-3">
                                <CogIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">הגדרות</h1>
                            </div>
                             <button onClick={onBack} className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline">
                              &larr; חזרה
                            </button>
                        </div>
        
                        <div className="space-y-8 divide-y divide-gray-200 dark:divide-zinc-700">
                            
                            {/* Appearance Settings */}
                            <div className="pt-6 first:pt-0">
                                <h2 className="text-2xl font-bold mb-6 text-pink-600">מראה</h2>
                                <div>
                                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">ערכת נושא</p>
                                    <div className="flex items-center gap-x-6">
                                        {[{ value: 'light', label: 'בהיר' }, { value: 'dark', label: 'כהה' }, { value: 'system', label: 'מערכת' }].map(option => {
                                            const isChecked = settings.theme === option.value;
                                            return (
                                                <label key={option.value} className="flex items-center cursor-pointer text-lg p-2 rounded-lg group">
                                                    <input
                                                        type="radio"
                                                        name="theme"
                                                        value={option.value}
                                                        checked={isChecked}
                                                        onChange={handleRadioChange}
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ease-in-out
                                                            ${isChecked
                                                                ? 'border-pink-600 bg-pink-600'
                                                                : 'border-gray-400 dark:border-gray-500 bg-white dark:bg-zinc-800 group-hover:border-pink-500'}`
                                                        }
                                                    >
                                                        {isChecked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <span
                                                        className={`mr-3 font-semibold transition-colors duration-200
                                                            ${isChecked
                                                                ? 'text-gray-900 dark:text-gray-100'
                                                                : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100'}`
                                                        }
                                                    >
                                                        {option.label}
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
        
                            {/* Chat Settings */}
                            <div className="pt-8">
                                <h2 className="text-2xl font-bold mb-6 text-pink-600">הגדרות יועץ ה-AI (צ'אט)</h2>
                                <div className="space-y-6">
                                    <ToggleSwitch
                                        label="סגור צ'אט אוטומטית"
                                        description="כאשר מופעל, הצ'אט ייסגר אוטומטית לאחר בחירת הצעה."
                                        settingKey="closeChatOnSuggestion"
                                        disabled={settings.isChatPinned}
                                    />
                                    <div>
                                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">מיקום הצ'אט</p>
                                        <div className="flex items-center gap-x-6">
                                            {[{ value: 'right', label: 'ימין' }, { value: 'left', label: 'שמאל' }].map(option => {
                                                const isChecked = settings.chatPosition === option.value;
                                                return (
                                                    <label key={option.value} className="flex items-center cursor-pointer text-lg p-2 rounded-lg group">
                                                        <input
                                                            type="radio"
                                                            name="chatPosition"
                                                            value={option.value}
                                                            checked={isChecked}
                                                            onChange={handleRadioChange}
                                                            className="sr-only"
                                                        />
                                                        <div
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ease-in-out
                                                                ${isChecked
                                                                    ? 'border-pink-600 bg-pink-600'
                                                                    : 'border-gray-400 dark:border-gray-500 bg-white dark:bg-zinc-800 group-hover:border-pink-500'}`
                                                            }
                                                        >
                                                            {isChecked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                        </div>
                                                        <span
                                                            className={`mr-3 font-semibold transition-colors duration-200
                                                                ${isChecked
                                                                    ? 'text-gray-900 dark:text-gray-100'
                                                                    : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100'}`
                                                            }
                                                        >
                                                            {option.label}
                                                        </span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        label="אפשר צ'אט צף"
                                        description="מאפשר להזיז את חלון הצ'אט בחופשיות על המסך."
                                        settingKey="isChatFloating"
                                        disabled={settings.isChatPinned}
                                    />
                                    <ToggleSwitch
                                        label="קבע את הצ'אט למסך"
                                        description="מצמיד את חלון הצ'אט לצד המסך שנקבע בהגדרת המיקום."
                                        settingKey="isChatPinned"
                                    />
                                </div>
                            </div>
        
                            {/* AI Settings */}
                            <div className="pt-8">
                                <h2 className="text-2xl font-bold mb-6 text-pink-600">הגדרות בינה מלאכותית</h2>
                                <div className="space-y-6">
                                    <div>
                                    <label htmlFor="aiModel" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">מודל בינה מלאכותית</label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">בחר את המודל ליצירת מערכי השיעור. דגמי Pro מתקדמים יותר אך עשויים להיות איטיים יותר.</p>
                                    <CustomSelect
                                    name="aiModel"
                                    id="aiModel"
                                    value={settings.aiModel}
                                    onChange={handleCustomSelectChange}
                                    options={AI_MODELS}
                                    className="w-full max-w-xs bg-gray-50 dark:bg-zinc-800"
                                    />
                                    </div>
                                    <ToggleSwitch
                                        label="צור תמונות אוטומטית"
                                        description="הפעל כדי ליצור תמונות מותאמות אישית לכל פעילות בשיעור."
                                        settingKey="generateImages"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;