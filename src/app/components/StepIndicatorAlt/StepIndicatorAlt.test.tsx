import React from "react";
import { StepIndicatorAlt } from "./StepIndicatorAlt";
import { render, screen } from "@/utils/testing-library";

describe("StepIndicatorAlt", () => {
	it("should render", () => {
		const { asFragment } = render(<StepIndicatorAlt length={3} />);

		expect(screen.getByTestId("StepIndicatorAlt")).toBeInTheDocument();
		expect(screen.getAllByTestId("StepIndicatorAlt__step")).toHaveLength(3);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with active index", () => {
		const { asFragment } = render(<StepIndicatorAlt length={3} activeIndex={2} />);

		expect(screen.getByTestId("StepIndicatorAlt")).toBeInTheDocument();
		expect(screen.getAllByTestId("StepIndicatorAlt__step")).toHaveLength(3);
		expect(screen.getAllByTestId("StepIndicatorAlt__prevstep")).toHaveLength(1);
		expect(screen.getAllByTestId("StepIndicatorAlt__activestep")).toHaveLength(1);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render checkmark if active index is last step", () => {
		const { asFragment } = render(<StepIndicatorAlt length={3} activeIndex={3} />);

		expect(screen.getByTestId("StepIndicatorAlt")).toBeInTheDocument();
		expect(screen.getAllByTestId("StepIndicatorAlt__step")).toHaveLength(3);
		expect(screen.getAllByTestId("StepIndicatorAlt__prevstep")).toHaveLength(3);
		expect(screen.queryByTestId("StepIndicatorAlt__activestep")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
