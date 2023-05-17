/** @type {import('jest').Config} */
module.exports = {
	verbose: true,
	preset: "ts-jest",
	rootDir: "tests",
	testEnvironment: "node",
	testMatch: ["**/*.ts"],
};
