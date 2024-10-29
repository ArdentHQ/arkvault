import { renderHook, act } from "@testing-library/react";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { FormField } from "./FormField";
import { FormFieldConsumer } from "./useFormField";
import { render, screen } from "@/utils/testing-library";

describe("FormField", () => {
	it("should render without FormProvider", () => {
		const tree = (
			<FormField name="test">
				<input data-testid="input" name="test" />
			</FormField>
		);
		render(tree);

		expect(screen.getByTestId("input")).toBeInTheDocument();
	});

	it("should provide field context", () => {
		const { result: form } = renderHook(() => useForm());

		const errorMessage = "Error message";

		act(() => {
			form.current.setError("test", { message: errorMessage, type: "fail" });
		});

		const tree = (
			<FormProvider {...form.current}>
				<FormField name="test">
					<FormFieldConsumer>{(value) => <p>{value?.errorMessage}</p>}</FormFieldConsumer>
				</FormField>
			</FormProvider>
		);
		render(tree);

		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});
});
