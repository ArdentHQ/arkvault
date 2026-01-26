import { omitBy, uniqBy } from "@/app/lib/helpers";

import { LedgerData } from "@/app/contexts/Ledger/Ledger.contracts";
import { Contracts } from "@/app/lib/profiles";
import { BIP44 } from "@ardenthq/arkvault-crypto";
import { sort } from "@/app/lib/helpers/fast-sort";
import { IProfile } from "../profiles/contracts";
import { LedgerService } from "./ledger.service";

interface LedgerImportOptions {
	slip44: number;
	startPath?: string;
	isLegacy: boolean;
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

	private calculateLastPath(slip44: number, useLegacy?: boolean): string | undefined {
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
				startPath: this.calculateLastPath(this.#ledgerService.slip44()),
				isLegacy: false,
			},
			{
				slip44: this.#ledgerService.slip44Eth(),
				startPath: this.calculateLastPath(this.#ledgerService.slip44Eth()),
				isLegacy: false,
			},
			{
				slip44: this.#ledgerService.slip44Legacy(),
				startPath: this.calculateLastPath(this.#ledgerService.slip44Legacy(), true),
				isLegacy: true,
			}
		];
	}

	async scan(options?: { isLoadingMore?: boolean, pageSize?: number }): Promise<LedgerData[]> {
		const importConfigs = this.#importOptions()
		let ledgerData: LedgerData[] = [];

		for (const config of importConfigs) {
			const scanOptions = {
				pageSize: options?.pageSize ?? 5,
				slip44: config.slip44,
				startPath: config.startPath,
			};

			const wallets = config.isLegacy
				? await this.#ledgerService.scanLegacy(scanOptions)
				: await this.#ledgerService.scan(scanOptions);

			for (const [path, data] of Object.entries(wallets)) {
				const address = data.address();
				const wallet = await this.#profile.walletFactory().fromAddress({ address });
				await wallet.synchroniser().identity();

				ledgerData.push({
					address,
					balance: wallet.balance(),
					path,
				});
			}
		}

		if (options?.isLoadingMore) {
			ledgerData = omitBy(ledgerData, (wallet) => this.#wallets.some((w) => w.address === wallet.address));
		} else {
			ledgerData = uniqBy([...this.#wallets, ...ledgerData], (wallet) => wallet.address);
		}

		return ledgerData;
	}
}

// Usage would be:
