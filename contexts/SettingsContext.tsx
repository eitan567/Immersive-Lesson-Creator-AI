import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { AppSettings } from '../types';
import { AI_MODELS } from '../constants';

const defaultSettings: AppSettings = {
  closeChatOnSuggestion: true,
  chatPosition: 'right',
  isChatFloating: true,
  isChatPinned: false,
  isChatCollapsed: false,
  aiModel: AI_MODELS[0],
  generateImages: false,
  theme: 'light',
};

interface SettingsContextType {
    settings: AppSettings;
    setSettings: (settings: Partial<AppSettings>) => void;
}

export const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    setSettings: () => {},
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                // Merge saved settings with defaults to ensure all keys are present
                const parsedSettings = JSON.parse(savedSettings);
                setSettingsState(prev => ({ ...prev, ...parsedSettings }));
            }
        } catch (e) {
            console.error("Failed to parse settings from localStorage", e);
        }
    }, []);

    const setSettings = (newSettings: Partial<AppSettings>) => {
        setSettingsState(prevSettings => {
            const updatedSettings = { ...prevSettings, ...newSettings };
            try {
                localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
            } catch (e) {
                console.error("Failed to save settings to localStorage", e);
            }
            return updatedSettings;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};