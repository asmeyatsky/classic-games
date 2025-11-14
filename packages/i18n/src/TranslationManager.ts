/**
 * Translation Manager
 * Handles language switching, translation retrieval, and interpolation
 */

import type {
  Language,
  Translations,
  LanguageResources,
  TranslationValue,
  InterpolationParams,
  i18nConfig,
} from './types';

/**
 * Core translation manager for handling localization
 */
export class TranslationManager {
  private currentLanguage: Language;
  private fallbackLanguage: Language;
  private resources: LanguageResources;
  private supportedLanguages: Language[];
  private listeners: Set<(language: Language) => void> = new Set();

  constructor(config: i18nConfig) {
    this.currentLanguage = config.defaultLanguage;
    this.fallbackLanguage = config.fallbackLanguage;
    this.resources = config.resources;
    this.supportedLanguages = config.supportedLanguages;
  }

  /**
   * Get translation string with optional interpolation
   * @param key Dot-separated translation key (e.g., "poker.actions.fold")
   * @param params Optional interpolation parameters
   * @returns Translated string
   */
  t(key: string, params?: InterpolationParams): string {
    const value = this.getTranslationValue(key);

    if (!value) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    // If value is a function, call it with params
    if (typeof value === 'function') {
      return value(params || {});
    }

    // If params provided, interpolate placeholders
    if (params && typeof value === 'string') {
      return this.interpolate(value, params);
    }

    return value;
  }

  /**
   * Get translation value with fallback logic
   * @param key Dot-separated translation key
   * @returns Translation value or undefined
   */
  private getTranslationValue(key: string): TranslationValue | undefined {
    // Try current language
    const result = this.getValueByPath(key, this.currentLanguage);
    if (result) return result;

    // Try fallback language if different
    if (this.currentLanguage !== this.fallbackLanguage) {
      const fallbackResult = this.getValueByPath(key, this.fallbackLanguage);
      if (fallbackResult) return fallbackResult;
    }

    return undefined;
  }

  /**
   * Get value from nested object by dot-separated path
   * @param path Dot-separated path (e.g., "poker.actions.fold")
   * @param language Language code
   * @returns Value at path or undefined
   */
  private getValueByPath(path: string, language: Language): TranslationValue | undefined {
    const translations = this.resources[language];
    if (!translations) return undefined;

    const keys = path.split('.');
    let current: any = translations;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' || typeof current === 'function' ? current : undefined;
  }

  /**
   * Interpolate placeholders in translation string
   * @param str String with {{key}} placeholders
   * @param params Parameter values
   * @returns Interpolated string
   */
  private interpolate(str: string, params: InterpolationParams): string {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Set current language
   * @param language Language code
   */
  setLanguage(language: Language): void {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Language not supported: ${language}`);
      return;
    }

    if (this.currentLanguage !== language) {
      this.currentLanguage = language;
      this.notifyListeners();
      this.saveLanguagePreference(language);
    }
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Language[] {
    return [...this.supportedLanguages];
  }

  /**
   * Get all translations for current language
   */
  getTranslations(): Translations {
    return this.resources[this.currentLanguage] || {};
  }

  /**
   * Get translations for specific language
   * @param language Language code
   */
  getTranslationsByLanguage(language: Language): Translations {
    return this.resources[language] || {};
  }

  /**
   * Add or update translations
   * @param language Language code
   * @param translations Translation object
   */
  addTranslations(language: Language, translations: Translations): void {
    if (!this.supportedLanguages.includes(language)) {
      this.supportedLanguages.push(language);
    }

    this.resources[language] = {
      ...this.resources[language],
      ...translations,
    };
  }

  /**
   * Subscribe to language changes
   * @param callback Function called when language changes
   * @returns Unsubscribe function
   */
  subscribe(callback: (language: Language) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of language change
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentLanguage));
  }

  /**
   * Save language preference to localStorage
   * @param language Language code
   */
  private saveLanguagePreference(language: Language): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18n:language', language);
    }
  }

  /**
   * Load language preference from localStorage
   * @returns Saved language or undefined
   */
  loadLanguagePreference(): Language | undefined {
    if (typeof window === 'undefined') return undefined;

    const saved = localStorage.getItem('i18n:language');
    if (saved && this.supportedLanguages.includes(saved as Language)) {
      return saved as Language;
    }

    return undefined;
  }

  /**
   * Detect system language
   * @returns Detected language or fallback
   */
  detectSystemLanguage(): Language {
    if (typeof window === 'undefined') return this.fallbackLanguage;

    const browserLang = navigator.language.split('-')[0].toLowerCase();
    const matchedLang = this.supportedLanguages.find((lang) => lang.startsWith(browserLang));

    return matchedLang || this.fallbackLanguage;
  }

  /**
   * Initialize with auto-detection (user preference > system > default)
   */
  initialize(): void {
    // Try user preference first
    const savedLanguage = this.loadLanguagePreference();
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
      return;
    }

    // Try system language
    const systemLanguage = this.detectSystemLanguage();
    if (systemLanguage !== this.fallbackLanguage) {
      this.currentLanguage = systemLanguage;
      this.saveLanguagePreference(systemLanguage);
      return;
    }
  }
}
