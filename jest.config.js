module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*'],
  coverageReporters: [['text', { skipFull: false, skipEmpty: true }]],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: -10,
    },
  },
  moduleDirectories: ['node_modules', 'src'],
  randomize: true, // Just to be sure memoization isn't broken
  testRegex: 'tests/.*\\.spec\\.(js|ts)$',
}
