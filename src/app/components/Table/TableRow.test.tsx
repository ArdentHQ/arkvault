import React from "react";

import { TableRow } from "./TableRow";
import { render, screen } from "@/utils/testing-library";

describe("TableRow", () => {
	it("should render with border", () => {
		const { container } = render(
			<table>
				<tbody>
					<TableRow border={true} />
				</tbody>
			</table>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render without border", () => {
		const { container } = render(
			<table>
				<tbody>
					<TableRow border={false} />
				</tbody>
			</table>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with onClick callback", () => {
		const { container } = render(
			<table>
				<tbody>
					<TableRow onClick={vi.fn()} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TableRow")).toHaveClass("group");
		expect(container).toMatchSnapshot();
	});

	it("should render without onClick callback", () => {
		const { container } = render(
			<table>
				<tbody>
					<TableRow />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("TableRow")).toHaveClass("group");
		expect(container).toMatchSnapshot();
	});
});
