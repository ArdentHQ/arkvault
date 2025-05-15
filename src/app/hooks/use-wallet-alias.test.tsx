import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useWalletAlias } from "./use-wallet-alias";
import { EnvironmentProvider } from "@/app/contexts";
import { env, getMainsailProfileId, getDefaultMainsailWalletId } from "@/utils/testing-library";

const UNKNOWN_ADDRESS = "unknown-address";
const ONCHAIN_USERNAME = "onchain_username";
const WALLET_NAME = "Mainsail Wallet 1";

describe("useWalletAlias", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		await profile.knownWallets().sync(profile, profile.activeNetwork());
		wallet = profile.wallets().findById(getDefaultMainsailWalletId());
	});

	it("should return undefined alias when no wallet or contact or delegate was found", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		expect(result.current.getWalletAlias({ address: "wrong-address", profile })).toStrictEqual({
			address: "wrong-address",
			alias: undefined,
			isContact: false,
		});
	});

	it("should return known wallet name", () => {
		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		vi.spyOn(wallet, "isCold").mockReturnValue(false);

		expect(
			result.current.getWalletAlias({
				address: "0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466",
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: "0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466",
			alias: "Genesis 1",
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
		const usernameSpy = vi.spyOn(wallet, "username").mockReturnValue(undefined);
		const displayNameSpy = vi.spyOn(wallet, "displayName").mockReturnValue(WALLET_NAME);
		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		expect(
			result.current.getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: wallet.address(),
			alias: WALLET_NAME,
			isContact: false,
		});
		usernameSpy.mockRestore();
		displayNameSpy.mockRestore();
	});

	it("should choose displayName over contact name when useNetworkWalletNames is false", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, false);
		const contact = profile
			.contacts()
			.create("testing contact", [{ address: wallet.address(), coin: "ARK", network: "ark.devnet" }]);
		const contactAddress = contact.addresses().findByAddress(wallet.address())[0];
		const usernameSpy = vi.spyOn(wallet, "username").mockReturnValue(undefined);
		const displayNameSpy = vi.spyOn(wallet, "displayName").mockReturnValue(WALLET_NAME);
		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		expect(
			result.current.getWalletAlias({
				address: contactAddress.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: contactAddress.address(),
			alias: WALLET_NAME,
			isContact: false,
		});
		profile.contacts().forget(contact.id());
		usernameSpy.mockRestore();
		displayNameSpy.mockRestore();
	});

	it("should choose onChainUsername over address when no wallet or contact exists (useNetworkWalletNames true)", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, true);
		const testNetwork = wallet.network();

		const usernamesSpy = vi.spyOn(profile.usernames(), "username").mockImplementation((networkId, address) => {
			if (address === UNKNOWN_ADDRESS) {
				return ONCHAIN_USERNAME;
			}
		});

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({
				address: UNKNOWN_ADDRESS,
				network: testNetwork,
				profile,
			}),
		).toStrictEqual({
			address: UNKNOWN_ADDRESS,
			alias: ONCHAIN_USERNAME,
			isContact: false,
		});

		usernamesSpy.mockRestore();
	});

	it("should return onChainUsername when useNetworkWalletNames is false and no wallet or contact exists", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, false);
		const testNetwork = profile.activeNetwork();

		const usernamesSpy = vi.spyOn(profile.usernames(), "username").mockImplementation((networkId, address) => {
			if (address === UNKNOWN_ADDRESS) {
				return ONCHAIN_USERNAME;
			}
		});

		const { result } = renderHook(() => useWalletAlias(), { wrapper });

		expect(
			result.current.getWalletAlias({
				address: UNKNOWN_ADDRESS,
				network: testNetwork,
				profile,
			}),
		).toStrictEqual({
			address: UNKNOWN_ADDRESS,
			alias: ONCHAIN_USERNAME,
			isContact: false,
		});

		usernamesSpy.mockRestore();
	});

	it("should return onChainUsername when wallet exists but has no username or displayName", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, true);
		const contact = profile.contacts().findByAddress(wallet.address())[0];
		if (contact) {
			profile.contacts().forget(contact.id());
		}
		const usernameSpy = vi.spyOn(wallet, "username").mockReturnValue(undefined);
		const displayNameSpy = vi.spyOn(wallet, "displayName").mockReturnValue(undefined);
		const usernamesSpy = vi.spyOn(profile.usernames(), "username").mockImplementation((networkId, address) => {
			if (address === wallet.address()) {
				return ONCHAIN_USERNAME;
			}
		});
		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		expect(
			result.current.getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: wallet.address(),
			alias: ONCHAIN_USERNAME,
			isContact: false,
		});
		usernameSpy.mockRestore();
		displayNameSpy.mockRestore();
		usernamesSpy.mockRestore();
	});

	it("should return wallet username when useNetworkWalletNames is true and wallet has username", () => {
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
		const displayNameSpy = vi.spyOn(wallet, "displayName").mockReturnValue(WALLET_NAME);
		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		expect(
			result.current.getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: wallet.address(),
			alias: WALLET_NAME,
			isContact: false,
		});
		usernameSpy.mockRestore();
		displayNameSpy.mockRestore();
	});

	it("should return contact name when useNetworkWalletNames is true and wallet doesn't exist", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, true);
		const contact = profile.contacts().first();
		const contactAddress = contact.addresses().first();
		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		expect(
			result.current.getWalletAlias({
				address: contactAddress.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: contactAddress.address(),
			alias: contact.name(),
			isContact: true,
		});
	});

	it("should prioritize walletUsername over localName, onChainUsername and contactName when useNetworkWalletNames is true", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, true);
		const contact = profile
			.contacts()
			.create("contactName", [{ address: wallet.address(), coin: "ARK", network: "ark.devnet" }]);
		const usernameSpy = vi.spyOn(wallet, "username").mockReturnValue("walletUsername");
		const displayNameSpy = vi.spyOn(wallet, "displayName").mockReturnValue("localName");
		const usernamesSpy = vi.spyOn(profile.usernames(), "username").mockReturnValue("onChainUsername");
		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		expect(
			result.current.getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: wallet.address(),
			alias: "walletUsername",
			isContact: false,
		});
		profile.contacts().forget(contact.id());
		usernameSpy.mockRestore();
		displayNameSpy.mockRestore();
		usernamesSpy.mockRestore();
	});

	it("should prioritize localName over contactName, walletUsername and onChainUsername when useNetworkWalletNames is false", () => {
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, false);
		const contact = profile
			.contacts()
			.create("contactName", [{ address: wallet.address(), network: "mainsail.devnet" }]);
		const usernameSpy = vi.spyOn(wallet, "username").mockReturnValue("walletUsername");
		const displayNameSpy = vi.spyOn(wallet, "displayName").mockReturnValue("localName");
		const usernamesSpy = vi.spyOn(profile.usernames(), "username").mockReturnValue("onChainUsername");

		const { result } = renderHook(() => useWalletAlias(), { wrapper });
		expect(
			result.current.getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		).toStrictEqual({
			address: wallet.address(),
			alias: "localName",
			isContact: false,
		});
		profile.contacts().forget(contact.id());
		usernameSpy.mockRestore();
		displayNameSpy.mockRestore();
		usernamesSpy.mockRestore();
	});
});
