/* eslint-disable testing-library/no-node-access */
import userEvent from "@testing-library/user-event";
import React from "react";

import { BackButton } from "./BackButton";
import { render, screen } from "@/utils/testing-library";

const leftIcon = "svg#chevron-left-small";

describe("BackButton", () => {
	it("should render", () => {
		const { container } = render(<BackButton />);

		expect(document.querySelector(leftIcon)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should render when disabled", () => {
		const { container } = render(<BackButton disabled />);

		expect(document.querySelector(leftIcon)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should redirect to previous page", async () => {
		const { container, router } = render(<BackButton />);

		await userEvent.click(screen.getByRole("button"));

		expect(router.state.location.pathname).toBe("/");

		expect(document.querySelector(leftIcon)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should redirect to given url", async () => {
		const { container, router } = render(<BackButton backToUrl="new-url" />);

		await userEvent.click(screen.getByRole("button"));

		expect(router.state.location.pathname).toBe("/new-url");

		expect(document.querySelector(leftIcon)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should not redirect to previous page when disabled", async () => {
		const { container } = render(<BackButton disabled />);

		await userEvent.click(screen.getByRole("button"));

		expect(document.querySelector(leftIcon)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should not redirect to given url when disabled", async () => {
		const { container, router } = render(<BackButton backToUrl="new-url" disabled />);

		await userEvent.click(screen.getByRole("button"));

		expect(router.state.location.pathname).toBe("/new-url");

		expect(document.querySelector(leftIcon)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});
});
