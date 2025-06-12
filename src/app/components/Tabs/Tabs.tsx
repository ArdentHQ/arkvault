import React from "react";
import { TabContext, TabId, useTab } from "./useTab";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

interface TabsProperties {
	id?: string;
	children: React.ReactNode;
	activeId?: TabId;
	className?: string;
	onChange?: (id: TabId) => void;
	disabled?: boolean;
	ref?: React.Ref<HTMLButtonElement>;
}

export interface TabButtonProps extends React.HTMLProps<HTMLButtonElement> {
	ref?: React.Ref<HTMLButtonElement>;
}

export function Tabs({ children, activeId, className, onChange, id, disabled }: TabsProperties) {
	const context = useTab({ disabled, initialId: activeId });
	const { currentId, setCurrentId } = context;

	React.useEffect(() => {
		if (currentId && !disabled) {
			onChange?.(currentId);
		}
	}, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		setCurrentId(activeId);
	}, [setCurrentId, activeId]);

	return (
		<TabContext.Provider value={context}>
			<div
				id={id}
				className={cn(className, {
					"pointer-events-none cursor-not-allowed": disabled,
				})}
			>
				{children}
			</div>
		</TabContext.Provider>
	);
}

interface TabProperties extends React.HTMLProps<HTMLElement> {
	children: React.ReactNode;
	tabId: string | number;
	count?: number;
	className?: string;
	ref?: React.Ref<HTMLButtonElement>;
}

export const TabButton = ({ ref, className, ...props }: TabButtonProps) => (
	<button {...props} ref={ref} type="button" className={twMerge("tab-button", className)} />
);

TabButton.displayName = "TabButton";

type EventType = React.KeyboardEvent<HTMLButtonElement> & { target: Element };

const onKeyDown = {
	ArrowLeft: (event: EventType) => {
		let previousTab = event.target.previousElementSibling;

		while (previousTab && previousTab.getAttribute("role") !== "tab") {
			previousTab = previousTab.previousElementSibling;
		}

		if (!previousTab) {
			const tabs = event.target.parentElement!.querySelectorAll("[role=tab]");
			previousTab = tabs[tabs.length - 1];
		}

		(previousTab as HTMLElement).focus();
	},
	ArrowRight: (event: EventType) => {
		let nextTab = event.target.nextElementSibling;

		while (nextTab && nextTab.getAttribute("role") !== "tab") {
			nextTab = nextTab.nextElementSibling;
		}

		if (!nextTab) {
			nextTab = event.target.parentElement!.querySelector("[role=tab]");
		}

		(nextTab as HTMLElement).focus();
	},
};

const TabScrollScroll = ({ ...properties }: React.HTMLProps<HTMLDivElement>) => (
	<div {...properties} className={twMerge("[&::-webkit-scrollbar]:hidden", properties.className)} />
);

export const TabScroll = ({ children }) => (
	<div data-testid="TabScroll" className="relative z-0">
		<div className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 px-5">
			<TabScrollScroll className="relative z-0 mx-auto overflow-x-auto">{children}</TabScrollScroll>
		</div>
	</div>
);

export const Tab = ({ ref, className, ...properties }: TabProperties) => {
	const context = React.useContext(TabContext);
	const isActive = context?.isIdActive(properties.tabId);

	return (
		<TabButton
			data-testid={`tabs__tab-button-${properties.tabId}`}
			role="tab"
			type="button"
			className={twMerge(
				"rounded px-3 py-1.5 text-base leading-5 font-semibold transition-all md:rounded-lg",
				className,
			)}
			ref={ref}
			aria-selected={isActive}
			tabIndex={isActive ? 0 : -1}
			data-ring-focus-margin="-mx-3"
			onKeyDown={(event: EventType) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (onKeyDown[event.key as keyof typeof onKeyDown]) {
					return onKeyDown[event.key as keyof typeof onKeyDown](event);
				}

				if (["Enter", " "].includes(event.key)) {
					return context?.setCurrentId(properties.tabId);
				}
			}}
			onClick={() => context?.setCurrentId(properties.tabId)}
			disabled={context?.disabled}
		>
			<span>{properties.children}</span>

			{properties.count !== undefined && (
				<span
					data-testid={`tabs__tab-button-${properties.tabId}-count`}
					className="bg-theme-primary-100 dark:bg-theme-secondary-900 ml-2 rounded px-1.5 py-0.5 text-sm font-semibold"
				>
					{properties.count}
				</span>
			)}
		</TabButton>
	);
};

Tab.displayName = "Tab";

export const TabList = ({
	noBackground,
	...properties
}: React.HTMLProps<HTMLDivElement> & { noBackground?: boolean }) => (
	<div
		{...properties}
		className={twMerge(
			"tab-list flex w-fit items-center gap-1 rounded-xl p-1",
			cn({
				"bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950": !noBackground,
				"bg-transparent": noBackground,
			}),
			properties.className,
		)}
	/>
);

type TabPanelProperties = {
	children: React.ReactNode;
	tabId: string | number;
	ref?: React.Ref<HTMLElement>;
} & React.HTMLProps<any>;

export const TabPanel = ({ tabId, children, ref, ...properties }: TabPanelProperties) => {
	const context = React.useContext(TabContext);
	const isActive = context?.isIdActive(tabId);

	if (!isActive) {
		return <></>;
	}

	return (
		<div data-testid="tab-pabel__active-panel" ref={ref} {...properties}>
			{children}
		</div>
	);
};

TabPanel.displayName = "TabPanel";
