import { renderHook } from "@testing-library/react";
import { useDonutGraph } from "./DonutGraph.helpers";

describe("DonutGraph.helpers", () => {
	describe("useDonutGraph", () => {
		it.each([
			{
				data: [
					{ color: "success-600", data: {}, value: 50 },
					{ color: "warning-600", data: {}, value: 30 },
					{ color: "info-600", data: {}, value: 20 },
				],
			},
			{
				data: [{ color: "success-600", data: {}, value: 100 }],
			},
		])("should plot data to svg circles needed to render the donut", ({ data }) => {
			const { result } = renderHook(() => useDonutGraph(data, 100));

			expect(result.current).toMatchSnapshot();
		});
	});
});
