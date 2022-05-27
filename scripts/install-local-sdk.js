"use strict";

const { exec } = require("child_process");
const { join, dirname } = require("path");
const fs = require("fs");

const packagePath = join(dirname(require.main.filename), "../package.json");
const packageJson = require(packagePath);
const sdkPath = process.argv[2];

if (!sdkPath) {
	console.warn("Error: sdk path is not provided. Use relative or absolute path to link your local sdk repo.");
	console.warn("Example: pnpm sdk:instal-local ../sdk/\n");
	return;
}

packageJson.dependencies["@payvo/sdk"] = join(sdkPath, "packages/sdk");
packageJson.dependencies["@payvo/sdk-ark"] = join(sdkPath, "packages/ark");
packageJson.dependencies["@payvo/sdk-cryptography"] = join(sdkPath, "packages/cryptography");
packageJson.dependencies["@payvo/sdk-helpers"] = join(sdkPath, "packages/helpers");
packageJson.dependencies["@payvo/sdk-intl"] = join(sdkPath, "packages/intl");
packageJson.dependencies["@payvo/sdk-ledger"] = join(sdkPath, "packages/ledger");
packageJson.dependencies["@payvo/sdk-news"] = join(sdkPath, "packages/news");
packageJson.dependencies["@payvo/sdk-profiles"] = join(sdkPath, "packages/profiles");

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4));

exec("pnpm install", () => {
	console.log("Finished adding local sdk.");
});
