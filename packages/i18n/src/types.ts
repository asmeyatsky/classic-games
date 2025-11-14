/**
 * i18n Type Definitions
 * Core types for internationalization and localization system
 */

/** Supported languages in the application */
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

/** Translation value type - can be string or function for interpolation */
export type TranslationValue = string | ((params: Record<string, any>) => string);

/** Nested translation object structure */
export type Translations = {
  [key: string]: TranslationValue | Translations;
};

/** Translation keys with nested namespace support */
export interface LanguageResources {
  [language: string]: Translations;
}

/** i18n Configuration */
export interface i18nConfig {
  defaultLanguage: Language;
  supportedLanguages: Language[];
  fallbackLanguage: Language;
  ns: string[];
  resources: LanguageResources;
}

/** Translation parameter interpolation */
export interface InterpolationParams {
  [key: string]: string | number | boolean;
}

/** User language preferences */
export interface UserLanguagePreferences {
  language: Language;
  region?: string;
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY/MM/DD';
  numberFormat?: 'en-US' | 'de-DE' | 'fr-FR';
  timeFormat?: '12h' | '24h';
}

/** Formatted date options */
export interface DateFormatOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short';
  day?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
}

/** Currency formatting options */
export interface CurrencyFormatOptions {
  style: 'currency';
  currency: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}
