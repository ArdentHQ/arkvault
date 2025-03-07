import { decodeFunctionData as viemDecodeFunctionData, Hex } from "viem";
import { ConsensusAbi, UsernamesAbi, MultiPaymentAbi } from "@mainsail/evm-contracts";

interface FunctionData {
	functionName: string;
	args: any[];
}

export enum AbiType {
	"Consensus" = "consensus",
	"Username" = "username",
	"MultiPayment" = "multiPayment",
}

export const decodeFunctionData = (data: Hex, abiType: AbiType = AbiType.Consensus): FunctionData => {
	const abiMap: Record<AbiType, any> = {
		[AbiType.Consensus]: ConsensusAbi.abi,
		[AbiType.Username]: UsernamesAbi.abi,
		[AbiType.MultiPayment]: MultiPaymentAbi.abi,
	};

	try {
		const result = viemDecodeFunctionData({
			abi: abiMap[abiType],
			data,
		}) as FunctionData;

		return result;
	} catch (error) {
		throw new Error(error.message);
	}
};
