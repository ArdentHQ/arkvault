import userEvent from "@testing-library/user-event";
import React from "react";

import { ConfigurationProvider, useConfiguration } from "./Configuration";
import { render, screen, waitFor, getMainsailProfileId, renderHook } from "@/utils/testing-library";

describe("Configuration Context", () => {
	it("should render the wrapper properly", () => {
		const { container, asFragment } = render(
			<ConfigurationProvider>
				<span data-testid="ConfigurationProvider__content">Configuration Provider content</span>
			</ConfigurationProvider>,
		);

		expect(screen.getByTestId("ConfigurationProvider__content")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should throw without provider", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			renderHook(() => useConfiguration());
		}).toThrow("[useConfiguration] Component not wrapped within a Provider");

		consoleSpy.mockRestore();
	});

	it("should render configuration consumer component", () => {
		const Test = () => {
			useConfiguration();
			return <p data-testid="Configuration__consumer">Configuration content</p>;
		};
		render(<Test />);

		expect(screen.getByTestId("Configuration__consumer")).toBeInTheDocument();
	});

	it("should update configuration", async () => {
		const Test = () => {
			const { setConfiguration, getProfileConfiguration } = useConfiguration();
			const { dashboard } = getProfileConfiguration(getMainsailProfileId());
			return (
				<div
					data-testid="Configuration__consumer"
					onClick={() => setConfiguration(getMainsailProfileId(), { dashboard: { viewType: "list" } })}
				>
					Configuration content
					{dashboard && dashboard.viewType === "list" && <div data-testid="Configuration__list" />}
				</div>
			);
		};

		const { asFragment } = render(<Test />);

		expect(screen.getByTestId("Configuration__consumer")).toBeInTheDocument();

		await waitFor(() => expect(screen.queryByTestId("Configuration__list")).not.toBeInTheDocument());

		userEvent.click(screen.getByTestId("Configuration__consumer"));

		await expect(screen.findByTestId("Configuration__list")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});
});
