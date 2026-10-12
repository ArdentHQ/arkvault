import { Contracts } from "@/app/lib/profiles";
import React from "react";

import { TransferLedgerReview } from "./LedgerReview";
import { env, getDefaultProfileId, renderWithForm, screen, waitForInitialValidation } from "@/utils/testing-library";

describe("TransferLedgerReview", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	it("should render", async () => {
		const { asFragment } = renderWithForm(
			<TransferLedgerReview wallet={wallet} estimatedExpiration={123} profile={profile} />,
			{
				defaultValues: {
					fee: "0",
					recipients: [],
				},
				registerCallback: ({ register }) => {
					register("fee");
					register("recipients");
				},
			},
		);

		expect(screen.getByText("123")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		await waitForInitialValidation();
	});

	it("should render with memo", async () => {
		const { asFragment } = renderWithForm(
			<TransferLedgerReview wallet={wallet} estimatedExpiration={123} profile={profile} />,
			{
				defaultValues: {
					fee: "0",
					memo: "test",
					recipients: [],
				},
				registerCallback: ({ register }) => {
					register("memo");
					register("fee");
					register("recipients");
				},
			},
		);

		expect(screen.getByText("123")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		await waitForInitialValidation();
	});

	it("should render skeleton while loading expiration", async () => {
		const { asFragment } = renderWithForm(
			<TransferLedgerReview wallet={wallet} estimatedExpiration={undefined} profile={profile} />,
			{
				defaultValues: {
					fee: "0",
					recipients: [],
				},
				registerCallback: ({ register }) => {
					register("fee");
					register("recipients");
				},
			},
		);

		expect(screen.getByTestId("TransferLedgerReview__expiration-skeleton")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		await waitForInitialValidation();
	});
});
