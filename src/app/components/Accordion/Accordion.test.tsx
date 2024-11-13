import React from "react";

import userEvent from "@testing-library/user-event";
import {
	AccordionWrapper,
	AccordionHeader,
	AccordionContent,
	AccordionHeaderSkeletonWrapper,
} from "./Accordion.blocks";
import { render, screen } from "@/utils/testing-library";
import { useAccordion } from "@/app/hooks";

describe("Button", () => {
	it("should render", () => {
		const { container } = render(
			<AccordionWrapper>
				<AccordionHeader onClick={() => {}}>Header</AccordionHeader>
				<AccordionContent>Content</AccordionContent>
			</AccordionWrapper>,
		);

		expect(screen.getByTestId("AccordionHeader")).toBeInTheDocument();
		expect(screen.getByTestId("AccordionContent")).toBeInTheDocument();
		expect(screen.getByTestId("Accordion__toggle")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render inactive", () => {
		const { container } = render(
			<AccordionWrapper isInactive>
				<AccordionHeader onClick={() => {}}>Header</AccordionHeader>
				<AccordionContent>Content</AccordionContent>
			</AccordionWrapper>,
		);

		expect(screen.getByTestId("AccordionHeader")).toBeInTheDocument();
		expect(screen.getByTestId("AccordionContent")).toBeInTheDocument();
		expect(screen.getByTestId("Accordion__toggle")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render collapsed", () => {
		const { container } = render(
			<AccordionWrapper isCollapsed={true}>
				<AccordionHeader onClick={() => {}}>Header</AccordionHeader>
				<AccordionContent>Content</AccordionContent>
			</AccordionWrapper>,
		);

		expect(screen.getByTestId("AccordionHeader")).toBeInTheDocument();
		expect(screen.getByTestId("AccordionContent")).toBeInTheDocument();
		expect(screen.getByTestId("Accordion__toggle")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render skeleton wrapper", () => {
		const { container } = render(<AccordionHeaderSkeletonWrapper>content</AccordionHeaderSkeletonWrapper>);

		expect(screen.getByTestId("AccordionHeaderSkeletonWrapper")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render expanded", () => {
		const { container } = render(
			<AccordionWrapper>
				<AccordionHeader onClick={() => {}} isExpanded>
					Header
				</AccordionHeader>
				<AccordionContent>Content</AccordionContent>
			</AccordionWrapper>,
		);

		expect(screen.getByTestId("AccordionHeader")).toBeInTheDocument();
		expect(screen.getByTestId("AccordionContent")).toBeInTheDocument();
		expect(screen.getByTestId("Accordion__toggle")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should hide the toggle button if no onClick method", () => {
		const { container } = render(
			<AccordionWrapper>
				<AccordionHeader onClick={undefined}>Header</AccordionHeader>
				<AccordionContent>Content</AccordionContent>
			</AccordionWrapper>,
		);

		expect(screen.getByTestId("AccordionHeader")).toBeInTheDocument();
		expect(screen.getByTestId("AccordionContent")).toBeInTheDocument();
		expect(screen.queryByTestId("Accordion__toggle")).not.toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should toggle the accordion on click", async () => {
		const Accordion = () => {
			useAccordion('accordion');

			const { isExpanded, handleHeaderClick } = useAccordion('accordion');

			return (
				<AccordionWrapper>
					<AccordionHeader isExpanded={isExpanded} onClick={handleHeaderClick}>
						Header
					</AccordionHeader>
					{isExpanded && <AccordionContent>Content</AccordionContent>}
				</AccordionWrapper>
			);
		};

		const { container } = render(<Accordion />);

		expect(screen.getByTestId("AccordionHeader")).toBeInTheDocument();
		expect(screen.queryByTestId("AccordionContent")).toBeInTheDocument();
		expect(screen.getByTestId("Accordion__toggle")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("AccordionHeader"));

		expect(screen.queryByTestId("AccordionContent")).not.toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});
});
