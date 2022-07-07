import userEvent from "@testing-library/user-event";
import React from "react";

import { InputDate } from "./InputDate";
import { render, screen } from "@/utils/testing-library";
import { renderHook } from "@testing-library/react-hooks";
import { FormProvider, useForm } from "react-hook-form";
import { FormField } from "@/app/components/Form";

const defaultValues: { startDate: string | number; endDate: string | number } = {
	startDate: new Date().getTime(),
	endDate: new Date().getTime(),
};

describe("InputDate", () => {
	it("should render", () => {
		const { result: form } = renderHook(() => useForm({ defaultValues }));
		const { asFragment } = render(
			<FormProvider {...form.current}>
				<FormField name="from">
					<InputDate />
				</FormField>
			</FormProvider>,
		);

		expect(screen.getByTestId("InputDate")).toBeInTheDocument();
		userEvent.click(screen.getByTestId("InputDate__calendar"));

		expect(asFragment()).toMatchSnapshot();
	});
});
