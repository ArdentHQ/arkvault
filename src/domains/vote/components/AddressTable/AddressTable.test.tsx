import { Contracts } from "@ardenthq/sdk-profiles";
import nock from "nock";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import userEvent from "@testing-library/user-event";
import { AddressTable } from "@/domains/vote/components/AddressTable";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	waitFor,
	renderResponsiveWithRoute,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { useConfiguration } from "@/app/contexts";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let resetProfileNetworksMock: () => void;

const Wrapper = ({ children }) => {
	const { setConfiguration } = useConfiguration();

	useEffect(() => {
		setConfiguration({ profileHasSyncedOnce: true, profileIsSyncingWallets: false });
	}, []);

	return <Route path="/profiles/:profileId">{children}</Route>;
};

describe("AddressTable", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		nock.disableNetConnect();

		nock("https://ark-test.arkvault.io")
			.get("/api/delegates")
			.query({ page: "1" })
			.reply(200, require("tests/fixtures/coins/ark/devnet/delegates.json"))
			.persist();

		await syncDelegates(profile);
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

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render in xs screen", async () => {
		const { asFragment, container } = renderResponsiveWithRoute(
			<Wrapper>
				<AddressTable wallets={[wallet]} profile={profile} />
			</Wrapper>,
			"xs",
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByTestId("AccordionHeader"));

		expect(screen.getByTestId("AddressRowMobile")).toBeInTheDocument();

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it.each([true, false])("should render in xs screen when wallet network is live", async (isLive) => {
		const isLiveSpy = jest.spyOn(wallet.network(), "isLive").mockReturnValue(isLive);

		const { asFragment, container } = renderResponsiveWithRoute(
			<Wrapper>
				<AddressTable wallets={[wallet]} profile={profile} />
			</Wrapper>,
			"xs",
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByTestId("AccordionHeader"));

		expect(screen.getByTestId("AddressRowMobile")).toBeInTheDocument();

		await expect(screen.findByTestId("StatusIcon__icon")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		isLiveSpy.mockRestore();
	});

	it("should render when the maximum votes is greater than 1", () => {
		const maxVotesMock = jest.spyOn(wallet.network(), "maximumVotesPerWallet").mockReturnValue(10);
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

	it("should render with voting delegates and handle exception", async () => {
		const walletVotingMock = jest.spyOn(wallet.voting(), "current").mockImplementation(() => {
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

		await waitFor(() => expect(screen.queryByTestId("StatusIcon__icon")).not.toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();

		walletVotingMock.mockRestore();
	});
});
