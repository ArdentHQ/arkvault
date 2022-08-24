import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import { useTranslation } from "react-i18next";

import { truncate } from "@ardenthq/sdk-helpers";
import { useSearchParametersValidation } from "./use-search-parameters-validation";
import { env, getDefaultProfileId, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const requiredParameters = {
	coin: "ARK",
	nethash: "1",
	network: "ark.devnet",
};

describe("useSearchParametersValidation", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		mockProfileWithPublicAndTestNetworks(profile);
	});

	it("should validate search parameters without errors (with network)", async () => {
		const parameters = new URLSearchParams(
			"amount=10&coin=ark&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.not.toThrow();
	});

	it("should validate search parameters without errors (with nethash)", async () => {
		const parameters = new URLSearchParams(
			"coin=ark&method=transfer&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.not.toThrow();
	});

	it("should throw for missing coin", async () => {
		const parameters = new URLSearchParams("method=transfer&network=ark.devnet");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.COIN_MISSING"),
		);
	});

	it("should throw for invalid coin", async () => {
		const parameters = new URLSearchParams("coin=custom&network=ark.devnet&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED", { coin: "CUSTOM" }),
		);
	});

	it("should throw for coin mismatch", async () => {
		const parameters = new URLSearchParams("coin=ARK&nethash=1&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(() =>
			result.current.validateSearchParameters(profile, env, parameters, {
				...requiredParameters,
				coin: "custom",
			}),
		).rejects.toThrow(t("TRANSACTION.VALIDATION.COIN_MISMATCH"));
	});

	it("should throw for missing method", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.METHOD_MISSING"),
		);
	});

	it("should throw for invalid method", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=custom");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.METHOD_NOT_SUPPORTED", { method: "custom" }),
		);
	});

	it("should throw for missing network or nethash", async () => {
		const parameters = new URLSearchParams("coin=ARK&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING"),
		);
	});

	it("should throw for invalid network", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=custom&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.NETWORK_INVALID", { network: "custom" }),
		);
	});

	it("should throw for invalid nethash", async () => {
		const parameters = new URLSearchParams("coin=ARK&nethash=custom&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.NETHASH_NOT_ENABLED", { nethash: "custom" }),
		);
	});

	it("should throw for network mismatch", async () => {
		const parameters = new URLSearchParams("coin=ark&method=transfer&network=ark.devnet");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(
			result.current.validateSearchParameters(profile, env, parameters, {
				...requiredParameters,
				nethash: undefined,
				network: "custom",
			}),
		).rejects.toThrow(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
	});

	it("should throw for nethash mismatch", async () => {
		const parameters = new URLSearchParams("coin=ARK&nethash=1&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(
			result.current.validateSearchParameters(profile, env, parameters, {
				...requiredParameters,
				nethash: "wrong",
				network: undefined,
			}),
		).rejects.toThrow(t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"));
	});

	it("should throw if recipient does not correspond to network", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=transfer&recipient=custom");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"),
		);
	});

	it("should throw if sign and no message", async () => {
		const parameters = new URLSearchParams(
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign",
		);

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.MESSAGE_MISSING"),
		);
	});

	it("should validate vote", async () => {
		const mockFindDelegateByName = jest
			.spyOn(env.delegates(), "findByUsername")
			.mockReturnValue(profile.wallets().first());

		const parameters = new URLSearchParams(
			"coin=ARK&network=ark.devnet&method=vote&delegate=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.not.toThrow();

		mockFindDelegateByName.mockRestore();
	});

	it("should find delegate by public key", async () => {
		const mockFindDelegateByPublicKey = jest
			.spyOn(env.delegates(), "findByPublicKey")
			.mockReturnValue(profile.wallets().first());

		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote&publicKey=1");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.not.toThrow();

		mockFindDelegateByPublicKey.mockRestore();
	});

	it("should throw for nethash mismatch if sign with invalid address", async () => {
		const parameters = new URLSearchParams(
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=hello&address=1",
		);

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"),
		);
	});

	it("should fail to find delegate by public key", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote&publicKey=1");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.DELEGATE_NOT_FOUND", { delegate: "1" }),
		);
	});

	it("should not allow both delegate name and public keys in the url", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote&publicKey=1&delegate=test");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;
		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.DELEGATE_OR_PUBLICKEY"),
		);
	});

	it("should fail to validate delegate address", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote&delegate=custom");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.DELEGATE_NOT_FOUND", { delegate: "custom" }),
		);
	});

	it("should accept a valid address", async () => {
		const parameters = new URLSearchParams(
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=hello&address=DL8d1p4XL1k4VvkQfZp2PBx38epXdm1Tve",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.not.toThrow();
	});

	it("should require delegate parameter if it is a vote link", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.DELEGATE_MISSING"),
		);
	});

	it("should fail if delegate is resigned", async () => {
		const delegateWallet = new ReadOnlyWallet({
			address: profile.wallets().first().address(),
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: profile.wallets().first().publicKey(),
			rank: 52,
			username: "testi",
		});
		const mockFindDelegateByPublicKey = jest
			.spyOn(env.delegates(), "findByPublicKey")
			.mockReturnValue(delegateWallet);

		const resignedMock = jest.spyOn(delegateWallet, "isResignedDelegate").mockReturnValue(true);

		const parameters = new URLSearchParams(
			`coin=ARK&network=ark.devnet&method=vote&publicKey=${delegateWallet.publicKey()}`,
		);

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.DELEGATE_RESIGNED", {
				delegate: truncate(delegateWallet.publicKey(), { length: 20, omissionPosition: "middle" }),
			}),
		);

		mockFindDelegateByPublicKey.mockRestore();
		resignedMock.mockRestore();
	});
});
