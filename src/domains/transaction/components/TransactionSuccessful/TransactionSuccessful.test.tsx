import { Contracts } from "@/app/lib/profiles";
import React from "react";

import { TransactionSuccessful } from "./TransactionSuccessful";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";

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
				"https://dwallets-evm.mainsailhq.com/api/blocks/*",
				{ data: {} }, // Basic mock for block data
			),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/ea63bf9a4b3eaf75a1dfff721967c45dce64eb7facf1aef29461868681b5c79b",
				transactionFixture
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
			timestamp: () => ({
				format: () => "2021-09-01 12:00",
				unix: () => 1_630_497_600,
			}),
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		vi.spyOn(transaction, "isMultiSignatureRegistration").mockReturnValue(false);
		vi.spyOn(transaction, "usesMultiSignature").mockReturnValue(false);

		render(<TransactionSuccessful senderWallet={wallet} transaction={transaction} />, {
			route: `/profiles/${profile.id()}`,
		});

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

		render(<TransactionSuccessful senderWallet={wallet} transaction={transaction} />, {
			route: `/profiles/${profile.id()}`,
		});

		expect(screen.getByTestId("TransactionPending")).toBeInTheDocument();

		vi.restoreAllMocks();
	});
});
