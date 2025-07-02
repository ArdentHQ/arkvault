/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Exceptions } from "@/app/lib/mainsail";
import { FunctionSigs } from "@mainsail/evm-contracts";
import { ConsensusContract, MultipaymentContract, UsernamesContract } from "@arkecosystem/typescript-crypto";

type TransactionData = Record<string, any>;

export const TransactionTypes = {
	MultiPayment: `0x${MultipaymentContract.methodIdentifiers["pay(address[],uint256[])"]}`,
	RegisterUsername: `0x${UsernamesContract.methodIdentifiers["registerUsername(string)"]}`,
	ResignUsername: `0x${UsernamesContract.methodIdentifiers["resignUsername(string)"]}`,
	Transfer: "",
	...FunctionSigs.ConsensusV1,
} as const;


export const trimHexPrefix = (type: string): string => type.replace(/^0x/, "");

const getFunctionIdentifiers = (contract: {
	abi: {
		type: string;
		name: string;
		inputs: { type: string }[];
	}[];
	methodIdentifiers: Record<string, string>;
}): Record<string, string> => {
	const result = {};

	for (const func of contract.abi.filter((item) => item.type === "function")) {
		const inputs = func.inputs.map((index) => index.type).join(",");
		const signature = `${func.name}(${inputs})`;

		const identifier = contract.methodIdentifiers?.[signature];

		if (identifier) {
			result[func.name] = identifier;
		}
	}

	return result;
};
export class TransactionTypeService {
	static #functionIdentifiers: Record<string, string>;

	public static isTransfer(data: TransactionData): boolean {
		return data.data === "";
	}

	public static isSecondSignature(data: TransactionData): boolean {
		throw new Exceptions.NotImplemented(this.constructor.name, this.isSecondSignature.name);
	}

	public static isValidatorRegistration(data: TransactionData): boolean {
		return TransactionTypeService.#checkFunctionIdentifier("registerValidator", data);
	}

	public static isVoteCombination(data: TransactionData): boolean {
		return false;
	}

	public static isVote(data: TransactionData): boolean {
		return TransactionTypeService.#checkFunctionIdentifier("vote", data);
	}

	public static isUnvote(data: TransactionData): boolean {
		return TransactionTypeService.#checkFunctionIdentifier("unvote", data);
	}

	public static isMultiPayment(data: TransactionData): boolean {
		return TransactionTypeService.#checkFunctionIdentifier("pay", data);
	}

	public static isUsernameRegistration(data: TransactionData): boolean {
		return TransactionTypeService.#checkFunctionIdentifier("registerUsername", data);
	}

	public static isUsernameResignation(data: TransactionData): boolean {
		return TransactionTypeService.#checkFunctionIdentifier("resignUsername", data);
	}

	public static isValidatorResignation(data: TransactionData): boolean {
		return TransactionTypeService.#checkFunctionIdentifier("resignValidator", data);
	}

	static #checkFunctionIdentifier(identifierName: string, data: TransactionData): boolean {
		// get function itentiferes and store them in a static variable
		if (!TransactionTypeService.#functionIdentifiers) {
			TransactionTypeService.#functionIdentifiers = {
				...getFunctionIdentifiers(UsernamesContract),
				...getFunctionIdentifiers(ConsensusContract),
				...getFunctionIdentifiers(MultipaymentContract),
			};
		} 

		const identifier = TransactionTypeService.#functionIdentifiers[identifierName];

		if (!identifier) {
			return false;
		}

		return data.data.includes(identifier);
	}
}
