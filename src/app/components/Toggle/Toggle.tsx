import React, { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

interface WrapperProperties extends React.HTMLAttributes<HTMLLabelElement> {
	disabled?: boolean;
	small?: boolean;
}

interface HandleProperties extends React.HTMLAttributes<HTMLDivElement> {
	small?: boolean;
}

interface HandleInnerProperties extends React.HTMLAttributes<HTMLSpanElement> {
	alwaysOn?: boolean;
	disabled?: boolean;
	small?: boolean;
}

const Wrapper = ({ disabled, small, ...properties }: WrapperProperties) => (
	<label
		{...properties}
		className={twMerge(
			"flex items-center",
			cn({ "cursor-not-allowed": disabled, "cursor-pointer": !disabled, "h-3": small, "h-4": !small }),
		)}
	/>
);

const Input = (
	properties: HTMLAttributes<HTMLInputElement> & {
		ref?: React.Ref<HTMLInputElement>;
		disabled?: boolean;
	},
) => <input {...properties} className={twMerge("toggle-input sr-only", properties.className)} />;

Input.displayName = "Input";

const Handle = ({ small, ...properties }: HandleProperties) => (
	<div
		{...properties}
		className={twMerge(
			"toggle-handle bg-theme-primary-100 dark:bg-theme-secondary-800 dim:bg-theme-dim-700 relative inline-flex h-[5px] rounded-full",
			cn({ "w-6": small, "w-[30px]": !small }),
		)}
	/>
);

const HandleInner = ({ alwaysOn, disabled, small, ...properties }: HandleInnerProperties) => (
	<span
		{...properties}
		className={twMerge(
			"absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-in-out",
			cn({
				"bg-theme-primary-100 dark:bg-theme-secondary-800 dim:bg-theme-dim-800": disabled,
				"bg-theme-primary-600 dim:bg-theme-dim-navy-600": !disabled && alwaysOn,
				"bg-theme-secondary-400 dark:bg-theme-secondary-600 dim:bg-theme-dim-500": !disabled && !alwaysOn,
				"h-3 w-3": small,
				"h-4 w-4": !small,
				"handle-inner": !disabled,
			}),
		)}
	/>
);

type ToggleProperties = {
	ref?: React.Ref<HTMLInputElement>;
	alwaysOn?: boolean;
	disabled?: boolean;
	small?: boolean;
} & React.InputHTMLAttributes<any>;

export const Toggle = ({ alwaysOn, disabled, small, onClick, ref, ...properties }: ToggleProperties) => (
	<Wrapper disabled={disabled} small={small} onClick={onClick}>
		<Input type="checkbox" disabled={disabled} ref={ref} {...properties} />
		<Handle small={small}>
			<HandleInner alwaysOn={alwaysOn} disabled={disabled} small={small} />
		</Handle>
	</Wrapper>
);

Toggle.displayName = "Toggle";
