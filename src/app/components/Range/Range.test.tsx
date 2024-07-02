import React from "react";

import { render, screen } from "@/utils/testing-library";

import { Range } from "./Range";

describe("Range", () => {
	it("should render", () => {
		const onChange = vi.fn();
		const { asFragment } = render(<Range values={[10]} onChange={onChange} />);

		expect(screen.getByTestId("Range")).toBeInTheDocument();
		expect(screen.getByTestId("Range__track")).toBeInTheDocument();
		expect(screen.getByTestId("Range__track__filled")).toBeInTheDocument();
		expect(screen.getByTestId("Range__thumb")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render invalid", () => {
		const onChange = vi.fn();
		const { asFragment } = render(<Range values={[10]} isInvalid onChange={onChange} />);

		expect(screen.getByTestId("Range")).toBeInTheDocument();
		expect(screen.getByTestId("Range__track")).toBeInTheDocument();
		expect(screen.getByTestId("Range__track__filled")).toBeInTheDocument();
		expect(screen.getByTestId("Range__thumb")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
