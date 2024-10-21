import React, { ReactNode } from "react";

interface Properties {
	titleSlot?: ReactNode;
	bodySlot?: ReactNode;
	rightSlot?: ReactNode;
	dataTestId?: string;
}

export const MultiEntryItem = ({ titleSlot, bodySlot, rightSlot, dataTestId }: Properties): JSX.Element => (
	<div
		data-testid={dataTestId}
		className="mb-3 overflow-hidden rounded border border-theme-secondary-300 bg-white last:mb-0 dark:border-theme-secondary-800 dark:bg-black sm:rounded-none sm:border-x-0 sm:border-b-0 sm:border-dashed sm:bg-transparent sm:pt-3 sm:dark:bg-transparent"
	>
		<div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
			<div className="flex w-full min-w-0 flex-1 flex-col sm:w-auto sm:items-start sm:space-x-0 sm:space-y-1">
				<div className="flex w-full flex-1 flex-row items-center justify-between bg-theme-secondary-100 px-4 py-3 dark:bg-theme-secondary-900 sm:bg-transparent sm:p-0 dark:sm:bg-transparent">
					{titleSlot}
				</div>
				<div className="px-4 pb-4 pt-3 sm:w-full sm:p-0">{bodySlot}</div>
			</div>
			<div className="hidden sm:block">{rightSlot}</div>
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
