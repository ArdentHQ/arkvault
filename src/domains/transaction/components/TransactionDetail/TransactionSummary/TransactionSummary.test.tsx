import React from "react";
import { Contracts, DTO } from "@/app/lib/profiles";
import { env, getDefaultProfileId, screen, render } from "@/utils/testing-library";
import { TransactionSummary } from "./TransactionSummary";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { BigNumber } from "@/app/lib/helpers";

describe("TransactionSummary", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should show amount if it is not zero", () => {
		const transaction = {
			...TransactionFixture,
			isValidatorRegistration: () => false,
			value: () => BigNumber.make(10),
		} as DTO.ExtendedSignedTransactionData;

		render(
			<TransactionSummary transaction={transaction} senderWallet={profile.wallets().first()} profile={profile} />,
		);

		expect(screen.getByTestId("TransactionSummary__Amount")).toBeInTheDocument();
	});

	it("should hide amount if it is zero and it is not a validator registration", () => {
		const transaction = {
			...TransactionFixture,
			isValidatorRegistration: () => false,
			value: () => BigNumber.make(0),
		} as DTO.ExtendedSignedTransactionData;

		render(
			<TransactionSummary transaction={transaction} senderWallet={profile.wallets().first()} profile={profile} />,
		);

		expect(screen.queryByTestId("TransactionSummary__Amount")).not.toBeInTheDocument();
	});

	it("should show amount if it is a validator registration and is not confirmed", () => {
		const transaction = {
			...TransactionFixture,
			isConfirmed: () => false,
			isValidatorRegistration: () => true,
			value: () => BigNumber.make(0),
		} as DTO.ExtendedSignedTransactionData;

		render(
			<TransactionSummary transaction={transaction} senderWallet={profile.wallets().first()} profile={profile} />,
		);

		expect(screen.getByTestId("TransactionSummary__Amount")).toBeInTheDocument();
	});

	it("should show amount if it is a validator registration and is confirmed and successful", () => {
		const transaction = {
			...TransactionFixture,
			isConfirmed: () => true,
			isSuccess: () => true,
			isValidatorRegistration: () => true,
			value: () => BigNumber.make(0),
		} as DTO.ExtendedConfirmedTransactionData;

		render(
			<TransactionSummary transaction={transaction} senderWallet={profile.wallets().first()} profile={profile} />,
		);

		expect(screen.getByTestId("TransactionSummary__Amount")).toBeInTheDocument();
	});

	it("should hide amount if it is a validator registration and is confirmed but not successful", () => {
		const transaction = {
			...TransactionFixture,
			isConfirmed: () => true,
			isSuccess: () => false,
			isValidatorRegistration: () => true,
			value: () => BigNumber.make(0),
		} as DTO.ExtendedConfirmedTransactionData;

		render(
			<TransactionSummary transaction={transaction} senderWallet={profile.wallets().first()} profile={profile} />,
		);

		expect(screen.queryByTestId("TransactionSummary__Amount")).not.toBeInTheDocument();
	});

	it("shows the validator fee if the transaction is a validator resignation and it has a validator fee", () => {
		const wallet = profile.wallets().first();

		const validatorFeeMock = vi.spyOn(wallet, "validatorFee").mockReturnValue(100);

		const transaction = {
			...TransactionFixture,
			isValidatorResignation: () => true,
		} as Contracts.SignedTransactionData;

		render(<TransactionSummary transaction={transaction} senderWallet={wallet} profile={profile} />);

		expect(screen.getByTestId("TransactionSummary__ValidatorFee")).toBeInTheDocument();

		expect(screen.queryByTestId("TransactionSummary__ValidatorFee__Tooltip")).not.toBeInTheDocument();

		validatorFeeMock.mockRestore();
	});
	it("shows the validator fee if the transaction is a validator resignation and it has a validator fee of 0", () => {
		const wallet = profile.wallets().first();

		const validatorFeeMock = vi.spyOn(wallet, "validatorFee").mockReturnValue(0);

		const transaction = {
			...TransactionFixture,
			isValidatorResignation: () => true,
		} as Contracts.SignedTransactionData;

		render(<TransactionSummary transaction={transaction} senderWallet={wallet} profile={profile} />);

		expect(screen.getByTestId("TransactionSummary__ValidatorFee")).toBeInTheDocument();

		expect(screen.getByTestId("TransactionSummary__ValidatorFee__Tooltip")).toBeInTheDocument();

		validatorFeeMock.mockRestore();
	});

	it("does not shows the validator fee if the transaction is not a validator resignation", () => {
		const wallet = profile.wallets().first();

		const validatorFeeMock = vi.spyOn(wallet, "validatorFee").mockReturnValue(100);

		const transaction = {
			...TransactionFixture,
			isValidatorResignation: () => false,
		} as Contracts.SignedTransactionData;

		render(<TransactionSummary transaction={transaction} senderWallet={wallet} profile={profile} />);

		expect(screen.queryByTestId("TransactionSummary__ValidatorFee")).not.toBeInTheDocument();

		validatorFeeMock.mockRestore();
	});

	it("does not shows the validator fee if the validator fee is not defined", () => {
		const wallet = profile.wallets().first();

		const validatorFeeMock = vi.spyOn(wallet, "validatorFee").mockReturnValue(undefined);

		const transaction = {
			...TransactionFixture,
			isValidatorResignation: () => true,
		} as Contracts.SignedTransactionData;

		render(<TransactionSummary transaction={transaction} senderWallet={wallet} profile={profile} />);

		expect(screen.queryByTestId("TransactionSummary__ValidatorFee")).not.toBeInTheDocument();

		validatorFeeMock.mockRestore();
	});
});
