import React from "react";
import { ProfilePageSkeleton } from "./ProfilePageSkeleton";
import { render } from "@/utils/testing-library";

describe("ProfilePageSkeleton", () => {
	it("should render without profile", () => {
		const { asFragment } = render(<ProfilePageSkeleton />);

		expect(asFragment()).toMatchSnapshot();
	});
});
