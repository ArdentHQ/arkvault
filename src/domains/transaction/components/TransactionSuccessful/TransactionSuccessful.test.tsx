import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";

import { TransactionSuccessful } from "./TransactionSuccessful";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

describe("TransactionSuccessful", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();

		server.use(
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/ea63bf9a4b3eaf75a1dfff721967c45dce64eb7facf1aef29461868681b5c79b",
				transactionsFixture,
			),
		);
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
			timestamp: () => ({
				unix: () => 1630497600,
				format: () => "2021-09-01 12:00",
			}),
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

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

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

	it("should render successfull screen if it's a multisignature registration", async () => {
		const transaction = {
			...TransactionFixture,
			get: () => ({
				min: 2,
				publicKeys: [
					"03af2feb4fc97301e16d6a877d5b135417e8f284d40fac0f84c09ca37f82886c51",
					"03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
				],
			}),
			isConfirmed: () => true,
			isMultiSignatureRegistration: () => true,
			type: () => "multiSignature",
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		render(
			<Route path="/profiles/:profileId">
				<TransactionSuccessful senderWallet={wallet} transaction={transaction} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByText("Participants")).resolves.toBeVisible();

		vi.restoreAllMocks();
	});

	it("should render successfull screen if it uses multisignature", async () => {
		const transaction = {
			...TransactionFixture,
			isConfirmed: () => true,
			isMultiSignatureRegistration: () => true,
			type: () => "multiSignature",
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

		await expect(screen.findByText("Participants")).resolves.toBeVisible();

		vi.restoreAllMocks();
	});
});
