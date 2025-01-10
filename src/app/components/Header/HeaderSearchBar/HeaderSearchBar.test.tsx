import userEvent from "@testing-library/user-event";
import React from "react";

import { HeaderSearchBar } from "./HeaderSearchBar";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("HeaderSearchBar", () => {
	it("should render", () => {
		const { asFragment } = render(<HeaderSearchBar />);

		expect(screen.getByRole("button")).toHaveTextContent("Search");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show the searchbar", async () => {
		render(<HeaderSearchBar />);

		await userEvent.click(screen.getByRole("button"));

		expect(screen.getByTestId("HeaderSearchBar__input")).toBeInTheDocument();
	});

	it("should limit search letters", async () => {
		render(<HeaderSearchBar maxLength={32} />);

		await userEvent.click(screen.getByRole("button"));

		const input: HTMLInputElement = screen.getByTestId("Input");

		expect(input.maxLength).toBe(32);

		const text = "looong text";
		const longText = text.repeat(10);

		await userEvent.clear(input);
		await userEvent.type(input, longText);

		expect(input.value).toBe(longText.slice(0, input.maxLength));
		expect(input.value).toHaveLength(input.maxLength);
	});

	it("should reset fields by prop", async () => {
		const onReset = vi.fn();
		const { rerender } = render(<HeaderSearchBar onReset={onReset} />);

		await userEvent.click(screen.getByRole("button"));

		const input: HTMLInputElement = screen.getByTestId("Input");

		await userEvent.clear(input);
		await userEvent.type(input, "test");

		expect(input.value).toBe("test");

		rerender(<HeaderSearchBar onReset={onReset} resetFields={true} />);

		await waitFor(() => expect(input.value).not.toBe("test"));

		expect(onReset).toHaveBeenCalledWith();
	});

	it("should show extra slot", async () => {
		render(<HeaderSearchBar extra={<div data-testid="extra-slot" />} />);

		await userEvent.click(screen.getByRole("button"));

		expect(screen.getByTestId("extra-slot")).toBeInTheDocument();
	});

	it("should hide the searchbar when clicked outside", async () => {
		const onSearch = vi.fn();

		render(
			<div>
				<div data-testid="header-search-bar__outside" className="mt-16">
					outside elememt to be clicked
				</div>

				<HeaderSearchBar onSearch={onSearch} />
			</div>,
		);

		await userEvent.click(screen.getByRole("button"));

		const outsideElement = screen.getByTestId("header-search-bar__outside");

		expect(outsideElement).toBeInTheDocument();

		expect(screen.getByTestId("Input")).toBeInTheDocument();

		await userEvent.click(outsideElement);

		expect(screen.queryByTestId("Input")).not.toBeInTheDocument();
	});

	it("should reset the query", async () => {
		const onReset = vi.fn();
		render(<HeaderSearchBar onReset={onReset} />);

		await userEvent.click(screen.getByRole("button"));

		const input: HTMLInputElement = screen.getByTestId("Input");

		await userEvent.clear(input);
		await userEvent.type(input, "test");

		expect(input.value).toBe("test");

		await userEvent.click(screen.getByTestId("header-search-bar__reset"));

		expect(input.value).not.toBe("test");
		expect(onReset).toHaveBeenCalledWith();
	});

	it("should call onSearch", async () => {
		const onSearch = vi.fn();

		render(<HeaderSearchBar onSearch={onSearch} />);

		await userEvent.click(screen.getByRole("button"));

		await userEvent.clear(screen.getByTestId("Input"));
		await userEvent.type(screen.getByTestId("Input"), "test");

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith("test");
		})
	});

	it("should set custom debounce timeout form props", async () => {
		const onSearch = vi.fn();

		render(<HeaderSearchBar onSearch={onSearch} debounceTimeout={100} />);

		await userEvent.click(screen.getByRole("button"));

		await userEvent.clear(screen.getByTestId("Input"));
		await userEvent.type(screen.getByTestId("Input"), "test");

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith("test");
		})
	});

	it("should always show clear button", async () => {
		render(<HeaderSearchBar alwaysDisplayClearButton />);

		await userEvent.click(screen.getByRole("button"));

		expect(screen.getByTestId("header-search-bar__reset")).toBeInTheDocument();
		expect(screen.getByTestId("header-search-bar__reset-icon")).toHaveClass("w-4");
		expect(screen.getByTestId("header-search-bar__reset")).toHaveClass("mr-4");
	});

	it("should not always show clear button by default", async () => {
		render(<HeaderSearchBar />);

		await userEvent.click(screen.getByRole("button"));

		expect(screen.getByTestId("header-search-bar__reset-icon")).toHaveClass("w-0");
		expect(screen.getByTestId("header-search-bar__reset")).not.toHaveClass("mr-4");
	});
});
