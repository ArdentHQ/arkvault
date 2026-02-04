import React from "react";
import { Contracts, DTO } from "@/app/lib/profiles";
import { env, getDefaultProfileId, screen, render } from "@/utils/testing-library";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { BigNumber } from "@/app/lib/helpers";
import { TokenDTO } from "../../../../../app/lib/profiles/token.dto";
import { TokensTransferred } from "./TokensTransferred";

describe("TokensTransferred", () => {
	let profile: Contracts.IProfile;
	const token = new TokenDTO({
		address: "0xabc",
		decimals: 18,
		deploymentHash: "0xdef",
		name: "ABC Token",
		symbol: "ABC",
		totalSupply: "12000000000",
	});

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should show amount of token transfer tx", () => {
		const wallet = profile.wallets().first();

		const transaction = {
			...TransactionFixture,
			isTokenTransfer: () => true,
			isValidatorRegistration: () => false,
			value: () => BigNumber.make(10),
			wallet: () => wallet,
		} as DTO.ExtendedSignedTransactionData;

		render(<TokensTransferred token={token} transaction={transaction} senderWallet={wallet} profile={profile} />);

		expect(screen.getByTestId("TokensTransferred__Amount")).toBeInTheDocument();
	});

	it("should show token transfer to address", () => {
		const wallet = profile.wallets().first();

		const transaction = {
			...TransactionFixture,
			isTokenTransfer: () => true,
			isValidatorRegistration: () => false,
			value: () => BigNumber.make(10),
			wallet: () => wallet,
		} as DTO.ExtendedSignedTransactionData;

		render(<TokensTransferred token={token} transaction={transaction} senderWallet={wallet} profile={profile} />);

		expect(screen.getByTestId("TokensTransferred__To")).toBeInTheDocument();
	});
});
