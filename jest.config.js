module.exports = {
  roots: ["<rootDir>/tests"],
  testRegex: "(.*\\.test.compiled\\.(js|tsx?|jsx?))$",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
