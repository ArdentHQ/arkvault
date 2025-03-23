import { Services } from "@ardenthq/sdk";
import { isLessThan, upperFirst } from "@ardenthq/sdk-helpers";
import { Contracts as ProfileContracts, DTO } from "@ardenthq/sdk-profiles";

import { useLedgerContext } from "@/app/contexts";
import { withAbortPromise } from "@/domains/transaction/utils";

type SignFunction = (input: any) => Promise<string>;

const prepareMultiSignature = async (
	input: Services.TransactionInputs,
	wallet: ProfileContracts.IReadWriteWallet,
): Promise<Services.TransactionInputs> => ({
	...input,
	signatory: await wallet.signatory().multiSignature(wallet.multiSignature().all() as Services.MultiSignatureAsset),
});

const prepareLedger = async (input: Services.TransactionInputs, wallet: ProfileContracts.IReadWriteWallet) => {
	const signature = await wallet
		.signatory()
		.ledger(wallet.data().get<string>(ProfileContracts.WalletData.DerivationPath)!);
	console.log({ input, signature })
	// Prevents "The device is already open" exception when running the signing function
	await wallet.ledger().disconnect();

	return {
		...input,
		signatory: signature,
	};
};

export const useTransactionBuilder = () => {
	const { abortConnectionRetry } = useLedgerContext();

	const build = async (
		type: string,
		input: Services.TransactionInputs,
		wallet: ProfileContracts.IReadWriteWallet,
		options?: {
			abortSignal?: AbortSignal;
		},
	): Promise<{ uuid: string; transaction: DTO.ExtendedSignedTransactionData }> => {
		await wallet.transaction().sync();

		const service = wallet.transaction();

		console.log({ input })

		// @ts-ignore
		const signFunction = (service[`sign${upperFirst(type)}`] as SignFunction).bind(service);
		let data = {
			...input,
			gasLimit: 21_000,
			gasPrice: 10,
		};

		console.log({ data })

		if (wallet.isMultiSignature()) {
			data = await prepareMultiSignature(data, wallet);
		}

		if (wallet.isLedger()) {
			data = await withAbortPromise(options?.abortSignal, abortConnectionRetry)(prepareLedger(data, wallet));
			console.log("1", { data })
		}


		const uuid = await signFunction(data);
		console.log({ uuid })

		return {
			transaction: wallet.transaction().transaction(uuid),
			uuid,
		};
	};

	return { build };
};
