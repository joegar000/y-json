module.exports = {
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "<rootDir>/jest.transformer.cjs",
  },
};
