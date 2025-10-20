import React, { ReactElement } from "react"
import { Spinner } from "@/app/components/Spinner"
import { Divider } from "@/app/components/Divider"
import { Icon } from "@/app/components/Icon"

export const Warning = ({ children }: { children?: React.ReactElement | string }) => (
	<div className="border-theme-warning-200 bg-theme-warning-50 dark:border-theme-warning-600 dim:border-theme-warning-600 dim:bg-theme-dim-900 flex items-center space-x-3 rounded-xl border px-3 py-2 max-sm:text-sm sm:px-6 sm:py-4 sm:leading-5 dark:bg-transparent">
		<Spinner color="warning-alt" size="sm" width={3} />
		<Divider
			type="vertical"
			className="text-theme-warning-200 dark:text-theme-secondary-800 dim:text-theme-dim-700 h-5"
		/>
		<p className="text-theme-secondary-700 dark:text-theme-warning-600 dim:text-theme-dim-200 font-semibold">
			{children}
		</p>
	</div>
)

export const Error = ({ children, title }: { children?: ReactElement | string, title?: string | ReactElement }) => (
	<div className="border-theme-danger-200 bg-theme-danger-50 dark:border-theme-danger-info-border dim:border-theme-danger-400 dim:bg-theme-dim-900 rounded-xl border py-2 max-sm:text-sm sm:py-4 sm:leading-5 dark:bg-transparent">
		<div className="mb-2 flex items-center space-x-3 px-3 sm:mb-4 sm:px-6">
			<div className="text-theme-danger-700 dark:text-theme-danger-info-border dim:text-theme-danger-400 flex items-center space-x-2">
				<Icon name="CircleCross" size="lg" className="h-5" />
				{title}
			</div>
		</div>

		<p className="border-theme-danger-200 text-theme-secondary-700 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dim:text-theme-dim-200 dim:border-theme-danger-400 border-t px-3 pt-2 font-semibold sm:px-6 sm:pt-4">
			<p className="font-semibold">{children}</p>
		</p>
	</div>
)

export const Success = ({ children }: { children?: React.ReactElement | string }) => (
	<div
		className="border-theme-success-200 bg-theme-success-50 dark:border-theme-success-600 dim:border-theme-success-500 dim:bg-theme-success-900 flex items-center space-x-3 rounded-xl border px-3 py-2 max-sm:text-sm sm:px-6 sm:py-4 sm:leading-5 dark:bg-transparent"
	>
		<div className="text-theme-success-700 dim:text-theme-success-500 flex items-center space-x-2">
			<Icon name="CheckmarkDouble" size="lg" className="h-5" />
		</div>

		<Divider
			type="vertical"
			className="text-theme-success-200 dark:text-theme-secondary-800 dim:text-theme-success-800 h-5"
		/>

		<p className="text-theme-secondary-700 dark:text-theme-success-600 dim:text-theme-dim-50 text-sm font-semibold sm:text-base">
			{children}
		</p>
	</div>
)
