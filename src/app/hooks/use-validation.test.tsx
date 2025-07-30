import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { EnvironmentProvider } from "@/app/contexts";
import React from "react";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { renderHook } from "@testing-library/react";
import { useValidation } from "./use-validation";
import { vi } from "vitest";

const getValuesMock = () => ({
	gasLimit: BigNumber.make(21_000),
	gasPrice: BigNumber.make(10),
});

const LOW_BALANCE_MESSAGE = "The balance is too low";

describe("useValidation hook", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
	});

	describe("Common#gasPrice", () => {
		it("should ignore validation if network not provided", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });
			const balance = BigNumber.make(5).toNumber();
			const validation = current.common.gasPrice(balance, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(10));

			expect(isValid).toBe(true);
		});

		it("should ignore validation if gasPrice is not provided", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });
			const balance = BigNumber.make(5).toNumber();
			const validation = current.common.gasPrice(balance, getValuesMock);
			const isValid = validation.validate.valid(undefined);

			expect(isValid).toBe(true);
		});

		it("should error for no gasPrice", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });
			const balance = BigNumber.ZERO;
			const validation = current.common.gasPrice(balance, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.ZERO);

			expect(isValid).toBe("Gas Price required.");
		});

		it("should error for gasPrice is less than min value", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });
			const balance = BigNumber.make(5).toNumber();
			const validation = current.common.gasPrice(balance, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(3));

			expect(isValid).toBe("Gas Price cannot be less than 5.");
		});

		it("should error for zero balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasPrice(0, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(6));

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});

		it("should error for negative balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasPrice(-5, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(6));

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});

		it("should error for lower than fee balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const balance = BigNumber.make(0.0006).toNumber();
			const validation = current.common.gasPrice(balance, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(10_000));

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
			const validation = current.common.gasLimit(balance, getValuesMock);
			const isValid = validation.validate.valid(BigNumber.make(21_000));

			expect(isValid).toBe(true);
		});

		it("should ignore validation if gas limit is not provided", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });
			const balance = BigNumber.make(5).toNumber();
			const validation = current.common.gasLimit(balance, getValuesMock);
			const isValid = validation.validate.valid(undefined);

			expect(isValid).toBe(true);
		});

		it("should error for no gasLimit", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasLimit(0, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(0));

			expect(isValid).toBe("Gas Limit required.");
		});

		it("should error for gasPrice is less than default value", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasLimit(0, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(300));

			expect(isValid).toBe("Gas Limit cannot be less than 21000.");
		});

		it("should error for zero balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasLimit(0, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(21_000));

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});

		it("should error for negative balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const validation = current.common.gasLimit(-5, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(21_000));

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});

		it("should error for lower than fee balance", () => {
			const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children} </EnvironmentProvider>;
			const {
				result: { current },
			} = renderHook(() => useValidation(), { wrapper });

			const balance = BigNumber.make(0.0002).toNumber();
			const validation = current.common.gasLimit(balance, getValuesMock, profile.activeNetwork());
			const isValid = validation.validate.valid(BigNumber.make(21_000));

			expect(isValid).contains(LOW_BALANCE_MESSAGE);
		});
	});
});
