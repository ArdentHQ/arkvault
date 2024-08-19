import userEvent from "@testing-library/user-event";
import React from "react";

import { Button } from "./Button";
import { ButtonVariant } from "@/types";
import { render, screen } from "@/utils/testing-library";

describe("Button", () => {
	it("should render", () => {
		const { container } = render(<Button />);

		expect(container).toMatchSnapshot();
	});

	it.each(["primary", "secondary", "danger", "warning", "transparent", "info", "reverse"])(
		"should render as %s button",
		(variant) => {
			const { container } = render(<Button variant={variant as ButtonVariant} />);

			expect(container).toMatchSnapshot();
		},
	);

	it("should render a small one", () => {
		const { container } = render(<Button size="sm" />);

		expect(container).toMatchSnapshot();
	});

	it("should render a large one", () => {
		const { container } = render(<Button size="lg" />);

		expect(container).toMatchSnapshot();
	});

	it("should render an icon", () => {
		const { container } = render(<Button size="icon" />);

		expect(container).toMatchSnapshot();
	});

	it("should render if disabled", () => {
		const { asFragment } = render(
			<Button disabled data-testid="Button">
				Click
			</Button>,
		);

		expect(screen.getByTestId("Button")).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with theme", () => {
		const { asFragment } = render(
			<Button disabled theme="dark" data-testid="Button">
				Click
			</Button>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit event on click", async () => {
		const onClick = vi.fn();
		render(<Button onClick={onClick}>Click Me</Button>);

		await userEvent.click(screen.getByText("Click Me"));

		expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should render with icon on the left side", () => {
		const { container } = render(
			<Button icon="Plus" iconPosition="left">
				Click Me
			</Button>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with icon on the right side", () => {
		const { container } = render(
			<Button icon="Plus" iconPosition="right">
				Click Me
			</Button>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with icon and custom icon size", () => {
		const { container } = render(
			<Button icon="Plus" iconSize="lg">
				Click Me
			</Button>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with loading state enabled", () => {
		const { container } = render(<Button isLoading>Click Me</Button>);

		expect(container).toMatchSnapshot();
	});

	it("should render loading with icon", () => {
		const { container } = render(<Button isLoading={true} size="icon" icon="icon" />);

		expect(container).toMatchSnapshot();
	});
});
