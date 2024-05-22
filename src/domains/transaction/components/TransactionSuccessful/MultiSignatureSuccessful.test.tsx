import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";

import { MultiSignatureSuccessful } from "./MultiSignatureSuccessful";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, renderResponsiveWithRoute, screen, waitFor } from "@/utils/testing-library";

describe("MultiSignatureSuccessful", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
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

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", async (breakpoint) => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		vi.spyOn(wallet, "isResignedDelegate").mockReturnValue(true);

		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId">
				<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction}>
					<div />
				</MultiSignatureSuccessful>
			</Route>,
			breakpoint,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("MultiSignatureSuccessful__publicKeys")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should render with delegate sender wallet", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		vi.spyOn(wallet, "isDelegate").mockReturnValue(true);
		vi.spyOn(wallet, "isResignedDelegate").mockReturnValue(false);

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		vi.spyOn(wallet, "isResignedDelegate").mockReturnValue(true);

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction}>
					<div />
				</MultiSignatureSuccessful>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("MultiSignatureSuccessful__publicKeys")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should render for vote with address", async () => {
		const transaction = {
			...TransactionFixture,
			data: () => ({
				toSignedData: () => ({
					asset: {
						votes: ["+022a40ea35d53eedf0341ffa17574fca844d69665ce35f224e9a6b1385575044fd"],
					},
				}),
			}),
			isVote: () => true,
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		render(
			<Route path="/profiles/:profileId">
				<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction}>
					<div />
				</MultiSignatureSuccessful>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findAllByTestId("TransactionRecipients")).resolves.toHaveLength(2);

		expect(screen.getByText("DArvWfH5nMDT38tWmo5k461vMQpRXHQWX9")).toBeInTheDocument();

		vi.restoreAllMocks();
	});

	it("should handle empty wallet and transation props", async () => {
		const { asFragment } = render(
			<MultiSignatureSuccessful senderWallet={undefined} transaction={undefined}>
				<div />
			</MultiSignatureSuccessful>,
		);

		await waitFor(() =>
			expect(screen.queryByTestId("MultiSignatureSuccessful__publicKeys")).not.toBeInTheDocument(),
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without generated address", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		vi.spyOn(transaction, "get").mockImplementation((attribute) =>
			transactionMockImplementation(attribute, transaction),
		);

		vi.spyOn(transaction.wallet().coin().address(), "fromMultiSignature").mockResolvedValue({
			address: undefined,
		});

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction}>
					<div />
				</MultiSignatureSuccessful>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("MultiSignatureSuccessful__publicKeys")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should render with ledger sender wallet", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		const derivationPath = "m/44'/1'/1'/0/0";
		const publicKey = wallet.publicKey();
		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);

		vi.spyOn(transaction, "get").mockImplementation((attribute) => {
			if (attribute === "multiSignature") {
				return {
					min: 2,
					publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()],
				};
			}

			if (attribute === Contracts.WalletData.DerivationPath) {
				return publicKey;
			}

			//@ts-ignore
			return transaction[attribute]();
		});

		vi.spyOn(wallet.data(), "get").mockImplementation((attribute) => {
			if (attribute === Contracts.WalletData.DerivationPath) {
				return derivationPath;
			}
		});

		vi.spyOn(wallet.ledger(), "getPublicKey").mockResolvedValue(publicKey!);

		vi.spyOn(transaction.wallet().coin().address(), "fromMultiSignature").mockResolvedValue({
			address: undefined,
		});

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<MultiSignatureSuccessful senderWallet={wallet} transaction={transaction}>
					<div />
				</MultiSignatureSuccessful>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("MultiSignatureSuccessful__publicKeys")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});
});
