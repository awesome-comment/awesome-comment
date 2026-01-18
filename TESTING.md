# Testing Guide

## Overview

This project uses [Vitest](https://vitest.dev/) as the testing framework. Tests are organized by package.

## Running Tests

### Run all tests (from root)
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Run tests for specific package

**Core package:**
```bash
cd packages/core
pnpm test:run
```

**Admin package:**
```bash
cd packages/admin
pnpm test:run
```

**Auth 包：**
```bash
cd packages/auth
pnpm test:run
```

**Auth Admin 包：**
```bash
cd packages/auth-admin
pnpm test:run
```

## Test Structure

```
packages/
├── core/
│   ├── data/
│   │   └── index.test.ts        # Data constants tests
│   └── utils/
│       └── validation.test.ts   # Validation utilities tests
├── auth/
│   └── tests/
│       └── unit/
│           └── auth.test.ts      # One Tap 流程测试
└── admin/
    └── tests/
        └── unit/
            ├── utils.test.ts        # Frontend utilities tests
            ├── ui.test.ts           # UI utilities tests
            ├── data-lang.test.ts    # Language data tests
            └── server-utils.test.ts # Server utilities tests
```

## Writing Tests

### Unit Tests

Place unit tests next to the source file or in the `tests/unit/` directory:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Nuxt Component Tests

The admin package uses `@nuxt/test-utils` for testing Nuxt components:

```typescript
import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import MyComponent from '~/components/MyComponent.vue';

describe('MyComponent', () => {
  it('renders correctly', async () => {
    const component = await mountSuspended(MyComponent);
    expect(component.text()).toContain('expected text');
  });
});
```

## Test Coverage

Currently covered:
- **Core package**: Data constants, validation utilities
- **Admin package**: Utils, UI helpers, language data, server utilities

## Configuration

### Core package (`packages/core/vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.{js,ts}'],
    globals: true,
  },
});
```

### Admin package (`packages/admin/vitest.config.ts`)
```typescript
import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    include: ['**/*.{test,spec}.{js,ts,vue}'],
    globals: true,
  },
});
```

## Known Issues

1. Some existing validation tests in `packages/core/utils/validation.test.ts` are failing due to edge cases in the validation logic.
2. The `__AUTH0_DOMAIN__` warning in admin tests is expected - Auth0 plugin is not initialized during tests.
