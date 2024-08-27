import React from "react";

import { Avatar } from "./Avatar";
import { Size } from "@/types";
import { render, screen } from "@/utils/testing-library";

describe("Avatar", () => {
	it("should render", () => {
		const { asFragment } = render(<Avatar address="abc" />);

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with highlight", () => {
		const { asFragment } = render(<Avatar address="abc" highlight />);

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom shadow color", () => {
		const { asFragment } = render(<Avatar address="abc" shadowClassName="ring-theme-black" />);

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with highlight and custom shadow color", () => {
		const { asFragment } = render(<Avatar address="abc" shadowClassName="ring-theme-black" highlight />);

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without shadow", () => {
		const { asFragment } = render(<Avatar address="abc" size="lg" noShadow />);

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "avatarMobile", "lg", "xl"])("should render with size", (size) => {
		const { asFragment } = render(<Avatar address="abc" size={size as Size} />);

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
