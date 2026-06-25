/* eslint-disable unicorn/no-array-reduce */
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
	byAccountIndex: boolean;
	pageSize?: number;
	skipZeroBalance?: boolean;
}

export class LedgerScanner {
	#ledgerService: LedgerService;
	#profile: IProfile;
	#wallets: LedgerData[];
	#defaultPageSize: number = 5;

	constructor(ledgerService: LedgerService, profile: IProfile, wallets: LedgerData[]) {
		this.#ledgerService = ledgerService;
		this.#profile = profile;
		this.#wallets = wallets;
	}

	#computeLastPath({
		slip44,
		byAccountIndex,
		importedLedgerAddresses,
	}: {
		importedLedgerAddresses: LedgerData[];
		slip44: number;
		byAccountIndex?: boolean;
	}): string | undefined {
		const currentlyScannedWalletPaths = importedLedgerAddresses.map(({ path }) => path);
		const profileWalletsPaths = [...this.#profile.wallets().values()].map((wallet) =>
			wallet.data().get<string>(Contracts.WalletData.DerivationPath),
		);

		const filteredBySlip44 = [...profileWalletsPaths, ...currentlyScannedWalletPaths].filter(
			(path) => path && BIP44.parse(path).coinType === slip44,
		);

		if (byAccountIndex) {
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
				const wallets = config.byAccountIndex
					? await this.#ledgerService.scanByAccountIndex({ ...config, pageSize: 1, startPath })
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

				if (!wallet.hasSyncedWithNetwork()) {
					// Pre-scan next 5 addresses to find those that might have transaction history.
					//
					// If none of the next 5 addresses have transaction history, then we just import the ones which do.
					// If some of the next 5 addresses do have transaction history, then we keep scanning until we hit 5 without transaction history.
					//
					// The scanning stops when we encounter 5 consecutive without transaction history.
					const next5 = await this.scanWithPager({
						byAccountIndex: config.byAccountIndex,
						pageSize: this.#defaultPageSize,
						slip44: config.slip44,
						startPath: path,
					});

					// Break if we have 5 consecutive empty addresses.
					const consecutiveEmpty = next5.reduce(
						(count, ledger) => (ledger?.hasSyncedWithNetwork ? 0 : count + 1),
						0,
					);
					if (consecutiveEmpty === 5) {
						break;
					}

					startPath = path;
					continue;
				}

				ledgerData.push({
					address,
					balance: wallet.balance(),
					path,
				});

				startPath = path;
			} catch {
				break;
			}
		}

		return ledgerData;
	}

	async scanWithPager(config: LedgerImportOptions): Promise<LedgerData[]> {
		let ledgerData: LedgerData[] = [];

		const wallets = config.byAccountIndex
			? await this.#ledgerService.scanByAccountIndex(config)
			: await this.#ledgerService.scan(config);

		for (const [path, data] of Object.entries(wallets)) {
			const address = data.address();
			const wallet = await this.#profile.walletFactory().fromAddress({ address });
			await wallet.synchroniser().identity();

			ledgerData.push({
				address,
				balance: wallet.balance(),
				hasSyncedWithNetwork: wallet.hasSyncedWithNetwork(),
				path,
			});
		}

		return ledgerData;
	}

	async scanNewAddresses(config: LedgerImportOptions): Promise<LedgerData[]> {
		const addressesWithBalance = await this.scanAllWithBalance({
			byAccountIndex: config.byAccountIndex,
			slip44: config.slip44,
			startPath: config.startPath,
		});

		const startPath = this.#computeLastPath({
			byAccountIndex: config.byAccountIndex,
			importedLedgerAddresses: [...addressesWithBalance, ...this.#wallets],
			slip44: this.#ledgerService.slip44Eth(),
		});

		const ledgerData = await this.scanWithPager({
			byAccountIndex: config.byAccountIndex,
			pageSize: config.pageSize,
			slip44: config.slip44,
			startPath,
		});

		return [...addressesWithBalance, ...ledgerData];
	}

	async scanWithBalancePriority(options?: { pageSize?: number }): Promise<LedgerData[]> {
		const pageSize = options?.pageSize ?? this.#defaultPageSize;

		// Scan legacy ARK addresses (slip44=1) by address index.
		const legacyAddresses = await this.scanAllWithBalance({
			byAccountIndex: false,
			slip44: this.#ledgerService.slip44Legacy(),
			startPath: this.#computeLastPath({
				importedLedgerAddresses: this.#wallets,
				slip44: this.#ledgerService.slip44Legacy(),
			}),
		});

		// Scan legacy ARK addresses (slip44=111) by address index.
		const arkAddresses = await this.scanAllWithBalance({
			byAccountIndex: false,
			slip44: this.#ledgerService.slip44(),
			startPath: this.#computeLastPath({
				importedLedgerAddresses: this.#wallets,
				slip44: this.#ledgerService.slip44(),
			}),
		});

		const legacyWithBalance = [...legacyAddresses, ...arkAddresses];

		// Scan ETH addresses (slip44=60) by account index
		// Ensure at least 1 new empty address is generated.
		const remainingSize = Math.max(1, pageSize - legacyWithBalance.length);
		const ledgerAddresses = await this.scanNewAddresses({
			byAccountIndex: true,
			pageSize: legacyWithBalance.length === 0 ? pageSize : remainingSize,
			slip44: this.#ledgerService.slip44Eth(),
			startPath: this.#computeLastPath({
				byAccountIndex: true,
				importedLedgerAddresses: this.#wallets,
				slip44: this.#ledgerService.slip44Eth(),
			}),
		});

		return [...legacyWithBalance, ...ledgerAddresses];
	}
}

// Usage would be:
