/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import React from "react";

import { Modal } from "./Modal";
import { render, screen, renderResponsive, waitFor } from "@/utils/testing-library";
import { browser } from "@/utils/platform";

describe("Modal", () => {
	it("should not render if not open", () => {
		const { asFragment } = render(<Modal title="ark" isOpen={false} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each([true, false])("should render a modal with overlay", (supportsOverflowOverlay) => {
		const overflowOverlayMock = vi
			.spyOn(browser, "supportsOverflowOverlay")
			.mockReturnValue(supportsOverflowOverlay);

		const { asFragment } = render(
			<Modal title="ark" isOpen={true}>
				This is the Modal content
			</Modal>,
		);

		expect(screen.getByTestId("Modal__overlay")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		overflowOverlayMock.mockRestore();
	});

	it("should render with scrollbar if it exceeds window height", () => {
		const windowHeight = window.innerHeight;
		Object.defineProperty(window, "innerHeight", { value: 40 });

		const { asFragment } = render(
			<Modal title="ark" isOpen={true}>
				This is the Modal content
			</Modal>,
		);

		expect(asFragment()).toMatchSnapshot();
		Object.defineProperty(window, "innerHeight", { value: windowHeight });
	});

	it("should render without offset for buttons", () => {
		const { asFragment } = render(
			<Modal title="ark" isOpen={true} noButtons>
				This is the Modal content
			</Modal>,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without close button", () => {
		const { asFragment } = render(
			<Modal title="ark" isOpen={true} hideCloseButton>
				This is the Modal content
			</Modal>,
		);

		expect(screen.queryByTestId("Modal__close-button")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should closed by click on overlay", async () => {
		const onClose = vi.fn();
		render(
			<Modal title="ark" isOpen={true} onClose={onClose}>
				This is the Modal content
			</Modal>,
		);

		expect(screen.getByTestId("Modal__overlay")).toBeInTheDocument();
		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Modal__overlay"));

		expect(onClose).toHaveBeenCalledWith();
	});

	it("should no close by click on modal content", async () => {
		const onClose = vi.fn();
		render(
			<Modal title="ark" isOpen={true} onClose={onClose}>
				This is the Modal content
			</Modal>,
		);

		expect(screen.getByTestId("Modal__overlay")).toBeInTheDocument();
		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Modal__inner"));

		expect(onClose).not.toHaveBeenCalled();
	});

	it("should closed by the Esc key", async () => {
		const onClose = vi.fn();
		const { asFragment } = render(<Modal title="ark" isOpen={true} onClose={onClose} />);

		expect(screen.getByTestId("Modal__overlay")).toBeInTheDocument();

		await userEvent.keyboard("{enter}");

		expect(onClose).not.toHaveBeenCalled();

		await userEvent.keyboard("{escape}");

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal with description", () => {
		const { asFragment } = render(<Modal title="ark" description="This is the Modal description" isOpen={true} />);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("This is the Modal description");
	});

	it("should render a modal with content", () => {
		const { asFragment } = render(
			<Modal title="ark" isOpen={true}>
				This is the Modal content
			</Modal>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent("This is the Modal content");
	});

	it("should render a small one", () => {
		const { container } = render(<Modal title="ark" size="sm" isOpen={true} />);

		expect(container).toMatchSnapshot();
	});

	it("should render a medium one", () => {
		const { container } = render(<Modal title="ark" size="md" isOpen={true} />);

		expect(container).toMatchSnapshot();
	});

	it("should render a large one", () => {
		const { container } = render(<Modal title="ark" size="lg" isOpen={true} />);

		expect(container).toMatchSnapshot();
	});

	it("should render a xlarge one", () => {
		const { container } = render(<Modal title="ark" size="xl" isOpen={true} />);

		expect(container).toMatchSnapshot();
	});

	it("should render a 3x large one", () => {
		const { container } = render(<Modal title="ark" size="3xl" isOpen={true} />);

		expect(container).toMatchSnapshot();
	});

	it("should render a 4x large one", () => {
		const { container } = render(<Modal title="ark" size="4xl" isOpen={true} />);

		expect(container).toMatchSnapshot();
	});

	it("should render a 5x large one", () => {
		const { container } = render(<Modal title="ark" size="5xl" isOpen={true} />);

		expect(container).toMatchSnapshot();
	});

	it("should render a modal with banner", () => {
		const { asFragment } = render(
			<Modal title="ark" isOpen={true} banner={true}>
				This is the Modal content
			</Modal>,
		);

		expect(screen.getByTestId("Modal__overlay")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should hide the mobile menu when the modal is opened", async () => {
		renderResponsive(
			<Modal title="ark" isOpen={true}>
				This is the Modal content
			</Modal>,
			"xs",
		);

		await waitFor(() => expect(screen.queryByTestId("NavigationBarMobile")).not.toBeInTheDocument());
	});
});
