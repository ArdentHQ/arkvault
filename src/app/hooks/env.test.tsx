import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { useActiveProfile, useActiveWallet, useActiveWalletWhenNeeded, useNetworks } from "./env";
import { env, getDefaultProfileId, render, screen, mockProfileWithOnlyPublicNetworks } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("useActiveProfile", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().values()[0];
	});

	const TestProfile: React.FC = () => {
		const profile = useActiveProfile();

		return <h1>{profile.name()}</h1>;
	};

	const TestWallet: React.FC = () => {
		const wallet = useActiveWallet();

		if (!wallet) {
			return <h1>{wallet}</h1>;
		}

		return <h1>{wallet.address()}</h1>;
	};

	it("should return profile", () => {
		render(
			<Route path="/profiles/:profileId">
				<TestProfile />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByText(profile.name())).toBeInTheDocument();
	});

	it("should throw error when profile is not found", () => {
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

		expect(() => {
			render(
				<Route path="/profiles/:profileId">
					<TestProfile />
				</Route>,
				{
					route: `/profiles/any_undefined_profile`,
				},
			);
		}).toThrow("No profile found for [any_undefined_profile]");

		consoleErrorSpy.mockRestore();
	});

	it("should throw error when useActiveProfile is called on a route where profile is not available", () => {
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
		const history = createHashHistory();

		expect(() => {
			render(<TestProfile />, {
				history,
				route: "/route-without-profile",
			});
		}).toThrow(
			"Parameter [profileId] must be available on the route where [useActiveProfile] is called. Current route is [/route-without-profile].",
		);

		consoleErrorSpy.mockRestore();
	});

	it("should return wallet", () => {
		render(
			<Route path="/profiles/:profileId/wallets/:walletId">
				<TestWallet />
			</Route>,
			{
				route: `/profiles/${profile.id()}/wallets/${wallet.id()}`,
			},
		);

		expect(screen.getByText(wallet.address())).toBeInTheDocument();
	});

	it("should return active wallet from url", () => {
		let activeWalletId: string | undefined;

		const TestActiveWallet = () => {
			const activeWallet = useActiveWalletWhenNeeded(false);
			activeWalletId = activeWallet?.id();

			return <TestWallet />;
		};

		render(
			<Route path="/profiles/:profileId/wallets/:walletId">
				<TestActiveWallet />
			</Route>,
			{
				route: `/profiles/${profile.id()}/wallets/${wallet.id()}`,
			},
		);

		expect(activeWalletId).toStrictEqual(wallet.id());
		expect(screen.getByText(wallet.address())).toBeInTheDocument();
	});

	it.each([true, false])(
		"should return undefined if wallet id is not provided in url when active wallet isRequired = %s",
		(isRequired: boolean) => {
			const consoleSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
			let activeWallet: Contracts.IReadWriteWallet | undefined;
			let activeWalletId: string | undefined;

			const TestActiveWallet = () => {
				activeWallet = useActiveWalletWhenNeeded(isRequired);
				activeWalletId = activeWallet?.id();

				return <TestWallet />;
			};

			expect(() =>
				render(
					<Route path="/profiles/:profileId/wallets/:walletId">
						<TestActiveWallet />
					</Route>,
					{
						route: `/profiles/${profile.id()}/wallets/1`,
						withProfileSynchronizer: false,
					},
				),
			).toThrow("Failed to find a wallet for [1].");

			expect(activeWallet).toBeUndefined();
			expect(activeWalletId).toBeUndefined();

			consoleSpy.mockRestore();
		},
	);
});

let networks: Networks.Network[];
let wallets: Contracts.IReadWriteWallet[];

const setGlobalVariables = (profileId: string) => {
	profile = env.profiles().findById(profileId);
	wallets = profile.wallets().values();
	networks = wallets.map((wallet) => wallet.network()).sort((a, b) => a.displayName().localeCompare(b.displayName()));
	networks = [...new Set(networks)];
};

describe("useNetworks", () => {
	const TestNetworks = ({ profile }: { profile: Contracts.IProfile }) => {
		const networks = useNetworks(profile);
		return (
			<ul>
				{networks.map((network, index) => (
					<li key={network.id()}>{`${index}:${network.displayName()}`}</li>
				))}
			</ul>
		);
	};

	beforeEach(() => {
		setGlobalVariables(getDefaultProfileId());
	});

	it.each(["b999d134-7a24-481e-a95d-bc47c543bfc9", "cba050f1-880f-45f0-9af9-cfe48f406052"])(
		"should return networks",
		(profileId) => {
			setGlobalVariables(profileId);

			render(
				<Route path="/profiles/:profileId">
					<TestNetworks profile={profile} />
				</Route>,
				{
					route: `/profiles/${profile.id()}`,
				},
			);

			for (const [index, network] of profile.availableNetworks().entries()) {
				expect(screen.getByText(`${index}:${network.displayName()}`)).toBeInTheDocument();
			}
		},
	);

	it("should throw error with no profile", () => {
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

		expect(() =>
			render(
				<Route path="/profiles/:profileId/wallets/:walletId">
					<TestNetworks profile={undefined} />
				</Route>,
				{
					route: `/profiles/${"undefined"}/wallets/${"undefined"}`,
				},
			),
		).toThrow(/Cannot read propert/);

		consoleErrorSpy.mockRestore();
	});

	it("should return empty array on empty profile", () => {
		jest.spyOn(profile.wallets(), "values").mockReturnValue([]);

		const {
			result: { current },
		} = renderHook(() => useNetworks(profile));

		expect(current).toHaveLength(0);
	});

	it("should return the network wallets", async () => {
		const resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);
		const { wallet: arkMainWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.mainnet",
		});
		const profileWalletsSpy = jest.spyOn(profile.wallets(), "values").mockReturnValue([arkMainWallet]);

		const {
			result: { current },
		} = renderHook(() => useNetworks(profile));

		expect(current).toHaveLength(1);

		profileWalletsSpy.mockRestore();
		resetProfileNetworksMock();
	});
});
