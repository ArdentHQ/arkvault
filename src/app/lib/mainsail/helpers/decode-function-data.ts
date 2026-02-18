import { decodeFunctionData as viemDecodeFunctionData, Hex } from "viem";
import { ConsensusContract, MultipaymentContract, UsernamesContract } from "@arkecosystem/typescript-crypto";

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
		[AbiType.Consensus]: ConsensusContract.abi,
		[AbiType.Username]: UsernamesContract.abi,
		[AbiType.MultiPayment]: MultipaymentContract.abi,
	};

	try {
		return viemDecodeFunctionData({
			abi: abiMap[abiType],
			data,
		}) as FunctionData;
	} catch (error) {
		throw new Error(error.message);
	}
};
