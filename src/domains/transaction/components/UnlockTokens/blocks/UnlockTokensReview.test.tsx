import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { UnlockTokensReview } from "./UnlockTokensReview";
import { buildTranslations } from "@/app/i18n/helpers";
import { UnlockTokensFormState } from "@/domains/transaction/components/UnlockTokens/UnlockTokens.contracts";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

const translations = buildTranslations();

describe("UnlockTokensReview", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		vi.spyOn(wallet, "currency").mockReturnValue("LSK");
		vi.spyOn(wallet, "alias").mockReturnValue("LSK Wallet 1");
	});

	it("should render", async () => {
		const onBack = vi.fn();
		const onConfirm = vi.fn();

		const { result } = renderHook(() =>
			useForm<UnlockTokensFormState>({
				defaultValues: {
					amount: 10,
					fee: 5,
					selectedObjects: [],
				},
				mode: "onChange",
			}),
		);

		result.current.register("amount");
		result.current.register("fee");

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<FormProvider {...result.current}>
					<UnlockTokensReview onBack={onBack} onConfirm={onConfirm} wallet={wallet} />
				</FormProvider>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByText(translations.TRANSACTION.UNLOCK_TOKENS.REVIEW.TITLE)).toBeInTheDocument();

		expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("+ 10 LSK");
		expect(screen.getAllByTestId("Amount")[1]).toHaveTextContent("5 LSK");

		await userEvent.click(screen.getByText(translations.COMMON.BACK));

		expect(onBack).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));

		await userEvent.click(screen.getByText(translations.COMMON.CONFIRM));

		expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));

		expect(asFragment()).toMatchSnapshot();
	});
});
