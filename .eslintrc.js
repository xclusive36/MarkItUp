module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'off',
  }
};
