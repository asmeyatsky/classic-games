/**
 * i18n React Context and Hooks
 * Provides translation functionality to React components
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
  useState,
} from 'react';
import { TranslationManager } from './TranslationManager';
import type { Language, InterpolationParams, i18nConfig } from './types';

/**
 * i18n Context Type
 */
interface i18nContextType {
  /** Translate key with optional interpolation */
  t: (key: string, params?: InterpolationParams) => string;
  /** Current language */
  language: Language;
  /** Set current language */
  setLanguage: (language: Language) => void;
  /** Supported languages */
  supportedLanguages: Language[];
  /** Translation manager instance */
  manager: TranslationManager;
}

/**
 * Create i18n context
 */
const i18nContext = createContext<i18nContextType | undefined>(undefined);

/**
 * i18n Provider Props
 */
interface i18nProviderProps {
  children: ReactNode;
  config: i18nConfig;
  onLanguageChange?: (language: Language) => void;
  autoDetect?: boolean;
}

/**
 * i18n Provider Component
 *
 * Wraps application with translation context
 *
 * @example
 * ```tsx
 * import { i18nProvider } from '@classic-games/i18n';
 *
 * <i18nProvider config={config} autoDetect={true}>
 *   <App />
 * </i18nProvider>
 * ```
 */
export function i18nProvider({
  children,
  config,
  onLanguageChange,
  autoDetect = true,
}: i18nProviderProps) {
  const [manager] = useState(() => new TranslationManager(config));
  const [language, setLanguageState] = useState<Language>(config.defaultLanguage);

  // Initialize on mount
  useEffect(() => {
    if (autoDetect) {
      manager.initialize();
      setLanguageState(manager.getLanguage());
    }

    // Subscribe to language changes
    const unsubscribe = manager.subscribe((newLanguage) => {
      setLanguageState(newLanguage);
      onLanguageChange?.(newLanguage);
    });

    return unsubscribe;
  }, [manager, autoDetect, onLanguageChange]);

  const t = useCallback(
    (key: string, params?: InterpolationParams) => manager.t(key, params),
    [manager]
  );

  const setLanguage = useCallback((lang: Language) => manager.setLanguage(lang), [manager]);

  const value: i18nContextType = {
    t,
    language,
    setLanguage,
    supportedLanguages: manager.getSupportedLanguages(),
    manager,
  };

  return <i18nContext.Provider value={value}>{children}</i18nContext.Provider>;
}

/**
 * Hook to use i18n context
 *
 * @throws Error if used outside i18nProvider
 *
 * @example
 * ```tsx
 * const { t, setLanguage } = use18n();
 * const greeting = t('common.greeting');
 * setLanguage('es');
 * ```
 */
export function use18n(): i18nContextType {
  const context = useContext(i18nContext);
  if (!context) {
    throw new Error('use18n must be used within i18nProvider');
  }
  return context;
}

/**
 * Hook to get translation function only
 *
 * @example
 * ```tsx
 * const t = useTranslation();
 * const title = t('pages.poker.title');
 * ```
 */
export function useTranslation() {
  const { t } = use18n();
  return t;
}

/**
 * Hook to get current language
 *
 * @example
 * ```tsx
 * const language = useLanguage();
 * console.log('Current language:', language);
 * ```
 */
export function useLanguage(): Language {
  const { language } = use18n();
  return language;
}

/**
 * Hook to set language
 *
 * @example
 * ```tsx
 * const setLanguage = useSetLanguage();
 * setLanguage('es');
 * ```
 */
export function useSetLanguage() {
  const { setLanguage } = use18n();
  return setLanguage;
}

/**
 * Hook for language switcher component
 *
 * @example
 * ```tsx
 * const { language, supportedLanguages, setLanguage } = useLanguageSwitcher();
 * return (
 *   <select value={language} onChange={(e) => setLanguage(e.target.value)}>
 *     {supportedLanguages.map(lang => (
 *       <option key={lang} value={lang}>{lang.toUpperCase()}</option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export function useLanguageSwitcher() {
  const { language, supportedLanguages, setLanguage } = use18n();

  return {
    language,
    supportedLanguages,
    setLanguage,
    changeLanguage: setLanguage,
  };
}

/**
 * HOC to wrap component with i18n
 *
 * @example
 * ```tsx
 * export default withi18n(MyComponent);
 * ```
 */
export function withi18n<P extends object>(
  Component: React.ComponentType<P & { t: (key: string) => string }>
) {
  return function i18nComponent(props: P) {
    const { t } = use18n();
    return <Component {...props} t={t} />;
  };
}
