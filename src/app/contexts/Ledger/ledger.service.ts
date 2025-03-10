import { Buffer } from "buffer";
import { Contracts, IoC, Services } from "@ardenthq/sdk";
import { BIP44, HDKey } from "@ardenthq/sdk-cryptography";
import Eth from "@ledgerhq/hw-app-eth";
import { chunk, createRange, formatLedgerDerivationPath } from "./ledger.service.helpers";

import { NotImplemented } from "@/app/lib";

export class LedgerService extends Services.AbstractLedgerService {
	readonly #clientService!: Services.ClientService;
	readonly #addressService!: Services.AddressService;
	#ledger!: Services.LedgerTransport;
	#transport!: InstanceType<typeof Eth>;

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#clientService = container.get(IoC.BindingType.ClientService);
		this.#addressService = container.get(IoC.BindingType.AddressService);
	}

	public override async onPreDestroy(): Promise<void> {
		return this.disconnect();
	}

	public override async connect(): Promise<void> {
		this.#ledger = await this.ledgerTransportFactory();
		this.#transport = new Eth(this.#ledger);
	}

	public override async disconnect(): Promise<void> {
		if (this.#ledger) {
			await this.#ledger.close();
		}
	}

	public override async getVersion(): Promise<string> {
		return "1"
	}

	public override async getPublicKey(path: string): Promise<string> {
		const result = await this.#transport.getAddress(path);
		console.log("[getPublicKey]", result);
		return result.publicKey;
	}

	public override async getExtendedPublicKey(path: string): Promise<string> {
		throw new NotImplemented(this.constructor.name, this.getExtendedPublicKey.name);
	}

	public override async signTransaction(path: string, payload: Buffer): Promise<string> {
		throw new NotImplemented(this.constructor.name, this.signTransaction.name);
	}

	public override async signMessage(path: string, payload: string): Promise<string> {
		throw new NotImplemented(this.constructor.name, this.signMessage.name);
	}

	public override async scan(options?: {
		useLegacy: boolean;
		startPath?: string;
		onProgress?: (wallet: Contracts.WalletData) => void;
	}): Promise<Services.LedgerWalletList> {
		const pageSize = 5;
		let page = 0;
		const slip44 = this.configRepository.get<number>("network.constants.slip44");

		const addressCache: Record<string, { address: string; publicKey: string }> = {};

		let hasMore = true;

		const walletsCollection: Contracts.WalletData[] = [];

		do {
			const addresses: string[] = [];

			const path = `m/44'/${slip44}'/0'`;
			let initialAddressIndex = 0;

			if (options?.startPath) {
				// Get the address index from expected format `m/purpose'/coinType'/account'/change/addressIndex`
				initialAddressIndex = BIP44.parse(options.startPath).addressIndex + 1;
			}

			/**
			 * @remarks
			 * This is the new BIP44 compliant derivation which will be used by default.
			 */
			const compressedPublicKey = await this.getExtendedPublicKey(path);

			for (const addressIndexIterator of createRange(page, pageSize)) {
				const addressIndex = initialAddressIndex + addressIndexIterator;
				const publicKey: string = HDKey.fromCompressedPublicKey(compressedPublicKey)
					.derive(`m/0/${addressIndex}`)
					.publicKey.toString("hex");

				const { address } = await this.#addressService.fromPublicKey(publicKey);

				addresses.push(address);

				addressCache[`${path}/0/${addressIndex}`] = { address, publicKey };
			}

			const collections = await Promise.all(
				chunk(addresses, 50).map((addresses: string[]) =>
					this.#clientService.wallets({
						identifiers: [...addresses].map((address: string) => ({ type: "address", value: address })),
					}),
				),
			);

			const batchWalletsCollection = collections.flatMap((collection) => collection.items());

			if (options?.onProgress !== undefined) {
				for (const item of batchWalletsCollection) {
					options.onProgress(item);
				}
			}

			walletsCollection.push(...batchWalletsCollection);

			hasMore = collections.some((collection) => collection.isNotEmpty());

			page++;
		} while (hasMore);

		return this.mapPathsToWallets(addressCache, walletsCollection);
	}

	public override async isNanoS(): Promise<boolean> {
		return this.#ledger.deviceModel?.id === "nanoS";
	}

	public override async isNanoX(): Promise<boolean> {
		return this.#ledger.deviceModel?.id === "nanoX";
	}
}
