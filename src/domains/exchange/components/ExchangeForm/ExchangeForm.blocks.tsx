export const FormItemFooter = ({ children }: { children: React.ReactNode }) => (
	<div className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 px-4 py-2 text-sm font-semibold sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-3">
		{children}
	</div>
);

export const FormItemRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div className="flex gap-1 text-sm sm:text-base">
		<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 min-w-[112px] font-semibold">
			{label}
		</span>
		{children}
	</div>
);

export const FormItem = ({ children }: { children: React.ReactNode }) => (
	<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 flex flex-col space-y-3 overflow-hidden rounded border-b border-dashed pb-4 font-semibold last:border-b-0 last:pb-0 sm:rounded-xl sm:border sm:border-solid sm:px-6 sm:py-5 sm:last:border-b sm:last:pb-5">
		{children}
	</div>
);

export const FormDivider = () => (
	<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 h-px w-full border-t border-dashed" />
);
