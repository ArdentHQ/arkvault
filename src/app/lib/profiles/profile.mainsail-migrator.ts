import { IProfile, IProfileData, IProfileMainsailMigrator } from "./contracts.js";
import { HttpClient } from "@/app/lib/mainsail/http-client.js";

export class ProfileMainsailMigrator implements IProfileMainsailMigrator {
	readonly #http: HttpClient = new HttpClient(10_000);

	async migrate(profile: IProfile, data: IProfileData): Promise<IProfileData> {
		if (this.#requiresMigration(data)) {
			data.wallets = await this.#migrateWallets(profile, data.wallets);
			data.contacts = await this.#migrateContacts(profile, data.contacts);
		}

		return data;
	}

	async #migrateWallets(profile: IProfile, wallets: IProfileData["wallets"]): Promise<IProfileData["wallets"]> {
		const migratedWallets: IProfileData["wallets"] = {};

		for (const [id, wallet] of Object.entries(wallets)) {
			const migratedWallet = await this.#migrateWallet(profile, wallet);
			migratedWallets[id] = migratedWallet;
		}

		return migratedWallets;
	}

	async #migrateWallet(
		profile: IProfile,
		wallet: IProfileData["wallets"][string],
	): Promise<IProfileData["wallets"][string]> {
		const migratedWallet: IProfileData["wallets"][string] = {
			...wallet,
			data: {
				...wallet.data,
				ADDRESS: await this.#migrateWalletAddress(profile, wallet.data),
			},
		};

		return migratedWallet;
	}

	async #migrateWalletAddress(
		profile: IProfile,
		walletData: IProfileData["wallets"][string]["data"],
	): Promise<IProfileData["wallets"][string]["data"]> {
		const publicKey = walletData["PUBLIC_KEY"];
		const wallet = await profile.walletFactory().fromPublicKey({ publicKey });
		const migratedWalletData: IProfileData["wallets"][string]["data"] = {
			ADDRESS: wallet.address(),
		};

		return migratedWalletData;
	}

	async #migrateContacts(profile: IProfile, contacts: IProfileData["contacts"]): Promise<IProfileData["contacts"]> {
		const migratedContacts: IProfileData["contacts"] = {};

		const contactPromises = Object.entries(contacts).map(async ([id, contact]) => {
			const migratedAddresses = (
				await Promise.all(
					contact.addresses.map(async (addr) => {
						const newAddress = await this.#migrateContactAddress(profile, addr);
						return newAddress ? { address: newAddress, id: addr.id } : null;
					}),
				)
			).filter((addr): addr is { id: string; address: string } => addr !== null);

			return [id, { ...contact, addresses: migratedAddresses }] as const;
		});

		for (const [id, migratedContact] of await Promise.all(contactPromises)) {
			migratedContacts[id] = migratedContact;
		}

		return migratedContacts;
	}

	async #migrateContactAddress(
		profile: IProfile,
		addr: IProfileData["contacts"][string]["addresses"][number],
	): Promise<string | undefined> {
		const apiUrl =
			addr.network === "ark.mainnet"
				? "https://ark-live.arkvault.io/api"
				: addr.network === "ark.devnet"
					? "https://ark-test.arkvault.io/api"
					: null;

		if (!apiUrl) {
			return undefined;
		}

		try {
			const response = await this.#http.get(`${apiUrl}/wallets/${addr.address}`);

			if (response.status() !== 200) {
				return undefined;
			}

			const body = response.json();
			const publicKey = body?.data?.publicKey;

			if (!publicKey) {
				return undefined;
			}

			const wallet = await profile.walletFactory().fromPublicKey({ publicKey });
			return wallet.address();
		} catch (error) {
			if (error.message.includes("404")) {
				return undefined;
			}
			throw new Error(
				`Failed to fetch public key for address ${addr.address}: HTTP request failed with status ${error.message.match(/\d+/)[0]}`,
			);
		}
	}

	#requiresMigration(data: IProfileData): boolean {
		const wallets = Object.values(data.wallets);
		const firstWallet = wallets?.[0];

		if (firstWallet?.data["NETWORK"]?.startsWith("ark.")) {
			return true;
		}

		const contacts = Object.values(data.contacts);
		const firstContact = contacts?.[0];
		return firstContact?.addresses?.[0]?.network?.startsWith("ark.") || false;
	}
}
