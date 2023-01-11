import React from "react";

import { MigrationAddress, MigrationDetail } from "./MigrationAddress";
import { render } from "@/utils/testing-library";

describe("MigrationAddress", () => {
	it("should render migration address", () => {
		const { asFragment } = render(<MigrationAddress address="123" />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render ethereum address", () => {
		const { asFragment } = render(<MigrationAddress address="123" className="some-class" isEthereum />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render migration detail", () => {
		const { asFragment } = render(
			<MigrationDetail>
				<div>test</div>
			</MigrationDetail>,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render migration detail with custom class", () => {
		const { asFragment } = render(
			<MigrationDetail className="custom-class">
				<div>test</div>
			</MigrationDetail>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
