import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { TransactionFees } from "@/types";
import { useCallback } from "react";
import { useEnvironmentContext } from "@/app/contexts";
import { EncodeInputData, EncodeTransactionType, TransactionEncoder } from "@/app/lib/mainsail/transaction-encoder";

interface CreateStubTransactionProperties {
	getData: () => Record<string, any>;
	stub: boolean;
	type: string;
}

interface CalculateBySizeProperties {
	data: Record<string, any>;
	type: string;
}

interface EstimateGasProperties {
	data: EncodeInputData;
	type: EncodeTransactionType;
}

interface CalculateProperties {
	coin: string;
	data?: Record<string, any>;
	network: string;
	type: string;
}

export const useFees = (profile: Contracts.IProfile) => {
	const { env } = useEnvironmentContext();

	const createStubTransaction = useCallback(
		async ({ type, getData, stub }: CreateStubTransactionProperties) => {
			const { mnemonic, wallet } = await profile.walletFactory().generate();

			const signatory = stub
				? await wallet.signatory().stub(mnemonic)
				: await wallet.signatory().mnemonic(mnemonic);

			return wallet.transactionService()[type]({
				data: getData(),
				nonce: "1",
				signatory,
			});
		},
		[profile],
	);

	const calculateBySize = useCallback(
		async ({ data, type }: CalculateBySizeProperties): Promise<TransactionFees> => {
			try {
				const transaction = await createStubTransaction({
					getData: () => data,
					stub: type === "multiSignature",
					type,
				});

				const fees = profile.activeNetwork().fees();

				const [min, avg, max] = await Promise.all([
					fees.calculate(transaction, { priority: "slow" }),
					fees.calculate(transaction, { priority: "average" }),
					fees.calculate(transaction, { priority: "fast" }),
				]);

				return {
					avg,
					max,
					min,
				};
			} catch {
				return {
					avg: BigNumber.make(0),
					max: BigNumber.make(0),
					min: BigNumber.make(0),
				};
			}
		},
		[createStubTransaction],
	);

	const estimateGas = useCallback(
		async ({ type, data: formData }: EstimateGasProperties) => {
			const gas = await profile
				.activeNetwork()
				.fees()
				.estimateGas({
					from: formData.senderAddress,
					...new TransactionEncoder(profile.activeNetwork()).byType(formData, type),
				});

			// Add 20% buffer on the gas, in case the estimate is too low.
			// @see https://app.clickup.com/t/86dxe6nxx
			return gas.times(1.2).integerValue();
		},
		[profile],
	);

	const calculate = useCallback(
		async ({ network, type: typeFromForm, data }: CalculateProperties): Promise<TransactionFees> => {
			await env.fees().sync(profile);

			const type = typeFromForm === "updateValidator" ? "evmCall" : typeFromForm;

			const transactionFees = env.fees().findByType(network, type);

			if (!!data && type === "multiSignature") {
				const feesBySize = await calculateBySize({ data, type });

				return {
					...feesBySize,
				};
			}

			return {
				avg: transactionFees.avg,
				max: transactionFees.max,
				min: transactionFees.min,
			};
		},
		[profile, calculateBySize, env],
	);

	return { calculate, estimateGas };
};
