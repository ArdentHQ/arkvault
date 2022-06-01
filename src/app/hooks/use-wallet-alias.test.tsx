import { Contracts } from "@payvo/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";

import { useWalletAlias } from "./use-wallet-alias";
import { EnvironmentProvider } from "@/app/contexts";
import { env, getDefaultProfileId, getDefaultWalletId, syncDelegates } from "@/utils/testing-library";

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
			alias: undefined,
			isContact: false,
			isDelegate: false,
		});
	});

	it("should return isDelegate = `false` when network is set but no wallet, contact or delegate was found", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({ address: "wrong-address", network: wallet.network(), profile }).isDelegate,
		).toBe(false);
	});

	it("should return isDelegate = `true` when network is set and delegate is found even when no wallet or contact found", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		jest.spyOn(env.delegates(), "findByAddress").mockReturnValueOnce({
			username: () => "delegate_username",
		} as any);

		expect(
			result.current.getWalletAlias({
				address: "wrong-address",
				network: wallet.network(),
				profile,
			}).isDelegate,
		).toBe(true);
	});

	it("should return contact name", () => {
		const contact = profile.contacts().first();
		const contactAddress = contact.addresses().first();

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(result.current.getWalletAlias({ address: contactAddress.address(), profile })).toStrictEqual({
			alias: contact.name(),
			isContact: true,
			isDelegate: false,
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
			alias: wallet.displayName(),
			isContact: false,
			isDelegate: false,
		});
	});

	it("should return displayName and isDelegate = true when address is also a delegate", () => {
		jest.spyOn(env.delegates(), "findByAddress").mockReturnValueOnce({
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
			alias: wallet.displayName(),
			isContact: false,
			isDelegate: true,
		});
	});

	it("should return delegate name", async () => {
		await syncDelegates(profile);

		const walletsSpy = jest.spyOn(profile.wallets(), "findByAddressWithNetwork").mockReturnValue(undefined);
		const contactsSpy = jest.spyOn(profile.contacts(), "findByAddress").mockReturnValue([]);

		const delegate = env.delegates().all(wallet.coinId(), wallet.networkId())[0];

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({
				address: delegate.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			alias: delegate.username(),
			isContact: false,
			isDelegate: true,
		});

		walletsSpy.mockRestore();
		contactsSpy.mockRestore();
	});

	it("should choose delegate name over alias if enabled in preferences", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, true);

		jest.spyOn(env.delegates(), "findByAddress").mockReturnValueOnce({
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
			alias: "delegate username",
			isContact: false,
			isDelegate: true,
		});
	});
});
