import userEvent from "@testing-library/user-event";
import React, { useState } from "react";

import { Switch, SwitchOption } from "./Switch";
import { render, screen } from "@/utils/testing-library";

describe("Switch", () => {
	const onChange = jest.fn();

	const leftOption: SwitchOption = { label: "Option A", value: "a" };
	const rightOption: SwitchOption = { label: "Option B", value: "b" };

	const Wrapper = () => {
		const [value, setValue] = useState("a");

		const change = (value_: string) => {
			onChange(value_);
			setValue(value_);
		};

		return <Switch value={value} onChange={change} leftOption={leftOption} rightOption={rightOption} />;
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render", () => {
		const { asFragment } = render(<Wrapper />);

		expect(screen.getByRole("checkbox")).toBeInTheDocument();
		expect(screen.getByText("Option A")).toBeInTheDocument();
		expect(screen.getByText("Option B")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render small labels", () => {
		const { asFragment } = render(
			<Switch size="sm" value="a" onChange={onChange} leftOption={leftOption} rightOption={rightOption} />,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render large labels", () => {
		const { asFragment } = render(
			<Switch size="lg" value="a" onChange={onChange} leftOption={leftOption} rightOption={rightOption} />,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render disabled", () => {
		const { asFragment } = render(
			<Switch disabled value="a" onChange={onChange} leftOption={leftOption} rightOption={rightOption} />,
		);

		expect(screen.getByRole("checkbox")).toBeDisabled();
		expect(screen.getByRole("checkbox")).not.toHaveAttribute("checked", "");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should allow changing the selected option by clicking the handle", () => {
		render(<Wrapper />);

		userEvent.click(screen.getByRole("checkbox"));

		expect(onChange).toHaveBeenCalledWith("b");
		expect(screen.getByRole("checkbox")).toBeChecked();

		userEvent.click(screen.getByRole("checkbox"));

		expect(onChange).toHaveBeenCalledWith("a");
		expect(screen.getByRole("checkbox")).not.toBeChecked();
	});

	it("should allow changing the selected option by clicking the option text", () => {
		render(<Wrapper />);

		userEvent.click(screen.getByText("Option B"));

		expect(onChange).toHaveBeenCalledWith("b");
		expect(screen.getByRole("checkbox")).toBeChecked();

		userEvent.click(screen.getByText("Option A"));

		expect(onChange).toHaveBeenCalledWith("a");
		expect(screen.getByRole("checkbox")).not.toBeChecked();
	});

	it("should not select option by clicking the option text when disabled", () => {
		render(<Switch disabled value="a" onChange={onChange} leftOption={leftOption} rightOption={rightOption} />);

		expect(screen.getByRole("checkbox")).not.toBeChecked();

		userEvent.click(screen.getByText("Option B"));

		expect(onChange).not.toHaveBeenCalled();
		expect(screen.getByRole("checkbox")).not.toBeChecked();
	});
});
