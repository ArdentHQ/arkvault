import { omitBy, uniqBy } from "@/app/lib/helpers";

import { LedgerData } from "@/app/contexts/Ledger/Ledger.contracts";
import { Contracts } from "@/app/lib/profiles";
import { BIP44 } from "@ardenthq/arkvault-crypto";
import { sort } from "@/app/lib/helpers/fast-sort";
import { IProfile } from "../profiles/contracts";
import { LedgerService } from "./ledger.service";
import { options } from "joi";

interface LedgerImportOptions {
	slip44: number;
	startPath?: string;
	isLegacy: boolean;
	pageSize?: number;
	skipZeroBalance?: boolean;
}

export class LedgerScanner {
	#ledgerService: LedgerService
	#profile: IProfile
	#wallets: LedgerData[]

	constructor(ledgerService: LedgerService, profile: IProfile, wallets: LedgerData[]) {
		this.#ledgerService = ledgerService
		this.#profile = profile
		this.#wallets = wallets
	}

	#computeLastPath(slip44: number, useLegacy?: boolean): string | undefined {
		const currentlyScannedWalletPaths = this.#wallets.map(({ path }) => path);
		const profileWalletsPaths = Array.from(this.#profile.wallets().values())
			.map((wallet) => wallet.data().get<string>(Contracts.WalletData.DerivationPath));

		const filteredBySlip44 = [...profileWalletsPaths, ...currentlyScannedWalletPaths]
			.filter(path => path && BIP44.parse(path).coinType === slip44);

		if (useLegacy) {
			return sort(filteredBySlip44)
				.desc(path => BIP44.parse(path!).account)
				.at(0);
		}

		return sort(filteredBySlip44)
			.desc(path => BIP44.parse(path!).addressIndex)
			.at(0);
	}

	#importOptions(): LedgerImportOptions[] {
		return [
			{
				slip44: this.#ledgerService.slip44(),
				startPath: this.#computeLastPath(this.#ledgerService.slip44()),
				isLegacy: false,
			},
			// {
			// 	slip44: this.#ledgerService.slip44Eth(),
			// 	startPath: this.#computeLastPath(this.#ledgerService.slip44Eth()),
			// 	isLegacy: false,
			// },
			{
				slip44: this.#ledgerService.slip44Legacy(),
				startPath: this.#computeLastPath(this.#ledgerService.slip44Legacy(), true),
				isLegacy: true,
			}
		];
	}

	async scan(options?: { isLoadingMore?: boolean, pageSize?: number }): Promise<LedgerData[]> {
		let ledgerData = await this.scanWithBalancePriority(options)
		console.log({ ledgerData })

		if (options?.isLoadingMore) {
			ledgerData = omitBy(ledgerData, (wallet) => this.#wallets.some((w) => w.address === wallet.address));
		} else {
			ledgerData = uniqBy([...this.#wallets, ...ledgerData], (wallet) => wallet.address);
		}

		return ledgerData;
	}

	async import(config: LedgerImportOptions): Promise<LedgerData[]> {
		let ledgerData: LedgerData[] = [];

		const wallets = config.isLegacy
			? await this.#ledgerService.scanLegacy(config)
			: await this.#ledgerService.scan(config);

		for (const [path, data] of Object.entries(wallets)) {
			const address = data.address();
			const wallet = await this.#profile.walletFactory().fromAddress({ address });
			await wallet.synchroniser().identity();

			// Stop on first zero balance address.
			if (config.skipZeroBalance && wallet.balance() === 0) {
				break;
			}

			ledgerData.push({
				address,
				balance: wallet.balance(),
				path,
			});
		}

		return ledgerData;
	}


	async scanWithBalancePriority(options?: { pageSize?: number }): Promise<LedgerData[]> {
		const pageSize = options?.pageSize ?? 5

		const legacyAddresses = await this.import(
			{
				slip44: this.#ledgerService.slip44Legacy(),
				startPath: this.#computeLastPath(this.#ledgerService.slip44Legacy(), true),
				isLegacy: true,
				skipZeroBalance: true
			}
		);

		const arkAddresses = await this.import(
			{
				slip44: this.#ledgerService.slip44(),
				startPath: this.#computeLastPath(this.#ledgerService.slip44()),
				isLegacy: false,
				skipZeroBalance: true
			},
		);


		const addressesWithBalance = [...legacyAddresses, ...arkAddresses]


		// No legacy addresses. Generate all new.
		if (addressesWithBalance.length === 0) {
			return await this.import(
				{
					slip44: this.#ledgerService.slip44Eth(),
					startPath: this.#computeLastPath(this.#ledgerService.slip44Eth()),
					isLegacy: false,
					pageSize: options?.pageSize
				}
			);

		}

		// Legacy addresses found. Generate reimaining addresses for the page.
		if (addressesWithBalance.length < pageSize) {
			const ledgerAddresses = await this.import(
				{
					slip44: this.#ledgerService.slip44Eth(),
					startPath: this.#computeLastPath(this.#ledgerService.slip44Eth()),
					isLegacy: false,
					pageSize: pageSize - addressesWithBalance.length
				}
			);

			return [...addressesWithBalance, ...ledgerAddresses]
		}

		// Legacy addresses are => for pageSize, just generate one.
		const ledgerAddresses = await this.import(
			{
				slip44: this.#ledgerService.slip44Eth(),
				startPath: this.#computeLastPath(this.#ledgerService.slip44Eth()),
				isLegacy: false,
				pageSize: 1
			}
		);

		return [...addressesWithBalance, ...ledgerAddresses]
	}
}

// Usage would be:
