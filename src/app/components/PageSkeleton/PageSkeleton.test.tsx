import React from "react";

import { render } from "@/utils/testing-library";

import { PageSkeleton } from "./PageSkeleton";

describe("PageSkeleton", () => {
	it("should render without profile", () => {
		const { asFragment } = render(<PageSkeleton />);

		expect(asFragment()).toMatchSnapshot();
	});
});
