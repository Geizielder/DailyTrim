export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore'
      ]
    ],
    'scope-empty': [0], // scope é opcional
    'subject-empty': [2, 'never'],
    'subject-case': [0], // permite qualquer case
    'header-max-length': [2, 'always', 100]
  }
}
