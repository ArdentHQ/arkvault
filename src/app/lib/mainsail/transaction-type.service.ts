/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Exceptions } from "@/app/lib/mainsail";
import { FunctionSigs } from "@mainsail/evm-contracts";

type TransactionData = Record<string, any>;

export const TransactionTypes = {
	MultiPayment: "0x084ce708",
	RegisterUsername: "0x36a94134",
	ResignUsername: "0xebed6dab",
	Transfer: "",
	...FunctionSigs.ConsensusV1,
} as const;

export const trimHexPrefix = (type: string): string => type.replace(/^0x/, "");

export class TransactionTypeService {
	public static isTransfer(data: TransactionData): boolean {
		return data.data === TransactionTypes.Transfer;
	}

	public static isSecondSignature(data: TransactionData): boolean {
		throw new Exceptions.NotImplemented(this.constructor.name, this.isSecondSignature.name);
	}

	public static isValidatorRegistration(data: TransactionData): boolean {
		// When signing transaction, mainsail removes the 0x prefix form the data payload forcing these tx type checks to always be false
		// as the TransactionTypes from mainsail consensus are always prefixed with 0x.
		// @TODO: Revisit these checks. See relevant issue https://app.clickup.com/t/86dvawadc
		return data.data.includes(TransactionTypes.RegisterValidator.slice(2)); // remove `0x` prefix from api response
	}

	public static isVoteCombination(data: TransactionData): boolean {
		return false;
	}

	public static isVote(data: TransactionData): boolean {
		// When signing transaction, mainsail removes the 0x prefix form the data payload forcing these tx type checks to always be false
		// as the TransactionTypes from mainsail consensus are always prefixed with 0x.
		// @TODO: Revisit these checks. See relevant issue https://app.clickup.com/t/86dvawadc
		return data.data.includes(TransactionTypes.Vote.slice(2)); // remove `0x` prefix from api response
	}

	public static isUnvote(data: TransactionData): boolean {
		// When signing transaction, mainsail removes the 0x prefix form the data payload forcing these tx type checks to always be false
		// as the TransactionTypes from mainsail consensus are always prefixed with 0x.
		// @TODO: Revisit these checks. See relevant issue https://app.clickup.com/t/86dvawadc
		return data.data.includes(TransactionTypes.Unvote.slice(2)); // remove `0x` prefix from api response
	}

	public static isMultiPayment(data: TransactionData): boolean {
		return data.data.includes(TransactionTypes.MultiPayment.slice(2));
	}

	public static isUsernameRegistration(data: TransactionData): boolean {
		// When signing transaction, mainsail removes the 0x prefix form the data payload forcing these tx type checks to always be false
		// as the TransactionTypes from mainsail consensus are always prefixed with 0x.
		// @TODO: Revisit these checks. See relevant issue https://app.clickup.com/t/86dvawadc
		return data.data.includes(TransactionTypes.RegisterUsername.slice(2)); // remove `0x` prefix from api response
	}

	public static isUsernameResignation(data: TransactionData): boolean {
		// When signing transaction, mainsail removes the 0x prefix form the data payload forcing these tx type checks to always be false
		// as the TransactionTypes from mainsail consensus are always prefixed with 0x.
		// @TODO: Revisit these checks. See relevant issue https://app.clickup.com/t/86dvawadc
		return data.data.includes(TransactionTypes.ResignUsername.slice(2)); // remove `0x` prefix from api response
	}

	public static isValidatorResignation(data: TransactionData): boolean {
		// When signing transaction, mainsail removes the 0x prefix form the data payload forcing these tx type checks to always be false
		// as the TransactionTypes from mainsail consensus are always prefixed with 0x.
		// @TODO: Revisit these checks. See relevant issue https://app.clickup.com/t/86dvawadc
		return data.data.includes(TransactionTypes.ResignValidator.slice(2)); // remove `0x` prefix from api response
	}

	public static isUpdateValidator(data: TransactionData): boolean {
		return data.data.includes(TransactionTypes.UpdateValidator.slice(2));
	}
}
