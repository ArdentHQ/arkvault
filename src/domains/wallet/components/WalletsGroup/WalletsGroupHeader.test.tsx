import React from "react";

import { render, renderResponsive } from "@/utils/testing-library";

import { WalletsGroupHeaderSkeleton } from "./WalletsGroupHeader";

describe("WalletsGroupHeaderSkeleton", () => {
	it("should render", () => {
		const { asFragment } = render(<WalletsGroupHeaderSkeleton />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render responsive", () => {
		const { asFragment } = renderResponsive(<WalletsGroupHeaderSkeleton />, "xs");

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as placeholder", () => {
		const { asFragment } = render(<WalletsGroupHeaderSkeleton placeholder />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render responsive as placeholder", () => {
		const { asFragment } = renderResponsive(<WalletsGroupHeaderSkeleton placeholder />, "xs");

		expect(asFragment()).toMatchSnapshot();
	});
});
