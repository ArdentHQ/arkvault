import cn from "classnames";

export const FormItemFooter = ({ children }: { children: React.ReactNode }) => (
	<div className="bg-theme-secondary-200 px-4 py-2 text-sm font-semibold text-theme-secondary-700 dim:bg-theme-dim-950 dim:text-theme-dim-200 dark:bg-theme-dark-950 dark:text-theme-dark-200 sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-3">
		{children}
	</div>
);

export const FormItemRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div className="flex gap-1 text-sm sm:text-base">
		<span className="min-w-[112px] font-semibold text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
			{label}
		</span>
		{children}
	</div>
);

export const FormItem = ({ children }: { children: React.ReactNode }) => (
	<div className="flex flex-col space-y-3 overflow-hidden rounded border-b border-dashed border-theme-secondary-300 pb-4 font-semibold last:border-b-0 last:pb-0 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:rounded-xl sm:border sm:border-solid sm:px-6 sm:py-5 sm:last:border-b sm:last:pb-5">
		{children}
	</div>
);

export const FormDivider = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"h-px w-full border-t border-dashed border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700",
			className,
		)}
	/>
);
