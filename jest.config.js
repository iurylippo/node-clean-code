module.exports = {
  coverageProvider: 'babel',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.(spec|e2e-spec)\\.js$',
  testPathIgnorePatterns: ['/node_modules/'],
  bail: true,
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: ['**/*.js'],
  coverageDirectory: '../coverage',
  coverageReporters: ['text-summary', 'lcov']
}
