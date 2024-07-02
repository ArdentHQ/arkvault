import React from "react";

import { render } from "@/utils/testing-library";

import { ProfilePageSkeleton } from "./ProfilePageSkeleton";

describe("ProfilePageSkeleton", () => {
	it("should render without profile", () => {
		const { asFragment } = render(<ProfilePageSkeleton />);

		expect(asFragment()).toMatchSnapshot();
	});
});
