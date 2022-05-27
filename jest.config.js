module.exports = {
	automock: false,
	coveragePathIgnorePatterns: ["index.ts", "index.tsx", "data.ts"],
	coverageReporters: ["json", "lcov", "text", "clover", "html"],
	moduleDirectories: ["node_modules", "utils"],
	testEnvironment: "jsdom",
	resetModules: true,
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	modulePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/*"],
	transformIgnorePatterns: ["^.+\\.module\\.(css|sass|scss|svg})$"],
	moduleNameMapper: {
		"^react($|/.+)": "<rootDir>/node_modules/react$1",
		"@/(.*)$": "<rootDir>/src/$1",
		"^tests/(.*)$": "<rootDir>/src/tests/$1",
		"^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
	},
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
		"^.+\\.css$": "jest-transform-stub",
		"^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>/src/tests/fileTransformer.js",
	},
	watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
};
