import { Contracts, Environment } from "@ardenthq/sdk-profiles";

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

	const importLegacyProfile = async (file: ReadableFile) => {
		let data: Record<string, any>;

		try {
			data = JSON.parse(file.content);
		} catch {
			throw new Error("CorruptedData");
		}

		if (!data.wallets?.length) {
			throw new Error("MissingWallets");
		}

		const profile = await env.profiles().create(file.name.split(".")[0]);

		for (const wallet of data.wallets) {
			if (wallet?.address && wallet?.balance.ARK) {
				await profile.coins().set("ARK", "mainsail.mainnet").__construct();
			}

			if (wallet?.address && wallet?.balance.DARK) {
				await profile.coins().set("ARK", "mainsail.devnet").__construct();
			}
		}

		await Promise.all(
			data.wallets.map(async (wallet: Record<string, any>) => {
				if (wallet.address && wallet.balance.ARK) {
					const importedWallet = await profile.walletFactory().fromAddress({
						address: wallet.address,
						coin: "ARK",
						network: "mainsail.mainnet",
					});
					profile.wallets().push(importedWallet);
					return wallet;
				}

				if (wallet.address && wallet.balance.DARK) {
					const importedWallet = await profile.walletFactory().fromAddress({
						address: wallet.address,
						coin: "ARK",
						network: "mainsail.devnet",
					});
					profile.wallets().push(importedWallet);
					return importedWallet;
				}
			}),
		);

		env.profiles().forget(profile.id());
		return profile;
	};

	const importProfile = async ({ password, file }: ImportFileProperties) => {
		if (!file) {
			return;
		}

		if (file.extension === "wwe") {
			return await importProfileFromWwe(file.content, password);
		}

		if (file.extension === "json") {
			return await importLegacyProfile(file);
		}
	};

	return { importProfile };
};
