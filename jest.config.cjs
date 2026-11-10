module.exports = {
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/**/*.test.js"],
  transform: {
    "^.+\\.ts$": "<rootDir>/jest.transformer.cjs",
  },
};
