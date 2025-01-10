import userEvent from "@testing-library/user-event";
import React from "react";

import { HeaderSearchInput } from "./HeaderSearchInput";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("HeaderSearchInput", () => {
	it("should render", () => {
		const { asFragment } = render(<HeaderSearchInput />);

		expect(screen.getByTestId("HeaderSearchInput__input")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should limit search letters", async () => {
		render(<HeaderSearchInput maxLength={32} />);

		userEvent.click(screen.getByRole("button"));

		const input: HTMLInputElement = screen.getByTestId("HeaderSearchInput__input__input");

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
		const { rerender } = render(<HeaderSearchInput onReset={onReset} />);

		await userEvent.click(screen.getByRole("button"));

		const input: HTMLInputElement = screen.getByTestId("HeaderSearchInput__input__input");

		await userEvent.clear(input);
		await userEvent.type(input, "test");

		expect(input.value).toBe("test");

		rerender(<HeaderSearchInput onReset={onReset} resetFields={true} />);

		await waitFor(() => expect(input.value).not.toBe("test"));

		expect(onReset).toHaveBeenCalledWith();
	});

	it("should reset the query", async () => {
		const onReset = vi.fn();
		render(<HeaderSearchInput onReset={onReset} />);

		await userEvent.click(screen.getByRole("button"));

		const input: HTMLInputElement = screen.getByTestId("HeaderSearchInput__input__input");

		await userEvent.clear(input);
		await userEvent.type(input, "test");

		expect(input.value).toBe("test");

		await userEvent.click(screen.getByTestId("HeaderSearchInput__input__reset"));

		expect(input.value).not.toBe("test");
		expect(onReset).toHaveBeenCalledWith();
	});

	it("should call onSearch", async () => {
		const onSearch = vi.fn();

		render(<HeaderSearchInput onSearch={onSearch} />);

		await userEvent.click(screen.getByRole("button"));

		await userEvent.clear(screen.getByTestId("HeaderSearchInput__input__input"));
		await userEvent.type(screen.getByTestId("HeaderSearchInput__input__input"), "test");

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith("test");
		});
	});

	it("should set custom debounce timeout form props", async () => {
		const onSearch = vi.fn();
		render(<HeaderSearchInput onSearch={onSearch} debounceTimeout={100} />);

		await userEvent.click(screen.getByRole("button"));

		await userEvent.clear(screen.getByTestId("HeaderSearchInput__input__input"));
		await userEvent.type(screen.getByTestId("HeaderSearchInput__input__input"), "test");

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith("test");
		});
	});
});
