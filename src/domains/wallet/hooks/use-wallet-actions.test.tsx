import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import React from "react";
import { env, act, getMainsailProfileId, Providers, LocationTracker } from "@/utils/testing-library";
import { DropdownOption } from "@/app/components/Dropdown";
import * as useActiveProfileModule from "@/app/hooks/env";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";
import { vi } from "vitest";

describe("useWalletActions", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	const wrapper = ({ children }) => <Providers>{children}</Providers>;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first();

		vi.spyOn(useActiveProfileModule, "useActiveProfile").mockReturnValue(profile);
	});

	it("should return undefined if there is no wallet", async () => {
		const {
			result: { current },
		} = renderHook(
			() =>
				useWalletActions({
					wallets: [],
				}),
			{ wrapper },
		);

		expect(current.handleOpen()).toBeUndefined();
		expect(current.handleSend()).toBeUndefined();

		await expect(current.handleToggleStar()).resolves.toBeUndefined();
		await expect(current.handleDelete()).resolves.toBeUndefined();
		expect(current.handleSelectOption({} as DropdownOption)).toBeUndefined();
	});

	it("should return undefined if no wallets passed", () => {
		const {
			result: { current },
		} = renderHook(
			() =>
				useWalletActions({
					wallets: [],
				}),
			{ wrapper },
		);

		expect(current.handleSend()).toBeUndefined();
	});

	it("should push right url to history if there are multiple wallets", () => {
		let currentLocation = { pathname: "/" };

		const {
			result: { current },
		} = renderHook(() => useWalletActions({ wallets: [wallet, profile.wallets().last()] }), {
			wrapper: ({ children }) => (
				<Providers>
					<LocationTracker
						onLocationChange={(location) => {
							currentLocation = location;
						}}
					/>
					{children}
				</Providers>
			),
		});

		expect(currentLocation.pathname).toBe("/");

		act(() => {
			current.handleSend();
		});

		expect(currentLocation.pathname).toBe(`/profiles/${profile.id()}/send-transfer`);

		act(() => {
			current.handleSelectOption({ value: "validator-resignation" } as DropdownOption);
		});

		expect(currentLocation.pathname).toBe(`/profiles/${profile.id()}/send-validator-resignation`);

		act(() => {
			current.handleSelectOption({ value: "username-resignation" } as DropdownOption);
		});

		expect(currentLocation.pathname).toBe(`/profiles/${profile.id()}/send-username-resignation`);
	});

	it("should call handleSendRegistration callback for validator registration", () => {
		const mockHandleSendRegistration = vi.fn();

		const {
			result: { current },
		} = renderHook(
			() =>
				useWalletActions({
					handleSendRegistration: mockHandleSendRegistration,
					wallets: [wallet],
				}),
			{ wrapper },
		);

		act(() => {
			current.handleSelectOption({ value: "validator-registration" } as DropdownOption);
		});

		expect(mockHandleSendRegistration).toHaveBeenCalledWith("validatorRegistration");
		expect(mockHandleSendRegistration).toHaveBeenCalledTimes(1);
	});

	it("should call handleSendRegistration callback for username registration", () => {
		const mockHandleSendRegistration = vi.fn();

		const {
			result: { current },
		} = renderHook(
			() =>
				useWalletActions({
					handleSendRegistration: mockHandleSendRegistration,
					wallets: [wallet],
				}),
			{ wrapper },
		);

		act(() => {
			current.handleSelectOption({ value: "username-registration" } as DropdownOption);
		});

		expect(mockHandleSendRegistration).toHaveBeenCalledWith("usernameRegistration");
		expect(mockHandleSendRegistration).toHaveBeenCalledTimes(1);
	});

	it("should not call handleSendRegistration callback when not provided", () => {
		const {
			result: { current },
		} = renderHook(() => useWalletActions({ wallets: [wallet] }), { wrapper });

		// Should not throw error when callback is not provided
		expect(() => {
			act(() => {
				current.handleSelectOption({ value: "validator-registration" } as DropdownOption);
			});
		}).not.toThrow();

		expect(() => {
			act(() => {
				current.handleSelectOption({ value: "username-registration" } as DropdownOption);
			});
		}).not.toThrow();
	});

	it("should call handleSendTransfer callback when provided", () => {
		const mockHandleSendTransfer = vi.fn();

		const {
			result: { current },
		} = renderHook(
			() =>
				useWalletActions({
					handleSendTransfer: mockHandleSendTransfer,
					wallets: [wallet],
				}),
			{ wrapper },
		);

		act(() => {
			current.handleSend();
		});

		expect(mockHandleSendTransfer).toHaveBeenCalledTimes(1);
	});

	it("should call handleSignMessage callback when provided", () => {
		const mockHandleSignMessage = vi.fn();

		const {
			result: { current },
		} = renderHook(
			() =>
				useWalletActions({
					handleSignMessage: mockHandleSignMessage,
					wallets: [wallet],
				}),
			{ wrapper },
		);

		act(() => {
			current.handleSelectOption({ value: "sign-message" } as DropdownOption);
		});

		expect(mockHandleSignMessage).toHaveBeenCalledTimes(1);
	});
});
