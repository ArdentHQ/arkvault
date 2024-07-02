import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { env, getDefaultProfileId, renderWithForm, screen } from "@/utils/testing-library";

import { IpfsLedgerReview } from "./LedgerReview";

describe("IpfsLedgerReview", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	it("should render", () => {
		const { asFragment } = renderWithForm(<IpfsLedgerReview wallet={wallet} />, {
			defaultValues: {
				fee: "0",
				hash: "123",
			},
			registerCallback: ({ register }) => {
				register("fee");
				register("hash");
			},
		});

		expect(screen.getByText("123")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
