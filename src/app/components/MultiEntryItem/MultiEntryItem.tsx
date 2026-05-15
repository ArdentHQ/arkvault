import React, { ReactNode, JSX } from "react";
import cn from "classnames";
import { twMerge } from "tailwind-merge";

interface Properties {
	className?: string;
	titleSlot?: ReactNode;
	bodySlot?: ReactNode;
	rightSlot?: ReactNode;
	dataTestId?: string;
	children?: ReactNode;
	size?: "sm" | "md";
	titleWrapperClassName?: string;
}

export const MultiEntryItem = ({
	titleSlot,
	bodySlot,
	rightSlot,
	dataTestId,
	size = "sm",
	className,
	children,
	titleWrapperClassName,
}: Properties): JSX.Element => (
	<div
		data-testid={dataTestId}
		className={twMerge(
			cn(
				"mb-3 overflow-hidden rounded border border-theme-secondary-300 bg-white last:mb-0 dim:border-theme-dim-700 dim:bg-transparent dark:border-theme-dark-700 dark:bg-theme-dark-900",
				{
					"md:rounded-none md:border-x-0 md:border-b-0 md:border-dashed md:bg-transparent md:pt-3 md:dark:bg-transparent":
						size === "md",
					"sm:rounded-none sm:border-x-0 sm:border-b-0 sm:border-dashed sm:bg-transparent sm:pt-3 sm:dark:bg-transparent":
						size === "sm",
				},
			),
			className,
		)}
	>
		<div
			className={cn("flex flex-col items-center space-y-4", {
				"md:flex-row md:space-x-4 md:space-y-0": size === "md",
				"sm:flex-row sm:space-x-4 sm:space-y-0": size === "sm",
			})}
		>
			<div
				className={cn("flex w-full min-w-0 flex-1 flex-col", {
					"md:w-auto md:items-start md:space-x-0 md:space-y-1": size === "md",
					"my-0 sm:w-auto sm:items-start sm:space-x-0 sm:space-y-1": size === "sm",
				})}
			>
				<div
					className={twMerge(
						cn(
							"flex w-full flex-1 flex-row items-center justify-between bg-theme-secondary-100 px-4 py-3 dim:bg-theme-dim-950 dark:bg-theme-dark-950",
							{
								"md:bg-transparent md:p-0 dim:md:bg-transparent dark:md:bg-transparent": size === "md",
								"sm:bg-transparent sm:p-0 dim:sm:bg-transparent dark:sm:bg-transparent": size === "sm",
							},
						),
						titleWrapperClassName,
					)}
				>
					{titleSlot}
				</div>

				{bodySlot && (
					<div
						className={cn("px-4 pb-4 pt-3", {
							"md:w-full md:p-0": size === "md",
							"sm:w-full sm:p-0": size === "sm",
						})}
					>
						{bodySlot}
					</div>
				)}
				{children}
			</div>
			<div className={cn("hidden", { "md:block": size === "md", "sm:block": size === "sm" })}>{rightSlot}</div>
		</div>
	</div>
);

export const InfoDetail = ({ label, body }: { label: ReactNode; body: ReactNode }): JSX.Element => (
	<div>
		<div className="mb-2 text-sm font-semibold leading-[17px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500">
			{label}
		</div>
		{body}
	</div>
);
