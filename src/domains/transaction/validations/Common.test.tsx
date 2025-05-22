import { Networks } from "@/app/lib/mainsail";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";

import { common } from "./Common";
import { env } from "@/utils/testing-library";

let network: Networks.Network;

describe("Common", () => {
	beforeAll(() => {
		network = env.profiles().first().wallets().first().network();
	});

	// @TODO: add test for gasLimit and gasPrice

	it.skip("should validate low balance", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const commonValidation = common(t).fee(1, network);

		expect(commonValidation.validate.valid("1234")).toBe(
			t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
				balance: "1",
				coinId: network.coin(),
			}),
		);
	});

	it.skip("should validate zero balance", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const error = t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
			balance: "0",
			coinId: network.coin(),
		});

		expect(common(t).fee(0, network).validate.valid(1234)).toBe(error);
		expect(common(t).fee(-1, network).validate.valid(1234)).toBe(error);
	});

	it.skip("should require a fee", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		expect(common(t).fee(1, network).validate.valid("0")).toBe(
			t("COMMON.VALIDATION.FIELD_REQUIRED", {
				field: t("COMMON.FEE"),
			}),
		);
	});

	it.skip("should fail to validate negative fee", () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const commonValidation = common(t).fee(1, network);

		expect(commonValidation.validate.valid("-1")).toBe(t("TRANSACTION.VALIDATION.FEE_NEGATIVE"));
	});

	it.skip("should fail to validate a low fee when network's fee type is size", () => {
		const feeTypeSpy = vi.spyOn(network, "feeType").mockReturnValue("size");

		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		expect(common(t).fee(5, network, { avg: 2, max: 2, min: 2, static: 2 }).validate.valid("1")).toBe(
			t("COMMON.VALIDATION.MIN", {
				field: t("COMMON.FEE"),
				min: 2,
			}),
		);

		feeTypeSpy.mockRestore();
	});
});
