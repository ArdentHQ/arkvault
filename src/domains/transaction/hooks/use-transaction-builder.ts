import { DTO, Contracts as ProfileContracts } from "@ardenthq/sdk-profiles";

import { Services } from "@ardenthq/sdk";
import { upperFirst } from "@/app/lib/helpers";
import { useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { withAbortPromise } from "@/domains/transaction/utils";
import { accessLedgerApp } from "@/app/contexts/Ledger/utils/connection";
import { httpClient } from "@/app/services";

type SignFunction = (input: any) => Promise<string>;

const prepareMultiSignature = async (
	input: Services.TransactionInputs,
	wallet: ProfileContracts.IReadWriteWallet,
): Promise<Services.TransactionInputs> => ({
	...input,
	signatory: await wallet.signatory().multiSignature(wallet.multiSignature().all() as Services.MultiSignatureAsset),
});

const prepareLedger = async (input: Services.TransactionInputs, wallet: ProfileContracts.IReadWriteWallet) => {
	await accessLedgerApp({ coin: wallet.coin() });

	const signature = await wallet
		.signatory()
		.ledger(wallet.data().get<string>(ProfileContracts.WalletData.DerivationPath)!);

	return {
		...input,
		signatory: signature,
	};
};

export const useTransactionBuilder = () => {
	const { abortConnectionRetry } = useLedgerContext();
	const { env } = useEnvironmentContext();

	const build = async (
		type: string,
		input: Services.TransactionInputs,
		wallet: ProfileContracts.IReadWriteWallet,
		options?: {
			abortSignal?: AbortSignal;
		},
	): Promise<{ uuid: string; transaction: DTO.ExtendedSignedTransactionData }> => {
		// Ensures the cache is flushed so it always fetches the latest wallet nonce
		httpClient.forgetWalletCache(env, wallet);

		await wallet.transaction().sync();

		const service = wallet.transaction();

		// @ts-ignore
		const signFunction = (service[`sign${upperFirst(type)}`] as SignFunction).bind(service);

		let data = input;

		// if (wallet.isMultiSignature()) {
		// 	data = await prepareMultiSignature(data, wallet);
		// }

		if (wallet.isLedger()) {
			data = await withAbortPromise(options?.abortSignal, abortConnectionRetry)(prepareLedger(data, wallet));
		}

		const uuid = await signFunction(data);

		return {
			transaction: wallet.transaction().transaction(uuid),
			uuid,
		};
	};

	return { build };
};
