import next from 'eslint-config-next';

const nextConfigs = Array.isArray(next) ? next : [next];

export default [
  ...nextConfigs,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'scripts/**',
      '*.config.mjs',
      '*.config.ts',
      '*.config.mts',
    ],
  },
  {
    rules: {
      // Cosmetic: literal quotes/apostrophes in JSX render fine.
      'react/no-unescaped-entities': 'warn',
      // These react-hooks rules became errors under Next 16's newer plugin.
      // They flag pre-existing, runtime-safe patterns; surfaced as warnings so
      // they're visible for incremental cleanup without blocking the build.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/incompatible-library': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
