import { Contracts, Services } from "@/app/lib/mainsail";
import { BIP44, HDKey } from "@ardenthq/arkvault-crypto";
import { connectedTransport as ledgerTransportFactory } from "@/app/contexts/Ledger/transport";

import { createRange } from "./ledger.service.helpers.js";
import { LedgerSignature } from "./ledger.service.types.js";
import { AddressService } from "./address.service.js";
import { WalletData } from "./wallet.dto.js";
import { ConfigKey, ConfigRepository } from "@/app/lib/mainsail/config.repository";
import Eth, { ledgerService } from "@ledgerhq/hw-app-eth";

export class LedgerService {
	readonly #addressService!: AddressService;

	#ledger!: Services.LedgerTransport;
	#config: ConfigRepository;
	#ethLedgerService!: any;
	#transport!: any;

	#extractAddressIndexFromPath(path: string): string {
		return path.split("/").slice(-2).join("/");
	}

	constructor({ config }: { config: ConfigRepository }) {
		this.#addressService = new AddressService();
		this.#config = config;
		this.#ethLedgerService = ledgerService;
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

	public async onPreDestroy(): Promise<void> {
		return this.disconnect();
	}

	public async connect(): Promise<void> {
		this.#ledger = await ledgerTransportFactory();
		this.#transport = new Eth(this.#ledger);
	}

	public async disconnect(): Promise<void> {
		if (this.#ledger) {
			await this.#ledger.close();
		}
	}

	public async getVersion(): Promise<string> {
		// @TODO: fix hardcoded number.
		return "1";
	}

	public async getPublicKey(path: string): Promise<string> {
		const derivationPath = `m/${this.#extractAddressIndexFromPath(path)}`;
		const publicKey = await this.getExtendedPublicKey(path);

		const pubKey: string = HDKey.fromCompressedPublicKey(publicKey)
			.derive(derivationPath)
			.publicKey.toString("hex");

		return pubKey;
	}

	public async getExtendedPublicKey(path: string): Promise<string> {
		return this.#getExtendedPublicKeyWithRetry(path);
	}

	public async sign(path: string, serialized: string | Buffer): Promise<LedgerSignature> {
		const chainId = this.#config.get("network.chainId") as number

		const resolution = await this.#ethLedgerService.resolveTransaction(
			serialized,
			{},
			{
				domain: { chainId },
			},
		);

		const signature = await this.#transport.signTransaction(path, serialized, resolution);

		return {
			...signature,
			// Clearing the ledger’s precomputed `v`, as it will be calculated in ts-crypto.
			// @see https://github.com/ArdentHQ/typescript-crypto/blob/c5141eba1416f0e6f30e4797c34e1834d48e933b/src/utils/TransactionUtils.ts#L20
			v: Number.parseInt(signature.v, 16) - (chainId * 2 + 35),
		};
	}

	public async signMessage(path: string, payload: string): Promise<string> {
		const hex = Buffer.from(payload).toString("hex");
		const { r, s, v } = await this.#transport.signPersonalMessage(path, hex);

		return [`0x`, r, s, v.toString(16)].join("");
	}

	public async scan(options?: {
		useLegacy: boolean;
		startPath?: string;
		pageSize?: number;
		onProgress?: (wallet: Contracts.WalletData) => void;
	}): Promise<Services.LedgerWalletList> {
		const pageSize = 5;
		const page = 0;
		const path = `m/44'/${this.slip44()}'/0'`;

		let initialAddressIndex = 0;

		if (options?.startPath) {
			// Get the address index from expected format `m/purpose'/coinType'/account'/change/addressIndex`
			initialAddressIndex = BIP44.parse(options.startPath).addressIndex + 1;
		}

		const ledgerWallets: Services.LedgerWalletList = {};
		for (const addressIndexIterator of createRange(page, options?.pageSize ?? pageSize)) {
			const addressIndex = initialAddressIndex + addressIndexIterator;
			const { extendedPublicKey, publicKey } = await this.#getPublicKeys(`${path}/0/${addressIndex}`);

			const { address } = this.#addressService.fromPublicKey(extendedPublicKey);

			ledgerWallets[`${path}/0/${addressIndex}`] = new WalletData({ config: this.#config }).fill({
				address,
				balance: 0,
				publicKey,
			});
		}
		return ledgerWallets;
	}

	public async isNanoS(): Promise<boolean> {
		return this.#ledger.deviceModel?.id === "nanoS";
	}

	public async isNanoX(): Promise<boolean> {
		return this.#ledger.deviceModel?.id === "nanoX";
	}

	public slip44(): number {
		return this.#config.get(ConfigKey.Slip44);
	}
}
