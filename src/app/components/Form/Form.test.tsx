import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { useForm } from "react-hook-form";

import { Form } from "./Form";
import { fireEvent, render, screen } from "@/utils/testing-library";

describe("Form", () => {
	it("should render with provider", async () => {
		const { result: form, waitForNextUpdate } = renderHook(() => useForm());
		const onSubmit = vi.fn();

		render(
			<Form context={form.current} onSubmit={onSubmit}>
				<input name="name" ref={form.current.register()} defaultValue="test" />
			</Form>,
		);

		expect(screen.getByTestId("Form")).toBeInTheDocument();

		fireEvent.submit(screen.getByTestId("Form"));

		await waitForNextUpdate();

		expect(onSubmit).toHaveBeenCalledWith({ name: "test" }, expect.anything());
	});

	it("should render without submit handler", () => {
		const { result: form } = renderHook(() => useForm());

		render(
			<Form context={form.current}>
				<input name="name" ref={form.current.register()} defaultValue="test" />
			</Form>,
		);

		fireEvent.submit(screen.getByTestId("Form"));

		expect(screen.getByTestId("Form")).toBeInTheDocument();
	});
});
