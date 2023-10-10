module.exports = {
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*'],
  coverageReporters: [['text', { skipFull: false, skipEmpty: true }]],
  coverageThreshold: {
    global: {
      branches: 89,
      functions: 100,
      lines: 95,
      statements: 96,
    },
  },
  moduleDirectories: ['node_modules', 'src'],
  randomize: true, // Just to be sure memoization isn't broken
  testRegex: 'tests/.*\\.spec\\.(js|ts)$',
}
