import React, { ReactElement } from "react";
import { Spinner } from "@/app/components/Spinner";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";

export const Warning = ({ children }: { children?: React.ReactElement | string }) => (
	<div
		data-testid="AlertBanner_warning"
		className="max-sm:text-sm flex items-center space-x-3 rounded-xl border border-theme-warning-200 bg-theme-warning-50 px-3 py-2 dim:border-theme-warning-600 dim:bg-theme-dim-900 dark:border-theme-warning-600 dark:bg-transparent sm:px-6 sm:py-4 sm:leading-5"
	>
		<Spinner color="warning-alt" size="sm" width={3} />
		<Divider
			type="vertical"
			className="h-5 text-theme-warning-200 dim:text-theme-dim-700 dark:text-theme-secondary-800"
		/>
		<p className="font-semibold text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-warning-600">
			{children}
		</p>
	</div>
);

export const Error = ({ children, title }: { children?: ReactElement | string; title?: string | ReactElement }) => (
	<div
		data-testid="AlertBanner_error"
		className="max-sm:text-sm rounded-xl border border-theme-danger-200 bg-theme-danger-50 py-2 dim:border-theme-danger-400 dim:bg-theme-dim-900 dark:border-theme-danger-info-border dark:bg-transparent sm:py-4 sm:leading-5"
	>
		<div className="mb-2 flex items-center space-x-3 px-3 sm:mb-4 sm:px-6">
			<div className="flex items-center space-x-2 text-theme-danger-700 dim:text-theme-danger-400 dark:text-theme-danger-info-border">
				<Icon name="CircleCross" size="lg" className="h-5" />
				<span>{title}</span>
			</div>
		</div>

		<p className="border-t border-theme-danger-200 px-3 pt-2 font-semibold text-theme-secondary-700 dim:border-theme-danger-400 dim:text-theme-dim-200 dark:border-theme-secondary-800 dark:text-theme-secondary-500 sm:px-6 sm:pt-4">
			<p className="font-semibold">{children}</p>
		</p>
	</div>
);

export const Success = ({ children }: { children?: React.ReactElement | string }) => (
	<div
		data-testid="AlertBanner_success"
		className="max-sm:text-sm flex items-center space-x-3 rounded-xl border border-theme-success-200 bg-theme-success-50 px-3 py-2 dim:border-theme-success-500 dim:bg-theme-success-900 dark:border-theme-success-600 dark:bg-transparent sm:px-6 sm:py-4 sm:leading-5"
	>
		<div className="flex items-center space-x-2 text-theme-success-700 dim:text-theme-success-500">
			<Icon name="CheckmarkDouble" size="lg" className="h-5" />
		</div>

		<Divider
			type="vertical"
			className="h-5 text-theme-success-200 dim:text-theme-success-800 dark:text-theme-secondary-800"
		/>

		<p className="text-sm font-semibold text-theme-secondary-700 dim:text-theme-dim-50 dark:text-theme-success-600 sm:text-base">
			{children}
		</p>
	</div>
);
