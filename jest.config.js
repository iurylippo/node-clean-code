module.exports = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.js$',
  testPathIgnorePatterns: ['/node_modules/'],
  bail: true,
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coverageReporters: ['text-summary', 'lcov']
}
