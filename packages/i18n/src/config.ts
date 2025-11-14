/**
 * i18n Configuration
 * Defines supported languages, resources, and default settings
 */

import type { i18nConfig, Language } from './types';
import { en } from './resources/en';
import { es } from './resources/es';

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

/**
 * Translation resources
 * Currently supports English and Spanish
 * Future: Add more languages (French, German, Japanese, Chinese)
 */
export const TRANSLATION_RESOURCES = {
  en,
  es,
  // Add more language resources as needed
  // fr: fr,
  // de: de,
  // ja: ja,
  // zh: zh,
} as const;

/**
 * Default i18n configuration
 */
export const defaultConfig: i18nConfig = {
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'es'],
  fallbackLanguage: 'en',
  ns: ['common', 'nav', 'poker', 'backgammon', 'scrabble', 'game', 'audio', 'stats', 'messages'],
  resources: TRANSLATION_RESOURCES,
};

/**
 * Language display names
 */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
};

/**
 * Language flags (emoji)
 */
export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  ja: '🇯🇵',
  zh: '🇨🇳',
};

/**
 * Language codes for locale-specific formatting
 */
export const LOCALE_CODES: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

/**
 * Date format preferences by language
 */
export const DATE_FORMATS: Record<Language, string> = {
  en: 'MM/DD/YYYY',
  es: 'DD/MM/YYYY',
  fr: 'DD/MM/YYYY',
  de: 'DD.MM.YYYY',
  ja: 'YYYY/MM/DD',
  zh: 'YYYY/MM/DD',
};

/**
 * Time format preferences by language
 */
export const TIME_FORMATS: Record<Language, '12h' | '24h'> = {
  en: '12h',
  es: '24h',
  fr: '24h',
  de: '24h',
  ja: '24h',
  zh: '24h',
};

/**
 * Get configuration for specific supported languages
 * @param languages Languages to include
 * @returns i18n configuration
 */
export function createConfig(languages: Language[] = ['en', 'es']): i18nConfig {
  const resources: Record<string, any> = {};

  languages.forEach((lang) => {
    if (lang in TRANSLATION_RESOURCES) {
      resources[lang] = TRANSLATION_RESOURCES[lang as keyof typeof TRANSLATION_RESOURCES];
    }
  });

  return {
    defaultLanguage: 'en' as Language,
    supportedLanguages: languages,
    fallbackLanguage: 'en' as Language,
    ns: defaultConfig.ns,
    resources,
  };
}
