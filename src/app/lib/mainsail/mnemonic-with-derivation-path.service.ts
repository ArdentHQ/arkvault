import { BIP39 } from "@ardenthq/arkvault-crypto";
import { Account, HDKey, hdKeyToAccount } from "viem/accounts";
import { parseTransaction } from "viem";

export class MnemonicWithDerivationPathService {
	public async getPublicKey(mnemonic: string, path: string): Promise<string> {
		const account = await this.getAccount(mnemonic, path);
		return account.publicKey as string;
	}

	public async getAddress(mnemonic: string, path: string): Promise<string> {
		const account = await this.getAccount(mnemonic, path);
		return account.address;
	}

	public async sign(mnemonic: string, path: string, data: Record<string, any>): Promise<object> {
		const account = await this.getAccount(mnemonic, path);

		if (!account.signTransaction) {
			throw new Error("Failed to create account!");
		}

		const signature = await account.signTransaction({
			chainId: 11812,
			gas: BigInt(data.gasLimit),
			gasPrice: BigInt(data.gasPrice.toString()),
			nonce: +data.nonce,
			to: data.to,
			type: "legacy",
			value: BigInt(data.value.toString()),
		});

		const parsedTransaction = parseTransaction(signature);
		console.log({parsedTransaction})

		return {
			r: parsedTransaction.r?.replace(/^0x/, ""),
			s: parsedTransaction.s?.replace(/^0x/, ""),
			v: parsedTransaction.yParity,
		}
	}

	//
	// public async signMessage(path: string, payload: string): Promise<string> {
	//
	// }

	public async getAccount(mnemonic: string, path: string): Promise<Account> {
		const seed = BIP39.toSeed(mnemonic);
		const hdKey = HDKey.fromMasterSeed(seed);

		return hdKeyToAccount(hdKey, {
			// @ts-expect-error we need ARK coin type
			path,
		});
	}
}
