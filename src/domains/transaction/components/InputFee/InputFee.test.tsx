import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";

import { InputFee } from "./InputFee";
import { InputFeeProperties, InputFeeSimpleValue, InputFeeViewType } from "./InputFee.contracts";
import { translations } from "@/domains/transaction/i18n";
import { env, render, renderResponsive, screen } from "@/utils/testing-library";

const getDefaultProperties = (): Omit<InputFeeProperties, "network" | "profile"> => ({
	avg: 0.456,
	disabled: false,
	loading: false,
	max: 0.5,
	min: 0.006,
	onChange: vi.fn(),
	onChangeSimpleValue: vi.fn(),
	onChangeViewType: vi.fn(),
	simpleValue: InputFeeSimpleValue.Average,
	step: 0.001,
	value: "0.3",
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
			const [value, setValue] = useState(defaultProps.value);
			const [viewType, setViewType] = useState(defaultProps.viewType);
			const [simpleValue, setSimpleValue] = useState(defaultProps.simpleValue);

			const handleChangeValue = (newValue: string) => {
				setValue(newValue);
				defaultProps.onChange(newValue);
			};

			const handleChangeViewType = (newValue: InputFeeViewType) => {
				setViewType(newValue);
				defaultProps.onChangeViewType?.(newValue);
			};

			const handleChangeSimpleValue = (value_: InputFeeSimpleValue) => {
				setSimpleValue(value_);
				defaultProps.onChangeSimpleValue?.(value_);
			};

			return (
				<InputFee
					{...defaultProps}
					value={value}
					onChange={handleChangeValue}
					viewType={viewType}
					onChangeViewType={handleChangeViewType}
					simpleValue={simpleValue}
					onChangeSimpleValue={handleChangeSimpleValue}
				/>
			);
		};
	});

	it("should keep different values for simple and advanced view types", async () => {
		const { asFragment } = render(<Wrapper />);

		// go to advanced mode and check value changes
		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		expect(defaultProps.onChangeViewType).toHaveBeenCalledWith(InputFeeViewType.Advanced);
		expect(defaultProps.onChange).toHaveBeenCalledWith(defaultProps.value);

		expect(screen.getByTestId("InputCurrency")).toBeInTheDocument();
		expect(screen.queryByTestId("ButtonGroup")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		// go to simple mode
		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.SIMPLE));

		expect(defaultProps.onChangeViewType).toHaveBeenCalledWith(InputFeeViewType.Simple);
		expect(defaultProps.onChange).toHaveBeenCalledWith(defaultProps.avg.toString());

		expect(screen.queryByTestId("InputCurrency")).not.toBeInTheDocument();
		expect(screen.getByTestId("ButtonGroup")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		// go back to advanced mode and repeat checks
		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		expect(defaultProps.onChangeViewType).toHaveBeenCalledWith(InputFeeViewType.Advanced);
		expect(defaultProps.onChange).toHaveBeenCalledWith(defaultProps.value);
	});

	it("should switch to simple and advanced type when value is number", async () => {
		defaultProps.value = 0.123 as unknown as string;

		render(<Wrapper />);

		expect(screen.getByTestId("ButtonGroup")).toBeInTheDocument();

		// go to advanced mode and check value changes
		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		expect(screen.getByTestId("InputCurrency")).toBeInTheDocument();
		expect(screen.queryByTestId("ButtonGroup")).not.toBeInTheDocument();

		expect(screen.getByTestId("InputCurrency")).toHaveValue("0.123");

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

			expect(defaultProps.onChange).toHaveBeenCalledWith(optionValue.toString());
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

			expect(screen.queryByTestId("InputCurrency")).not.toBeInTheDocument();

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

				expect(screen.queryByTestId("InputCurrency")).not.toBeInTheDocument();

				if (breakpoint !== "xs") {
					expect(screen.getByTestId("ButtonGroup")).toBeInTheDocument();
				}

				expect(asFragment()).toMatchSnapshot();
			},
		);

		it.each(["xs", "sm"])("should render loading state of simple view in %s", (breakpoint) => {
			const { asFragment } = renderResponsive(<InputFee {...defaultProps} loading={true} />, breakpoint);

			expect(screen.queryByTestId("InputCurrency")).not.toBeInTheDocument();

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

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			expect(inputElement).toBeInTheDocument();

			inputElement.select();
			await userEvent.clear(inputElement);
			await userEvent.type(inputElement, "0.447");

			expect(defaultProps.onChange).toHaveBeenCalledWith("0.447");
			expect(inputElement).toHaveValue("0.447");
			expect(asFragment()).toMatchSnapshot();
		});

		it("should use avg as the default value", () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.avg = 0.1234;
			defaultProps.value = undefined;

			render(<InputFee {...defaultProps} />);

			expect(screen.getByTestId("InputCurrency")).toHaveValue("0.1234");
		});

		it("should increment value by step when up button is clicked", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.step = 0.01;
			defaultProps.value = "0.5";

			render(<InputFee {...defaultProps} />);

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__up"));
			await userEvent.click(screen.getByTestId("InputFeeAdvanced__up"));
			await userEvent.click(screen.getByTestId("InputFeeAdvanced__up"));

			expect(screen.getByTestId("InputCurrency")).toHaveValue("0.53");
		});

		it("should decrement value by step when down button is clicked", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.step = 0.01;
			defaultProps.value = "0.5";

			render(<InputFee {...defaultProps} />);

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__down"));
			await userEvent.click(screen.getByTestId("InputFeeAdvanced__down"));
			await userEvent.click(screen.getByTestId("InputFeeAdvanced__down"));

			expect(screen.getByTestId("InputCurrency")).toHaveValue("0.47");
		});

		it("should disable down button when value is zero", () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.step = 0.01;
			defaultProps.value = "0";

			render(<InputFee {...defaultProps} />);

			expect(screen.getByTestId("InputFeeAdvanced__down")).toBeDisabled();
		});

		it("should not allow to input negative values", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;

			render(<InputFee {...defaultProps} />);

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			inputElement.select();
			await userEvent.clear(inputElement, "-1.4");
			await userEvent.type(inputElement, "-1.4");

			expect(inputElement).toHaveValue("1.4");
		});

		it("should not allow to set a negative value with down button", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.step = 0.6;
			defaultProps.value = "1.5";

			render(<InputFee {...defaultProps} />);

			expect(screen.getByTestId("InputCurrency")).toHaveValue("1.5");

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__down"));

			expect(screen.getByTestId("InputCurrency")).toHaveValue("0.9");

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__down"));

			expect(screen.getByTestId("InputCurrency")).toHaveValue("0.3");

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__down"));

			expect(screen.getByTestId("InputCurrency")).toHaveValue("0");
		});

		it("should render disabled", () => {
			defaultProps.viewType = InputFeeViewType.Advanced;

			const { asFragment } = render(<InputFee {...defaultProps} disabled />);

			expect(screen.getByTestId("InputFeeAdvanced__up")).toBeDisabled();
			expect(screen.getByTestId("InputFeeAdvanced__down")).toBeDisabled();
			expect(screen.getByTestId("InputCurrency")).toBeDisabled();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should set value = step when empty and up button is clicked", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.step = 0.01;
			defaultProps.value = "";

			render(<InputFee {...defaultProps} />);

			expect(screen.getByTestId("InputCurrency")).not.toHaveValue();
			expect(screen.getByTestId("InputFeeAdvanced__up")).not.toBeDisabled();
			expect(screen.getByTestId("InputFeeAdvanced__down")).not.toBeDisabled();

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__up"));

			expect(screen.getByTestId("InputCurrency")).toHaveValue("0.01");
		});

		it("should set value = 0 when empty and down button is clicked", async () => {
			defaultProps.viewType = InputFeeViewType.Advanced;
			defaultProps.step = 0.01;
			defaultProps.value = "";

			render(<InputFee {...defaultProps} />);

			expect(screen.getByTestId("InputCurrency")).not.toHaveValue();
			expect(screen.getByTestId("InputFeeAdvanced__up")).not.toBeDisabled();
			expect(screen.getByTestId("InputFeeAdvanced__down")).not.toBeDisabled();

			await userEvent.click(screen.getByTestId("InputFeeAdvanced__down"));

			expect(screen.getByTestId("InputCurrency")).toHaveValue("0");
		});

		it("should display converted value when on live net", () => {
			defaultProps.viewType = InputFeeViewType.Advanced;

			vi.spyOn(network, "isLive").mockReturnValueOnce(true);

			vi.spyOn(profile.settings(), "get").mockReturnValue("EUR");

			const { asFragment } = render(<InputFee {...defaultProps} />);

			expect(screen.getByTestId("Amount")).toHaveTextContent(/^€0.00$/);
			expect(asFragment()).toMatchSnapshot();
		});
	});
});
