import { IProfile, IProfileData, IProfileMainsailMigrator, ProfileData } from "./contracts.js";
import { HttpClient } from "@/app/lib/mainsail/http-client.js";
import { Avatar } from "./helpers/avatar.js";
import { UUID } from "@ardenthq/arkvault-crypto";
export class ProfileMainsailMigrator implements IProfileMainsailMigrator {
	readonly #http: HttpClient = new HttpClient(10_000);
	readonly #migrationResult: Record<string, any[]> = {
		coldAddresses: [],
		coldContacts: [],
		mergedAddresses: [],
		mergedContacts: [],
	};

	/**
	 * Migrates the profile data from Mainsail to ArkVault if needed.
	 *
	 * @param {IProfileData} [data]
	 * @return {Promise<IProfileData>}
	 * @memberof Profile
	 */
	public async migrate(profile: IProfile, data: IProfileData): Promise<IProfileData> {
		if (this.#requiresMigration(data)) {
			data.wallets = await this.#migrateWallets(profile, data.wallets);
			data.contacts = await this.#migrateContacts(profile, data.contacts);
			data.settings = await this.#migrateSettings(profile, data.settings, data.wallets);

			profile.data().set(ProfileData.MigrationResult, this.#migrationResult);
		}

		return data;
	}

	async #migrateWallets(profile: IProfile, wallets: IProfileData["wallets"]): Promise<IProfileData["wallets"]> {
		const migratedWallets: IProfileData["wallets"] = {};
		const seenPublicKeys = new Set<string>();

		for (const [id, wallet] of Object.entries(wallets)) {
			const publicKey: string | undefined = wallet?.data?.["PUBLIC_KEY"];

			// If this public key has already been migrated, skip to avoid duplicates
			if (publicKey !== undefined && seenPublicKeys.has(publicKey)) {
				const duplicateWallet = Object.values(wallets).find(
					(d) => d.data["PUBLIC_KEY"] === publicKey && migratedWallets[d.id] !== undefined,
				);
				const newWallet = Object.values(migratedWallets).find((d) => d.data["PUBLIC_KEY"] === publicKey);

				this.#migrationResult.mergedAddresses.push({
					...wallet.data,
					duplicateAddress: duplicateWallet?.data.ADDRESS,
					newAddress: newWallet?.data.ADDRESS,
				});
				continue;
			}

			const migratedWallet = await this.#migrateWallet(profile, wallet);
			if (migratedWallet !== undefined) {
				if (publicKey !== undefined) {
					seenPublicKeys.add(publicKey);
				}
				migratedWallets[id] = migratedWallet;
			}
		}

		return migratedWallets;
	}

	async #migrateWallet(
		profile: IProfile,
		wallet: IProfileData["wallets"][string],
	): Promise<IProfileData["wallets"][string] | undefined> {
		const newData = await this.#migrateWalletAddress(profile, wallet.data);

		if (newData === undefined) {
			return undefined;
		}

		const migratedWallet: IProfileData["wallets"][string] = {
			...wallet,
			data: {
				...wallet.data,
				...newData,
			},
		};

		return migratedWallet;
	}

	async #migrateWalletAddress(
		profile: IProfile,
		walletData: IProfileData["wallets"][string]["data"],
	): Promise<IProfileData["wallets"][string]["data"] | undefined> {
		const publicKey = walletData["PUBLIC_KEY"];
		if (publicKey === undefined) {
			this.#migrationResult.coldAddresses.push(walletData);
			return undefined;
		}

		const wallet = await profile.walletFactory().fromPublicKey({ publicKey });
		const migratedWalletData: IProfileData["wallets"][string]["data"] = {
			ADDRESS: wallet.address(),
		};

		return migratedWalletData;
	}

	async #migrateContacts(profile: IProfile, contacts: IProfileData["contacts"]): Promise<IProfileData["contacts"]> {
		const contactPromises = Object.entries(contacts).map(([originalId, contact]) =>
			this.#processContactEntry(profile, originalId, contact),
		);

		const allResults = await Promise.all(contactPromises);
		return this.#finalizeContacts(allResults);
	}

	async #processContactEntry(
		profile: IProfile,
		originalId: string,
		contact: IProfileData["contacts"][string],
	): Promise<Array<{ id: string; contact: any }> | null> {
		const addressResults = await Promise.all(
			contact.addresses.map(async (addr) => {
				const newAddress = await this.#migrateContactAddress(profile, addr, contact.name);
				return newAddress ? { address: newAddress, id: addr.id, oldAddress: addr.address } : null;
			}),
		);

		const migratedAddresses = addressResults.filter(
			(addr): addr is { id: string; address: string; oldAddress: string } => addr !== null,
		);

		if (migratedAddresses.length === 0) {
			return null;
		}

		const results: Array<{ id: string; contact: any }> = [];
		for (let index = 0; index < migratedAddresses.length; index++) {
			const address = migratedAddresses[index];
			const originalName = contact.name;
			const finalName = index > 0 ? `${originalName} (${index + 1})` : originalName;
			const contactId = index === 0 ? originalId : UUID.random();

			const newContact = {
				...contact,
				addresses: [address],
				id: contactId,
				name: finalName,
				oldName: originalName,
			};

			results.push({ contact: newContact, id: contactId });
		}

		return results;
	}

	#finalizeContacts(allResults: Array<Array<{ id: string; contact: any }> | null>): IProfileData["contacts"] {
		const migratedContacts: IProfileData["contacts"] = {};
		const finalNameCounts = new Map<string, number>();
		const seenAddresses = new Map<string, string>();

		const normalizedResults = allResults
			.filter((result) => result !== null)
			.flat()
			.map((result) => ({
				...result.contact,
				...result.contact.addresses[0],
				contactId: result.id,
			}));

		for (const result of allResults) {
			if (result === null) {
				continue;
			}

			for (const { id, contact } of result) {
				contact.id = id;

				const migratedAddress = contact.addresses?.[0]?.address;
				if (typeof migratedAddress === "string") {
					if (seenAddresses.has(migratedAddress)) {
						const duplicateContact = normalizedResults.find(
							(result) => result.address === migratedAddress && result.contactId !== id,
						);

						this.#migrationResult.mergedContacts.push({
							...contact,
							duplicateContact: {
								address: duplicateContact.address,
								name: duplicateContact.name,
								oldAddress: duplicateContact.oldAddress,
								oldName: duplicateContact.oldName,
							},
							name: duplicateContact.name,
						});
						continue;
					}
					seenAddresses.set(migratedAddress, id);
				}

				const contactName = contact.name;
				const nameCount = finalNameCounts.get(contactName) || 0;
				if (nameCount > 0) {
					contact.name = `${contactName} (${nameCount + 1})`;
				}
				finalNameCounts.set(contactName, nameCount + 1);

				migratedContacts[id] = contact;
			}
		}

		return migratedContacts;
	}

	async #migrateContactAddress(
		profile: IProfile,
		addr: IProfileData["contacts"][string]["addresses"][number],
		contactName: string,
	): Promise<string | undefined> {
		if (!["ark.mainnet", "ark.devnet"].includes(addr.network)) {
			return undefined;
		}

		const apiUrl =
			addr.network === "ark.mainnet"
				? (import.meta.env.VITE_ARK_LEGACY_MAINNET_API_URL ?? "https://ark-live.arkvault.io/api")
				: (import.meta.env.VITE_ARK_LEGACY_DEVNET_API_URL ?? "https://ark-test.arkvault.io/api");

		try {
			const response = await this.#http.get(`${apiUrl}/wallets/${addr.address}`);

			const body = response.json();
			const publicKey = body?.data?.publicKey;

			if (!publicKey) {
				this.#migrationResult.coldContacts.push({
					...addr,
					name: contactName,
				});
				return undefined;
			}

			const wallet = await profile.walletFactory().fromPublicKey({ publicKey });
			return wallet.address();
		} catch (error) {
			if (error.message.includes("404")) {
				this.#migrationResult.coldContacts.push({
					...addr,
					name: contactName,
				});
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

	async #migrateSettings(
		profile: IProfile,
		settings: IProfileData["settings"],
		wallets: IProfileData["wallets"],
	): Promise<IProfileData["settings"]> {
		const migratedSettings: IProfileData["settings"] = {};

		// Keep settings that remain the same
		const settingsToKeep = [
			"AUTOMATIC_SIGN_OUT_PERIOD",
			"BIP39_LOCALE",
			"DO_NOT_SHOW_FEE_WARNING",
			"FALLBACK_TO_DEFAULT_NODES",
			"EXCHANGE_CURRENCY",
			"LOCALE",
			"MARKET_PROVIDER",
			"NAME",
			"THEME",
			"TIME_FORMAT",
			"USE_NETWORK_WALLET_NAMES",
			"USE_TEST_NETWORKS",
		];

		for (const settingKey of settingsToKeep) {
			migratedSettings[settingKey] = settings[settingKey];
		}

		// Migrate avatar
		if (settings["AVATAR"]) {
			const avatar = settings["AVATAR"];
			if (avatar.startsWith("data:image")) {
				migratedSettings["AVATAR"] = avatar;
			} else {
				migratedSettings["AVATAR"] = Avatar.make(settings["NAME"]);
			}
		}

		this.#migrateDashboardConfiguration(migratedSettings, wallets);

		return migratedSettings;
	}

	#migrateDashboardConfiguration(migratedSettings: IProfileData["settings"], wallets: IProfileData["wallets"]): void {
		const walletAddresses = Object.values(wallets).map((wallet) => wallet.data.ADDRESS);

		migratedSettings["WALLET_SELECTION_MODE"] = "multiple";

		if (walletAddresses.length === 0) {
			migratedSettings["DASHBOARD_CONFIGURATION"] = {
				addressPanelSettings: {
					multiSelectedAddresses: [],
					singleSelectedAddress: [],
				},
				addressViewPreference: "multiple",
			};

			return;
		}

		migratedSettings["DASHBOARD_CONFIGURATION"] = {
			addressPanelSettings: {
				multiSelectedAddresses: walletAddresses,
				singleSelectedAddress: [walletAddresses[0]],
			},
			addressViewPreference: "multiple",
		};
	}
}
