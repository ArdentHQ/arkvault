import userEvent from "@testing-library/user-event";
import React, { useRef } from "react";
import * as useResizeDetectorModule from "react-resize-detector";

import { getTruncatedValue, TruncateMiddleDynamic } from "./TruncateMiddleDynamic";
import { render, screen } from "@/utils/testing-library";

vi.mock("react-resize-detector", () => ({
	useResizeDetector: () => ({ ref: null }),
}));

describe("TruncateMiddleDynamic", () => {
	const valueToTruncate = "Lorem ipsum dolor sit amet consectetur adipisicing elit.";

	const useResizeDetectorSpy = vi.spyOn(useResizeDetectorModule, "useResizeDetector");
	const getBoundingClientRectSpy = vi.spyOn(Element.prototype, "getBoundingClientRect");

	const parentElement = document.createElement("div");
	const parentElementReference = { current: parentElement } as React.RefObject<HTMLElement>;

	const Component = ({
		value,
		offset,
		availableWidth,
	}: {
		value: string;
		offset?: number;
		availableWidth?: number;
	}) => {
		const referenceElement = useRef(parentElement);

		return (
			<TruncateMiddleDynamic
				parentRef={referenceElement}
				value={value}
				offset={offset}
				availableWidth={availableWidth}
			/>
		);
	};

	afterEach(() => {
		useResizeDetectorSpy.mockReset();
		getBoundingClientRectSpy.mockReset();
	});

	afterAll(() => {
		useResizeDetectorSpy.mockRestore();
		getBoundingClientRectSpy.mockRestore();
	});

	it("should render", () => {
		const { asFragment } = render(<TruncateMiddleDynamic value={valueToTruncate} />);

		expect(screen.getByText(valueToTruncate)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it.skip("should render with tooltip in the dark mode", () => {
		useResizeDetectorSpy
			.mockReturnValueOnce({ ref: parentElementReference, width: 50 })
			.mockReturnValue({ ref: parentElementReference, width: 30 });

		getBoundingClientRectSpy
			.mockReturnValueOnce({ width: 40 } as DOMRect)
			.mockReturnValueOnce({ width: 40 } as DOMRect)
			.mockReturnValueOnce({ width: 35 } as DOMRect)
			.mockReturnValue({ width: 20 } as DOMRect);

		render(<Component value={valueToTruncate} offset={5} availableWidth={40} />);

		userEvent.hover(screen.getByText("Lorem ipsum dolor sit amet…sectetur adipisicing elit."));

		expect(screen.getByRole("tooltip")).toHaveAttribute("data-theme", "dark");
	});

	it("should return the value if the elements have no width", () => {
		useResizeDetectorSpy.mockReturnValue({ ref: parentElementReference, width: 0 });
		getBoundingClientRectSpy.mockReturnValue({ width: 0 } as DOMRect);

		const { asFragment, rerender } = render(<Component value={valueToTruncate} />);

		expect(screen.getByText(valueToTruncate)).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		rerender(<Component value={valueToTruncate} />);

		expect(screen.getByText(valueToTruncate)).toBeInTheDocument();
	});

	it("should return the value if it fits the given container", () => {
		useResizeDetectorSpy.mockReturnValue({ ref: parentElementReference, width: 100 });
		getBoundingClientRectSpy.mockReturnValue({ width: 50 } as DOMRect);

		render(<Component value={valueToTruncate} />);

		expect(screen.getByText(valueToTruncate)).toBeInTheDocument();
	});

	it("should truncate the value if it does not fit the given container", () => {
		useResizeDetectorSpy
			.mockReturnValueOnce({ ref: parentElementReference, width: 100 })
			.mockReturnValue({ ref: parentElementReference, width: 30 });

		getBoundingClientRectSpy
			.mockReturnValueOnce({ width: 50 } as DOMRect)
			.mockReturnValueOnce({ width: 50 } as DOMRect)
			.mockReturnValueOnce({ width: 45 } as DOMRect)
			.mockReturnValueOnce({ width: 40 } as DOMRect)
			.mockReturnValueOnce({ width: 35 } as DOMRect)
			.mockReturnValueOnce({ width: 30 } as DOMRect)
			.mockReturnValueOnce({ width: 20 } as DOMRect);

		render(<Component value={valueToTruncate} availableWidth={20} />);

		expect(screen.getByText("Lorem ipsum dolor sit …etur adipisicing elit.")).toBeInTheDocument();
	});

	it("should return value with default offset", () => {
		getBoundingClientRectSpy
			.mockReturnValueOnce({ width: 50 } as DOMRect)
			.mockReturnValueOnce({ width: 45 } as DOMRect)
			.mockReturnValueOnce({ width: 40 } as DOMRect)
			.mockReturnValueOnce({ width: 35 } as DOMRect)
			.mockReturnValueOnce({ width: 30 } as DOMRect)
			.mockReturnValueOnce({ width: 20 } as DOMRect);

		expect(getTruncatedValue(parentElement, 30, valueToTruncate)).toBe(
			"Lorem ipsum dolor sit am…ctetur adipisicing elit.",
		);
	});

	it("should truncate value if doesn't overflow and availableWidth is set", () => {
		useResizeDetectorSpy.mockReturnValue({ ref: parentElementReference, width: 100 });
		getBoundingClientRectSpy.mockReturnValue({ width: 100 } as DOMRect);

		const { asFragment } = render(<Component value={valueToTruncate} availableWidth={50} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should truncate value if it overflows and availableWidth is set", () => {
		useResizeDetectorSpy.mockReturnValue({ ref: parentElementReference, width: 100 });
		getBoundingClientRectSpy.mockReturnValue({ width: 100 } as DOMRect);

		const { asFragment } = render(<Component value={"DJqwFiSdTR2TRPDxTQ8bnUmdnxaSTguF3b"} availableWidth={50} />);

		expect(asFragment()).toMatchSnapshot();

		vi.restoreAllMocks();
	});

	it("should return the value if it overflows the given container", () => {
		useResizeDetectorSpy.mockReturnValue({ ref: parentElementReference, width: 100 });
		getBoundingClientRectSpy.mockReturnValue({ width: 0 } as DOMRect);

		render(<Component value={valueToTruncate} availableWidth={20} />);

		expect(screen.getByText(valueToTruncate)).toBeInTheDocument();
	});
});
