import { Coins, Services } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { useCallback } from "react";

import { useEnvironmentContext } from "@/app/contexts";
import { TransactionFees } from "@/types";
import { assertString } from "@/utils/assertions";

interface CreateStubTransactionProperties {
	coin: Coins.Coin;
	getData: (wallet: Contracts.IReadWriteWallet) => Record<string, any>;
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

	const getMuSigData = (senderWallet: Contracts.IReadWriteWallet, data: Record<string, any>) => {
		const participants = data?.participants ?? [];
		const minParticipants = data?.minParticipants ?? 2;

		const publicKey = senderWallet.publicKey();
		assertString(publicKey);

		const publicKeys = participants.map((participant: any) => participant.publicKey);

		// Some coins like ARK, throw error if signatory's public key is not included in musig participants public keys.
		publicKeys.splice(1, 1, publicKey);

		return {
			// LSK
			mandatoryKeys: publicKeys,

			// TODO: handle fields in sdk
			// ARK
			min: +minParticipants,

			numberOfSignatures: +minParticipants,
			optionalKeys: [],
			publicKeys,
			senderPublicKey: publicKey,
		};
	};

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
				data: getData(wallet),
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
					getData: (senderWallet) => {
						if (type === "multiSignature") {
							return getMuSigData(senderWallet, data);
						}

						return data;
					},
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
				avg: transactionFees.avg.toHuman(),
				isDynamic: transactionFees.isDynamic,
				max: transactionFees.max.toHuman(),
				min: transactionFees.min.toHuman(),
				static: transactionFees.static.toHuman(),
			};
		},
		[profile, calculateBySize, env],
	);

	return { calculate };
};
