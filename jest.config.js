module.exports = {
  roots: ["<rootDir>/test"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleNameMapper: {
    GoogleAnalytics: "<rootDir>/test/GoogleAnalyticsStub.ts"
  },
  testRegex: "[a-zA-Z0-9-\\/]+(\\.test\\.ts)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
