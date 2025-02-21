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
		});
	});

	it("should return contact name when useNetworkWalletNames is false", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, false);
		const contact = profile.contacts().first();
		const contactAddress = contact.addresses().first();

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(result.current.getWalletAlias({ address: contactAddress.address(), profile })).toStrictEqual({
			address: contactAddress.address(),
			alias: contact.name(),
			isContact: true,
		});
	});

	it("should return displayName when useNetworkWalletNames is false", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, false);
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
		});
	});

	it("should choose displayName over contact name when useNetworkWalletNames is false", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, false);
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
		});

		profile.contacts().forget(contact.id());
		expect(profile.contacts().values()).toHaveLength(2);
	});

	it("should choose contact name over username when useNetworkWalletNames is false", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, false);
		const contact = profile.contacts().first();
		const contactAddress = contact.addresses().first();

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({
				address: contactAddress.address(),
				profile,
				username: "contact_username",
			}),
		).toStrictEqual({
			address: contactAddress.address(),
			alias: contact.name(),
			isContact: true,
		});
	});

	it("should choose username over address when no wallet or contact exists", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, false);
		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({ address: "unknown-address", profile, username: "xyz_username" }),
		).toStrictEqual({
			address: "unknown-address",
			alias: "xyz_username",
			isContact: false,
		});
	});

	it("should return username when useNetworkWalletNames is true and wallet has username", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, true);
		const usernameSpy = vi.spyOn(wallet, "username").mockReturnValue("username");

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: wallet.address(),
			alias: "username",
			isContact: false,
		});

		usernameSpy.mockRestore();
	});

	it("should return displayName when useNetworkWalletNames is true but wallet has no username", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, true);
		const usernameSpy = vi.spyOn(wallet, "username").mockReturnValue(undefined);

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
		});

		usernameSpy.mockRestore();
	});

	it("should return username when useNetworkWalletNames is true and wallet doesn't exist", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, true);
		const contact = profile.contacts().first();
		const contactAddress = contact.addresses().first();

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({
				address: contactAddress.address(),
				profile,
				username: "contact_username",
			}),
		).toStrictEqual({
			address: contactAddress.address(),
			alias: "contact_username",
			isContact: false,
		});
	});
});
