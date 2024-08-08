import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { UnlockTokensAuthentication } from "./UnlockTokensAuthentication";
import { buildTranslations } from "@/app/i18n/helpers";
import { env, getDefaultProfileId, renderWithForm, screen } from "@/utils/testing-library";

const translations = buildTranslations();

describe("UnlockTokensAuthentication", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		const profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();
	});

	it("should render", async () => {
		const onBack = vi.fn();

		const { asFragment } = renderWithForm(<UnlockTokensAuthentication wallet={wallet} onBack={onBack} />, {
			withProviders: true,
		});

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByText(translations.COMMON.BACK));

		expect(onBack).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
		expect(asFragment()).toMatchSnapshot();
	});
});
