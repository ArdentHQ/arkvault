import { Contracts, Environment } from "@/app/lib/profiles";

import { ReadableFile } from "@/app/hooks/use-files";

interface ImportFileProperties {
	file?: ReadableFile;
	password?: string;
}

export const useProfileImport = ({ env }: { env: Environment }) => {
	const importProfileFromWwe = async (profileData: string, password?: string) => {
		let profile: Contracts.IProfile;

		try {
			profile = await env.profiles().import(profileData, password);
		} catch (error) {
			if (error.message.includes("Reason: Unexpected token") && !password) {
				throw new Error("PasswordRequired");
			}

			if (error.message.includes("unexpected character at line") && !password) {
				throw new Error("PasswordRequired");
			}

			if (error.message.includes("Unexpected identifier") && !password) {
				throw new Error("PasswordRequired");
			}

			if (error.message.includes("Reason: Malformed") && !password) {
				throw new Error("PasswordRequired");
			}

			throw error;
		}

		return profile;
	};

	const importProfile = async ({ password, file }: ImportFileProperties) => {
		if (!file) {
			return;
		}

		if (file.extension === "wwe") {
			return await importProfileFromWwe(file.content, password);
		}
	};

	return { importProfile };
};
