import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';
import pluginUnicorn from 'eslint-plugin-unicorn';

export default defineConfig(
  {
    // Global ignores (must be a standalone config object)
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/tests/**',
      'commitlint.config.js',
      'jest.config.js',
      'prisma.config.ts',
    ],
  },
  {
    // General ESLint settings for all file types
    files: ['**/*.{js,mts,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: pluginImport,
      unicorn: pluginUnicorn,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
          'newlines-between': 'always',
        },
      ],
      // Unicorn rules
      'unicorn/prefer-query-selector': 'off', // Not a browser environment
      'unicorn/no-null': 'off',
      'unicorn/prefer-node-protocol': 'error',
    },
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
);
