import { decodeFunctionData as viemDecodeFunctionData, Hex } from "viem";
import {
	ConsensusContract,
	MultipaymentContract,
	UsernamesContract,
	TokenContract,
} from "@arkecosystem/typescript-crypto";

interface FunctionData {
	functionName: string;
	args: any[];
}

export enum AbiType {
	"Consensus" = "consensus",
	"Username" = "username",
	"MultiPayment" = "multiPayment",
	"Token" = "token",
}

export const decodeFunctionData = (data: Hex, abiType: AbiType = AbiType.Consensus): FunctionData => {
	const abiMap: Record<AbiType, any> = {
		[AbiType.Consensus]: ConsensusContract.abi,
		[AbiType.Username]: UsernamesContract.abi,
		[AbiType.MultiPayment]: MultipaymentContract.abi,
		[AbiType.Token]: TokenContract.abi,
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
