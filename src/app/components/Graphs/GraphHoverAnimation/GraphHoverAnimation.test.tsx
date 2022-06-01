import React from "react";
import { GraphHoverAnimation } from "./GraphHoverAnimation";
import { render } from "@/utils/testing-library";

describe("GraphHoverAnimation", () => {
	it("should render SMIL hover animations for svg elements", () => {
		const { asFragment } = render(
			<svg width={16} height={16}>
				<rect width={0} height={16} x={0} y={0}>
					<GraphHoverAnimation animations={[{ attribute: "width", from: 0, to: 16 }]} />
				</rect>
			</svg>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should allow passing a target element", () => {
		const { asFragment } = render(
			<svg width={16} height={16}>
				<rect width={8} height={16} x={0} y={0} id="rectToHoverOn" />

				<rect width={0} height={16} x={8} y={0}>
					<GraphHoverAnimation
						targetElementId="rectToHoverOn"
						animations={[{ attribute: "width", from: 0, to: 8 }]}
					/>
				</rect>
			</svg>,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
