import React from "react";
import { useForm } from "react-hook-form";

import { renderHook, waitFor } from "@testing-library/react";
import { Form } from "./Form";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@/utils/testing-library";

describe("Form", () => {
	const formSubmitButtonId = "form-submit-button";
	it("should render with provider", async () => {
		const { result: form } = renderHook(() => useForm());
		const onSubmit = vi.fn();

		render(
			<Form context={form.current} onSubmit={onSubmit}>
				<input name="name" ref={form.current.register()} defaultValue="test" />
				<button type="submit" data-testid={formSubmitButtonId} />
			</Form>,
		);

		expect(screen.getByTestId(formSubmitButtonId)).toBeInTheDocument();

		await userEvent.click(screen.getByTestId(formSubmitButtonId));

		await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: "test" }, expect.anything()));
	});

	it("should render without submit handler", async () => {
		const { result: form } = renderHook(() => useForm());

		render(
			<Form context={form.current}>
				<input name="name" ref={form.current.register()} defaultValue="test" />
				<button type="submit" data-testid={formSubmitButtonId} />
			</Form>,
		);

		await userEvent.click(screen.getByTestId(formSubmitButtonId));

		expect(screen.getByTestId("Form")).toBeInTheDocument();
	});
});
