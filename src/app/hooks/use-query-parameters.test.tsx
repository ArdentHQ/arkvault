import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { useQueryParameters } from "./use-query-parameters";
import { render, screen } from "@/utils/testing-library";

describe("useQueryParameters hook", () => {
	const TestComponent: React.FC = () => {
		const reloadPath = useQueryParameters();

		const handle = () => {
			reloadPath.get("");
		};
		return (
			<h1 data-testid="header_test" onClick={handle}>
				useQueryParameters Test Component
			</h1>
		);
	};

	it("should render useQueryParameters", () => {
		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
		);

		expect(screen.getByTestId("header_test")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("header_test"));

		expect(screen.getByText("useQueryParameters Test Component")).toBeInTheDocument();
	});
});
