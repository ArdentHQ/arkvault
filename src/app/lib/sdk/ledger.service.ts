/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { ConfigRepository } from "./config";
import { IContainer } from "./container.contracts";
import { WalletData } from "./contracts";
import { DataTransferObjectService } from "./data-transfer-object.contract";
import { NotImplemented } from "./exceptions";
import { LedgerService, LedgerTransportFactory, LedgerWalletList } from "./ledger.contract";
import { BindingType } from "./service-provider.contract";

export class AbstractLedgerService implements LedgerService {
	readonly #dataTransferObjectService: DataTransferObjectService;

	protected readonly configRepository: ConfigRepository;
	protected readonly ledgerTransportFactory: LedgerTransportFactory;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
		this.ledgerTransportFactory = container.get(BindingType.LedgerTransportFactory);
		this.#dataTransferObjectService = container.get(BindingType.DataTransferObjectService);
	}

	public async onPreDestroy(): Promise<void> {
		return this.disconnect();
	}

	public async connect(): Promise<void> {
		throw new NotImplemented(this.constructor.name, this.connect.name);
	}

	public async disconnect(): Promise<void> {
		//
	}

	public async getVersion(): Promise<string> {
		throw new NotImplemented(this.constructor.name, this.getVersion.name);
	}

	public async getPublicKey(path: string): Promise<string> {
		throw new NotImplemented(this.constructor.name, this.getPublicKey.name);
	}

	public async getExtendedPublicKey(path: string): Promise<string> {
		throw new NotImplemented(this.constructor.name, this.getExtendedPublicKey.name);
	}

	public async signTransaction(path: string, payload: Buffer): Promise<string> {
		throw new NotImplemented(this.constructor.name, this.signTransaction.name);
	}

	public async signMessage(path: string, payload: string): Promise<string> {
		throw new NotImplemented(this.constructor.name, this.signMessage.name);
	}

	public async scan(options?: { useLegacy: boolean }): Promise<LedgerWalletList> {
		throw new NotImplemented(this.constructor.name, this.scan.name);
	}

	public async isNanoS(): Promise<boolean> {
		return false;
	}

	public async isNanoX(): Promise<boolean> {
		return false;
	}

	protected mapPathsToWallets(
		addressCache: Record<string, { address: string; publicKey: string }>,
		wallets: WalletData[],
	): LedgerWalletList {
		let foundFirstCold = false;
		const ledgerWallets: LedgerWalletList = {};

		for (const [path, { address, publicKey }] of Object.entries(addressCache)) {
			const matchingWallet: WalletData | undefined = wallets.find(
				(wallet: WalletData) => wallet.address() === address,
			);

			if (matchingWallet === undefined) {
				if (foundFirstCold) {
					continue;
				}
				foundFirstCold = true;

				ledgerWallets[path] = this.#dataTransferObjectService.wallet({
					address,
					balance: 0,
					publicKey,
				});
			} else {
				ledgerWallets[path] = matchingWallet;
			}
		}
		return ledgerWallets;
	}
}
