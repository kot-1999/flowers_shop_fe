import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importPlugin from 'eslint-plugin-import';

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: {
      import: importPlugin
    },
    rules: {
      'object-curly-newline': [
        'error',
        {
          ObjectExpression: {
            multiline: true,
            consistent: true
          },
          ObjectPattern: {
            multiline: true,
            consistent: true
          },
          ImportDeclaration: {
            multiline: true,
            consistent: true
          },
          ExportDeclaration: {
            multiline: true,
            consistent: true
          }
        }
      ],

      'arrow-parens': ['error', 'always'],
      'object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: false
        }
      ],
      'operator-linebreak': ['error', 'before'],
      'function-paren-newline': ['error', 'multiline'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_'
        }
      ],
      'wrap-iife': ['error', 'inside'],
      'quotes': [
        'error',
        'single',
        {
          avoidEscape: true
        }
      ],
      'max-len': [
        'error',
        {
          code: 150
        }
      ],
      'newline-per-chained-call': [
        'error',
        {
          ignoreChainWithDepth: 2
        }
      ],
      'curly': ['error', 'all'],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error']
        }
      ],
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true
        }
      ],
      'object-curly-spacing': ['error', 'always'],
      'no-extra-semi': 'error',
      'comma-dangle': ['error', 'never'],
      'prefer-const': 'error',
      'brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: true
        }
      ],
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-definitions': [
        'error',
        'interface'
      ],
      'import/no-cycle': 'error',
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 0,
          maxBOF: 0
        }
      ],

      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          },
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type'
          ],
          'newlines-between': 'always'
        }
      ],

      'import/newline-after-import': 'error'
    }
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts'
  ])
]);