import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";

import { InputFee } from "./InputFee";
import { InputFeeProperties, InputFeeOption, InputFeeViewType } from "./InputFee.contracts";
import { translations } from "@/domains/transaction/i18n";
import { env, render, renderResponsive, screen } from "@/utils/testing-library";
import { BigNumber } from "@/app/lib/helpers";

const getDefaultProperties = (): Omit<InputFeeProperties, "network" | "profile"> => ({
	avg: BigNumber.make(7.456),
	disabled: false,
	estimatedGasLimit: BigNumber.make(100_000),
	gasLimit: BigNumber.make(100_000),
	gasPrice: BigNumber.make(5.3),
	loading: false,
	max: BigNumber.make(8.5),
	min: BigNumber.make(5.006),
	onChangeFeeOption: vi.fn(),
	onChangeGasLimit: vi.fn(),
	onChangeGasPrice: vi.fn(),
	onChangeViewType: vi.fn(),
	selectedFeeOption: InputFeeOption.Average,
	viewType: InputFeeViewType.Simple,
});

let defaultProps: InputFeeProperties;
let network: Networks.Network;
let profile: Contracts.IProfile;
let Wrapper: React.FC;

describe("InputFee", () => {
	beforeEach(() => {
		profile = env.profiles().first();
		network = profile.wallets().first().network();

		defaultProps = {
			...getDefaultProperties(),
			network,
			profile,
		};

		// eslint-disable-next-line react/display-name
		Wrapper = () => {
			const [gasPrice, setGasPrice] = useState(defaultProps.gasPrice);
			const [viewType, setViewType] = useState(defaultProps.viewType);
			const [simpleValue, setSimpleValue] = useState(defaultProps.selectedFeeOption);
			const [gasLimit, setGasLimit] = useState(defaultProps.gasLimit);

			const handleChangeGasPrice = (newValue: BigNumber | string | number) => {
				setGasPrice(BigNumber.make(newValue));
				defaultProps.onChangeGasPrice(newValue);
			};

			const handleChangeViewType = (newValue: InputFeeViewType) => {
				setViewType(newValue);
				defaultProps.onChangeViewType?.(newValue);
			};

			const handleChangeSimpleValue = (value_: InputFeeOption) => {
				setSimpleValue(value_);
				defaultProps.onChangeFeeOption?.(value_);
			};

			const handleChangeGasLimit = (value: BigNumber | string | number) => {
				setGasLimit(BigNumber.make(value));
				defaultProps.onChangeGasLimit(value);
			};

			return (
				<InputFee
					{...defaultProps}
					gasPrice={gasPrice}
					gasLimit={gasLimit}
					onChangeGasPrice={handleChangeGasPrice}
					onChangeGasLimit={handleChangeGasLimit}
					viewType={viewType}
					onChangeViewType={handleChangeViewType}
					selectedFeeOption={simpleValue}
					onChangeFeeOption={handleChangeSimpleValue}
				/>
			);
		};
	});

	it("should keep different values for simple and advanced view types", async () => {
		const { asFragment } = render(<Wrapper />);

		// go to advanced mode and check value changes
		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		expect(defaultProps.onChangeViewType).toHaveBeenCalledWith(InputFeeViewType.Advanced);
		// expect(defaultProps.onChangeGasPrice).toHaveBeenCalled(defaultProps.gasPrice);

		expect(screen.getByTestId("Input_GasPrice")).toBeInTheDocument();
		expect(screen.queryByTestId("ButtonGroup")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		// go to simple mode
		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.SIMPLE));

		expect(defaultProps.onChangeViewType).toHaveBeenCalledWith(InputFeeViewType.Simple);
		expect(defaultProps.onChangeGasPrice).toHaveBeenCalledWith(defaultProps.avg);

		expect(screen.queryByTestId("Input_GasPrice")).not.toBeInTheDocument();
		expect(screen.getByTestId("ButtonGroup")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		// go back to advanced mode and repeat checks
		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		expect(defaultProps.onChangeViewType).toHaveBeenCalledWith(InputFeeViewType.Advanced);
		// expect(defaultProps.onChangeGasPrice).toHaveBeenCalledWith(defaultProps.gasPrice);
	});

	it("should switch to simple and advanced type when value is number", async () => {
		defaultProps.gasPrice = BigNumber.make(8.5);

		render(<Wrapper />);

		expect(screen.getByTestId("ButtonGroup")).toBeInTheDocument();

		// go to advanced mode and check value changes
		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		expect(screen.getByTestId("Input_GasPrice")).toBeInTheDocument();
		expect(screen.queryByTestId("ButtonGroup")).not.toBeInTheDocument();

		expect(screen.getByTestId("Input_GasPrice")).toHaveValue("8.5");

		// go to simple mode
		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.SIMPLE));

		expect(screen.getByTestId("ButtonGroup")).toBeInTheDocument();
	});

	describe("simple view type", () => {
		it.each([
			[translations.FEES.SLOW, getDefaultProperties().min],
			[translations.FEES.AVERAGE, getDefaultProperties().avg],
			[translations.FEES.FAST, getDefaultProperties().max],
		])("should update value when clicking button %s", async (optionText, optionValue) => {
			const { asFragment } = render(<Wrapper />);

			await userEvent.click(screen.getByText(optionText));

			expect(defaultProps.onChangeGasPrice).toHaveBeenCalledWith(optionValue);
			expect(asFragment()).toMatchSnapshot();
		});

		it("should display converted values when on live net", () => {
			vi.spyOn(network, "isLive").mockReturnValueOnce(true);

			// use fiat currency for the converted balance
			vi.spyOn(profile.settings(), "get").mockReturnValue("EUR");

			const { asFragment } = render(<InputFee {...defaultProps} />);

			expect(screen.getAllByTestId("Amount")).toHaveLength(6);
			expect(asFragment()).toMatchSnapshot();
		});

		it.each(["xs", "sm", "md", "lg", "xl"])("should render simple view in %s", (breakpoint) => {
			const { asFragment } = renderResponsive(<InputFee {...defaultProps} />, breakpoint);

			expect(screen.queryByTestId("Input_GasPrice")).not.toBeInTheDocument();

			if (breakpoint !== "xs") {
				expect(screen.getByTestId("ButtonGroup")).toBeInTheDocument();
			}

			expect(asFragment()).toMatchSnapshot();
		});

		it.each(["xs", "sm", "md", "lg", "xl"])(
			"should render simple view with converted values in %s",
			(breakpoint) => {
				vi.spyOn(network, "isLive").mockReturnValueOnce(true);

				// use fiat currency for the converted balance
				vi.spyOn(profile.settings(), "get").mockReturnValue("EUR");

				const { asFragment } = renderResponsive(<InputFee {...defaultProps} />, breakpoint);

				expect(screen.queryByTestId("Input_GasPrice")).not.toBeInTheDocument();

				if (breakpoint !== "xs") {
					expect(screen.getByTestId("ButtonGroup")).toBeInTheDocument();
				}

				expect(asFragment()).toMatchSnapshot();
			},
		);

		it.each(["xs", "sm"])("should render loading state of simple view in %s", (breakpoint) => {
			const { asFragment } = renderResponsive(<InputFee {...defaultProps} loading={true} />, breakpoint);

			expect(screen.queryByTestId("Input_GasPrice")).not.toBeInTheDocument();

			if (breakpoint !== "xs") {
				expect(screen.getByTestId("ButtonGroup")).toBeInTheDocument();
			}

			expect(asFragment()).toMatchSnapshot();
		});
	});

	describe("advanced view type", () => {
		it("should allow to input a value", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			const { asFragment } = render(<Wrapper />);

			const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");

			expect(inputElement).toBeInTheDocument();

			inputElement.select();
			await userEvent.clear(inputElement);
			await userEvent.type(inputElement, "8.447");

			expect(defaultProps.onChangeGasPrice).toHaveBeenCalledWith(BigNumber.make(8.447));
			expect(inputElement).toHaveValue("8.447");
			expect(asFragment()).toMatchSnapshot();
		});

		it("should increment value by step when up button is clicked", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.gasPrice = BigNumber.make(0.5);

			render(<InputFee {...defaultProps} />);

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__up"));

			expect(defaultProps.onChangeGasPrice).toHaveBeenCalledWith(BigNumber.make(1.5));
		});

		it("should decrement value by step when down button is clicked", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.gasPrice = BigNumber.make(6.5);

			render(<InputFee {...defaultProps} />);

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__down"));

			expect(defaultProps.onChangeGasPrice).toHaveBeenCalledWith(BigNumber.make(5.5));
		});

		it("should disable down button when value is zero", () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.gasPrice = BigNumber.make(0);

			render(<InputFee {...defaultProps} />);

			expect(screen.getByTestId("InputFeeAdvanced__down")).toBeDisabled();
		});

		it("should disable down button when gasPrice is less than min gas Price", () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.gasPrice = BigNumber.make(3);

			render(<InputFee {...defaultProps} />);

			expect(screen.getByTestId("InputFeeAdvanced__down")).toBeDisabled();
		});

		it("should not allow to input negative values", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;

			render(<InputFee {...defaultProps} />);

			const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");

			inputElement.select();
			await userEvent.clear(inputElement, "-1.4");
			await userEvent.type(inputElement, "-1.4");

			expect(inputElement).toHaveValue("1.4");
		});

		it("should render disabled", () => {
			defaultProps.viewType = InputFeeViewType.Advanced;

			const { asFragment } = render(<InputFee {...defaultProps} disabled />);

			expect(screen.getByTestId("InputFeeAdvanced__up")).toBeDisabled();
			expect(screen.getByTestId("InputFeeAdvanced__down")).toBeDisabled();
			expect(screen.getByTestId("Input_GasPrice")).toBeDisabled();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should set min gasPrice when field is empty and up button is clicked", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.gasPrice = BigNumber.make(0);

			render(<InputFee {...defaultProps} />);

			const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");

			inputElement.select();
			await userEvent.clear(inputElement);

			expect(inputElement).toHaveValue("");

			expect(screen.getByTestId("InputFeeAdvanced__up")).not.toBeDisabled();
			expect(screen.getByTestId("InputFeeAdvanced__down")).toBeDisabled();

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__up"));

			expect(defaultProps.onChangeGasPrice).toHaveBeenCalledWith(BigNumber.make(5));
		});

		it("should display converted value when on live net", () => {
			defaultProps.viewType = InputFeeViewType.Advanced;

			const networkIsLive = vi.spyOn(network, "isLive").mockReturnValue(true);

			const getFiatCurrency = vi.spyOn(profile.settings(), "get").mockReturnValue("EUR");

			const { asFragment } = render(<InputFee {...defaultProps} network={network} />);

			expect(screen.getByTestId("InputFeeAdvanced__convertedGasFee")).toHaveTextContent(/^~€0.00$/);

			expect(asFragment()).toMatchSnapshot();

			networkIsLive.mockRestore();
			getFiatCurrency.mockRestore();
		});
	});
});
