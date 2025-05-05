import { Services } from "@/app/lib/sdk";
import { Contracts } from "@/app/lib/profiles";
import { useCallback } from "react";

import { useEnvironmentContext } from "@/app/contexts";
import { TransactionFees } from "@/types";
import { FeeService } from "@/app/lib/mainsail/fee.service";
import { TransactionService } from "@/app/lib/mainsail/transaction.service";

interface CreateStubTransactionProperties {
	getData: () => Record<string, any>;
	stub: boolean;
	type: string;
}

interface CalculateBySizeProperties {
	data: Record<string, any>;
	type: string;
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


			return (new TransactionService())[type]({
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

				const fees = new FeeService({ config: profile.activeNetwork().config(), profile });

				const [min, avg, max] = await Promise.all([
					fees.calculate(transaction, { priority: "slow" }),
					fees.calculate(transaction, { priority: "average" }),
					fees.calculate(transaction, { priority: "fast" }),
				]);

				return {
					avg: avg.toHuman(),
					max: max.toHuman(),
					min: min.toHuman(),
					static: min.toHuman(),
				};
			} catch {
				return {
					avg: 0,
					max: 0,
					min: 0,
					static: 0,
				};
			}
		},
		[createStubTransaction],
	);

	const calculate = useCallback(
		async ({ network, type, data }: CalculateProperties): Promise<TransactionFees> => {
			let transactionFees: Services.TransactionFee;

			const activeNetwork = profile.activeNetwork();

			await env.fees().sync(profile);
			transactionFees = env.fees().findByType(network, type);

			if (!!data && (activeNetwork.feeType() === "size" || type === "multiSignature")) {
				const feesBySize = await calculateBySize({ data, type });

				return {
					...feesBySize,
					isDynamic: transactionFees.isDynamic,
				};
			}

			return {
				avg: transactionFees.avg.toNumber(),
				isDynamic: transactionFees.isDynamic,
				max: transactionFees.max.toNumber(),
				min: transactionFees.min.toNumber(),
				static: transactionFees.static.toNumber(),
			};
		},
		[profile, calculateBySize, env],
	);

	return { calculate };
};
