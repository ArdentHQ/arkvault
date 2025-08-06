import { ConsensusAbi, MultiPaymentAbi, UsernamesAbi } from "@mainsail/evm-contracts";
import { ContractAddresses, UnitConverter } from "@arkecosystem/typescript-crypto";
import { encodeFunctionData, numberToHex } from "viem";

import { BigNumber } from "@/app/lib/helpers";
import { Network } from "@/app/lib/mainsail/network";
import { Contracts } from "@/app/lib/profiles";
import { EstimateGasPayload } from "@/app/lib/mainsail/fee.contract";
import { FeeService } from "@/app/lib/mainsail/fee.service";
import { TransactionFees } from "@/types";
import { useCallback } from "react";
import { useEnvironmentContext } from "@/app/contexts";

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

export function getEstimateGasParams(
	network: Network,
	formData: Record<string, any>,
	type: string,
): EstimateGasPayload {
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
			const amounts: BigNumber[] = [];

			for (const payment of recipientList) {
				recipients.push(payment.address);
				// @TODO https://app.clickup.com/t/86dwvx1ya get rid of extra BigNumber.make
				amounts.push(BigNumber.make(UnitConverter.parseUnits(payment.amount, "ark").toString()));
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
		updateValidator: () => {
			const data = encodeFunctionData({
				abi: ConsensusAbi.abi,
				args: [`0x${validatorPublicKey}`],
				functionName: "updateValidator",
			});

			return {
				data,
				to: ContractAddresses.CONSENSUS,
			};
		},
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

			const value = network.milestone()["validatorRegistrationFee"] ?? 0;

			return {
				data,
				to: ContractAddresses.CONSENSUS,
				value: numberToHex(BigNumber.make(value).toBigInt()),
			};
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
			const fees = new FeeService({ config: profile.activeNetwork().config(), profile });
			const gas = await fees.estimateGas(getEstimateGasParams(profile.activeNetwork(), formData, type));

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
