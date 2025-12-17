import tseslint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';
import pluginUnicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  {
    // General ESLint settings for all file types
    files: ['**/*.{js,mts,ts,tsx}'],
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
    ],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: pluginImport,
      unicorn: pluginUnicorn,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
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
  ...tseslint.configs.recommended,
);
