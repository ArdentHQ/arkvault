import { Contracts } from "@payvo/sdk-profiles";
import React from "react";

import { TransferLedgerReview } from "./LedgerReview";
import { env, getDefaultProfileId, renderWithForm, screen } from "@/utils/testing-library";

describe("TransferLedgerReview", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	it("should render", () => {
		const { asFragment } = renderWithForm(<TransferLedgerReview wallet={wallet} estimatedExpiration={123} />, {
			defaultValues: {
				fee: "0",
				recipients: [],
			},
			registerCallback: ({ register }) => {
				register("fee");
				register("recipients");
			},
		});

		expect(screen.getByText("123")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render skeleton while loading expiration", () => {
		const { asFragment } = renderWithForm(
			<TransferLedgerReview wallet={wallet} estimatedExpiration={undefined} />,
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
	});
});
