import React from "react";
import { SelectPolygonAddress } from "./SelectPolygonAddress";
import { render, screen } from "@/utils/testing-library";

describe("SelectPolygonAddress", () => {
	it("should render", () => {
		render(<SelectPolygonAddress />);

		expect(screen.getByTestId("SelectPolygonAddress__input")).toBeInTheDocument();

		expect(screen.queryByTestId("EthereumAvatar")).not.toBeInTheDocument();
	});

	it("should render disabled", () => {
		render(<SelectPolygonAddress disabled />);

		expect(screen.getByTestId("SelectPolygonAddress__input")).toBeInTheDocument();

		expect(screen.getByTestId("SelectPolygonAddress__input")).toBeDisabled();
	});

	it("should render with placeholder", () => {
		render(<SelectPolygonAddress placeholder="Select" />);

		expect(screen.getByTestId("SelectPolygonAddress__input")).toBeInTheDocument();

		expect(screen.getByTestId("SelectPolygonAddress__input")).toHaveAttribute("placeholder", "Select");
	});

	it("should render with a value", () => {
		render(<SelectPolygonAddress value="0x000" />);

		expect(screen.getByTestId("SelectPolygonAddress__input")).toBeInTheDocument();

		expect(screen.getByTestId("EthereumAvatar")).toBeInTheDocument();
	});
});
