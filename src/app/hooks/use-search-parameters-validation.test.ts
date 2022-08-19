import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import { TFunction, useTranslation } from "react-i18next";

import { useSearchParametersValidation } from "./use-search-parameters-validation";
import { env, getDefaultProfileId, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const requiredParameters = {
	coin: "ARK",
	nethash: "1",
	network: "ark.devnet",
};

const buildMissingParameterMessage = (t: TFunction, parameter: string) =>
	t("TRANSACTION.VALIDATION.PARAMETER_MISSING", { parameter });

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
			buildMissingParameterMessage(t, t("COMMON.COIN")),
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
			buildMissingParameterMessage(t, t("COMMON.METHOD")),
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
			buildMissingParameterMessage(t, t("COMMON.NETWORK_OR_NETHASH")),
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

	describe("Transfer", () => {
		it("should throw if recipient does not correspond to network", async () => {
			const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=transfer&recipient=custom");

			const { result: translation } = renderHook(() => useTranslation());
			const { t } = translation.current;

			const { result } = renderHook(() => useSearchParametersValidation());

			await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
				t("TRANSACTION.VALIDATION.NETWORK_MISMATCH"),
			);
		});
	});

	describe("Message Verification", () => {
		it("should throw if message, signatory or signature is missing", async () => {
			const { result: translation } = renderHook(() => useTranslation());
			const { t } = translation.current;

			const { result } = renderHook(() => useSearchParametersValidation());

			let parameters = new URLSearchParams(
				"coin=ARK&network=ark.devnet&method=verify&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
			);

			await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
				buildMissingParameterMessage(t, t("COMMON.MESSAGE")),
			);

			parameters = new URLSearchParams(
				"coin=ARK&network=ark.devnet&method=verify&message=hello+world&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
			);

			await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
				buildMissingParameterMessage(t, t("COMMON.SIGNATORY")),
			);

			parameters = new URLSearchParams(
				"coin=ARK&network=ark.devnet&method=verify&message=hello+world&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca",
			);

			await expect(result.current.validateSearchParameters(profile, parameters)).rejects.toThrow(
				buildMissingParameterMessage(t, t("COMMON.SIGNATURE")),
			);
		});
	});
});
