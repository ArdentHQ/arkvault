import { renderHook } from "@testing-library/react";
import { useLineGraph } from "./LineGraph.helpers";

describe("LineGraph.helpers", () => {
	describe("useLineGraph", () => {
		it("should plot data to svg rectangles needed to render the line", () => {
			const { result } = renderHook(() =>
				useLineGraph(
					[
						{ color: "success-600", data: { label: "item 1" }, value: 50 },
						{ color: "warning-600", data: { label: "item 2" }, value: 30 },
						{ color: "info-600", data: { label: "item 3" }, value: 20 },
					],
					{
						graphWidth: 100,
						segmentHeight: 8,
						segmentHeightHover: 16,
						segmentSpacing: 8,
					},
				),
			);

			expect(result.current).toMatchSnapshot();
		});

		it("should assign full graph width to single graph segment", () => {
			const { result } = renderHook(() =>
				useLineGraph([{ color: "success-600", data: { label: "item 1" }, value: 95 }], {
					graphWidth: 100,
					segmentHeight: 8,
					segmentHeightHover: 16,
					segmentSpacing: 8,
				}),
			);

			expect(result.current[0].width).toBe(100);
			expect(result.current).toMatchSnapshot();
		});
	});
});
