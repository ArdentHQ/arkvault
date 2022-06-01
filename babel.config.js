module.exports = {
	env: {
		test: {
			plugins: [
				"macros",
				function () {
					return {
						visitor: {
							MetaProperty(path) {
								path.replaceWithSourceString("process");
							},
						},
					};
				},
			],
			presets: [
				[
					"@babel/preset-env",
					{
						targets: {
							node: "current",
						},
					},
				],
				"@babel/preset-react",
				"@babel/preset-typescript",
			],
		},
	},
};
