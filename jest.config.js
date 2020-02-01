module.exports = {
  roots: ["<rootDir>/test"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "[a-zA-Z0-9-\\/]+(\\.test\\.ts)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
