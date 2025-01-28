import React, { ReactNode } from "react";
import cn from "classnames";

interface Properties {
	titleSlot?: ReactNode;
	bodySlot?: ReactNode;
	rightSlot?: ReactNode;
	dataTestId?: string;
	size?: "sm" | "md";
}

export const MultiEntryItem = ({
	titleSlot,
	bodySlot,
	rightSlot,
	dataTestId,
	size = "sm",
}: Properties): JSX.Element => (
	<div
		data-testid={dataTestId}
		className={cn(
			"mb-3 overflow-hidden rounded border border-theme-secondary-300 bg-white last:mb-0 dark:border-theme-dark-700 dark:bg-theme-dark-900",
			{
				"md:rounded-none md:border-x-0 md:border-b-0 md:border-dashed md:bg-transparent md:pt-3 md:dark:bg-transparent":
					size === "md",
				"sm:rounded-none sm:border-x-0 sm:border-b-0 sm:border-dashed sm:bg-transparent sm:pt-3 sm:dark:bg-transparent":
					size === "sm",
			},
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
					"sm:w-auto sm:items-start sm:space-x-0 sm:space-y-1": size === "sm",
				})}
			>
				<div
					className={cn(
						"flex w-full flex-1 flex-row items-center justify-between bg-theme-secondary-100 px-4 py-3 dark:bg-theme-dark-950",
						{
							"md:bg-transparent md:p-0 dark:md:bg-transparent": size === "md",
							"sm:bg-transparent sm:p-0 dark:sm:bg-transparent": size === "sm",
						},
					)}
				>
					{titleSlot}
				</div>
				<div
					className={cn("px-4 pb-4 pt-3", {
						"md:w-full md:p-0": size === "md",
						"sm:w-full sm:p-0": size === "sm",
					})}
				>
					{bodySlot}
				</div>
			</div>
			<div className={cn("hidden", { "md:block": size === "md", "sm:block": size === "sm" })}>{rightSlot}</div>
		</div>
	</div>
);

export const InfoDetail = ({ label, body }: { label: ReactNode; body: ReactNode }): JSX.Element => (
	<div>
		<div className="mb-2 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500">
			{label}
		</div>
		{body}
	</div>
);
