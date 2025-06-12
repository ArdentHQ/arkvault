/* eslint-disable sonarjs/no-duplicate-string */
import { Networks } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";
import * as inputFee from "@/domains/transaction/components/InputFee/InputFee";

import { common } from "./Common";
import { env, t } from "@/utils/testing-library";

let network: Networks.Network;
let getValues: () => any;

describe("Common Validations", () => {
	beforeAll(() => {
		network = env.profiles().first().wallets().first().network();
	});

	beforeEach(() => {
		getValues = () => ({});

		vi.spyOn(inputFee, "getFeeMinMax").mockReturnValue({
			maxGasLimit: BigNumber.make(1000),
			maxGasPrice: BigNumber.make(1000),
			minGasLimit: BigNumber.make(10),
			minGasPrice: BigNumber.make(10),
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("fee", () => {
		// Fee method is hardcoded to return true for now
		it("should temporarily return true on different inputs", () => {
			const fees = {
				avg: BigNumber.make(50),
				max: BigNumber.make(100),
				min: BigNumber.make(10),
			};
			let feeValidation;
			feeValidation = common(t).fee(100, network, fees);
			expect(feeValidation.validate()).toBe(true);

			feeValidation = common(t).fee(undefined, network, fees);
			expect(feeValidation.validate()).toBe(true);

			feeValidation = common(t).fee(100, undefined, fees);
			expect(feeValidation.validate()).toBe(true);

			feeValidation = common(t).fee(100, network, undefined);
			expect(feeValidation.validate()).toBe(true);
		});
	});

	describe("gasLimit", () => {
		it("should return true if network coin or gasLimit is not defined", () => {
			const gasLimitValidation = common(t).gasLimit(100, getValues, undefined);
			expect(gasLimitValidation.validate.valid(BigNumber.make(100))).toBe(true);

			const gasLimitValidation2 = common(t).gasLimit(100, getValues, network);
			expect(gasLimitValidation2.validate.valid(undefined)).toBe(true);

			const noCoinSpy = vi.spyOn(network, "coin").mockReturnValue("");
			const gasLimitValidation3 = common(t).gasLimit(100, getValues, network);
			expect(gasLimitValidation3.validate.valid(BigNumber.make(100))).toBe(true);
			noCoinSpy.mockRestore();
		});

		it("should fail if gasLimit is zero", () => {
			const gasLimitValidation = common(t).gasLimit(100, getValues, network);
			expect(gasLimitValidation.validate.valid(BigNumber.make(0))).toBe(
				t("COMMON.VALIDATION.FIELD_REQUIRED", {
					field: t("COMMON.GAS_LIMIT"),
				}),
			);
		});

		it("should fail if gasLimit is too low", () => {
			const gasLimitValidation = common(t).gasLimit(100, getValues, network);
			expect(gasLimitValidation.validate.valid(BigNumber.make(5))).toBe(
				t("COMMON.VALIDATION.GAS_LIMIT_IS_TOO_LOW", {
					minGasLimit: BigNumber.make(10),
				}),
			);
		});

		it("should fail if gasLimit is too high", () => {
			const gasLimitValidation = common(t).gasLimit(100, getValues, network);
			expect(gasLimitValidation.validate.valid(BigNumber.make(2000))).toBe(
				t("COMMON.VALIDATION.GAS_LIMIT_IS_TOO_HIGH", {
					maxGasLimit: BigNumber.make(1000),
				}),
			);
		});

		it("should fail if balance is zero or negative", () => {
			let gasLimitValidation = common(t).gasLimit(0, getValues, network);
			expect(gasLimitValidation.validate.valid(BigNumber.make(100))).toBe(
				t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
					balance: 0,
					coinId: network.coin(),
				}),
			);
			gasLimitValidation = common(t).gasLimit(-10, getValues, network);
			expect(gasLimitValidation.validate.valid(BigNumber.make(100))).toBe(
				t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
					balance: 0,
					coinId: network.coin(),
				}),
			);
		});

		it("should return true if gasPrice is not defined", () => {
			getValues = () => ({ gasPrice: undefined });
			const gasLimitValidation = common(t).gasLimit(100, getValues, network);
			expect(gasLimitValidation.validate.valid(BigNumber.make(100))).toBe(true);
		});

		it("should use 0 as default balance", () => {
			const gasLimitValidation = common(t).gasLimit(undefined, getValues, network);
			expect(gasLimitValidation.validate.valid(BigNumber.make(100))).toBe(
				t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
					balance: 0,
					coinId: network.coin(),
				}),
			);
		});

		it("should fail if fee is greater than balance", () => {
			getValues = () => ({ gasPrice: BigNumber.make(10) });
			const gasLimitValidation = common(t).gasLimit(50, getValues, network);

			vi.spyOn(inputFee, "calculateGasFee").mockReturnValue(BigNumber.make(100));

			expect(gasLimitValidation.validate.valid(BigNumber.make(100))).toBe(
				t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
					balance: 50,
					coinId: network.coin(),
				}),
			);
		});

		it("should pass validation", () => {
			getValues = () => ({ gasPrice: BigNumber.make(1) });
			const gasLimitValidation = common(t).gasLimit(100, getValues, network);

			vi.spyOn(inputFee, "calculateGasFee").mockReturnValue(BigNumber.make(50));

			expect(gasLimitValidation.validate.valid(BigNumber.make(100))).toBe(true);
		});

		it("should use 0 as default balance for gasPrice", () => {
			const gasLimitValidation = common(t).gasPrice(undefined, getValues, network);
			expect(gasLimitValidation.validate.valid(BigNumber.make(100))).toBe(
				t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
					balance: 0,
					coinId: network.coin(),
				}),
			);
		});
	});

	describe("gasPrice", () => {
		it("should return true if network coin or gasPrice is not defined", () => {
			const gasPriceValidation = common(t).gasPrice(100, getValues, undefined);
			expect(gasPriceValidation.validate.valid(BigNumber.make(100))).toBe(true);

			const gasPriceValidation2 = common(t).gasPrice(100, getValues, network);
			expect(gasPriceValidation2.validate.valid(undefined)).toBe(true);

			const noCoinSpy = vi.spyOn(network, "coin").mockReturnValue("");
			const gasPriceValidation3 = common(t).gasPrice(100, getValues, network);
			expect(gasPriceValidation3.validate.valid(BigNumber.make(100))).toBe(true);
			noCoinSpy.mockRestore();
			expect(gasPriceValidation3.validate.valid(BigNumber.make(100))).toBe(true);
		});

		it("should fail if gasPrice is zero", () => {
			const gasPriceValidation = common(t).gasPrice(100, getValues, network);
			expect(gasPriceValidation.validate.valid(BigNumber.make(0))).toBe(
				t("COMMON.VALIDATION.FIELD_REQUIRED", {
					field: t("COMMON.GAS_PRICE"),
				}),
			);
		});

		it("should fail if balance is zero or negative", () => {
			let gasPriceValidation = common(t).gasPrice(0, getValues, network);
			expect(gasPriceValidation.validate.valid(BigNumber.make(100))).toBe(
				t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
					balance: 0,
					coinId: network.coin(),
				}),
			);

			gasPriceValidation = common(t).gasPrice(-10, getValues, network);
			expect(gasPriceValidation.validate.valid(BigNumber.make(100))).toBe(
				t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
					balance: 0,
					coinId: network.coin(),
				}),
			);
		});

		it("should fail if gasPrice is too low", () => {
			const gasPriceValidation = common(t).gasPrice(100, getValues, network);
			expect(gasPriceValidation.validate.valid(BigNumber.make(5))).toBe(
				t("COMMON.VALIDATION.GAS_PRICE_IS_TOO_LOW", {
					minGasPrice: BigNumber.make(10),
				}),
			);
		});

		it("should fail if gasPrice is too high", () => {
			const gasPriceValidation = common(t).gasPrice(100, getValues, network);
			expect(gasPriceValidation.validate.valid(BigNumber.make(2000))).toBe(
				t("COMMON.VALIDATION.GAS_PRICE_IS_TOO_HIGH", {
					maxGasPrice: BigNumber.make(1000),
				}),
			);
		});

		it("should return true if gasLimit is not defined", () => {
			getValues = () => ({ gasLimit: undefined });
			const gasPriceValidation = common(t).gasPrice(100, getValues, network);
			expect(gasPriceValidation.validate.valid(BigNumber.make(100))).toBe(true);
		});

		it("should fail if fee is greater than balance", () => {
			getValues = () => ({ gasLimit: BigNumber.make(10) });
			const gasPriceValidation = common(t).gasPrice(50, getValues, network);

			vi.spyOn(inputFee, "calculateGasFee").mockReturnValue(BigNumber.make(100));

			expect(gasPriceValidation.validate.valid(BigNumber.make(100))).toBe(
				t("TRANSACTION.VALIDATION.LOW_BALANCE_AMOUNT", {
					balance: 50,
					coinId: network.coin(),
				}),
			);
		});

		it("should pass validation", () => {
			getValues = () => ({ gasLimit: BigNumber.make(1) });
			const gasPriceValidation = common(t).gasPrice(100, getValues, network);

			vi.spyOn(inputFee, "calculateGasFee").mockReturnValue(BigNumber.make(50));

			expect(gasPriceValidation.validate.valid(BigNumber.make(100))).toBe(true);
		});
	});
});
