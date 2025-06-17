import userEvent from "@testing-library/user-event";
import React from "react";

import { NavigationProvider, useNavigationContext } from "./Navigation";
import { render, screen, waitFor, renderHook } from "@/utils/testing-library";

describe("Navigation Context", () => {
	it("should render the wrapper properly", () => {
		const { container, asFragment } = render(
			<NavigationProvider>
				<span data-testid="NavigationProvider__content">Navigation Provider content</span>
			</NavigationProvider>,
		);

		expect(screen.getByTestId("NavigationProvider__content")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should throw without provider", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			renderHook(() => useNavigationContext());
		}).toThrow("[useNavigationContext] Component not wrapped within a Provider");

		consoleSpy.mockRestore();
	});

	it("should update navigation", async () => {
		const Test = () => {
			const { hasFixedFormButtons, setHasFixedFormButtons } = useNavigationContext();
			return (
				<div data-testid="Navigation__consumer" onClick={() => setHasFixedFormButtons(true)}>
					{hasFixedFormButtons ? "Has fixed form buttons" : "Does not have fixed form buttons"}
				</div>
			);
		};

		const { asFragment } = render(
			<NavigationProvider>
				<Test />
			</NavigationProvider>,
		);

		expect(screen.getByTestId("Navigation__consumer")).toBeInTheDocument();

		expect(screen.getByText("Does not have fixed form buttons")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("Navigation__consumer"));

		await waitFor(() => expect(screen.queryByText("Does not have fixed form buttons")).not.toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();
	});
});
