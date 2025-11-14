# Internationalization (i18n) System

Complete multi-language support system for Classic Games featuring automatic language detection, user preferences, and seamless React integration.

**Status**: ✅ Complete
**Framework**: React with TypeScript
**Supported Languages**: English, Spanish (extensible for 6+ languages)
**Architecture**: Context-based with translation management

---

## Overview

The i18n system provides:

- **Multi-Language Support**: English, Spanish, and extensible for more languages
- **Automatic Detection**: Browser language detection with fallback logic
- **User Preferences**: Persistent language choice via localStorage
- **React Integration**: Hooks and context for easy component integration
- **Nested Translations**: Dot-separated keys for organized translations
- **Parameter Interpolation**: Dynamic values in translation strings
- **Translation Manager**: Centralized language management
- **Type Safety**: Full TypeScript support

---

## Architecture

### Core Components

```
i18n System Architecture
├── TranslationManager (Core language engine)
│   ├── Language switching
│   ├── Translation retrieval
│   └── Parameter interpolation
├── i18nContext (React integration)
│   ├── Provider component
│   └── Custom hooks
├── Translation Resources
│   ├── English (en)
│   ├── Spanish (es)
│   └── Extensible for more
└── Configuration
    ├── Supported languages
    ├── Language metadata
    └── Locale-specific formatting
```

### Data Flow

```
User Component
    ↓
use18n() Hook
    ↓
i18nContext
    ↓
TranslationManager
    ↓
Translation Resources
    ↓
Translated String
```

---

## Installation & Setup

### 1. Add i18n to monorepo package

The `@classic-games/i18n` package is already created in `packages/i18n/`.

### 2. Configure in web app

Update `apps/web/package.json`:

```json
{
  "dependencies": {
    "@classic-games/i18n": "*"
  }
}
```

### 3. Wrap app with provider

```typescript
// apps/web/app/layout.tsx
import { i18nProvider, defaultConfig } from '@classic-games/i18n';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <i18nProvider config={defaultConfig} autoDetect={true}>
          {children}
        </i18nProvider>
      </body>
    </html>
  );
}
```

---

## Core Concepts

### Languages

Supported languages with metadata:

| Language | Code | Name     | Flag | Locale |
| -------- | ---- | -------- | ---- | ------ |
| English  | `en` | English  | 🇬🇧   | en-US  |
| Spanish  | `es` | Español  | 🇪🇸   | es-ES  |
| French   | `fr` | Français | 🇫🇷   | fr-FR  |
| German   | `de` | Deutsch  | 🇩🇪   | de-DE  |
| Japanese | `ja` | 日本語   | 🇯🇵   | ja-JP  |
| Chinese  | `zh` | 中文     | 🇨🇳   | zh-CN  |

Currently implemented: **English, Spanish**
Extensible for: **French, German, Japanese, Chinese**

### Translation Keys

Translations organized with nested namespace structure:

```
poker.title              → "Texas Hold'em Poker"
poker.actions.fold      → "Fold"
poker.gamePhases.flop   → "Flop - 3 Community Cards"
common.ok               → "OK"
```

**Key Naming Convention**:

- `module.feature.element` (e.g., `poker.actions.fold`)
- Lowercase with dots for nesting
- Clear, descriptive names

### Parameter Interpolation

Translations can include dynamic parameters:

```typescript
// Translation string
"hints": "Hints: {{count}}"

// Usage
t('game.hints', { count: 5 })
// Result: "Hints: 5"
```

---

## API Reference

### TranslationManager

Core translation engine:

```typescript
class TranslationManager {
  // Translate with optional parameters
  t(key: string, params?: Record<string, any>): string;

  // Language management
  setLanguage(language: Language): void;
  getLanguage(): Language;
  getSupportedLanguages(): Language[];

  // Translation data
  getTranslations(): Translations;
  getTranslationsByLanguage(language: Language): Translations;
  addTranslations(language: Language, translations: Translations): void;

  // Preferences
  subscribe(callback: (language: Language) => void): () => void;
  loadLanguagePreference(): Language | undefined;
  saveLanguagePreference(language: Language): void;

  // Auto-detection
  detectSystemLanguage(): Language;
  initialize(): void;
}
```

### React Hooks

#### use18n()

Main hook - get translation function, language, and controls:

```typescript
const { t, language, setLanguage, supportedLanguages } = use18n();

const title = t('poker.title');
setLanguage('es');
```

#### useTranslation()

Translation function only (lightweight):

```typescript
const t = useTranslation();
const greeting = t('common.greeting');
```

#### useLanguage()

Current language only:

```typescript
const language = useLanguage();
console.log('Current:', language); // 'en' or 'es'
```

#### useSetLanguage()

Language setter function:

```typescript
const setLanguage = useSetLanguage();
setLanguage('es');
```

#### useLanguageSwitcher()

Complete language switching controls:

```typescript
const { language, supportedLanguages, setLanguage } = useLanguageSwitcher();

return (
  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
    {supportedLanguages.map((lang) => (
      <option key={lang} value={lang}>{LANGUAGE_NAMES[lang]}</option>
    ))}
  </select>
);
```

### i18nProvider

Wrap application with i18n context:

```typescript
<i18nProvider
  config={defaultConfig}
  autoDetect={true}
  onLanguageChange={(language) => console.log('Language changed to:', language)}
>
  <App />
</i18nProvider>
```

**Props**:

- `config`: i18nConfig object
- `autoDetect`: Auto-detect system language (default: true)
- `onLanguageChange`: Callback when language changes

---

## Usage Examples

### Example 1: Basic Translation

```typescript
import { use18n } from '@classic-games/i18n';

export function PokerTitle() {
  const { t } = use18n();

  return (
    <h1>{t('poker.title')}</h1>
    // Output: <h1>Texas Hold'em Poker</h1>
  );
}
```

### Example 2: Language Switching

```typescript
import { useLanguageSwitcher, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@classic-games/i18n';

export function LanguageSwitcher() {
  const { language, supportedLanguages, setLanguage } = useLanguageSwitcher();

  return (
    <div className="language-switcher">
      {supportedLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={language === lang ? 'active' : ''}
        >
          {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
        </button>
      ))}
    </div>
  );
}
```

### Example 3: Parameter Interpolation

```typescript
import { use18n } from '@classic-games/i18n';

export function GameStats({ hints, score }: { hints: number; score: number }) {
  const { t } = use18n();

  return (
    <div>
      <p>{t('game.hints', { count: hints })}</p>
      <p>{t('stats.bestScore')}: {score}</p>
    </div>
  );
}
```

### Example 4: Conditional Translation

```typescript
import { use18n } from '@classic-games/i18n';

export function GameStatus({ folded }: { folded: boolean }) {
  const { t } = use18n();

  return (
    <p>
      {folded ? t('poker.status.folded') : t('poker.status.yourTurn')}
    </p>
  );
}
```

### Example 5: Game-Specific Translations

```typescript
import { use18n } from '@classic-games/i18n';

export function GameActions({ gameType }: { gameType: 'poker' | 'backgammon' | 'scrabble' }) {
  const { t } = use18n();

  const translations = {
    poker: {
      primary: t('poker.actions.fold'),
      secondary: t('poker.actions.call'),
    },
    backgammon: {
      primary: t('backgammon.actions.rollDice'),
      secondary: t('backgammon.actions.moveChecker'),
    },
    scrabble: {
      primary: t('scrabble.actions.playWord'),
      secondary: t('scrabble.actions.swap'),
    },
  };

  const game = translations[gameType];
  return (
    <div>
      <button>{game.primary}</button>
      <button>{game.secondary}</button>
    </div>
  );
}
```

### Example 6: Settings Component

```typescript
import { use18n, LANGUAGE_NAMES } from '@classic-games/i18n';

export function Settings() {
  const { t, language, setLanguage, supportedLanguages } = use18n();

  return (
    <div className="settings">
      <h2>{t('common.settings')}</h2>

      <div>
        <label>{t('common.language')}</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
          {supportedLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {LANGUAGE_NAMES[lang]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>
          <input type="checkbox" defaultChecked />
          {t('audio.musicEnabled')}
        </label>
      </div>
    </div>
  );
}
```

---

## Translation Structure

### English Translations

Located in `packages/i18n/src/resources/en.ts`

**Namespaces**:

- `common`: UI buttons and generic labels
- `nav`: Navigation menu items
- `poker`: Poker game specific
- `backgammon`: Backgammon game specific
- `scrabble`: Scrabble game specific
- `game`: Generic game UI
- `audio`: Audio settings
- `stats`: Statistics
- `messages`: User messages
- `months`: Month names
- `days`: Day names

### Spanish Translations

Located in `packages/i18n/src/resources/es.ts`

Same structure as English with Spanish translations.

### Adding New Translations

Create new language file:

```typescript
// packages/i18n/src/resources/fr.ts
export const fr = {
  common: {
    yes: 'Oui',
    no: 'Non',
    // ... rest of translations
  },
  // ... other namespaces
};
```

Register in config:

```typescript
// packages/i18n/src/config.ts
export const TRANSLATION_RESOURCES = {
  en,
  es,
  fr, // Add new language
};
```

---

## Language Detection & Preferences

### Detection Order

1. **User Preference**: Saved in localStorage
2. **System Language**: Browser language setting
3. **Default Language**: 'en' (English)

### Implementation

```typescript
// Auto-detection happens in initialization
manager.initialize();

// Or manual control
const saved = manager.loadLanguagePreference();
const system = manager.detectSystemLanguage();
manager.setLanguage(language);
```

### Preference Storage

Language preference saved to localStorage with key: `i18n:language`

```javascript
// Read
localStorage.getItem('i18n:language'); // 'es'

// Write (automatic on language change)
localStorage.setItem('i18n:language', 'es');
```

---

## Advanced Features

### Language Change Subscription

React to language changes:

```typescript
const { manager } = use18n();

useEffect(() => {
  const unsubscribe = manager.subscribe((newLanguage) => {
    console.log('Language changed to:', newLanguage);
    // Update document.lang attribute
    document.documentElement.lang = newLanguage;
  });

  return unsubscribe;
}, [manager]);
```

### Dynamic Translation Loading

Add translations at runtime:

```typescript
const { manager } = use18n();

manager.addTranslations('es', {
  newFeature: {
    title: 'Nueva Característica',
    description: 'Descripción aquí',
  },
});
```

### Translation with Complex Logic

Function-based translations:

```typescript
// In translation resource
export const en = {
  game: {
    scoreMessage: (params: { score: number; rank: string }) => {
      const modifier = params.score > 1000 ? 'Excellent' : 'Good';
      return `${modifier} score of ${params.score} (${params.rank})`;
    },
  },
};

// Usage
t('game.scoreMessage', { score: 1500, rank: 'S' });
// Result: "Excellent score of 1500 (S)"
```

---

## Performance Optimization

### Lazy Translation Loading

Only load needed translations:

```typescript
const config = createConfig(['en', 'es']); // Load only English and Spanish

<i18nProvider config={config}>
  <App />
</i18nProvider>
```

### Translation Caching

Translations cached in TranslationManager:

```typescript
// First call - retrieves from object
t('poker.title'); // Retrieves from resources

// Subsequent calls - same lookup (no performance impact)
t('poker.title'); // Instant retrieval
```

### Code Splitting for Languages

Load translations asynchronously if needed:

```typescript
// For large translation sets, could be split
const loadSpanish = () => import('./resources/es');

manager.addTranslations('es', await loadSpanish());
```

---

## Locale-Specific Formatting

### Date Formatting

Format dates according to language preferences:

```typescript
import { LOCALE_CODES, DATE_FORMATS } from '@classic-games/i18n';

function formatDate(date: Date, language: Language): string {
  return date.toLocaleDateString(LOCALE_CODES[language]);
}

formatDate(new Date(), 'en'); // "11/14/2024"
formatDate(new Date(), 'es'); // "14/11/2024"
```

### Number Formatting

Format numbers by locale:

```typescript
import { LOCALE_CODES } from '@classic-games/i18n';

function formatNumber(num: number, language: Language): string {
  return new Intl.NumberFormat(LOCALE_CODES[language]).format(num);
}

formatNumber(1234.56, 'en'); // "1,234.56"
formatNumber(1234.56, 'es'); // "1.234,56"
```

### Currency Formatting

Format currency by language:

```typescript
import { LOCALE_CODES } from '@classic-games/i18n';

function formatCurrency(amount: number, language: Language, currency = 'USD'): string {
  return new Intl.NumberFormat(LOCALE_CODES[language], {
    style: 'currency',
    currency,
  }).format(amount);
}

formatCurrency(100, 'en'); // "$100.00"
formatCurrency(100, 'es'); // "100,00 $"
```

---

## Integration with Existing Features

### Poker Game

```typescript
import { use18n } from '@classic-games/i18n';

export function PokerGame() {
  const { t } = use18n();

  return (
    <div>
      <h1>{t('poker.title')}</h1>
      <button>{t('poker.actions.fold')}</button>
      <button>{t('poker.actions.call')}</button>
      <button>{t('poker.actions.raise')}</button>
      <p>{t(`poker.gamePhases.${currentPhase}`)}</p>
    </div>
  );
}
```

### Audio Settings

```typescript
import { use18n } from '@classic-games/i18n';

export function AudioSettings() {
  const { t } = use18n();

  return (
    <div>
      <label>{t('audio.master')}</label>
      <input type="range" />

      <label>
        <input type="checkbox" defaultChecked />
        {t('audio.musicEnabled')}
      </label>

      <label>
        <input type="checkbox" defaultChecked />
        {t('audio.sfxEnabled')}
      </label>
    </div>
  );
}
```

### Game Statistics

```typescript
import { use18n } from '@classic-games/i18n';

export function Statistics() {
  const { t } = use18n();

  return (
    <div>
      <h2>{t('nav.statistics')}</h2>
      <div>{t('stats.totalGames')}: {stats.total}</div>
      <div>{t('stats.wins')}: {stats.wins}</div>
      <div>{t('stats.losses')}: {stats.losses}</div>
      <div>{t('stats.winRate')}: {stats.winRate}%</div>
    </div>
  );
}
```

---

## Testing Translations

### Test Translation Retrieval

```typescript
import { TranslationManager } from '@classic-games/i18n';
import { defaultConfig } from '@classic-games/i18n';

describe('TranslationManager', () => {
  let manager: TranslationManager;

  beforeEach(() => {
    manager = new TranslationManager(defaultConfig);
  });

  test('should retrieve English translation', () => {
    manager.setLanguage('en');
    expect(manager.t('poker.title')).toBe("Texas Hold'em Poker");
  });

  test('should retrieve Spanish translation', () => {
    manager.setLanguage('es');
    expect(manager.t('poker.title')).toBe("Póker Texas Hold'em");
  });

  test('should interpolate parameters', () => {
    expect(manager.t('game.hints', { count: 5 })).toBe('Hints: 5');
  });
});
```

### Test React Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { use18n } from '@classic-games/i18n';

test('should change language', () => {
  const { result } = renderHook(() => use18n(), { wrapper: i18nProvider });

  expect(result.current.language).toBe('en');

  act(() => {
    result.current.setLanguage('es');
  });

  expect(result.current.language).toBe('es');
});
```

---

## Browser Support

**Requirements**:

- Modern browsers with localStorage support
- ES6+ JavaScript support
- Intl API for locale-specific formatting (all modern browsers)

**Tested On**:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

---

## Future Enhancements

### Planned Features

1. **Pluralization Rules**
   - Language-specific plural handling
   - "1 item" vs "2 items" formatting

2. **Date/Time Formatting Utilities**
   - Locale-aware date formatting
   - Timezone support
   - Relative dates ("2 hours ago")

3. **RTL Language Support**
   - Arabic, Hebrew, Urdu support
   - Automatic text direction
   - RTL-aware components

4. **Translation Management Dashboard**
   - Web UI for managing translations
   - Translation status tracking
   - Collaboration features

5. **AI-Powered Translations**
   - Auto-translation suggestions
   - Quality checking
   - Machine translation fallback

6. **Language Pack Splitting**
   - Load language bundles on demand
   - Reduce initial bundle size
   - Per-language code splitting

7. **More Languages**
   - French, German, Japanese, Chinese
   - Regional variants (en-GB, en-AU, etc.)

8. **Translation Memory**
   - Cache frequently used translations
   - Performance metrics
   - Memory optimization

---

## Related Documentation

- **Configuration**: See `packages/i18n/src/config.ts`
- **Type Definitions**: See `packages/i18n/src/types.ts`
- **Translation Resources**: See `packages/i18n/src/resources/`
- **Bundle Optimization**: See `BUNDLE_OPTIMIZATION.md`
- **Developer Guide**: See `DEVELOPER_GUIDE.md`

---

## API Summary

| Function                | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| `use18n()`              | Main hook for translations and language control |
| `useTranslation()`      | Get translation function only                   |
| `useLanguage()`         | Get current language                            |
| `useSetLanguage()`      | Get language setter                             |
| `useLanguageSwitcher()` | Get complete language controls                  |
| `i18nProvider`          | Context provider component                      |
| `withi18n()`            | HOC for class components                        |
| `TranslationManager`    | Core translation engine                         |

---

**Last Updated**: November 14, 2024
**Version**: 1.0.0
**Status**: Production Ready

For questions or improvements, see the project documentation.
