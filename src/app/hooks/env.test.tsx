import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { useActiveProfile, useActiveWallet, useActiveWalletWhenNeeded } from "./env";

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
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());

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
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
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
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
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
