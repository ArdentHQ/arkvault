import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { UnlockTokensTotal } from "./UnlockTokensTotal";
import { buildTranslations } from "@/app/i18n/helpers";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

const translations = buildTranslations();

describe("UnlockTokensTotal", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		const profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();

		vi.spyOn(wallet, "currency").mockReturnValue("LSK");
	});

	it("should render", () => {
		const { asFragment } = render(
			<UnlockTokensTotal isLoading={false} isLoadingFee={false} amount={10} fee={8} wallet={wallet} />,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading", () => {
		const { asFragment } = render(
			<UnlockTokensTotal isLoading={true} isLoadingFee={false} amount={10} fee={8} wallet={wallet} />,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render loading fee", () => {
		const { asFragment } = render(
			<UnlockTokensTotal isLoading={false} isLoadingFee={true} amount={10} fee={8} wallet={wallet} />,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show hint when balance is less than the fee", async () => {
		vi.spyOn(wallet, "balance").mockReturnValueOnce(5);

		render(<UnlockTokensTotal isLoading={false} isLoadingFee={false} amount={10} fee={8} wallet={wallet} />);

		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("AmountLabel__hint"));

		const hintText = translations.TRANSACTION.UNLOCK_TOKENS.INSUFFICIENT_BALANCE_HINT.replace(
			"{{currency}}",
			wallet.currency(),
		);

		expect(screen.getByText(hintText)).toBeInTheDocument();
	});
});
