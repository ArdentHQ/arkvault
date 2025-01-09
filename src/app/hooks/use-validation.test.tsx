import { BigNumber } from "@ardenthq/sdk-helpers";
import { renderHook } from "@testing-library/react";
import React from "react";

import { useValidation } from "./use-validation";
import { EnvironmentProvider } from "@/app/contexts";
import { env } from "@/utils/testing-library";

const mockNetwork = {
	coin: vi.fn,
};

const getValuesMock = () => ({
	gasLimit: 21_000,
	gasPrice: 10
})

const LOW_BALANCE_MESSAGE = "The balance is too low";

describe("useValidation hook", () => {
	describe("Common#gasPrice", () => {
		it("should ignore validation if network not provided", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });
			const balance = BigNumber.make(5).toNumber();
			const validation = current.common.gasPrice(balance, getValuesMock, 5);
			const isValid = validation.validate.valid(10);

			expect(isValid).toBe(true);
		});

		it("should error for no gasPrice", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });
			const balance = BigNumber.ZERO;
			const validation = current.common.gasPrice(balance, getValuesMock, 5, mockNetwork);
			const isValid = validation.validate.valid(0);

			expect(isValid).toBe("Gas Price required");
		});

		it("should error for gasPrice is less than min value", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });
			const balance = BigNumber.ZERO;
			const validation = current.common.gasPrice(balance, getValuesMock, 5, mockNetwork);
			const isValid = validation.validate.valid(3);

			expect(isValid).toBe("Gas price cannot be less than 5")
		});

		it("should error for zero balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasPrice(0, getValuesMock, 5, mockNetwork);
			const isValid = validation.validate.valid(6);

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});

		it("should error for negative balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasPrice(-5, getValuesMock, 5, mockNetwork);
			const isValid = validation.validate.valid(6);

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});

		it("should error for lower than fee balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const balance = BigNumber.make(0.0006).toNumber();
			const validation = current.common.gasPrice(balance, getValuesMock, 5, mockNetwork);
			const isValid = validation.validate.valid(7000000);

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});
	});

	describe("Common#gasLimit", () => {
		it("should ignore validation if network not provided", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });
			const balance = BigNumber.make(5).toNumber();
			const validation = current.common.gasLimit(balance, getValuesMock, 21_000);
			const isValid = validation.validate.valid(21_000);

			expect(isValid).toBe(true);
		});

		it("should error for no gasLimit", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasLimit(0, getValuesMock, 21_000, mockNetwork);
			const isValid = validation.validate.valid(0);

			expect(isValid).toBe("Gas Limit required");
		});

		it("should error for gasPrice is less than default value", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasLimit(0, getValuesMock, 21_000, mockNetwork);
			const isValid = validation.validate.valid(300);

			expect(isValid).toBe("Gas limit cannot be less than 21000")
		});

		it("should error for zero balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasLimit(0, getValuesMock, 21_000, mockNetwork);
			const isValid = validation.validate.valid(21_000);

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});

		it("should error for negative balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasLimit(-5, getValuesMock, 21_000, mockNetwork);
			const isValid = validation.validate.valid(21_000);

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});

		it("should error for lower than fee balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const balance = BigNumber.make(0.0006).toNumber();
			const validation = current.common.gasLimit(balance, getValuesMock, 21_000, mockNetwork);
			const isValid = validation.validate.valid(7000000);

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});
	});
});
