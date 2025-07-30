import { IProfile, IProfileData, IProfileMainsailMigrator } from "./contracts.js";
import { HttpClient } from "@/app/lib/mainsail/http-client.js";
import { UUID } from "@ardenthq/arkvault-crypto";

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
				...(await this.#migrateWalletAddress(profile, wallet.data)),
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
		const contactNameCounts = new Map<string, number>();

		const contactPromises = Object.entries(contacts).map(async ([originalId, contact]) => {
			const addressResults = await Promise.all(
				contact.addresses.map(async (addr) => {
					const newAddress = await this.#migrateContactAddress(profile, addr);
					return newAddress ? { address: newAddress, id: addr.id } : null;
				}),
			);
			const migratedAddresses = addressResults.filter(
				(addr): addr is { id: string; address: string } => addr !== null,
			);

			// Skip contacts with no valid addresses after migration
			if (migratedAddresses.length === 0) {
				return null;
			}

			// Create separate contact for each unique address
			const results: Array<{ id: string; contact: any }> = [];

			for (let index = 0; index < migratedAddresses.length; index++) {
				const address = migratedAddresses[index];
				const originalName = contact.name;
				let finalName = originalName;
				let nameCount = contactNameCounts.get(originalName) || 0;

				if (nameCount > 0) {
					nameCount++;
					finalName = `${originalName} (${nameCount})`;
				}

				contactNameCounts.set(originalName, nameCount + 1);

				// Use original ID for first contact, generate deterministic ID for additional contacts
				let contactId: string;
				if (index === 0) {
					contactId = originalId;
				} else {
					// Generate deterministic UUID by modifying the original ID
					// The reason for using a deterministic UUID is that it seems to
					// duplicate the contact in the frontend
					contactId = this.#generateDeterministicId(originalId, index);
				}

				const newContact = {
					...contact,
					addresses: [address],
					id: contactId,
					name: finalName,
				};

				results.push({ contact: newContact, id: contactId });
			}

			return results;
		});

		const allResults = await Promise.all(contactPromises);

		for (const result of allResults) {
			if (result !== null) {
				for (const { id, contact } of result) {
					// Ensure the contact's id property matches the dictionary key
					contact.id = id;
					migratedContacts[id] = contact;
				}
			}
		}

		return migratedContacts;
	}

	async #migrateContactAddress(
		profile: IProfile,
		addr: IProfileData["contacts"][string]["addresses"][number],
	): Promise<string | undefined> {
		if (!["ark.mainnet", "ark.devnet"].includes(addr.network)) {
			return undefined;
		}

		const apiUrl =
			addr.network === "ark.mainnet"
				? (import.meta.env.VITE_ARK_LEGACY_MAINNET_API_URL ?? "https://ark-live.arkvault.io/api")
				: (import.meta.env.VITE_ARK_LEGACY_DEVNET_API_URL ?? "https://ark-test.arkvault.io/api");

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

	#generateDeterministicId(originalId: string, index: number): string {
		// Modify the last character of the UUID to create a deterministic variant
		const lastChar = originalId.charAt(originalId.length - 1);
		const newLastChar = String.fromCharCode(
			((lastChar.charCodeAt(0) + index) % 16) + (lastChar.charCodeAt(0) >= 97 ? 97 : 48),
		);
		return originalId.slice(0, -1) + newLastChar;
	}
}
