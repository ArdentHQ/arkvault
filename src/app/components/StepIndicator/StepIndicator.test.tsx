import React from "react";
import { StepIndicator } from "./StepIndicator";
import { render, screen } from "@/utils/testing-library";

describe("StepIndicator", () => {
	it("should render", () => {
		const { asFragment } = render(<StepIndicator steps={["1", "2", "3"]} />);

		expect(screen.getByRole("list")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render witth active index defined", () => {
		const { asFragment } = render(<StepIndicator steps={["1", "2", "3"]} activeIndex={2} />);

		expect(screen.getByRole("list")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should limit active index to max number of steps", () => {
		const { asFragment } = render(<StepIndicator steps={["1", "2", "3"]} activeIndex={5} />);

		expect(screen.getByRole("list")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should not render with an empty steps array", () => {
		const { asFragment } = render(<StepIndicator steps={[]} />);

		expect(screen.queryByRole("list")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with active step title and subtitle", () => {
		render(
			<StepIndicator
				steps={["1", "2", "3"]}
				activeIndex={2}
				activeStepTitle="Active Step"
				activeStepSubtitle="Active Step Subtitle"
			/>,
		);

		expect(screen.getByRole("list")).toBeInTheDocument();
		expect(screen.getByText("Active Step")).toBeInTheDocument();
		expect(screen.getByText("Active Step Subtitle")).toBeInTheDocument();
	});
});
