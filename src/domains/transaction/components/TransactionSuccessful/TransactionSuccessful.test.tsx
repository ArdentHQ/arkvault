import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";

import { TransactionSuccessful } from "./TransactionSuccessful";
import * as useConfirmedTransactionMock from "./hooks/useConfirmedTransaction";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

console.log(useConfirmedTransactionMock);

describe("TransactionSuccessful", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();

		vi.spyOn(useConfirmedTransactionMock, "useConfirmedTransaction").mockReturnValue(true);
	});

	const transactionMockImplementation = (attribute, transaction) => {
		if (attribute === "multiSignature") {
			return {
				min: 2,
				publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()],
			};
		}

		return transaction[attribute]();
	};

	it("should render", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		vi.spyOn(transaction, "isMultiSignatureRegistration").mockReturnValue(false);
		vi.spyOn(transaction, "usesMultiSignature").mockReturnValue(false);

		render(
			<Route path="/profiles/:profileId">
				<TransactionSuccessful senderWallet={wallet} transaction={transaction} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());

		expect(screen.getByTestId("TransactionSuccessful")).toBeInTheDocument();

		vi.restoreAllMocks();
	});

	it("should render as pending", () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		vi.spyOn(transaction, "isMultiSignatureRegistration").mockReturnValue(false);
		vi.spyOn(transaction, "usesMultiSignature").mockReturnValue(false);

		vi.spyOn(useConfirmedTransactionMock, "useConfirmedTransaction").mockReturnValue(false);

		render(
			<Route path="/profiles/:profileId">
				<TransactionSuccessful senderWallet={wallet} transaction={transaction} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByTestId("TransactionPending")).toBeInTheDocument();

		vi.restoreAllMocks();
	});

	it("should render with custom title and description", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		vi.spyOn(transaction, "isMultiSignatureRegistration").mockReturnValue(false);
		vi.spyOn(transaction, "usesMultiSignature").mockReturnValue(false);

		render(
			<Route path="/profiles/:profileId">
				<TransactionSuccessful
					senderWallet={wallet}
					transaction={transaction}
					title="Title"
					description="Description"
				/>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByTestId("TransactionSuccessful")).toBeInTheDocument();

		await expect(screen.findByText("Title")).resolves.toBeInTheDocument();
		await expect(screen.findAllByText("Description")).resolves.toHaveLength(2);

		vi.restoreAllMocks();
	});

	it("should render successfull screen if it's a multisignature registration", () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		vi.spyOn(transaction, "isMultiSignatureRegistration").mockReturnValue(true);

		render(
			<Route path="/profiles/:profileId">
				<TransactionSuccessful senderWallet={wallet} transaction={transaction} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByTestId("TransactionSuccessful")).toBeInTheDocument();

		vi.restoreAllMocks();
	});

	it("should render successfull screen if it uses multisignature", () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		vi.spyOn(transaction, "usesMultiSignature").mockReturnValue(true);

		render(
			<Route path="/profiles/:profileId">
				<TransactionSuccessful senderWallet={wallet} transaction={transaction} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByTestId("TransactionSuccessful")).toBeInTheDocument();

		vi.restoreAllMocks();
	});
});
