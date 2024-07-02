import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { render, screen } from "@/utils/testing-library";

import { useReloadPath } from "./use-reload-path";

describe("useReloadPath hook", () => {
	const TestComponent: React.FC = () => {
		const reloadPath = useReloadPath();

		const handle = () => {
			reloadPath();
		};
		return (
			<h1 data-testid="header_test" onClick={handle}>
				UseReloadPath Test Component
			</h1>
		);
	};

	it("should render useReloadPath", async () => {
		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
		);

		expect(screen.getByTestId("header_test")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("header_test"));

		expect(screen.getByText("UseReloadPath Test Component")).toBeInTheDocument();
	});
});
