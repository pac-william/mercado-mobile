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
    '^expo-constants$': '<rootDir>/tests/__mocks__/expo-constants.ts',
    '^react-native$': '<rootDir>/tests/__mocks__/react-native.ts',
    '^expo-location$': '<rootDir>/tests/__mocks__/expo-location.ts',
    '^expo-notifications$': '<rootDir>/tests/__mocks__/expo-notifications.ts',
    '^expo-image-picker$': '<rootDir>/tests/__mocks__/expo-image-picker.ts',
    '^react-native-paper$': '<rootDir>/tests/__mocks__/react-native-paper.ts',
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
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|expo-modules-core|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-svg|@react-native-community|@testing-library|react-test-renderer)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};

