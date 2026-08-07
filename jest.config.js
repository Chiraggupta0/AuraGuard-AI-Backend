module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/docs/**'],
  coverageDirectory: 'coverage',
  testTimeout: 20000,
};
