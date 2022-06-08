import { Signatories } from "@payvo/sdk";
import { BigNumber } from "@payvo/sdk-helpers";
import { DateTime } from "@payvo/sdk-intl";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { UnlockTokensModal } from "./UnlockTokensModal";
import { LedgerProvider } from "@/app/contexts";
import * as useFeesHook from "@/app/hooks/use-fees";
import { buildTranslations } from "@/app/i18n/helpers";
import transactionFixture from "@/tests/fixtures/coins/lsk/testnet/transactions/unlock-token.json";
import { env, MNEMONICS, render, screen, waitFor, within } from "@/utils/testing-library";

const translations = buildTranslations();

describe("UnlockTokensModal", () => {
	const mnemonic = MNEMONICS[0];
	const fee = 0.001_47;

	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	const unlockableBalanceItemMock = {
		address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		amount: BigNumber.make(30),
		height: "789",
		isReady: true,
		timestamp: DateTime.make("2020-01-01T00:00:00.000Z"),
	};

	beforeAll(async () => {
		nock.disableNetConnect();

		profile = await env.profiles().create("empty");

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic,
			network: "ark.devnet",
		});

		jest.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve({ avg: fee, max: fee, min: fee, static: fee }),
		});

		// items mock

		jest.spyOn(wallet.coin().client(), "unlockableBalances").mockResolvedValue({
			current: BigNumber.make(30),
			objects: [unlockableBalanceItemMock],
			pending: BigNumber.make(0),
		});

		// wallet mocks

		jest.spyOn(wallet, "isSecondSignature").mockReturnValue(false);
		jest.spyOn(wallet, "isMultiSignature").mockReturnValue(false);
		jest.spyOn(wallet, "isDelegate").mockReturnValue(false);
		jest.spyOn(wallet, "isResignedDelegate").mockReturnValue(false);

		// transaction mocks

		jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
			amount: () => 30,
			convertedAmount: () => 0,
			convertedFee: () => 0,
			explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
			fee: () => +transactionFixture.data.fee / 1e8,
			id: () => transactionFixture.data.id,
			isMultiSignatureRegistration: () => false,
			isUnlockToken: () => true,
			sender: () => transactionFixture.data.sender,
			timestamp: () => DateTime.make(),
			type: () => "unlockToken",
			usesMultiSignature: () => false,
			wallet: () => wallet,
		} as any);
	});

	it("should render", async () => {
		const onClose = jest.fn();

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<UnlockTokensModal wallet={wallet} onClose={onClose} profile={profile} />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("UnlockTokensModal")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByText(translations.COMMON.CLOSE));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it.each(["success", "error"])("should handle unlock token transaction with %s", async (expectedOutcome) => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<LedgerProvider>
					<UnlockTokensModal wallet={wallet} onClose={jest.fn()} profile={profile} />
				</LedgerProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("UnlockTokensModal")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		expect(screen.getAllByTestId("TableRow")).toHaveLength(1);
		expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(2);

		await waitFor(() => {
			expect(within(screen.getAllByTestId("UnlockTokensTotal")[0]).getByTestId("Amount")).toHaveTextContent(
				"+ 30 DARK",
			);
		});

		expect(within(screen.getAllByTestId("UnlockTokensTotal")[1]).getByTestId("Amount")).toHaveTextContent(
			"- 0.00147 DARK",
		);

		// continue to review step

		userEvent.click(screen.getByText(translations.TRANSACTION.UNLOCK_TOKENS.UNLOCK));

		expect(screen.getByText(translations.TRANSACTION.UNLOCK_TOKENS.REVIEW.TITLE)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		// back to select step

		userEvent.click(screen.getByText(translations.COMMON.BACK));

		await waitFor(() => {
			expect(within(screen.getAllByTestId("UnlockTokensTotal")[1]).getByTestId("Amount")).toHaveTextContent(
				"- 0.00147 DARK",
			);
		});

		// continue to review step

		userEvent.click(screen.getByText(translations.TRANSACTION.UNLOCK_TOKENS.UNLOCK));

		expect(screen.getByText(translations.TRANSACTION.UNLOCK_TOKENS.REVIEW.TITLE)).toBeInTheDocument();

		// continue to auth step

		userEvent.click(screen.getByText(translations.COMMON.CONFIRM));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		// back to review step

		userEvent.click(screen.getByText(translations.COMMON.BACK));

		expect(screen.getByText(translations.TRANSACTION.UNLOCK_TOKENS.REVIEW.TITLE)).toBeInTheDocument();

		// continue to auth step

		userEvent.click(screen.getByText(translations.COMMON.CONFIRM));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		// enter signing key

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), mnemonic);

		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(mnemonic));

		// send transaction

		const signMock = jest
			.spyOn(wallet.transaction(), "signUnlockToken")
			.mockResolvedValue(transactionFixture.data.id);

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue(
			expectedOutcome === "success"
				? {
						accepted: [transactionFixture.data.id],
						errors: {},
						rejected: [],
				  }
				: {
						accepted: [],
						errors: { error: "unable to unlock token" },
						rejected: [transactionFixture.data.id],
				  },
		);

		userEvent.click(screen.getByTestId("UnlockTokensAuthentication__send"));

		if (expectedOutcome === "success") {
			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();
		} else {
			await expect(screen.findByTestId("ErrorStep__errorMessage")).resolves.toBeVisible();
		}

		expect(asFragment()).toMatchSnapshot();

		expect(signMock).toHaveBeenCalledWith({
			data: {
				objects: [
					{
						...unlockableBalanceItemMock,
						id: expect.any(String),
					},
				],
			},
			signatory: expect.any(Signatories.Signatory),
		});

		expect(broadcastMock).toHaveBeenCalledWith(transactionFixture.data.id);

		signMock.mockRestore();
		broadcastMock.mockRestore();
	});
});
