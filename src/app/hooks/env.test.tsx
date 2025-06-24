import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { useActiveProfile, useActiveWallet, useActiveWalletWhenNeeded } from "./env";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

describe("useActiveProfile", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().values()[0];
	});

	const TestProfile: React.FC = () => {
		const profile = useActiveProfile();

		return <h1 data-testid="test-profile">{profile.name()}</h1>;
	};

	const TestWallet: React.FC = () => {
		const wallet = useActiveWallet();

		if (!wallet) {
			return <h1>{wallet}</h1>;
		}

		return <h1 data-testid="test-wallet">{wallet.address()}</h1>;
	};

	it("should return profile", () => {
		render(<TestProfile />, {
			route: `/profiles/${profile.id()}`,
		});

		expect(screen.getByText(profile.name())).toBeInTheDocument();
	});

	it("should throw error when profile is not found", () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());

		render(<TestProfile />, {
			route: `/profiles/any_undefined_profile`,
		});

		expect(screen.getByText(`No profile found for [any_undefined_profile]`)).toBeInTheDocument();

		consoleErrorSpy.mockRestore();
	});

	it("should throw error when useActiveProfile is called on a route where profile is not available", async () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());

		render(<TestProfile />, {
			route: "/route-without-profile",
		});

		await waitFor(() => expect(screen.queryByTestId("test-profile")).not.toBeInTheDocument());
		consoleErrorSpy.mockRestore();
	});

	it("should return wallet", () => {
		render(<TestWallet />, {
			route: `/profiles/${profile.id()}/wallets/${wallet.id()}`,
		});

		expect(screen.getByText(wallet.address())).toBeInTheDocument();
	});

	it("should return active wallet from url", () => {
		let activeWalletId: string | undefined;

		const TestActiveWallet = () => {
			const activeWallet = useActiveWalletWhenNeeded(false);
			activeWalletId = activeWallet?.id();

			return <TestWallet />;
		};

		render(<TestActiveWallet />, {
			route: `/profiles/${profile.id()}/wallets/${wallet.id()}`,
		});

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

			render(<TestActiveWallet />, {
				route: `/profiles/${profile.id()}/wallets/1`,
				withProfileSynchronizer: false,
			});

			expect(activeWallet).toBeUndefined();
			expect(activeWalletId).toBeUndefined();

			consoleSpy.mockRestore();
		},
	);
});
