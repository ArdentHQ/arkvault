import userEvent from "@testing-library/user-event";
import React from "react";
import { DonutGraph } from "./DonutGraph";
import { render, screen, waitFor } from "@/utils/testing-library";

import { GraphDataPoint } from "@/app/components/Graphs/Graphs.contracts";

describe("DonutGraph", () => {
	let data: GraphDataPoint[];

	beforeAll(() => {
		data = [
			{ color: "success-600", data: { label: "item 1" }, value: 50 },
			{ color: "warning-600", data: { label: "item 2" }, value: 30 },
			{ color: "info-600", data: { label: "item 3" }, value: 20 },
		];
	});

	it("should render", () => {
		const { asFragment } = render(<DonutGraph size={100} data={data} />);

		expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render tooltip on hover", async () => {
		const { asFragment } = render(
			<DonutGraph
				size={100}
				data={data}
				renderTooltip={(dataPoint) => (
					<div data-testid="TooltipContent">
						{dataPoint.data.label} value: {dataPoint.value}
					</div>
				)}
			/>,
		);

		expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);

		expect(screen.queryByTestId("TooltipContent")).not.toBeInTheDocument();

		await userEvent.hover(screen.getAllByTestId("DonutGraph__item-hover-area")[2]);

		expect(screen.getByTestId("TooltipContent")).toBeInTheDocument();
		expect(screen.getByTestId("TooltipContent")).toHaveTextContent("item 1 value: 50");

		await userEvent.unhover(screen.getAllByTestId("DonutGraph__item-hover-area")[2]);
		await userEvent.hover(screen.getAllByTestId("DonutGraph__item-hover-area")[1]);

		expect(screen.getByTestId("TooltipContent")).toHaveTextContent("item 2 value: 30");

		await userEvent.unhover(screen.getAllByTestId("DonutGraph__item-hover-area")[1]);

		await waitFor(() => expect(screen.getByTestId("TooltipContainer")).toHaveClass("hidden"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render content inside the circle", () => {
		const { asFragment } = render(
			<DonutGraph
				size={100}
				data={data}
				renderContentInsideCircle={() => <div data-testid="Content">content</div>}
			/>,
		);

		expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);
		expect(screen.getByTestId("Content")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
