import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";

import { AddressTable } from "@/domains/vote/components/AddressTable";
import {
	env,
	render,
	screen,
	syncValidators,
	waitFor,
	renderResponsiveWithRoute,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";
import { useConfiguration } from "@/app/contexts";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let resetProfileNetworksMock: () => void;

const Wrapper = ({ children }) => {
	const { setConfiguration } = useConfiguration();

	useEffect(() => {
		setConfiguration(profile.id(), { profileHasSyncedOnce: true, profileIsSyncingWallets: false });
	}, []);

	return <>{children}</>;
};

describe("AddressTable", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ee02b13f-8dbf-4191-a9dc-08d2ab72ec28");

		await syncValidators(profile);
		await wallet.synchroniser().votes();
	});

	afterAll(() => {
		resetProfileNetworksMock();
	});

	it("should render", async () => {
		const { asFragment, container } = render(
			<Wrapper>
				<AddressTable wallets={[wallet]} profile={profile} />
			</Wrapper>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toBeInTheDocument();

		await expect(screen.findByTestId("AddressRow__wallet")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with empty results", async () => {
		const { asFragment, container } = render(
			<Wrapper>
				<AddressTable wallets={[]} profile={profile} showEmptyResults />
			</Wrapper>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toBeInTheDocument();

		await expect(screen.findByTestId("EmptyResults")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render in xs screen", async () => {
		renderResponsiveWithRoute(
			<Wrapper>
				<AddressTable wallets={[wallet]} profile={profile} />
			</Wrapper>,
			"xs",
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByTestId("AddressRowMobile")).toBeInTheDocument();

		await expect(screen.findByTestId("AddressRow__wallet-status")).resolves.toBeVisible();
	});

	it("should render when the maximum votes is greater than 1", () => {
		const maxVotesMock = vi.spyOn(wallet.network(), "maximumVotesPerWallet").mockReturnValue(10);
		const { asFragment, container } = render(
			<Wrapper>
				<AddressTable wallets={[wallet]} profile={profile} />
			</Wrapper>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		maxVotesMock.mockRestore();
	});

	it("should render with voting validators and handle exception", async () => {
		const walletVotingMock = vi.spyOn(wallet.voting(), "current").mockImplementation(() => {
			throw new Error("error");
		});

		const { asFragment, container } = render(
			<Wrapper>
				<AddressTable wallets={[wallet]} profile={profile} />
			</Wrapper>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toBeInTheDocument();

		await waitFor(() => expect(screen.queryByTestId("AddressRow__wallet-status")).not.toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();

		walletVotingMock.mockRestore();
	});
});
