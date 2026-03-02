/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.(css)$": "<rootDir>/src/__mocks__/styleMock.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { useESM: true, tsconfig: "tsconfig.json" },
    ],
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/cypress/"],
};

export default config;
