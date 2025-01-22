import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { expect } from "vitest";
import { AddressesSidePanel } from "./AddressesSidePanel";

describe("AddressesSidePanel", () => {
	let profile: Contracts.IProfile;
	let wallets: Contracts.IWalletRepository;

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);

		await profile.sync();

		wallets = profile.wallets();
	});

	it("should render", () => {
		render(
			<AddressesSidePanel
				wallets={wallets}
				selectedAddresses={[]}
				open={true}
				onSelectedAddressesChange={vi.fn()}
				onOpenChange={vi.fn()}
				onDeleteAddress={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("AddressesSidePanel")).toBeInTheDocument();
		expect(screen.getAllByTestId("AddressRow").length).toBe(wallets.count());
	});
});
