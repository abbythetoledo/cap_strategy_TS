module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["gen"],
  moduleFileExtensions: ["js", "json", "ts"],
  restoreMocks: true,
};
