/**
 * Classic Games i18n (Internationalization)
 *
 * Complete localization system supporting multiple languages with:
 * - Translation management with nested keys
 * - React context and hooks integration
 * - Automatic language detection
 * - User preference persistence
 * - Dynamic translation loading
 * - Parameter interpolation
 *
 * @example
 * ```typescript
 * // Initialize i18n
 * import { i18nProvider, use18n, defaultConfig } from '@classic-games/i18n';
 *
 * <i18nProvider config={defaultConfig} autoDetect={true}>
 *   <App />
 * </i18nProvider>
 *
 * // Use translations in components
 * const { t, setLanguage } = use18n();
 * const title = t('poker.title');
 * setLanguage('es');
 * ```
 */

// Type definitions
export type {
  Language,
  Translations,
  InterpolationParams,
  UserLanguagePreferences,
  DateFormatOptions,
  CurrencyFormatOptions,
} from './types';

// Translation Manager
export { TranslationManager } from './TranslationManager';

// React Context & Hooks
export {
  i18nProvider,
  use18n,
  useTranslation,
  useLanguage,
  useSetLanguage,
  useLanguageSwitcher,
  withi18n,
} from './i18nContext';

// Configuration
export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  LOCALE_CODES,
  DATE_FORMATS,
  TIME_FORMATS,
  defaultConfig,
  createConfig,
  TRANSLATION_RESOURCES,
} from './config';

// Translation Resources
export { en } from './resources/en';
export { es } from './resources/es';
