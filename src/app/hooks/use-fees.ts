import { Coins, Services } from "@/app/lib/sdk";
import { Contracts } from "@/app/lib/profiles";
import { useCallback } from "react";

import { useEnvironmentContext } from "@/app/contexts";
import { TransactionFees } from "@/types";

interface CreateStubTransactionProperties {
	coin: Coins.Coin;
	getData: () => Record<string, any>;
	stub: boolean;
	type: string;
}

interface CalculateBySizeProperties {
	coin: Coins.Coin;
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

	const getWallet = useCallback(
		async (coin: string, network: string) => profile.walletFactory().generate({ coin, network }),
		[profile],
	);

	const createStubTransaction = useCallback(
		async ({ coin, type, getData, stub }: CreateStubTransactionProperties) => {
			const { mnemonic, wallet } = await getWallet(coin.network().coin(), coin.network().id());

			const signatory = stub
				? await wallet.signatory().stub(mnemonic)
				: await wallet.signatory().mnemonic(mnemonic);

			return (coin.transaction() as any)[type]({
				data: getData(),
				nonce: "1",
				signatory,
			});
		},
		[getWallet],
	);

	const calculateBySize = useCallback(
		async ({ coin, data, type }: CalculateBySizeProperties): Promise<TransactionFees> => {
			try {
				const transaction = await createStubTransaction({
					coin,
					getData: () => data,
					stub: type === "multiSignature",
					type,
				});

				const [min, avg, max] = await Promise.all([
					coin.fee().calculate(transaction, { priority: "slow" }),
					coin.fee().calculate(transaction, { priority: "average" }),
					coin.fee().calculate(transaction, { priority: "fast" }),
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
		async ({ coin, network, type, data }: CalculateProperties): Promise<TransactionFees> => {
			let transactionFees: Services.TransactionFee;

			const coinInstance = profile.coins().get(coin, network);

			try {
				transactionFees = env.fees().findByType(coin, network, type);
			} catch {
				await env.fees().syncAll(profile);

				transactionFees = env.fees().findByType(coin, network, type);
			}

			if (!!data && (coinInstance.network().feeType() === "size" || type === "multiSignature")) {
				const feesBySize = await calculateBySize({ coin: coinInstance, data, type });

				return {
					...feesBySize,
					isDynamic: transactionFees?.isDynamic,
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
