import React from "react";

import { StepsProvider } from "@/app/contexts";
import { render, screen } from "@/utils/testing-library";

import { StepHeader } from "./StepHeader";

describe("StepHeader", () => {
	it("should render", () => {
		const { asFragment } = render(
			<StepsProvider activeStep={1} steps={4}>
				<StepHeader title="title" subtitle="subtitle" />
			</StepsProvider>,
		);

		expect(screen.getByRole("list")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with extra", () => {
		const { asFragment } = render(
			<StepsProvider activeStep={1} steps={4}>
				<StepHeader title="title" subtitle="subtitle" extra="extra" />
			</StepsProvider>,
		);

		expect(screen.getByRole("list")).toBeInTheDocument();
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
