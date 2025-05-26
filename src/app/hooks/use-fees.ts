import { Services } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { useCallback } from "react";

import { useEnvironmentContext } from "@/app/contexts";
import { TransactionFees } from "@/types";
import { FeeService } from "@/app/lib/mainsail/fee.service";
import { encodeFunctionData, numberToHex } from "viem";
import { ConsensusAbi, MultiPaymentAbi, UsernamesAbi } from "@mainsail/evm-contracts";
import { ContractAddresses, UnitConverter } from "@arkecosystem/typescript-crypto";
import { EstimateGasPayload } from "@/app/lib/mainsail/fee.contract";
import { BigNumber } from "@/app/lib/helpers";

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
	data: Record<string, any>;
	type: string;
}

interface CalculateProperties {
	coin: string;
	data?: Record<string, any>;
	network: string;
	type: string;
}

export function getEstimateGasParams(formData: Record<string, any>, type: string): EstimateGasPayload {
	const {
		senderAddress,
		recipientAddress,
		recipients: recipientList,
		username,
		validatorPublicKey,
		voteAddresses,
	} = formData;

	const paramBuilders: Record<string, () => Omit<EstimateGasPayload, "from">> = {
		multiPayment: () => {
			const recipients: string[] = [];
			const amounts: number[] = [];

			for (const payment of recipientList) {
				recipients.push(payment.address);
				amounts.push(UnitConverter.parseUnits(payment.amount, "ark").toNumber());
			}

			const value = numberToHex(BigNumber.sum(amounts).toBigInt());

			const data = encodeFunctionData({
				abi: MultiPaymentAbi.abi,
				args: [recipients, amounts],
				functionName: "pay",
			});

			return { data, to: ContractAddresses.MULTIPAYMENT, value };
		},
		transfer: () => ({ to: recipientAddress as string }),
		usernameRegistration: () => {
			const data = encodeFunctionData({
				abi: UsernamesAbi.abi,
				args: [username],
				functionName: "registerUsername",
			});

			return { data, to: ContractAddresses.USERNAMES };
		},
		usernameResignation: () => {
			const data = encodeFunctionData({
				abi: UsernamesAbi.abi,
				args: [],
				functionName: "resignUsername",
			});

			return { data, to: ContractAddresses.USERNAMES };
		},
		validatorRegistration: () => {
			const data = encodeFunctionData({
				abi: ConsensusAbi.abi,
				args: [`0x${validatorPublicKey}`],
				functionName: "registerValidator",
			});

			return { data, to: ContractAddresses.CONSENSUS };
		},
		validatorResignation: () => {
			const data = encodeFunctionData({
				abi: ConsensusAbi.abi,
				args: [],
				functionName: "resignValidator",
			});

			return { data, to: ContractAddresses.CONSENSUS };
		},
		vote: () => {
			const vote = (voteAddresses as string[]).at(0);
			const isVote = !!vote;

			const data = encodeFunctionData({
				abi: ConsensusAbi.abi,
				args: isVote ? [vote] : [],
				functionName: isVote ? "vote" : "unvote",
			});

			return { data, to: ContractAddresses.CONSENSUS };
		},
	};

	return {
		from: senderAddress,
		...paramBuilders[type](),
	};
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
				};
			} catch {
				return {
					avg: 0,
					max: 0,
					min: 0,
				};
			}
		},
		[createStubTransaction],
	);

	const estimateGas = useCallback(
		async ({ type, data: formData }: EstimateGasProperties) => {
			const fees = new FeeService({ config: profile.activeNetwork().config(), profile });
			return await fees.estimateGas(getEstimateGasParams(formData, type));
		},
		[profile],
	);

	const calculate = useCallback(
		async ({ network, type, data }: CalculateProperties): Promise<TransactionFees> => {
			let transactionFees: Services.TransactionFee;

			await env.fees().sync(profile);
			transactionFees = env.fees().findByType(network, type);

			if (!!data && type === "multiSignature") {
				const feesBySize = await calculateBySize({ data, type });

				return {
					...feesBySize,
				};
			}

			return {
				avg: transactionFees.avg.toNumber(),
				max: transactionFees.max.toNumber(),
				min: transactionFees.min.toNumber(),
			};
		},
		[profile, calculateBySize, env],
	);

	return { calculate, estimateGas };
};
