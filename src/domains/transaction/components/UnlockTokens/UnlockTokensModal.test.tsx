import { Signatories } from "@ardenthq/sdk";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { UnlockTokensModal } from "./UnlockTokensModal";
import * as useFeesHook from "@/app/hooks/use-fees";
import { buildTranslations } from "@/app/i18n/helpers";
import transactionFixture from "@/tests/fixtures/coins/lsk/testnet/transactions/unlock-token.json";
import { env, MNEMONICS, render, screen, waitFor, within } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

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
		profile = await env.profiles().create("empty");

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic,
			network: "ark.devnet",
		});

		vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve({ avg: fee, max: fee, min: fee, static: fee }),
		});

		// items mock

		vi.spyOn(wallet.coin().client(), "unlockableBalances").mockResolvedValue({
			current: BigNumber.make(30),
			objects: [unlockableBalanceItemMock],
			pending: BigNumber.make(0),
		});

		// wallet mocks

		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);
		vi.spyOn(wallet, "isMultiSignature").mockReturnValue(false);
		vi.spyOn(wallet, "isDelegate").mockReturnValue(false);
		vi.spyOn(wallet, "isResignedDelegate").mockReturnValue(false);

		// transaction mocks

		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
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

	beforeEach(() => {
		server.use(requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }));
	});

	it("should render", async () => {
		const onClose = vi.fn();

		render(
			<Route path="/profiles/:profileId">
				<UnlockTokensModal wallet={wallet} onClose={onClose} profile={profile} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("UnlockTokensModal")).resolves.toBeVisible();

		userEvent.click(screen.getByText(translations.COMMON.CLOSE));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it.each(["success", "error"])("should handle unlock token transaction with %s", async (expectedOutcome) => {
		render(
			<Route path="/profiles/:profileId">
				<UnlockTokensModal wallet={wallet} onClose={vi.fn()} profile={profile} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await expect(screen.findByTestId("UnlockTokensModal")).resolves.toBeVisible();

		expect(screen.getAllByTestId("TableRow")).toHaveLength(1);

		await waitFor(() => {
			expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(2);
		});

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

		// enter signing key

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), mnemonic);

		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(mnemonic));

		// send transaction

		const signMock = vi
			.spyOn(wallet.transaction(), "signUnlockToken")
			.mockResolvedValue(transactionFixture.data.id);

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue(
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

		await waitFor(() => {
			expect(screen.getByTestId("UnlockTokensAuthentication__send")).toBeEnabled();
		});

		userEvent.click(screen.getByTestId("UnlockTokensAuthentication__send"));

		if (expectedOutcome === "success") {
			await waitFor(() => {
				expect(screen.getByTestId("TransactionSuccessful")).toBeInTheDocument();
			});
		} else {
			await waitFor(() => {
				expect(screen.getByTestId("ErrorStep__errorMessage")).toBeInTheDocument();
			});
		}

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
