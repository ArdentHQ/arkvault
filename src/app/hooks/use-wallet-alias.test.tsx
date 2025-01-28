import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import React from "react";

import { useWalletAlias } from "./use-wallet-alias";
import { EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, getDefaultWalletId } from "@/utils/testing-library";

describe("useWalletAlias", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById(getDefaultWalletId());
	});

	it("should return undefined alias when no wallet or contact or delegate was found", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(result.current.getWalletAlias({ address: "wrong-address", profile })).toStrictEqual({
			address: "wrong-address",
			alias: undefined,
			isContact: false,
			isValidator: false,
		});
	});

	it("should return isValidator = `false` when network is set but no wallet, contact or delegate was found", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({ address: "wrong-address", network: wallet.network(), profile }).isValidator,
		).toBe(false);
	});

	it("should return isValidator = `false` when network is set and delegate is found even when no wallet or contact found", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		vi.spyOn(env.delegates(), "findByAddress").mockReturnValueOnce({
			username: () => "delegate_username",
		} as any);

		expect(
			result.current.getWalletAlias({
				address: "wrong-address",
				network: wallet.network(),
				profile,
			}).isValidator,
		).toBe(false);
	});

	it("should return contact name", () => {
		const contact = profile.contacts().first();
		const contactAddress = contact.addresses().first();

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(result.current.getWalletAlias({ address: contactAddress.address(), profile })).toStrictEqual({
			address: contactAddress.address(),
			alias: contact.name(),
			isContact: true,
			isValidator: false,
		});
	});

	it("should return displayName", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: wallet.address(),
			alias: wallet.displayName(),
			isContact: false,
			isValidator: false,
		});
	});

	it("should choose displayName over contact name", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		expect(profile.contacts().values()).toHaveLength(2);

		const contact = profile
			.contacts()
			.create("testing contact", [{ address: wallet.address(), coin: "ARK", network: "ark.devnet" }]);
		const contactAddress = contact.addresses().findByAddress(wallet.address())[0];

		expect(profile.contacts().values()).toHaveLength(3);

		expect(
			result.current.getWalletAlias({
				address: contactAddress.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: contactAddress.address(),
			alias: wallet.displayName(),
			isContact: false,
			isValidator: false,
		});

		profile.contacts().forget(contact.id());
		expect(profile.contacts().values()).toHaveLength(2);
	});

	it("should choose contact name over username", () => {
		const contact = profile.contacts().first();
		const contactAddress = contact.addresses().first();

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({
				address: contactAddress.address(),
				profile,
				username: "delegate_username",
			}),
		).toStrictEqual({
			address: contactAddress.address(),
			alias: contact.name(),
			isContact: true,
			isValidator: false,
		});
	});

	it("should choose username over address", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({ address: wallet.address(), profile, username: "delegate_username" }),
		).toStrictEqual({
			address: wallet.address(),
			alias: "delegate_username",
			isContact: false,
			isValidator: false,
		});
	});

	it("should return displayName and isValidator = true when address is also a delegate", () => {
		vi.spyOn(env.delegates(), "findByAddress").mockReturnValueOnce({
			username: () => "delegate username",
		} as any);

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: wallet.address(),
			alias: wallet.displayName(),
			isContact: false,
			isValidator: false,
		});

		vi.spyOn(env.delegates(), "findByAddress").mockRestore();
	});
});
