import React, { useRef } from "react";
import DatePicker from "react-datepicker";

import { Controller, RegisterOptions, useFormContext } from "react-hook-form";
import { Input } from "./Input";
import { Icon } from "@/app/components/Icon";
import { useFormField } from "@/app/components/Form/useFormField";

type InputDateProperties = {
	rules?: RegisterOptions;
	minDate?: Date;
	startDate?: Date;
	endDate?: Date;
	placement?: string;
	selectsStart?: boolean;
	selectsEnd?: boolean;
	isInvalid?: boolean;
} & React.InputHTMLAttributes<any>;

export const InputDate = React.forwardRef<HTMLInputElement, InputDateProperties>(
	(
		{ minDate, startDate, endDate, placement = "bottom-start", selectsStart, selectsEnd, rules, ...properties },
		reference,
	) => {
		const { control } = useFormContext();

		const fieldContext = useFormField();

		const calenderReference = useRef(null);

		return (
			<Controller
				name={fieldContext!.name}
				control={control}
				rules={rules}
				render={(field, { invalid }) => (
					<DatePicker
						ref={calenderReference}
						selected={field.value}
						calendarClassName="bg-theme-background"
						popperPlacement={placement as any}
						selectsStart={selectsStart}
						selectsEnd={selectsEnd}
						minDate={minDate}
						maxDate={new Date()}
						startDate={startDate}
						endDate={endDate}
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
												onClick={() => (calenderReference.current as any)?.setOpen(true)}
												className="ring-focus relative flex h-full w-full items-center justify-center text-2xl focus:outline-none"
												data-ring-focus-margin="-m-1"
											>
												<Icon name="Calendar" size="lg" />
											</button>
										),
									},
								}}
								isInvalid={invalid}
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
