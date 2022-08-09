import { Services, Signatories } from "@ardenthq/sdk";
import { Contracts as ProfileContracts } from "@ardenthq/sdk-profiles";

const signWithLedger = async (message: string, wallet: ProfileContracts.IReadWriteWallet) => {
	const path = wallet.data().get<string>(ProfileContracts.WalletData.DerivationPath);

	let signatory = wallet.publicKey();

	if (!signatory) {
		signatory = await wallet.coin().ledger().getPublicKey(path!);
	}

	const signature = await wallet.ledger().signMessage(path!, message);

	return {
		message,
		signatory,
		signature,
	};
};

const withAbortPromise =
	(signal?: AbortSignal) =>
	<T>(promise: Promise<T>) =>
		new Promise<T>((resolve, reject) => {
			if (signal) {
				signal.addEventListener("abort", () => reject("ERR_ABORT"));
			}

			return promise.then(resolve).catch(reject);
		});

const sign = async (
	wallet: ProfileContracts.IReadWriteWallet,
	message: string,
	mnemonic?: string,
	wif?: string,
	secret?: string,
	options?: {
		abortSignal?: AbortSignal;
	},
): Promise<Services.SignedMessage> => {
	if (wallet.isLedger()) {
		return withAbortPromise(options?.abortSignal)(signWithLedger(message, wallet));
	}

	let signatory: Signatories.Signatory;

	if (mnemonic) {
		signatory = await wallet.signatory().mnemonic(mnemonic);
	}

	if (wif) {
		signatory = await wallet.signatory().mnemonic(wif);
	}

	if (secret) {
		signatory = await wallet.signatory().secret(secret);
	}

	// @ts-ignore
	return wallet.message().sign({ message, signatory });
};

// @TODO: extract this into the SDK/Profiles
export const useMessageSigner = () => ({ sign });
