import React from "react";

import { render, screen } from "@/utils/testing-library";
import { Loader } from '@/app/components/Loader';

describe("Loader", () => {
	it("should render with custom text", () => {
		const { asFragment } = render(<Loader text="Testing" />);

		expect(screen.getByTestId("Loader__wrapper")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

    it("should render with custom class names", () => {
        const { asFragment } = render(<Loader text="Testing" className="custom-class" />);

        expect(screen.getByTestId("Loader__wrapper")).toHaveClass("custom-class");
        expect(asFragment()).toMatchSnapshot();
    })

    it("should render custom text", () => {
        render(<Loader text="Testing" />);
        expect(screen.getByText("Testing")).toBeInTheDocument();
    })
});
