export const FormItemFooter = ({ children }: { children: React.ReactNode }) => (
	<div className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 -mx-6 -mb-6 px-6 py-3 text-xs font-semibold">
		{children}
	</div>
);

export const FormItemRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div className="flex gap-1">
		<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 min-w-[112px] font-semibold">
			{label}
		</span>
		{children}
	</div>
);

export const FormItem = ({ children }: { children: React.ReactNode }) => (
	<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 flex flex-col space-y-3 overflow-hidden rounded-xl border px-6 py-5 font-semibold">
		{children}
	</div>
);

export const FormDivider = () => (
	<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 h-px w-full border-t border-dashed" />
);
