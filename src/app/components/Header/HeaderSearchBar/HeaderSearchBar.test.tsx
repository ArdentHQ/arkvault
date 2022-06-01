import userEvent from "@testing-library/user-event";
import React from "react";

import { HeaderSearchBar } from "./HeaderSearchBar";
import { act, render, screen, waitFor } from "@/utils/testing-library";

describe("HeaderSearchBar", () => {
	it("should render", () => {
		const { asFragment } = render(<HeaderSearchBar />);

		expect(screen.getByRole("button")).toHaveTextContent("Search");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show the searchbar", () => {
		render(<HeaderSearchBar />);

		userEvent.click(screen.getByRole("button"));

		expect(screen.getByTestId("HeaderSearchBar__input")).toBeInTheDocument();
	});

	it("should limit search letters", () => {
		render(<HeaderSearchBar maxLength={32} />);

		userEvent.click(screen.getByRole("button"));

		const input: HTMLInputElement = screen.getByTestId("Input");

		expect(input.maxLength).toBe(32);

		const text = "looong text";
		const longText = text.repeat(10);

		userEvent.paste(input, longText);

		expect(input.value).toBe(longText.slice(0, input.maxLength));
		expect(input.value).toHaveLength(input.maxLength);
	});

	it("should reset fields by prop", async () => {
		const onReset = jest.fn();
		const { rerender } = render(<HeaderSearchBar onReset={onReset} />);

		userEvent.click(screen.getByRole("button"));

		const input: HTMLInputElement = screen.getByTestId("Input");

		userEvent.paste(input, "test");

		expect(input.value).toBe("test");

		rerender(<HeaderSearchBar onReset={onReset} resetFields={true} />);

		await waitFor(() => expect(input.value).not.toBe("test"));

		expect(onReset).toHaveBeenCalledWith();
	});

	it("should show extra slot", () => {
		render(<HeaderSearchBar extra={<div data-testid="extra-slot" />} />);

		userEvent.click(screen.getByRole("button"));

		expect(screen.getByTestId("extra-slot")).toBeInTheDocument();
	});

	it("should hide the searchbar when clicked outside", () => {
		const onSearch = jest.fn();

		render(
			<div>
				<div data-testid="header-search-bar__outside" className="mt-16">
					outside elememt to be clicked
				</div>

				<HeaderSearchBar onSearch={onSearch} />
			</div>,
		);

		userEvent.click(screen.getByRole("button"));

		const outsideElement = screen.getByTestId("header-search-bar__outside");

		expect(outsideElement).toBeInTheDocument();

		expect(screen.getByTestId("Input")).toBeInTheDocument();

		userEvent.click(outsideElement);

		expect(screen.queryByTestId("Input")).not.toBeInTheDocument();
	});

	it("should reset the query", () => {
		const onReset = jest.fn();
		render(<HeaderSearchBar onReset={onReset} />);

		userEvent.click(screen.getByRole("button"));

		const input: HTMLInputElement = screen.getByTestId("Input");

		userEvent.paste(input, "test");

		expect(input.value).toBe("test");

		userEvent.click(screen.getByTestId("header-search-bar__reset"));

		expect(input.value).not.toBe("test");
		expect(onReset).toHaveBeenCalledWith();
	});

	it("should call onSearch", () => {
		jest.useFakeTimers();

		const onSearch = jest.fn();

		render(<HeaderSearchBar onSearch={onSearch} />);

		userEvent.click(screen.getByRole("button"));

		userEvent.paste(screen.getByTestId("Input"), "test");

		act(() => {
			jest.runAllTimers();
		});

		expect(onSearch).toHaveBeenCalledWith("test");
	});

	it("should set custom debounce timeout form props", () => {
		jest.useFakeTimers();

		const onSearch = jest.fn();

		render(<HeaderSearchBar onSearch={onSearch} debounceTimeout={100} />);

		userEvent.click(screen.getByRole("button"));

		userEvent.paste(screen.getByTestId("Input"), "test");

		act(() => {
			jest.runAllTimers();
		});

		expect(onSearch).toHaveBeenCalledWith("test");
	});
});
