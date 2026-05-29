import { render, screen } from "@/utils/testing-library";
import { ViewingAddressInfo } from "./PortfolioHeader.blocks";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { AddressViewSelection } from "@/app/lib/profiles/wallet.enum";
import { waitFor } from "@testing-library/react";

describe("ViewingAddressInfo", () => {
	let profile: Contracts.IProfile;

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
	});

	it("should show wallet alias when in single mode with one wallet", async () => {
		const wallets = [profile.wallets().first()];

		render(
			<ViewingAddressInfo
				profile={profile}
				wallets={wallets}
				availableWallets={1}
				mode={AddressViewSelection.single}
			/>,
		);

		await waitFor(() => {
			const addressElement = screen.queryByTestId("Address__alias");
			expect(addressElement).toBeInTheDocument();
		});
	});

	it("should show wallet alias when only one wallet is selected even in multiple mode", async () => {
		const wallets = [profile.wallets().first()];

		render(
			<ViewingAddressInfo
				profile={profile}
				wallets={wallets}
				availableWallets={2}
				mode={AddressViewSelection.multiple}
			/>,
		);

		await waitFor(() => {
			const addressElement = screen.queryByTestId("Address__alias");
			expect(addressElement).toBeInTheDocument();
		});
	});

	it("should show multiple addresses text when more than one wallet is selected in multiple mode", async () => {
		const wallets = [profile.wallets().first(), profile.wallets().last()];

		render(
			<ViewingAddressInfo
				profile={profile}
				wallets={wallets}
				availableWallets={2}
				mode={AddressViewSelection.multiple}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText(/Multiple Addresses \(2\)/)).toBeInTheDocument();
		});
	});
});
