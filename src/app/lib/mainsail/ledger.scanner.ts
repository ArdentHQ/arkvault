import { omitBy, uniqBy } from "@/app/lib/helpers";

import { LedgerData } from "@/app/contexts/Ledger/Ledger.contracts";
import { Contracts } from "@/app/lib/profiles";
import { BIP44 } from "@ardenthq/arkvault-crypto";
import { sort } from "@/app/lib/helpers/fast-sort";
import { IProfile } from "@/app/lib/profiles/contracts";
import { LedgerService } from "./ledger.service";

interface LedgerImportOptions {
	slip44: number;
	startPath?: string;
	isLegacy: boolean;
	pageSize?: number;
	skipZeroBalance?: boolean;
}

export class LedgerScanner {
	#ledgerService: LedgerService;
	#profile: IProfile;
	#wallets: LedgerData[];

	constructor(ledgerService: LedgerService, profile: IProfile, wallets: LedgerData[]) {
		this.#ledgerService = ledgerService;
		this.#profile = profile;
		this.#wallets = wallets;
	}

	#computeLastPath(slip44: number, useLegacy?: boolean): string | undefined {
		const currentlyScannedWalletPaths = this.#wallets.map(({ path }) => path);
		const profileWalletsPaths = [...this.#profile.wallets().values()].map((wallet) =>
			wallet.data().get<string>(Contracts.WalletData.DerivationPath),
		);

		const filteredBySlip44 = [...profileWalletsPaths, ...currentlyScannedWalletPaths].filter(
			(path) => path && BIP44.parse(path).coinType === slip44,
		);

		if (useLegacy) {
			return sort(filteredBySlip44)
				.desc((path) => BIP44.parse(path!).account)
				.at(0);
		}

		return sort(filteredBySlip44)
			.desc((path) => BIP44.parse(path!).addressIndex)
			.at(0);
	}

	async scan(options?: { isLoadingMore?: boolean; pageSize?: number }): Promise<LedgerData[]> {
		let ledgerData = await this.scanWithBalancePriority(options);

		if (options?.isLoadingMore) {
			ledgerData = omitBy(ledgerData, (wallet) => this.#wallets.some((w) => w.address === wallet.address));
		} else {
			ledgerData = uniqBy([...this.#wallets, ...ledgerData], (wallet) => wallet.address);
		}

		return ledgerData;
	}

	async scanAllWithBalance(config: LedgerImportOptions): Promise<LedgerData[]> {
		const ledgerData: LedgerData[] = [];
		let startPath = config.startPath;

		while (true) {
			try {

				const wallets = config.isLegacy
					? await this.#ledgerService.scanLegacy({ ...config, pageSize: 1, startPath })
					: await this.#ledgerService.scan({ ...config, pageSize: 1, startPath });

				const ledgerAddress = Object.entries(wallets)[0];

				// No more wallets found stop.
				if (!ledgerAddress) {
					break;
				}

				const [path, data] = ledgerAddress;
				const address = data.address();

				const wallet = await this.#profile.walletFactory().fromAddress({ address });
				await wallet.synchroniser().identity();

				// First zero-balance wallet found. Stop.
				if (wallet.balance() === 0) {
					break;
				}

				ledgerData.push({
					address,
					balance: wallet.balance(),
					path,
				});

				startPath = path
			} catch (error) {
				break;
			}
		}

		return ledgerData;
	}

	async scanWithPager(config: LedgerImportOptions): Promise<LedgerData[]> {
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
		const pageSize = options?.pageSize ?? 5;

		const legacyAddresses = await this.scanAllWithBalance({
			isLegacy: true,
			slip44: this.#ledgerService.slip44Legacy(),
			startPath: this.#computeLastPath(this.#ledgerService.slip44Legacy(), true),
		});


		const arkAddresses = await this.scanAllWithBalance({
			isLegacy: false,
			slip44: this.#ledgerService.slip44(),
			startPath: this.#computeLastPath(this.#ledgerService.slip44()),
		});

		const addressesWithBalance = [...legacyAddresses, ...arkAddresses];

		// No legacy addresses. Generate all new.
		if (addressesWithBalance.length === 0) {
			return await this.scanWithPager({
				isLegacy: false,
				pageSize: options?.pageSize,
				slip44: this.#ledgerService.slip44Eth(),
				startPath: this.#computeLastPath(this.#ledgerService.slip44Eth()),
			});
		}

		// Legacy addresses found. Generate new reimaining addresses for the page.
		if (addressesWithBalance.length < pageSize) {
			const ledgerAddresses = await this.scanWithPager({
				isLegacy: false,
				pageSize: pageSize - addressesWithBalance.length,
				slip44: this.#ledgerService.slip44Eth(),
				startPath: this.#computeLastPath(this.#ledgerService.slip44Eth()),
			});

			return [...addressesWithBalance, ...ledgerAddresses];
		}

		// Legacy addresses are more or equeal to pageSize, just generate one empty.
		const ledgerAddresses = await this.scanWithPager({
			isLegacy: false,
			pageSize: 1,
			slip44: this.#ledgerService.slip44Eth(),
			startPath: this.#computeLastPath(this.#ledgerService.slip44Eth()),
		});

		return [...addressesWithBalance, ...ledgerAddresses];
	}
}

// Usage would be:
