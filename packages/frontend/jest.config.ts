import type { Config } from "jest";

const config: Config = {
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
  setupFilesAfterSetup: ["@testing-library/jest-dom"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/cypress/"],
};

export default config;
