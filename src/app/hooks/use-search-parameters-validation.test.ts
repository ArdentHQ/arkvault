import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import { useTranslation } from "react-i18next";

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

		await expect(result.current.validateSearchParameters(profile, parameters)).resolves.not.toThrow();
	});

	it("should validate search parameters without errors (with nethash)", async () => {
		const parameters = new URLSearchParams(
			"coin=ark&method=transfer&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, parameters)).resolves.not.toThrow();
	});

	it("should throw for missing coin", async () => {
		const parameters = new URLSearchParams("method=transfer&network=ark.devnet");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.COIN_MISSING"),
		);
	});

	it("should throw for invalid coin", async () => {
		const parameters = new URLSearchParams("coin=custom&network=ark.devnet&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED", { coin: "CUSTOM" }),
		);
	});

	it("should throw for coin mismatch", async () => {
		const parameters = new URLSearchParams("coin=ARK&nethash=1&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(() =>
			result.current.validateSearchParameters(profile, parameters, {
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

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.METHOD_MISSING"),
		);
	});

	it("should throw for invalid method", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=custom");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.METHOD_NOT_SUPPORTED", { method: "custom" }),
		);
	});

	it("should throw for missing network or nethash", async () => {
		const parameters = new URLSearchParams("coin=ARK&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING"),
		);
	});

	it("should throw for invalid network", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=custom&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.NETWORK_INVALID", { network: "custom" }),
		);
	});

	it("should throw for invalid nethash", async () => {
		const parameters = new URLSearchParams("coin=ARK&nethash=custom&method=transfer");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.NETHASH_NOT_ENABLED", { nethash: "custom" }),
		);
	});

	it("should throw for network mismatch", async () => {
		const parameters = new URLSearchParams("coin=ark&method=transfer&network=ark.devnet");

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(
			result.current.validateSearchParameters(profile, parameters, {
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
			result.current.validateSearchParameters(profile, parameters, {
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

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
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

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.MESSAGE_MISSING"),
		);
	});

	it("should throw for nethash mismatch if sign with invalid address", async () => {
		const parameters = new URLSearchParams(
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=hello&address=1",
		);

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
			t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"),
		);
	});

	it("should accept a valid address", async () => {
		const parameters = new URLSearchParams(
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=hello&address=DL8d1p4XL1k4VvkQfZp2PBx38epXdm1Tve",
		);

		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, parameters)).resolves.not.toThrow();
	});
});
