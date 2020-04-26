module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts", "mock-local-storage"],
  transform: {
    "\\.(jpe?g|png|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)$": "<rootDir>/file-mock.js",
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "svg"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  moduleNameMapper: {
    "\\.(jpe?g|png|gif|webp|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)$": "<rootDir>/file-mock.js",
  },
};
