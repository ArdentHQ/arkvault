import React from "react";

import { render, screen } from "@/utils/testing-library";

import { StepsProvider, useSteps } from "./Steps";

describe("Steps Context", () => {
	it("should render the wrapper properly", () => {
		const { container, asFragment } = render(
			<StepsProvider activeStep={1} steps={2}>
				<span data-testid="StepsProvider">Content</span>
			</StepsProvider>,
		);

		expect(screen.getByTestId("StepsProvider")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render steps children", () => {
		const Test = () => {
			useSteps();
			return <p data-testid="content">Configuration content</p>;
		};

		render(
			<StepsProvider activeStep={1} steps={2}>
				<Test />
			</StepsProvider>,
		);

		expect(screen.getByTestId("content")).toBeInTheDocument();
	});

	it("should not throw without provider", () => {
		const Test = () => {
			useSteps();
			return <p data-testid="content">Configuration content</p>;
		};

		expect(() => render(<Test />, { withProviders: false })).not.toThrow();
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});
});
