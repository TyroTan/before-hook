module.exports = {
  roots: ["<rootDir>/test"],
  testRegex: "(.*\\.test\\.(js|tsx?|jsx?))$",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
