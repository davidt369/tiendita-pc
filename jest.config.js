module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Changed from 'node' to 'jsdom'
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
