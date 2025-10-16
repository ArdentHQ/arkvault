import {
	FloatingFocusManager,
	FloatingOverlay,
	FloatingPortal,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
	useTransitionStyles,
} from "@floating-ui/react";
import React, { JSX, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { SidePanelStyledStep } from "./SidePanelStyledStep";
import { Tooltip } from "@/app/components/Tooltip";
import cn from "classnames";
import { isUnit } from "@/utils/test-helpers";
import { useIsScrolled } from "@/app/hooks/use-is-scrolled";
import { SIDE_PANEL_TRANSITION_DURATION, usePanels } from "@/app/contexts/Panels";
import { useLocalStorage } from "usehooks-ts";
import { useTranslation } from "react-i18next";

interface SidePanelProps {
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string | React.ReactNode;
	titleIcon?: React.ReactNode;
	subtitle?: string;
	dataTestId?: string;
	className?: string;
	scrollRef?: React.RefObject<HTMLDivElement>;
	onMountChange?: (mounted: boolean) => void;
	hasSteps?: boolean;
	totalSteps?: number;
	activeStep?: number;
	footer?: React.ReactNode;
	onBack?: () => void;
	isLastStep?: boolean;
	disableOutsidePress?: boolean;
	disableEscapeKey?: boolean;
	shakeWhenClosing?: boolean;
	preventClosing?: boolean;
	minimizeable?: boolean;
}

interface SidePanelContextValue {
	setHasModalOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidePanelContext = React.createContext<SidePanelContextValue | undefined>(undefined);

export const useSidePanel = (): SidePanelContextValue | undefined => useContext(SidePanelContext);

export const SidePanelButtons = ({ className, ...properties }: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
	<div
		className={cn(
			"flex w-full items-center justify-end gap-3 [&>button]:flex-1 sm:[&>button]:flex-none",
			className,
		)}
		{...properties}
	/>
);

interface SidePanelHeaderProps {
	title: string | React.ReactNode;
	titleIcon?: React.ReactNode;
	isMinimized: boolean;
	hasSteps: boolean;
	minimizeable: boolean;
	onMinimizeClick: () => void;
	onCloseClick: () => void;
	onHeaderClick?: () => void;
}

const SidePanelHeader = ({
	title,
	titleIcon,
	isMinimized,
	hasSteps,
	minimizeable,
	onMinimizeClick,
	onCloseClick,
	onHeaderClick,
}: SidePanelHeaderProps): JSX.Element => {
	const { t } = useTranslation();
	const [minimizedHintHasShown, persistMinimizedHint] = useLocalStorage("minimized-hint", false);

	return (
		<div
			onClick={onHeaderClick}
			className={cn(
				"flex justify-between transition-all duration-200",
				!hasSteps &&
					"border-b-theme-secondary-300 dark:border-b-theme-secondary-800 dim:border-b-theme-dim-700 border-b",
				isMinimized ? "cursor-pointer items-center py-3.5 pr-[162px] pl-6" : "items-start px-6 py-4",
			)}
		>
			<div className="flex gap-2 items-center">
				{titleIcon && (
					<div
						className={cn(
							"text-theme-primary-600 dark:text-theme-navy-500 hidden shrink-0 transition-all duration-200 sm:block",
							isMinimized && "[&_:has(svg)]:h-5",
						)}
					>
						{titleIcon}
					</div>
				)}
				<h2
					data-testid="SidePanel__title"
					className={cn(
						"mb-0 font-semibold transition-all duration-200 md:pt-0",
						isMinimized ? "text-base leading-5 truncate" : "text-lg leading-[21px]",
					)}
				>
					{title}
				</h2>
			</div>

			<div className="flex flex-row gap-3 items-center">
				{minimizeable && (
					<div
						className={cn(
							"bg-transparent rounded transition-all duration-200 ease-linear text-theme-secondary-700 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 hover:bg-theme-primary-800 dim:text-theme-dim-200 dim:bg-transparent dim-hover:bg-theme-dim-navy-500 dim-hover:text-white hover:text-white dark:bg-transparent dark:hover:text-white",
							isMinimized ? "w-5 h-5" : "w-6 h-6",
						)}
					>
						<Tooltip
							visible={isMinimized && !minimizedHintHasShown}
							appendTo={() => document.body}
							interactive={true}
							offset={[0, 30]}
							content={
								<div className="flex items-center gap-4 rounded-lg px-3 py-1.5">
									<span className="font-semibold text-white">
										{t("COMMON.YOU_CAN_RESUME_THIS_ACTION_LATER_BY_REOPENING_IT")}
									</span>
									<Button
										size="xs"
										variant="transparent"
										data-testid="SidePanel__minimize-button-hint"
										className="bg-theme-primary-500 dim:bg-theme-dim-navy-600 w-full px-4 py-1.5 whitespace-nowrap sm:w-auto"
										onClick={() => persistMinimizedHint(true)}
									>
										{t("COMMON.GOT_IT")}
									</Button>
								</div>
							}
							placement="top"
						>
							<Button
								data-testid="SidePanel__minimize-button"
								variant="transparent"
								size="md"
								className={cn("p-0", isMinimized ? "w-5 h-5" : "w-6 h-6")}
								onClick={(e) => {
									e.stopPropagation();
									onMinimizeClick();
								}}
							>
								<Icon name={isMinimized ? "Maximize" : "Minimize"} />
							</Button>
						</Tooltip>
					</div>
				)}

				<div
					className={cn(
						"bg-transparent rounded transition-all duration-200 ease-linear text-theme-secondary-700 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 hover:bg-theme-primary-800 dim:text-theme-dim-200 dim:bg-transparent dim-hover:bg-theme-dim-navy-500 dim-hover:text-white hover:text-white dark:bg-transparent dark:hover:text-white",
						isMinimized ? "w-5 h-5" : "w-6 h-6",
					)}
				>
					<Button
						data-testid="SidePanel__close-button"
						variant="transparent"
						size="md"
						onClick={(e) => {
							e.stopPropagation();
							onCloseClick();
						}}
						className={cn("p-0", isMinimized ? "w-5 h-5" : "w-6 h-6")}
					>
						<Icon name="Cross" />
					</Button>
				</div>
			</div>
		</div>
	);
};

const SidePanelContent = ({
	children,
	open,
	onOpenChange,
	title,
	titleIcon,
	subtitle,
	dataTestId,
	className,
	scrollRef,
	onMountChange,
	hasSteps = false,
	totalSteps = 0,
	activeStep = 0,
	footer,
	onBack,
	isLastStep,
	disableOutsidePress = false,
	disableEscapeKey = false,
	shakeWhenClosing = false,
	preventClosing = false,
	minimizeable = true,
}: SidePanelProps): JSX.Element => {
	const popStateHandlerRef = useRef<() => void>(() => {});
	const { isMinimized, toggleMinimize } = usePanels();

	const [shake, setShake] = useState(false);
	const [hasModalOpened, setHasModalOpened] = useState(false);

	const shouldPreventClosing = useCallback(() => preventClosing, [preventClosing]);

	const toggleOpen = useCallback(
		(open: boolean = false) => {
			if (open === false && shakeWhenClosing && shouldPreventClosing()) {
				setShake(true);
				setTimeout(() => setShake(false), 900);
				return;
			}

			onOpenChange(open);
		},
		[onOpenChange, shakeWhenClosing, shouldPreventClosing],
	);

	const { refs, context } = useFloating({
		onOpenChange: toggleOpen,
		open,
	});

	const click = useClick(context);
	const role = useRole(context);
	const dismiss = useDismiss(context, {
		enabled: !hasModalOpened && !isMinimized,
		escapeKey: !disableEscapeKey || (shakeWhenClosing && preventClosing),
		outsidePress: disableOutsidePress ? false : (event) => !(event.target as HTMLElement).closest(".Toastify"),
		outsidePressEvent: "pointerdown",
	});

	const scrollContainerRef = useRef<HTMLDivElement | null>(null);

	const isScrolled = useIsScrolled({ active: open && !!footer, scrollContainerRef });

	const { getFloatingProps } = useInteractions([click, role, dismiss]);

	const stylesConfiguration = useMemo(
		() => ({
			close: {
				transform: isMinimized ? "translate(148px, 100%)" : "translateX(100%)",
				transitionTimingFunction: "ease-in",
			},
			common: {
				transformOrigin: "right",
				transitionProperty: "transform",
			},
			duration: isMinimized ? 150 : SIDE_PANEL_TRANSITION_DURATION,
			initial: {
				transform: isMinimized ? "translateY(100%)" : "translateX(100%)",
			},
			open: {
				transform: isMinimized ? "translate(148px, calc(100dvh - 48px))" : "translateX(0%)",
				transitionTimingFunction: "ease-out",
			},
		}),
		[isMinimized],
	);

	const { isMounted, styles } = useTransitionStyles(context, stylesConfiguration);

	useEffect(() => {
		onMountChange?.(isMounted);
	}, [isMounted, onMountChange]);

	useEffect(() => {
		popStateHandlerRef.current = () => {
			if (hasSteps && typeof onBack === "function" && !isLastStep) {
				onBack();
			} else {
				toggleOpen();
			}
		};
	}, [hasSteps, onBack, toggleOpen, isLastStep]);

	useEffect(() => {
		if (open && hasSteps) {
			window.history.pushState({ sidePanelStep: activeStep }, "");
		}
	}, [open, hasSteps, activeStep]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const handlePopState = () => {
			popStateHandlerRef.current?.();
		};

		window.history.pushState({ sidePanelOpen: true }, "");
		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);

			if (window.history.state?.sidePanelOpen) {
				window.history.back();
			}
		};
	}, [open]);

	return (
		<FloatingPortal>
			{isMounted && (
				<SidePanelContext.Provider value={{ setHasModalOpened }}>
					<>
						<div
							className={cn(
								"dim:bg-[#101627CC]/90 dim:backdrop-blur-sm fixed inset-0 z-40 bg-[#212225]/10 backdrop-blur-xl transition-opacity duration-200 dark:bg-[#191d22]/90 dark:backdrop-blur-none",
								isMinimized ? "pointer-events-none opacity-0" : "opacity-100",
							)}
						/>
						<FloatingOverlay
							className={cn("z-50", {
								"pointer-events-none": isMinimized,
							})}
							lockScroll={!isMinimized}
						>
							<FloatingFocusManager context={context} disabled={isUnit()}>
								<div
									data-testid={dataTestId}
									className={cn("Dialog", {
										"pointer-events-auto": isMinimized,
									})}
									ref={refs.setFloating}
									{...getFloatingProps()}
								>
									<div
										style={styles}
										className={cn("fixed top-0 right-0 w-full md:max-w-[608px]", className, {
											"animate-shake": shake,
										})}
									>
										<div
											data-testid="SidePanel__scrollable-content"
											className={cn(
												"navy-scroll bg-theme-background text-theme-text flex h-dvh w-full flex-col shadow-[0_15px_35px_0px_rgba(33,34,37,0.08)] transition-all duration-200",
												isMinimized
													? "border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 overflow-hidden rounded-tl-xl border-t border-l"
													: "border-transparent",
											)}
											ref={scrollRef}
										>
											<div className="relative">
												<div className="bg-theme-background">
													<div className="flex relative flex-col">
														<SidePanelHeader
															title={title}
															titleIcon={titleIcon}
															isMinimized={isMinimized}
															hasSteps={hasSteps}
															minimizeable={minimizeable}
															onMinimizeClick={toggleMinimize}
															onCloseClick={() => toggleOpen()}
															onHeaderClick={isMinimized ? toggleMinimize : undefined}
														/>

														{hasSteps && (
															<ul className="flex flex-row w-full">
																{[...Array(totalSteps).keys()].map((index) => (
																	<SidePanelStyledStep
																		key={index}
																		isActive={index < activeStep}
																	/>
																))}
															</ul>
														)}
													</div>
												</div>
											</div>

											<div
												ref={scrollContainerRef}
												className="flex overflow-y-auto flex-col flex-1 gap-4 px-6 py-4"
												data-testid="SidePanel__content"
												inert={isMinimized}
											>
												{subtitle && (
													<div className="text-theme-secondary-text text-sm leading-[21px] font-normal md:text-base md:leading-7">
														{subtitle}
													</div>
												)}
												<div className="flex flex-col">{children}</div>
											</div>

											{footer && (
												<div
													data-testid="SidePanel__footer"
													className={cn(
														"flex flex-col px-6 py-4 w-full border-t bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700",
														{ "shadow-footer-side-panel": isScrolled },
													)}
												>
													{footer}
												</div>
											)}
										</div>
									</div>
								</div>
							</FloatingFocusManager>
						</FloatingOverlay>
					</>
				</SidePanelContext.Provider>
			)}
		</FloatingPortal>
	);
};

export const SidePanel = (props: SidePanelProps): JSX.Element => {
	const { resetKey } = usePanels();

	return (
		<div key={resetKey} className="display-contents">
			<SidePanelContent {...props} />
		</div>
	);
};