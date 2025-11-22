module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  verbose: true,
  collectCoverage: true,
  passWithNoTests: true,
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/contexts/**/*.ts',
    'src/services/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/domain/**/*.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo-secure-store$': '<rootDir>/tests/__mocks__/expo-secure-store.ts',
    '^expo-sqlite$': '<rootDir>/tests/__mocks__/expo-sqlite.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        skipLibCheck: true,
        noImplicitAny: false,
        strict: false,
      },
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};

