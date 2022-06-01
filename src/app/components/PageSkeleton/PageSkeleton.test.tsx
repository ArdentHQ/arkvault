import React from "react";
import { PageSkeleton } from "./PageSkeleton";
import { render } from "@/utils/testing-library";

describe("PageSkeleton", () => {
	it("should render without profile", () => {
		const { asFragment } = render(<PageSkeleton />);

		expect(asFragment()).toMatchSnapshot();
	});
});
