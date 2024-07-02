import { Coins, Networks } from "@ardenthq/sdk";
import { Contracts, DTO, Profile, Wallet } from "@ardenthq/sdk-profiles";
import { AssertionError } from "assert";

export function assertProfile(profile?: Contracts.IProfile): asserts profile is Profile {
	if (!(profile instanceof Profile)) {
		throw new AssertionError({
			message: `Expected 'profile' to be Contracts.IProfile, but received ${profile}`,
		});
	}
}

export function assertWallet(wallet?: Contracts.IReadWriteWallet): asserts wallet is Wallet {
	if (!(wallet instanceof Wallet)) {
		throw new AssertionError({
			message: `Expected 'wallet' to be Contracts.IReadWriteWallet, but received ${wallet}`,
		});
	}
}

export function assertReadOnlyWallet(wallet?: Contracts.IReadOnlyWallet): asserts wallet is Contracts.IReadOnlyWallet {
	if (typeof wallet?.governanceIdentifier !== "function") {
		throw new AssertionError({
			message: `Expected 'wallet' to be Contracts.IReadOnlyWallet, but received ${wallet}`,
		});
	}
}

export function assertCoin(coin?: Coins.Coin): asserts coin is Coins.Coin {
	if (!(coin instanceof Coins.Coin)) {
		throw new AssertionError({
			message: `Expected 'coin' to be Coins.Coin, but received ${coin}`,
		});
	}
}

export function assertNetwork(network?: Networks.Network): asserts network is Networks.Network {
	if (typeof network?.isLive !== "function") {
		throw new AssertionError({
			message: `Expected 'network' to be Networks.Network, but received ${network}`,
		});
	}
	return undefined;
}

export function assertSignedTransaction(
	transaction?: DTO.ExtendedSignedTransactionData,
): asserts transaction is DTO.ExtendedSignedTransactionData {
	if (!(transaction instanceof DTO.ExtendedSignedTransactionData)) {
		throw new AssertionError({
			message: `Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received ${transaction}`,
		});
	}
}

export function assertConfirmedTransaction(
	transaction?: DTO.ExtendedConfirmedTransactionData,
): asserts transaction is DTO.ExtendedConfirmedTransactionData {
	if (!(transaction instanceof DTO.ExtendedConfirmedTransactionData)) {
		throw new AssertionError({
			message: `Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received ${transaction}`,
		});
	}
}

export function assertArray(value: unknown): asserts value is NonNullable<any[]> {
	if (!Array.isArray(value)) {
		throw new AssertionError({
			message: `Expected 'value' to be array, but received ${value}`,
		});
	}
}

export function assertString(value: unknown): asserts value is NonNullable<string> {
	if (typeof value !== "string" || value.trim() === "") {
		throw new AssertionError({
			message: `Expected 'value' to be string, but received ${value}`,
		});
	}
}

export function assertNumber(value: unknown): asserts value is NonNullable<number> {
	if (typeof value !== "number" || value > Number.MAX_SAFE_INTEGER || Number.isNaN(value)) {
		throw new AssertionError({
			message: `Expected 'value' to be number, but received ${value}`,
		});
	}
}
