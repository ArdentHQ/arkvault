import { screen, waitFor, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { AddToOtherGroupFunction, GRAPH_MIN_VALUE, GraphType } from "./Graphs.contracts";
import { useGraphData, useGraphTooltip, useGraphWidth } from "./Graphs.shared";
import { act, render } from "@/utils/testing-library";

const addToOtherGroup: AddToOtherGroupFunction = (otherGroup, entry) => ({
	color: "",
	data: { label: "Other" },
	value: (otherGroup?.value ?? 0) + entry.value,
});

describe("Graphs shared hooks", () => {
	describe("useGraphWidth", () => {
		it("should return reference and width of the svg element where it is applied", () => {
			const Component = () => {
				const [reference, width] = useGraphWidth();

				return (
					<svg ref={reference}>
						<text>{width}</text>
					</svg>
				);
			};

			const { asFragment } = render(<Component />);

			act(() => {
				global.dispatchEvent(new Event("resize"));
			});

			expect(asFragment()).toMatchSnapshot();
		});

		it("should have 0 as default width when reference is not applied on any element", () => {
			const { result } = renderHook(() => useGraphWidth());

			const [, width] = result.current;

			expect(width).toBe(0);
		});
	});

	describe("useGraphTooltip", () => {
		it("returns empty component and props when the render function is not specified", () => {
			const { result } = renderHook(() => useGraphTooltip(undefined, "line"));

			const { Tooltip, getMouseEventProperties } = result.current;

			expect(Object.keys(getMouseEventProperties({ color: "success-600", data: {}, value: 100 }))).toHaveLength(
				0,
			);

			const { asFragment } = render(<Tooltip />);

			expect(asFragment()).toMatchInlineSnapshot(`<DocumentFragment />`);
		});

		it("returns tooltip component and props for the target element when type is line", async () => {
			const renderTooltip = (dataPoint) => <p data-testid="TooltipContent">value is: {dataPoint.value}</p>;

			const Component = () => {
				const { Tooltip, getMouseEventProperties } = useGraphTooltip(renderTooltip, "line");

				const rectProperties: React.SVGProps<SVGRectElement> = { height: 4, width: 4, y: 0 };

				return (
					<div>
						<Tooltip />

						<svg width={8} height={4}>
							<rect
								data-testid="Rect1"
								x={0}
								{...rectProperties}
								{...getMouseEventProperties({ color: "success-600", data: {}, value: 85 })}
							/>
							<rect
								data-testid="Rect2"
								x={4}
								{...rectProperties}
								{...getMouseEventProperties({ color: "warning-600", data: {}, value: 15 })}
							/>
						</svg>
					</div>
				);
			};

			render(<Component />);

			expect(screen.queryByTestId("TooltipContent")).not.toBeInTheDocument();

			expect(screen.getByTestId("Rect1")).toBeInTheDocument();
			expect(screen.getByTestId("Rect2")).toBeInTheDocument();

			await userEvent.hover(screen.getByTestId("Rect1"));

			await waitFor(() => expect(screen.getByTestId("TooltipContent")).toHaveTextContent("value is: 85"));

			await userEvent.unhover(screen.getByTestId("Rect1"));
			await userEvent.hover(screen.getByTestId("Rect2"));

			await waitFor(() => expect(screen.getByTestId("TooltipContent")).toHaveTextContent("value is: 15"));

			expect(screen.getByTestId("TooltipContainer")).not.toHaveClass("hidden");

			await userEvent.unhover(screen.getByTestId("Rect2"));

			// Wait for the tooltip to fade out completely.
			await waitFor(() => expect(screen.getByTestId("TooltipContainer")).toHaveClass("hidden"));
		});

		it("returns tooltip component and props for the target element when type is donut", async () => {
			const renderTooltip = (dataPoint) => <p data-testid="TooltipContent">value is: {dataPoint.value}</p>;

			const Component = () => {
				const { Tooltip, getMouseEventProperties } = useGraphTooltip(renderTooltip, "donut");

				const circleProperties: React.SVGProps<SVGCircleElement> = {
					cx: 21,
					cy: 21,
					fill: "transparent",
					r: 100 / (2 * Math.PI),
				};

				return (
					<div>
						<Tooltip />

						<svg viewBox="0 0 42 42">
							<circle
								data-testid="Circle1"
								{...circleProperties}
								{...getMouseEventProperties({ color: "success-600", data: {}, value: 85 })}
								strokeDasharray="85 15"
								strokeDashoffset="25"
							/>
							<circle
								data-testid="Circle2"
								{...circleProperties}
								{...getMouseEventProperties({ color: "warning-600", data: {}, value: 15 })}
								strokeDasharray="15 85"
								strokeDashoffset="40"
							/>
						</svg>
					</div>
				);
			};

			render(<Component />);

			expect(screen.queryByTestId("TooltipContent")).not.toBeInTheDocument();

			expect(screen.getByTestId("Circle1")).toBeInTheDocument();
			expect(screen.getByTestId("Circle2")).toBeInTheDocument();

			await userEvent.hover(screen.getByTestId("Circle1"));

			await waitFor(() => expect(screen.getByTestId("TooltipContent")).toHaveTextContent("value is: 85"));

			await userEvent.unhover(screen.getByTestId("Circle1"));
			await userEvent.hover(screen.getByTestId("Circle2"));

			await waitFor(() => expect(screen.getByTestId("TooltipContent")).toHaveTextContent("value is: 15"));

			expect(screen.getByTestId("TooltipContainer")).not.toHaveClass("hidden");

			await userEvent.unhover(screen.getByTestId("Circle2"));

			// Wait for the tooltip to fade out completely.
			await waitFor(() => expect(screen.getByTestId("TooltipContainer")).toHaveClass("hidden"));
		});
	});

	describe("useGraphData", () => {
		const THRESHOLD = 5; // for the test assume threshold is 5%

		describe.each([
			{ size: GRAPH_MIN_VALUE.line / THRESHOLD, type: "line" as GraphType },
			{ size: GRAPH_MIN_VALUE.donut / THRESHOLD, type: "donut" as GraphType },
		])("group (%s)", ({ type, size }) => {
			it("should not group basic entries", () => {
				const { result } = renderHook(() => useGraphData(type, addToOtherGroup));

				expect(
					result.current.group(
						[
							{ color: "", data: { label: "ARK" }, value: 90 },
							{ color: "", data: { label: "LSK" }, value: 10 },
						],
						size,
					),
				).toStrictEqual([
					{ color: "", data: { label: "ARK" }, value: 90 },
					{ color: "", data: { label: "LSK" }, value: 10 },
				]);
			});

			it("should group small balances when they are less than 6", () => {
				const { result } = renderHook(() => useGraphData(type, addToOtherGroup));

				expect(
					result.current.group(
						[
							{ color: "", data: { label: "ARK" }, value: 90 },
							{ color: "", data: { label: "LSK" }, value: 4 },
							{ color: "", data: { label: "ETH" }, value: 4 },
							{ color: "", data: { label: "BTC" }, value: 2 },
						],
						size,
					),
				).toStrictEqual([
					{ color: "", data: { label: "ARK" }, value: 90 },
					{ color: "", data: { label: "Other" }, value: 10 },
				]);
			});

			it("should group small balances when they are more than 6", () => {
				const { result } = renderHook(() => useGraphData(type, addToOtherGroup));

				expect(
					result.current.group(
						[
							{ color: "", data: { label: "ARK" }, value: 80 },
							{ color: "", data: { label: "LSK" }, value: 6 },
							{ color: "", data: { label: "ETH" }, value: 2 },
							{ color: "", data: { label: "SOL" }, value: 3 },
							{ color: "", data: { label: "GALA" }, value: 1 },
							{ color: "", data: { label: "AVAX" }, value: 3 },
							{ color: "", data: { label: "TLM" }, value: 1 },
							{ color: "", data: { label: "MANA" }, value: 2 },
							{ color: "", data: { label: "BTC" }, value: 2 },
						],
						size,
					),
				).toStrictEqual([
					{ color: "", data: { label: "ARK" }, value: 80 },
					{ color: "", data: { label: "LSK" }, value: 6 },
					{ color: "", data: { label: "Other" }, value: 14 },
				]);
			});

			it("should hide small balances when their sum is below the threshold and they are less than 6", () => {
				const { result } = renderHook(() => useGraphData(type, addToOtherGroup));

				expect(
					result.current.group(
						[
							{ color: "", data: { label: "ARK" }, value: 99 },
							{ color: "", data: { label: "LSK" }, value: 1 },
						],
						size,
					),
				).toStrictEqual([{ color: "", data: { label: "ARK" }, value: 99 }]);
			});

			it("should hide small balances when their sum is below the threshold and they are more than 6", () => {
				const { result } = renderHook(() => useGraphData(type, addToOtherGroup));

				expect(
					result.current.group(
						[
							{ color: "", data: { label: "ARK" }, value: 90 },
							{ color: "", data: { label: "LSK" }, value: 6 },
							{ color: "", data: { label: "ETH" }, value: 1 },
							{ color: "", data: { label: "BTC" }, value: 1 },
							{ color: "", data: { label: "ADA" }, value: 1 },
							{ color: "", data: { label: "SOL" }, value: 1 },
						],
						size,
					),
				).toStrictEqual([
					{ color: "", data: { label: "ARK" }, value: 90 },
					{ color: "", data: { label: "LSK" }, value: 6 },
				]);
			});

			it("should support both grouping and limiting", () => {
				const { result } = renderHook(() => useGraphData(type, addToOtherGroup));

				expect(
					result.current.group(
						[
							{ color: "", data: { label: "ARK" }, value: 10 },
							{ color: "", data: { label: "LSK" }, value: 10 },
							{ color: "", data: { label: "BTC" }, value: 10 },
							{ color: "", data: { label: "ETH" }, value: 10 },
							{ color: "", data: { label: "ADA" }, value: 10 },
							{ color: "", data: { label: "SOL" }, value: 10 },
							{ color: "", data: { label: "BNB" }, value: 9 },
							{ color: "", data: { label: "GALA" }, value: 6 },
							{ color: "", data: { label: "AVAX" }, value: 8 },
							{ color: "", data: { label: "TLM" }, value: 7 },
							{ color: "", data: { label: "MANA" }, value: 7 },
							{ color: "", data: { label: "XRP" }, value: 1 },
							{ color: "", data: { label: "LUNA" }, value: 2 },
						],
						size,
					),
				).toStrictEqual([
					{ color: "", data: { label: "ARK" }, value: 10 },
					{ color: "", data: { label: "LSK" }, value: 10 },
					{ color: "", data: { label: "BTC" }, value: 10 },
					{ color: "", data: { label: "ETH" }, value: 10 },
					{ color: "", data: { label: "ADA" }, value: 10 },
					{ color: "", data: { label: "SOL" }, value: 10 },
					{ color: "", data: { label: "Other" }, value: 40 },
				]);
			});
		});
	});
});
