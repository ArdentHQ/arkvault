import React from "react";

import { Route } from "react-router-dom";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, render, screen, getDefaultProfileId, MNEMONICS, triggerMessageSignOnce } from "@/utils/testing-library";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import userEvent from "@testing-library/user-event";
import { TransactionAmountLabel, TransactionFiatAmount } from "./TransactionAmount.blocks";
import { createHashHistory } from "history";
import { Contracts } from "@ardenthq/sdk-profiles";

const history = createHashHistory();

const walletUrl = (walletId: string) => `/profiles/${getDefaultProfileId()}/wallets/${walletId}`;

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const mnemonic = MNEMONICS[0];

describe("TransactionAmount.blocks", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic,
			network: "ark.devnet",
		});

		profile.wallets().push(wallet);

		profile.coins().set("ARK", "ark.devnet");

		await triggerMessageSignOnce(wallet);
	});

	beforeEach(() => {
		history.push(walletUrl(wallet.id()));
	});

	const path = "/profiles/:profileId/wallets/:walletId";

	const fixture = {
		...TransactionFixture,
		fee: () => 5,
		isMultiPayment: () => true,
		isReturn: () => true,
		recipients: () => [
			{ address: "address-1", amount: 10 },
			{ address: "address-2", amount: 20 },
			{ address: TransactionFixture.wallet().address(), amount: 30 },
		],
		total: () => 65,
		wallet: () => ({
			...TransactionFixture.wallet(),
			currency: () => "DARK",
		}),
	};

	it("should show hint and amount for multiPayment transaction", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;
		const secret = "secret";

		const encryptedWallet = await profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			secret,
		});

		encryptedWallet.signingKey().set(secret, "password");

		encryptedWallet
			.data()
			.set(Contracts.WalletData.ImportMethod, Contracts.WalletImportMethod.SECRET_WITH_ENCRYPTION);

		profile.wallets().push(encryptedWallet);

		history.push(walletUrl(encryptedWallet.id()));

		const fixtureWithSender = {
			...fixture,
			recipients: () => [
				{ address: "address-1", amount: 10 },
				{ address: "address-2", amount: 20 },
				{ address: encryptedWallet.address(), amount: 30 },
			],
			sender: () => encryptedWallet.address(),
		}
		
		render(
			<Route path={path}>
				<TransactionAmountLabel transaction={fixtureWithSender as any} />
			</Route>, 
			{
				history,
				route: walletUrl(encryptedWallet.id()),
			},
		);

		// should have a label
		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("AmountLabel__hint"));

		const hintText = t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: 30, currency: "DARK" });

		expect(screen.getByText(hintText)).toBeInTheDocument();

		// should have an amount without returned amount
		expect(screen.getByText(/35 DARK/)).toBeInTheDocument();
	});

	it("should not show hint if the active wallet is not the sender of the transaction", async () => {
		const fixture = {
			...TransactionFixture,
			fee: () => 5,
			isMultiPayment: () => true,
			isReturn: () => true,
			recipients: () => [
				{ address: "address-1", amount: 10 },
				{ address: "address-2", amount: 20 },
				{ address: "address-3", amount: 30 },
			],
			total: () => 65,
			wallet: () => ({
				...TransactionFixture.wallet(),
				currency: () => "DARK",
			}),
		};

		
		render(
			<Route path={path}>
				<TransactionAmountLabel transaction={fixture as any} />
				</Route>, {
					history
			});

		expect(screen.queryByTestId("AmountLabel__hint")).not.toBeInTheDocument();
	});

	it("should show fiat value for multiPayment transaction", () => {
		const exchangeMock = vi.spyOn(env.exchangeRates(), "exchange").mockReturnValue(5);

		render(<TransactionFiatAmount transaction={fixture as any} exchangeCurrency="USD" />);

		expect(screen.getByText("$5.00")).toBeInTheDocument();

		exchangeMock.mockRestore();
	});
});
