import { Contracts, IoC, Services } from "@ardenthq/sdk";
import { BIP44, HDKey } from "@ardenthq/sdk-cryptography";
import { Exceptions } from "@mainsail/contracts";

import { Interfaces } from "./crypto/index.js";
import { createRange } from "./ledger.service.helpers.js";
import { LedgerSignature, SetupLedgerFactory } from "./ledger.service.types.js";

export class LedgerService extends Services.AbstractLedgerService {
	readonly #clientService!: Services.ClientService;
	readonly #addressService!: Services.AddressService;
	readonly #dataTransferObjectService: Services.DataTransferObjectService;
	#ledger!: Services.LedgerTransport;
	#ethLedgerService!: any;
	#transport!: any;

	#configCrypto!: { crypto: Interfaces.NetworkConfig; height: number };

	#extractAddressIndexFromPath(path: string): string {
		return path.split("/").slice(-2).join("/");
	}

	async #getPublicKeys(path: string): Promise<{ extendedPublicKey: string; publicKey: string }> {
		const derivationPath = `m/${this.#extractAddressIndexFromPath(path)}`;
		const extendedPublicKey = await this.getExtendedPublicKey(path);

		const publicKey: string = HDKey.fromCompressedPublicKey(extendedPublicKey)
			.derive(derivationPath)
			.publicKey.toString("hex");

		return { extendedPublicKey, publicKey };
	}

	async #getExtendedPublicKeyWithRetry(path: string, retryCount = 0): Promise<string> {
		try {
			const result = await this.#transport.getAddress(path);
			return result.publicKey;
		} catch (error) {
			if (error?.message?.includes?.("busy") && retryCount < 3) {
				await new Promise((resolve) => setTimeout(resolve, 500));
				return await this.#getExtendedPublicKeyWithRetry(path, retryCount + 1);
			}
			throw new Error(error);
		}
	}

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#clientService = container.get(IoC.BindingType.ClientService);
		this.#addressService = container.get(IoC.BindingType.AddressService);
		this.#dataTransferObjectService = container.get(IoC.BindingType.DataTransferObjectService);
	}

	public override async onPreDestroy(): Promise<void> {
		return this.disconnect();
	}

	public override async connect(setupTransport?: SetupLedgerFactory): Promise<void> {
		this.#ledger = await this.ledgerTransportFactory();

		if (setupTransport) {
			const data = setupTransport?.(this.#ledger);

			this.#transport = data?.transport;
			this.#ethLedgerService = data?.ledgerService;
		}
	}

	public override async disconnect(): Promise<void> {
		if (this.#ledger) {
			await this.#ledger.close();
		}
	}

	public override async getVersion(): Promise<string> {
		// @TODO: fix hardcoded number.
		return "1";
	}

	public override async getPublicKey(path: string): Promise<string> {
		const derivationPath = `m/${this.#extractAddressIndexFromPath(path)}`;
		const publicKey = await this.getExtendedPublicKey(path);

		const pubKey: string = HDKey.fromCompressedPublicKey(publicKey)
			.derive(derivationPath)
			.publicKey.toString("hex");

		return pubKey;
	}

	public override async getExtendedPublicKey(path: string): Promise<string> {
		return this.#getExtendedPublicKeyWithRetry(path);
	}

	public override async sign(path: string, serialized: string | Buffer): Promise<LedgerSignature> {
		const resolution = await this.#ethLedgerService.resolveTransaction(
			serialized,
			{},
			{
				domain: { chainId: 10_000 },
			},
		);

		return await this.#transport.signTransaction(path, serialized, resolution);
	}

	public override async signMessage(path: string, payload: string): Promise<string> {
		throw new Exceptions.NotImplemented(this.constructor.name, this.signMessage.name);
	}

	public override async scan(options?: {
		useLegacy: boolean;
		startPath?: string;
		pageSize?: number;
		onProgress?: (wallet: Contracts.WalletData) => void;
	}): Promise<Services.LedgerWalletList> {
		const pageSize = 5;
		const page = 0;
		const slip44 = this.configRepository.get<number>("network.constants.slip44");

		const addresses: Record<string, { address: string; publicKey: string }> = {};
		const path = `m/44'/${slip44}'/0'`;

		let initialAddressIndex = 0;

		if (options?.startPath) {
			// Get the address index from expected format `m/purpose'/coinType'/account'/change/addressIndex`
			initialAddressIndex = BIP44.parse(options.startPath).addressIndex + 1;
		}

		const ledgerWallets: Services.LedgerWalletList = {};

		for (const addressIndexIterator of createRange(page, options?.pageSize ?? pageSize)) {
			const addressIndex = initialAddressIndex + addressIndexIterator;
			const { extendedPublicKey, publicKey } = await this.#getPublicKeys(`${path}/0/${addressIndex}`);

			const { address } = await this.#addressService.fromPublicKey(extendedPublicKey);

			ledgerWallets[`${path}/0/${addressIndex}`] = this.#dataTransferObjectService.wallet({
				address,
				balance: 0,
				publicKey,
			});
		}
		return ledgerWallets;
	}

	public override async isNanoS(): Promise<boolean> {
		return this.#ledger.deviceModel?.id === "nanoS";
	}

	public override async isNanoX(): Promise<boolean> {
		return this.#ledger.deviceModel?.id === "nanoX";
	}
}
