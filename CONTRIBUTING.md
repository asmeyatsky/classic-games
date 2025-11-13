# Contributing to Classic Games

Thank you for your interest in contributing to the Classic Games platform! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes** following the guidelines
5. **Submit a pull request** for review

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/allansmeyatsky/classic-games.git
cd classic-games

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start development
npm run dev
```

### Development Commands

```bash
# Start all apps in development mode
npm run dev

# Start specific apps
npm run web          # Next.js web app (localhost:3000)
npm run mobile       # Expo mobile app
npm run backend      # Node.js backend (localhost:3001)

# Run tests
npm run test

# Run linting and formatting
npm run lint         # Check for linting errors
npm run lint:fix     # Fix linting errors automatically
npm run format       # Format code with Prettier

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

## Code Style

We maintain a consistent code style across the project using **ESLint** and **Prettier**.

### Key Style Rules

- **TypeScript**: Strict mode enabled, no `any` types
- **Indentation**: 2 spaces (tabs are not used)
- **Line Length**: Maximum 100 characters
- **Quotes**: Single quotes for strings
- **Semicolons**: Required at end of statements
- **Arrow Functions**: Always use parentheses for parameters

### Pre-commit Hooks

We use **Husky** and **lint-staged** to automatically enforce code quality before commits:

```bash
# Staged TypeScript/JavaScript files:
- ESLint check and fix
- Prettier format

# Staged markdown/JSON files:
- Prettier format
```

You don't need to run linting manually before committing; the hooks will handle it automatically!

## Commit Guidelines

We follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `chore`: Dependency updates, build config changes

### Example Commits

```bash
git commit -m "feat(poker): add all-in move validation"
git commit -m "fix(backgammon): resolve bearing off logic bug"
git commit -m "docs: update testing guide with new test patterns"
```

## Testing

We maintain comprehensive test coverage across the project.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

### Test Coverage Guidelines

- Game engines: Target 85%+ coverage
- Utilities: Target 80%+ coverage
- Components: Target 70%+ coverage for critical paths

### Writing Tests

```typescript
// Example test for poker game
describe('PokerGame', () => {
  it('should evaluate hand correctly', () => {
    const game = new PokerGame(2);
    const hand = [/* cards */];
    const result = game.evaluateHand(hand);
    expect(result).toBe('Royal Flush');
  });
});
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest changes from `main`
2. **Run tests locally** and ensure all pass
3. **Run linting** and fix any errors: `npm run lint:fix`
4. **Format code**: `npm run format`
5. **Update documentation** if needed

### PR Template

Include the following in your PR description:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No console errors or warnings
```

### Review Process

- At least one code review is required before merging
- Address any requested changes
- Keep commits clean and organized
- Squash commits if requested by reviewer

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description**: Clear, concise description
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, Browser (if applicable)
6. **Screenshots**: If applicable

### Feature Requests

When suggesting features:

1. **Description**: Clear explanation of the feature
2. **Use Case**: Why this feature is needed
3. **Proposed Solution**: How you would implement it
4. **Alternatives**: Any alternative solutions

## Project Structure

```
classic-games/
├── apps/
│   ├── web/          # Next.js web application
│   ├── mobile/       # React Native mobile app
│   └── backend/      # Node.js WebSocket server
├── packages/
│   ├── game-engine/  # Core game logic
│   ├── shared-ui/    # Reusable components
│   ├── three-components/  # 3D components
│   ├── audio/        # Audio system
│   └── utils/        # Utility functions
└── docs/             # Documentation
```

## Architecture Principles

We follow clean architecture principles:

1. **Separation of Concerns**: Business logic separate from UI/Infrastructure
2. **Dependency Inversion**: Depend on abstractions, not concrete implementations
3. **Type Safety**: Use TypeScript strictly
4. **Immutability**: Prefer immutable data structures
5. **Server-Authoritative**: Game logic validated server-side

## Need Help?

- **Documentation**: Check `README.md` and `ARCHITECTURE.md`
- **Issues**: Search existing GitHub issues
- **Discussions**: Start a GitHub discussion

---

Thank you for contributing! Together, we're building an amazing gaming platform. 🎮
