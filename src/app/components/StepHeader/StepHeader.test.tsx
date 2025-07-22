import React from "react";
import { StepHeader } from "./StepHeader";
import { render, screen } from "@/utils/testing-library";
import { StepsProvider } from "@/app/contexts";

describe("StepHeader", () => {
	it("should render", () => {
		const { asFragment } = render(
			<StepsProvider activeStep={1} steps={4}>
				<StepHeader title="title" subtitle="subtitle" />
			</StepsProvider>,
		);

		expect(screen.getAllByRole("list")).toHaveLength(2);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with extra", () => {
		const { asFragment } = render(
			<StepsProvider activeStep={1} steps={4}>
				<StepHeader title="title" subtitle="subtitle" extra="extra" />
			</StepsProvider>,
		);

		expect(screen.getAllByRole("list")).toHaveLength(2);
		expect(screen.getByText("extra")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render simple header without a provider", () => {
		const { asFragment } = render(<StepHeader title="title" subtitle="subtitle" />);

		expect(screen.getByTestId("header__title")).toBeInTheDocument();
		expect(screen.getByTestId("header__subtitle")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
