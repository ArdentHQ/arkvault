import { renderHook } from "@testing-library/react-hooks";
import { useTranslation } from "react-i18next";

import { useTransactionURL } from "./use-transaction-url";
import { env, getDefaultProfileId } from "@/utils/testing-library";

const urls = {
	invalid: "invalid url",
	valid: "http://localhost:3000/#/?amount=10&coin=ARK&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
	validSearchParams:
		"amount=10&coin=ARK&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
	withoutCoin:
		"http://localhost:3000/#/?amount=10&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
	withInvalidNetwork:
		"http://localhost:3000/#/?amount=10&coin=ARK&network=custom&method=transfer&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
	withoutNetwork:
		"http://localhost:3000/#/?amount=10&coin=ARK&method=transfer&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
};

describe("useTransactionURL", () => {
	it("should validate url without errors", () => {
		const { result } = renderHook(() => useTransactionURL());

		expect(result.current.validateTransferURLParams(urls.valid)).toBeUndefined();
	});

	it("should error for invalid url", () => {
		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useTransactionURL());

		expect(result.current.validateTransferURLParams(urls.invalid)).toBe(t("TRANSACTION.INVALID_URL"));
	});

	it("should error for missing coin", () => {
		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useTransactionURL());

		expect(result.current.validateTransferURLParams(urls.withoutCoin)).toBe(
			t("TRANSACTION.VALIDATION.COIN_MISSING"),
		);
	});

	it("should error for invalid network", () => {
		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useTransactionURL());

		expect(result.current.validateTransferURLParams(urls.withInvalidNetwork)).toBe(
			t("TRANSACTION.VALIDATION.NETWORK_INVALID"),
		);
	});

	it("should error for missing network or nethash", () => {
		const { result: translation } = renderHook(() => useTranslation());
		const { t } = translation.current;

		const { result } = renderHook(() => useTransactionURL());

		expect(result.current.validateTransferURLParams(urls.withoutNetwork)).toBe(
			t("TRANSACTION.VALIDATION.NETWORK_OR_NETHASH_MISSING"),
		);
	});

	it("should generate send transfer path", () => {
		const { result } = renderHook(() => useTransactionURL());
		const profile = env.profiles().findById(getDefaultProfileId());

		expect(result.current.generateSendTransferPath(profile, urls.valid)).toBe(
			`/profiles/${profile.id()}/send-transfer?${urls.validSearchParams}`,
		);
	});
});
