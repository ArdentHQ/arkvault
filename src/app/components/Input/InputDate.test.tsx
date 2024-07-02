import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { FormField } from "@/app/components/Form";
import { render, screen } from "@/utils/testing-library";

import { InputDate } from "./InputDate";

const defaultValues: { startDate: string | number; endDate: string | number } = {
	endDate: Date.now(),
	startDate: Date.now(),
};

describe("InputDate", () => {
	it("should render", async () => {
		const { result: form } = renderHook(() => useForm({ defaultValues }));
		const { asFragment } = render(
			<FormProvider {...form.current}>
				<FormField name="from">
					<InputDate />
				</FormField>
			</FormProvider>,
		);

		expect(screen.getByTestId("InputDate")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("InputDate__calendar"));

		expect(asFragment()).toMatchSnapshot();
	});
});
