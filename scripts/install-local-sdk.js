"use strict";

const { exec } = require("child_process");
const { join, dirname } = require("path");
const fs = require("fs");

const packagePath = join(dirname(require.main.filename), "../package.json");
const packageJson = require(packagePath);
const sdkPath = process.argv[2];

if (!sdkPath) {
	console.warn("Error: sdk path is not provided. Use relative or absolute path to link your local sdk repo.");
	console.warn("Example: pnpm sdk:install-local ../platform-sdk/\n");
	return;
}

packageJson.dependencies["@ardenthq/sdk"] = join(sdkPath, "packages/sdk");

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, "\t"));

exec("pnpm install", () => {
	console.log("Finished adding local sdk.");
});
