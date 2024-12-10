import React, { forwardRef, useMemo } from "react";
import { TabContext, TabId, useTab } from "./useTab";
import { useTheme } from "@/app/hooks";
import { twMerge } from "tailwind-merge";
import cn from 'classnames';

interface TabsProperties {
	id?: string;
	children: React.ReactNode;
	activeId?: TabId;
	className?: string;
	onChange?: (id: TabId) => void;
}

export function Tabs({ children, activeId, className, onChange, id }: TabsProperties) {
	const context = useTab({ initialId: activeId });
	const { currentId, setCurrentId } = context;

	React.useEffect(() => {
		if (currentId) {
			onChange?.(currentId);
		}
	}, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		setCurrentId(activeId);
	}, [setCurrentId, activeId]);

	return (
		<TabContext.Provider value={context}>
			<div id={id} className={className}>
				{children}
			</div>
		</TabContext.Provider>
	);
}

interface TabProperties {
	children: React.ReactNode;
	tabId: string | number;
	count?: number;
	className?: string;
}

const TabButton = forwardRef<HTMLButtonElement, React.HTMLProps<HTMLButtonElement>>((properties, ref) => {
    return (
        <button
            {...properties}
            ref={ref}
            type="button"
            className={twMerge("tab-button", properties.className)}
        />
    );
});

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

const TabScrollScroll = ({ ...properties }: React.HTMLProps<HTMLDivElement>) => {
	return <div {...properties} className={twMerge("[&::-webkit-scrollbar]:hidden", properties.className)} />;
}

export const TabScroll = ({ children }) => {
	const { isDarkMode } = useTheme();

	const shadowRGB = useMemo(() => (isDarkMode ? "18, 18, 19" : "247, 250, 251"), [isDarkMode]);

	return (
		<div data-testid="TabScroll" className="relative z-0">
			<span
				className="pointer-events-none absolute z-10 block h-full w-8 bg-theme-secondary-100 dark:bg-black"
				style={{
					background: `linear-gradient(90deg, rgba(${shadowRGB}, 0.8) 14.49%, rgba(${shadowRGB}, 0) 92.71%)`,
				}}
			/>
			<div className="bg-theme-secondary-100 dark:bg-black">
				<TabScrollScroll className="relative z-0 mx-auto overflow-x-auto">{children}</TabScrollScroll>
			</div>
			<span
				className="pointer-events-none absolute right-0 top-0 z-10 block h-full w-8 bg-theme-secondary-100 dark:bg-black"
				style={{
					background: `linear-gradient(270deg, rgba(${shadowRGB}, 0.8) 14.49%, rgba(${shadowRGB}, 0) 92.71%)`,
				}}
			/>
		</div>
	);
};

export const Tab = React.forwardRef<HTMLButtonElement, TabProperties>((properties: TabProperties, reference) => {
	const context = React.useContext(TabContext);
	const isActive = context?.isIdActive(properties.tabId);

	return (
		<TabButton
			data-testid={`tabs__tab-button-${properties.tabId}`}
			role="tab"
			type="button"
			className={twMerge(
				"ring-focus mx-6 before:bg-theme-secondary-300 before:dark:bg-theme-secondary-800",
				properties.className,
			)}
			ref={reference}
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
		>
			<span>{properties.children}</span>

			{properties.count !== undefined && (
				<span
					data-testid={`tabs__tab-button-${properties.tabId}-count`}
					className="ml-2 rounded bg-theme-primary-100 px-1.5 py-0.5 text-sm font-semibold dark:bg-theme-secondary-900"
				>
					{properties.count}
				</span>
			)}
		</TabButton>
	);
});

Tab.displayName = "Tab";

export const TabList = ({ noBackground, ...properties}: React.HTMLProps<HTMLDivElement> & {noBackground?: boolean}) => {
	return <div {...properties} className={twMerge("inline-flex items-stretch justify-start tab-list", cn({
		"px-2 rounded-xl bg-theme-secondary-100 dark:bg-theme-secondary-background": !noBackground,
	}))} />;
}

type TabPanelProperties = {
	children: React.ReactNode;
	tabId: string | number;
} & React.HTMLProps<any>;

export const TabPanel = React.forwardRef<HTMLDivElement, TabProperties>(
	({ tabId, children, ...properties }: TabPanelProperties, reference) => {
		const context = React.useContext(TabContext);
		const isActive = context?.isIdActive(tabId);

		if (!isActive) {
			return <></>;
		}

		return (
			<div data-testid="tab-pabel__active-panel" ref={reference} {...properties}>
				{children}
			</div>
		);
	},
);

TabPanel.displayName = "TabPanel";
