import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { useReloadPath } from "./use-reload-path";
import { render, screen } from "@/utils/testing-library";

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

	it("should render useReloadPath", () => {
		render(<Route path="/" element={<TestComponent />} />);

		expect(screen.getByTestId("header_test")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("header_test"));

		expect(screen.getByText("UseReloadPath Test Component")).toBeInTheDocument();
	});
});
