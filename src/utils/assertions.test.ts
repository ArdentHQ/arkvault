/* eslint-disable unicorn/no-null */
import { beforeAll } from "vitest";
import { Networks } from "@/app/lib/mainsail";
import { Profile } from "@/app/lib/profiles/profile";
import { Wallet } from "@/app/lib/profiles/wallet";
import { env } from "@/utils/testing-library";
import { DTO } from "@/app/lib/profiles";
import manifest from "@/app/lib/mainsail/networks/mainsail.devnet";

import {
	assertArray,
	assertNetwork,
	assertNumber,
	assertProfile,
	assertReadOnlyWallet,
	assertString,
	assertWallet,
	assertSignedTransaction,
	assertConfirmedTransaction,
} from "./assertions";

let profile: Profile;

describe("#assertProfile", () => {
	beforeAll(() => {
		profile = new Profile(
			{
				data: "{}",
				id: "id",
				name: "John Doe",
			},
			env,
		);
	});
	it("should pass with a profile instance", () => {
		expect(() => assertProfile(profile)).not.toThrow();
	});

	it("should fail without a profile instance", () => {
		expect(() => assertProfile(undefined)).toThrow(
			"Expected 'profile' to be Contracts.IProfile, but received undefined",
		);
		expect(() => assertProfile(null)).toThrow("Expected 'profile' to be Contracts.IProfile, but received null");
		expect(() => assertProfile(true)).toThrow("Expected 'profile' to be Contracts.IProfile, but received true");
		expect(() => assertProfile(false)).toThrow("Expected 'profile' to be Contracts.IProfile, but received false");
		expect(() => assertProfile("")).toThrow("Expected 'profile' to be Contracts.IProfile, but received ");
		expect(() => assertProfile("a")).toThrow("Expected 'profile' to be Contracts.IProfile, but received a");
		expect(() => assertProfile(1)).toThrow("Expected 'profile' to be Contracts.IProfile, but received 1");
		expect(() => assertProfile({})).toThrow(
			"Expected 'profile' to be Contracts.IProfile, but received [object Object]",
		);
		expect(() => assertProfile([])).toThrow("Expected 'profile' to be Contracts.IProfile, but received ");
	});

	it("should not throw for a valid Profile instance (explicit)", () => {
		const anotherProfile = new Profile({ data: "{}", id: "another", name: "Another" }, env);
		expect(() => assertProfile(anotherProfile)).not.toThrow();
	});
});

describe("#assertWallet", () => {
	it("should pass with a wallet instance", () => {
		// @ts-ignore
		expect(() => assertWallet(new Wallet("id", {}, profile))).not.toThrow();
	});

	it("should fail without a profile instance", () => {
		expect(() => assertWallet(undefined)).toThrow(
			"Expected 'wallet' to be Contracts.IReadWriteWallet, but received undefined",
		);
		expect(() => assertWallet(null)).toThrow(
			"Expected 'wallet' to be Contracts.IReadWriteWallet, but received null",
		);
		expect(() => assertWallet(true)).toThrow(
			"Expected 'wallet' to be Contracts.IReadWriteWallet, but received true",
		);
		expect(() => assertWallet(false)).toThrow(
			"Expected 'wallet' to be Contracts.IReadWriteWallet, but received false",
		);
		expect(() => assertWallet("")).toThrow("Expected 'wallet' to be Contracts.IReadWriteWallet, but received ");
		expect(() => assertWallet("a")).toThrow("Expected 'wallet' to be Contracts.IReadWriteWallet, but received a");
		expect(() => assertWallet(1)).toThrow("Expected 'wallet' to be Contracts.IReadWriteWallet, but received 1");
		expect(() => assertWallet({})).toThrow(
			"Expected 'wallet' to be Contracts.IReadWriteWallet, but received [object Object]",
		);
		expect(() => assertWallet([])).toThrow("Expected 'wallet' to be Contracts.IReadWriteWallet, but received ");
	});
});

describe("#assertReadOnlyWallet", () => {
	it("should pass with a ReadOnlyWallet instance", () => {
		const mockReadOnlyWallet = {
			governanceIdentifier: () => "test",
		};
		expect(() => assertReadOnlyWallet(mockReadOnlyWallet)).not.toThrow();
	});

	it("should fail without a profile instance", () => {
		expect(() => assertReadOnlyWallet(undefined)).toThrow(
			"Expected 'wallet' to be Contracts.IReadOnlyWallet, but received undefined",
		);
		expect(() => assertReadOnlyWallet(null)).toThrow(
			"Expected 'wallet' to be Contracts.IReadOnlyWallet, but received null",
		);
		expect(() => assertReadOnlyWallet(true)).toThrow(
			"Expected 'wallet' to be Contracts.IReadOnlyWallet, but received true",
		);
		expect(() => assertReadOnlyWallet(false)).toThrow(
			"Expected 'wallet' to be Contracts.IReadOnlyWallet, but received false",
		);
		expect(() => assertReadOnlyWallet("")).toThrow(
			"Expected 'wallet' to be Contracts.IReadOnlyWallet, but received ",
		);
		expect(() => assertReadOnlyWallet("a")).toThrow(
			"Expected 'wallet' to be Contracts.IReadOnlyWallet, but received a",
		);
		expect(() => assertReadOnlyWallet(1)).toThrow(
			"Expected 'wallet' to be Contracts.IReadOnlyWallet, but received 1",
		);
		expect(() => assertReadOnlyWallet({})).toThrow(
			"Expected 'wallet' to be Contracts.IReadOnlyWallet, but received [object Object]",
		);
		expect(() => assertReadOnlyWallet([])).toThrow(
			"Expected 'wallet' to be Contracts.IReadOnlyWallet, but received ",
		);
	});
});

describe("#assertNetwork", () => {
	it("should pass with a network instance", () => {
		// @ts-ignore
		expect(() => assertNetwork(new Networks.Network({}, manifest, profile))).not.toThrow();
	});

	it("should fail without a network instance", () => {
		expect(() => assertNetwork(undefined)).toThrow(
			"Expected 'network' to be Networks.Network, but received undefined",
		);
		expect(() => assertNetwork(null)).toThrow("Expected 'network' to be Networks.Network, but received null");
		expect(() => assertNetwork(true)).toThrow("Expected 'network' to be Networks.Network, but received true");
		expect(() => assertNetwork(false)).toThrow("Expected 'network' to be Networks.Network, but received false");
		expect(() => assertNetwork("")).toThrow("Expected 'network' to be Networks.Network, but received ");
		expect(() => assertNetwork("a")).toThrow("Expected 'network' to be Networks.Network, but received a");
		expect(() => assertNetwork(1)).toThrow("Expected 'network' to be Networks.Network, but received 1");
		expect(() => assertNetwork({})).toThrow(
			"Expected 'network' to be Networks.Network, but received [object Object]",
		);
		expect(() => assertNetwork([])).toThrow("Expected 'network' to be Networks.Network, but received ");
	});
});

describe("#assertArray", () => {
	it("should pass with an array", () => {
		expect(() => assertArray(["a"])).not.toThrow();
	});

	it("should fail without an array", () => {
		expect(() => assertArray(undefined)).toThrow("Expected 'value' to be array, but received undefined");
		expect(() => assertArray(null)).toThrow("Expected 'value' to be array, but received null");
		expect(() => assertArray(true)).toThrow("Expected 'value' to be array, but received true");
		expect(() => assertArray(false)).toThrow("Expected 'value' to be array, but received false");
		expect(() => assertArray("")).toThrow("Expected 'value' to be array, but received ");
		expect(() => assertArray(1)).toThrow("Expected 'value' to be array, but received 1");
		expect(() => assertArray({})).toThrow("Expected 'value' to be array, but received [object Object]");
	});
});

describe("#assertString", () => {
	it("should pass with a string", () => {
		expect(() => assertString("a")).not.toThrow();
		expect(() => assertString(Number(1).toString())).not.toThrow();
	});

	it("should fail without a string", () => {
		expect(() => assertString(undefined)).toThrow("Expected 'value' to be string, but received undefined");
		expect(() => assertString(null)).toThrow("Expected 'value' to be string, but received null");
		expect(() => assertString(true)).toThrow("Expected 'value' to be string, but received true");
		expect(() => assertString(false)).toThrow("Expected 'value' to be string, but received false");
		expect(() => assertString("")).toThrow("Expected 'value' to be string, but received ");
		expect(() => assertString(1)).toThrow("Expected 'value' to be string, but received 1");
		expect(() => assertString({})).toThrow("Expected 'value' to be string, but received [object Object]");
		expect(() => assertString([])).toThrow("Expected 'value' to be string, but received ");
	});
});

describe("#assertNumber", () => {
	it("should pass with a number", () => {
		expect(() => assertNumber(1)).not.toThrow();
		expect(() => assertNumber(3.1)).not.toThrow();
		expect(() => assertNumber(Number(1))).not.toThrow();
		expect(() => assertNumber(Number.MAX_SAFE_INTEGER)).not.toThrow();
	});

	it("should fail without a number", () => {
		expect(() => assertNumber(undefined)).toThrow("Expected 'value' to be number, but received undefined");
		expect(() => assertNumber(null)).toThrow("Expected 'value' to be number, but received null");
		expect(() => assertNumber(true)).toThrow("Expected 'value' to be number, but received true");
		expect(() => assertNumber(false)).toThrow("Expected 'value' to be number, but received false");
		expect(() => assertNumber("")).toThrow("Expected 'value' to be number, but received ");
		expect(() => assertNumber("1")).toThrow("Expected 'value' to be number, but received 1");
		expect(() => assertNumber({})).toThrow("Expected 'value' to be number, but received [object Object]");
		expect(() => assertNumber([])).toThrow("Expected 'value' to be number, but received ");
		expect(() => assertNumber(Number.NaN)).toThrow("Expected 'value' to be number, but received NaN");
		expect(() => assertNumber(Number.MAX_SAFE_INTEGER + 1)).toThrow(
			"Expected 'value' to be number, but received 9007199254740992",
		);
	});
});

describe("#assertSignedTransaction", () => {
	it("should pass with a signed transaction instance", () => {
		expect(() => assertSignedTransaction(new DTO.ExtendedSignedTransactionData())).not.toThrow();
	});

	it("should fail with invalid types", () => {
		expect(() => assertSignedTransaction(undefined)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received undefined",
		);
		expect(() => assertSignedTransaction(null)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received null",
		);
		expect(() => assertSignedTransaction(true)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received true",
		);
		expect(() => assertSignedTransaction(false)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received false",
		);
		expect(() => assertSignedTransaction("")).toThrow(
			"Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received ",
		);
		expect(() => assertSignedTransaction("a")).toThrow(
			"Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received a",
		);
		expect(() => assertSignedTransaction(1)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received 1",
		);
		expect(() => assertSignedTransaction({})).toThrow(
			"Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received [object Object]",
		);
		expect(() => assertSignedTransaction([])).toThrow(
			"Expected 'transaction' to be DTO.ExtendedSignedTransactionData, but received ",
		);
	});
});

describe("#assertConfirmedTransaction", () => {
	it("should pass with a confirmed transaction instance", () => {
		expect(() => assertConfirmedTransaction(new DTO.ExtendedConfirmedTransactionData())).not.toThrow();
	});

	it("should fail with invalid types", () => {
		expect(() => assertConfirmedTransaction(undefined)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received undefined",
		);
		expect(() => assertConfirmedTransaction(null)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received null",
		);
		expect(() => assertConfirmedTransaction(true)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received true",
		);
		expect(() => assertConfirmedTransaction(false)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received false",
		);
		expect(() => assertConfirmedTransaction("")).toThrow(
			"Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received ",
		);
		expect(() => assertConfirmedTransaction("a")).toThrow(
			"Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received a",
		);
		expect(() => assertConfirmedTransaction(1)).toThrow(
			"Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received 1",
		);
		expect(() => assertConfirmedTransaction({})).toThrow(
			"Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received [object Object]",
		);
		expect(() => assertConfirmedTransaction([])).toThrow(
			"Expected 'transaction' to be DTO.ExtendedConfirmedTransactionData, but received ",
		);
	});
});
