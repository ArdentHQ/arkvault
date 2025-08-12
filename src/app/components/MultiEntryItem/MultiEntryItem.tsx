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
}

export const MultiEntryItem = ({
	titleSlot,
	bodySlot,
	rightSlot,
	dataTestId,
	size = "sm",
	className,
	children,
}: Properties): JSX.Element => (
	<div
		data-testid={dataTestId}
		className={twMerge(
			cn(
				"border-theme-secondary-300 dark:border-theme-dark-700 dark:bg-theme-dark-900 dim:border-theme-dim-700 dim:bg-transparent mb-3 overflow-hidden rounded border bg-white last:mb-0",
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
				"md:flex-row md:space-y-0 md:space-x-4": size === "md",
				"sm:flex-row sm:space-y-0 sm:space-x-4": size === "sm",
			})}
		>
			<div
				className={cn("flex w-full min-w-0 flex-1 flex-col", {
					"md:w-auto md:items-start md:space-y-1 md:space-x-0": size === "md",
					"my-0 sm:w-auto sm:items-start sm:space-y-1 sm:space-x-0": size === "sm",
				})}
			>
				<div
					className={cn(
						"bg-theme-secondary-100 dark:bg-theme-dark-950 dim:bg-theme-dim-950 flex w-full flex-1 flex-row items-center justify-between px-4 py-3",
						{
							"dim:md:bg-transparent md:bg-transparent md:p-0 dark:md:bg-transparent": size === "md",
							"dim:sm:bg-transparent sm:bg-transparent sm:p-0 dark:sm:bg-transparent": size === "sm",
						},
					)}
				>
					{titleSlot}
				</div>

				{bodySlot && (
					<div
						className={cn("px-4 pt-3 pb-4", {
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
		<div className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 mb-2 text-sm leading-[17px] font-semibold">
			{label}
		</div>
		{body}
	</div>
);
