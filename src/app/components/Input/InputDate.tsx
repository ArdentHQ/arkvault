import React from "react";
import DatePicker from "react-datepicker";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "./Input";
import { Icon } from "@/app/components/Icon";
import { useFormField } from "@/app/components/Form/useFormField";

type InputDateProperties = {
	minDate?: Date;
	startDate?: Date;
	placement?: string;
	selectsStart?: boolean;
	selectsEnd?: boolean;
	isInvalid?: boolean;
} & React.InputHTMLAttributes<any>;

export const InputDate = React.forwardRef<HTMLInputElement, InputDateProperties>(
	({ minDate, startDate, placement = "bottom-start", selectsStart, selectsEnd, ...properties }, reference) => {
		const { control } = useFormContext();

		const fieldContext = useFormField();

		return (
			<Controller
				name={fieldContext!.name}
				control={control}
				render={(field) => (
					<DatePicker
						selected={field.value}
						calendarClassName="bg-theme-background"
						popperPlacement={placement as any}
						selectsStart={selectsStart}
						selectsEnd={selectsEnd}
						minDate={minDate}
						startDate={startDate}
						onChange={field.onChange}
						customInput={
							<Input
								data-testid="InputDate"
								ref={reference}
								addons={{
									end: {
										content: (
											<button
												data-testid="InputDate__calendar"
												type="button"
												// onClick={() => ???.setOpen(true)}
												className="ring-focus relative flex h-full w-full items-center justify-center text-2xl focus:outline-none"
												data-ring-focus-margin="-m-1"
											>
												<Icon name="Calendar" size="lg" />
											</button>
										),
									},
								}}
								isInvalid={!field.value}
								{...properties}
							/>
						}
					/>
				)}
			/>
		);
	},
);

InputDate.displayName = "InputDate";
