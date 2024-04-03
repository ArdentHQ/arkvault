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
packageJson.dependencies["@ardenthq/sdk-ark"] = join(sdkPath, "packages/ark");
packageJson.dependencies["@ardenthq/sdk-mainsail"] = join(sdkPath, "packages/mainsail");
packageJson.dependencies["@ardenthq/sdk-cryptography"] = join(sdkPath, "packages/cryptography");
packageJson.dependencies["@ardenthq/sdk-helpers"] = join(sdkPath, "packages/helpers");
packageJson.dependencies["@ardenthq/sdk-intl"] = join(sdkPath, "packages/intl");
packageJson.dependencies["@ardenthq/sdk-ledger"] = join(sdkPath, "packages/ledger");
packageJson.dependencies["@ardenthq/sdk-profiles"] = join(sdkPath, "packages/profiles");

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, "\t"));

exec("pnpm install", () => {
	console.log("Finished adding local sdk.");
});
