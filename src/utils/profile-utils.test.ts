/* eslint-disable @typescript-eslint/require-await */
import {
	getProfileById,
	getProfileFromUrl,
	getProfileStoredPassword,
	getErroredNetworks,
	isValidProfileUrl,
	hasIncompatibleLedgerWallets,
} from "./profile-utils";
import { mockProfileWithPublicAndTestNetworks } from "./testing-library";
import { env, getDefaultProfileId } from "@/utils/testing-library";

describe("Profile utils", () => {
	it("#getProfileById", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		expect(getProfileById(env, profile.id())).toStrictEqual(profile);

		expect(getProfileById()).not.toStrictEqual(profile);
		expect(getProfileById(env, "wrong id")).not.toStrictEqual(profile);
	});

	it("#getProfileFromUrl", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		expect(getProfileFromUrl(env, `/profiles/${profile.id()}`)).toStrictEqual(profile);
	});

	it("#getProfileStoredPassword", async () => {
		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");
		const passwordLessProfile = env.profiles().findById(getDefaultProfileId());

		const mockUsesPassword = vi.spyOn(profile, "usesPassword").mockImplementation(() => true);

		const mockPasswordLessProfile = vi.spyOn(passwordLessProfile, "usesPassword").mockImplementation(() => false);

		const memoryPasswordMock = vi.spyOn(profile.password(), "get").mockImplementation(() => {
			throw new Error("password not found");
		});

		expect(getProfileStoredPassword(profile)).toBeUndefined();
		expect(getProfileStoredPassword(passwordLessProfile)).toBeUndefined();

		memoryPasswordMock.mockRestore();

		const passwordMock = vi.spyOn(profile.password(), "get").mockImplementation(() => "password");

		expect(getProfileStoredPassword(profile)).toBe("password");

		mockUsesPassword.mockRestore();
		mockPasswordLessProfile.mockRestore();
		passwordMock.mockRestore();
	});

	it("#getErroredNetworks", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		vi.spyOn(profile.wallets().first(), "isCold").mockReturnValue(true);

		await profile.wallets().restore();

		expect(getErroredNetworks(profile).hasErroredNetworks).toBe(false);
		expect(getErroredNetworks(profile).erroredNetworks).toHaveLength(0);

		vi.restoreAllMocks();
	});

	it("should have errored networks", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const walletRestoreMock = vi.spyOn(profile.wallets().first(), "hasBeenFullyRestored").mockReturnValue(false);

		expect(getErroredNetworks(profile).hasErroredNetworks).toBe(true);
		expect(getErroredNetworks(profile).erroredNetworks).toHaveLength(1);

		walletRestoreMock.mockRestore();
		resetProfileNetworksMock();
	});

	it("should ignore cold wallets", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const walletRestoreMock = vi.spyOn(profile.wallets().first(), "isCold").mockReturnValue(true);

		expect(getErroredNetworks(profile).hasErroredNetworks).toBe(false);
		expect(getErroredNetworks(profile).erroredNetworks).toHaveLength(0);

		walletRestoreMock.mockRestore();
		resetProfileNetworksMock();
	});

	it("should ignore wallets that has been fully restored and has synced with network", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const walletRestoreMock = vi.spyOn(profile.wallets().first(), "hasBeenFullyRestored").mockReturnValue(true);
		const walletRestoreMock2 = vi.spyOn(profile.wallets().first(), "hasSyncedWithNetwork").mockReturnValue(true);

		expect(getErroredNetworks(profile).hasErroredNetworks).toBe(false);
		expect(getErroredNetworks(profile).erroredNetworks).toHaveLength(0);

		walletRestoreMock.mockRestore();
		walletRestoreMock2.mockRestore();
		resetProfileNetworksMock();
	});

	it("#isValidProfileUrl", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		expect(isValidProfileUrl(env, `/profiles/${profile.id()}`)).toBe(true);
		expect(isValidProfileUrl(env, "/profiles/1")).toBe(false);
		// Ignore all the rest urls.
		expect(isValidProfileUrl(env, "/")).toBe(true);
	});

	it("#hasIncompatibleLedgerWallets", async () => {
		process.env.REACT_APP_IS_UNIT = undefined;
		const profile = env.profiles().findById(getDefaultProfileId());
		const ledgerWalletMock = vi.spyOn(profile.wallets().first(), "isLedger").mockReturnValue(true);

		expect(hasIncompatibleLedgerWallets(profile)).toBe(true);

		ledgerWalletMock.mockRestore();

		process.env.REACT_APP_IS_UNIT = "1";
		expect(hasIncompatibleLedgerWallets(profile)).toBe(false);
	});
});
