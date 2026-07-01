import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import * as ReactRouter from "react-router";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { FormProvider, useForm } from "react-hook-form";
import { ConfirmTransferStep } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/ConfirmTransferStep";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("#ConfirmTransferStep", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		const fixtureData = Fixtures.ByContractAddress.data;
		const walletTokenData = Fixtures.ByWalletAddress.data[0];

		profile
			.wallets()
			.first()
			.tokens()
			.create({
				token: new TokenDTO(fixtureData),
				walletToken: new WalletTokenDTO(walletTokenData),
			});

		const tokensCollection = new WalletTokenCollection(
			[
				new WalletToken({
					network: profile.activeNetwork(),
					profile,
					token: new TokenDTO(fixtureData),
					walletToken: new WalletTokenDTO(walletTokenData),
				}),
			],
			{
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
			},
		);

		vi.spyOn(profile.tokens(), "selected").mockReturnValue(tokensCollection);
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	const Component = () => {
		const form = useForm({
			defaultValues: {},
			mode: "onChange",
		});

		form.register("recipients");
		form.register("tokenContractAddress");

		form.setValue("tokenContractAddress", profile.tokens().selected().first().token().address());
		form.setValue("recipients", [
			{ address: wallet.address(), amount: 1 },
			{ address: wallet.address(), amount: 2 },
		]);

		return (
			<FormProvider {...form}>
				<ConfirmTransferStep wallet={wallet} />
			</FormProvider>
		);
	};

	it("should display recipients modal", async () => {
		render(<Component />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		const confirmTransferStepID = "BatchTransfer__confirm-transfer-step";
		await expect(screen.findByTestId(confirmTransferStepID)).resolves.toBeVisible();

		// Display recipients modal
		await userEvent.click(screen.getByTestId("TransactionRecipientsModal--ShowList"));
		await expect(screen.findByTestId("RecipientsModal")).resolves.toBeVisible();

		// Close recipients modal
		await userEvent.click(screen.getByTestId("Modal__close-button"));
		await waitFor(() => {
			expect(screen.queryByTestId("RecipientsModal")).not.toBeInTheDocument();
		});
	});
});
