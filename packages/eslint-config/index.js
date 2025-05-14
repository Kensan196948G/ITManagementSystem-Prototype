module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        },
        project: './tsconfig.json'
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:security/recommended'
    ],
    plugins: [
        '@typescript-eslint',
        'react',
        'react-hooks',
        'jsx-a11y',
        'security',
        'no-unsanitized'
    ],
    rules: {
        // TypeScript関連ルール
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',

        // セキュリティ関連ルール
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'security/detect-object-injection': 'error',
        'security/detect-non-literal-fs-filename': 'error',
        'security/detect-possible-timing-attacks': 'error',
        'no-unsanitized/method': 'error',
        'no-unsanitized/property': 'error',

        // React関連ルール
        'react/prop-types': 'off', // TypeScriptで型チェックするため無効化
        'react/react-in-jsx-scope': 'off', // React 17以降では不要
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // コード品質
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
        'eqeqeq': ['error', 'always'],
        'curly': 'error',
        'default-case': 'error'
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    env: {
        browser: true,
        es2020: true,
        node: true
    },
    overrides: [
        {
            files: ['**/*.test.ts', '**/*.test.tsx'],
            env: {
                jest: true
            }
        }
    ]
};