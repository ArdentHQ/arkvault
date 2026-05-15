/* eslint-disable sonarjs/cognitive-complexity */
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
import { SIDE_PANEL_TRANSITION_DURATION, usePanels } from "@/app/contexts/Panels";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { SidePanelStyledStep } from "./SidePanelStyledStep";
import { Tooltip } from "@/app/components/Tooltip";
import cn from "classnames";
import { isUnit } from "@/utils/test-helpers";
import { useIsScrolled } from "@/app/hooks/use-is-scrolled";
import { useLocalStorage } from "usehooks-ts";
import { useNavigationContext } from "@/app/contexts";
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

interface SidepanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	isScrolled?: boolean;
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

export const SidepanelFooter = ({ className, isScrolled, ...properties }: SidepanelFooterProps) => (
	<div
		data-testid="SidePanel__footer"
		className={cn(
			"flex w-full flex-col border-t border-theme-secondary-300 bg-theme-background px-6 py-4 dim:border-theme-dim-700 dark:border-theme-dark-700",
			{ "shadow-footer-side-panel": isScrolled },
			className,
		)}
		{...properties}
	/>
);

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
	const { t } = useTranslation();
	const popStateHandlerRef = useRef<() => void>(() => {});
	const { isMinimized, toggleMinimize, toggleExpand, isExpanded } = usePanels();

	const { hasFixedFormButtons } = useNavigationContext();

	const [minimizedHintHasShown, persistMinimizedHint] = useLocalStorage("minimized-hint", false);
	const [shake, setShake] = useState(false);
	const [hasModalOpened, setHasModalOpened] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	const shouldPreventClosing = useCallback(() => preventClosing, [preventClosing]);

	const toggleOpen = useCallback(
		(open: boolean = false) => {
			if (open === false) {
				setIsClosing(true);
			}

			if (open === false && shakeWhenClosing && shouldPreventClosing()) {
				setShake(true);
				setTimeout(() => setShake(false), 900);

				return;
			}

			onOpenChange(open);

			setTimeout(() => {
				setIsClosing(false);
			}, SIDE_PANEL_TRANSITION_DURATION);
		},
		[onOpenChange, shakeWhenClosing, shouldPreventClosing, isMinimized],
	);

	const { refs, context } = useFloating({
		onOpenChange: toggleOpen,
		open,
	});

	const click = useClick(context);
	const role = useRole(context);
	const dismiss = useDismiss(context, {
		enabled: !hasModalOpened && !isMinimized,
		// Allow escape attempts when we need to show shake due to preventClosing
		escapeKey: !disableEscapeKey || (shakeWhenClosing && preventClosing),
		outsidePress: disableOutsidePress ? false : (event) => !(event.target as HTMLElement).closest(".Toastify"),
		outsidePressEvent: "pointerdown",
	});

	const scrollContainerRef = useRef<HTMLDivElement | null>(null);

	const isScrolled = useIsScrolled({ active: open && !!footer, scrollContainerRef });

	const { getFloatingProps } = useInteractions([click, role, dismiss]);

	const duration = useMemo(() => {
		if (!open && isExpanded) {
			return 0;
		}

		if (open && isExpanded && isClosing) {
			return 0;
		}

		return isMinimized ? 150 : SIDE_PANEL_TRANSITION_DURATION;
	}, [isClosing, isExpanded, open, isMinimized]);

	const stylesConfiguration = useMemo(
		() => ({
			close: {
				transform: isMinimized ? "translateY(100vh)" : "translateX(100%)",
				transitionTimingFunction: "cubic-bezier(0.7, 0, 0.84, 0)",
			},
			common: {
				transformOrigin: "right",
				transitionProperty: "transform, opacity, left",
				willChange: "transform, opacity, left",
			},
			duration,
			initial: isExpanded
				? undefined
				: {
						transform: isMinimized ? "translateY(100%)" : "translateX(100%)",
					},
			open: {
				transform: isMinimized ? "translate(0, calc(100dvh - 48px))" : "translateX(0%)",
				transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
			},
		}),
		[isMinimized, isExpanded, duration],
	);

	const { isMounted, styles } = useTransitionStyles(context, stylesConfiguration);

	useEffect(() => {
		onMountChange?.(isMounted);
	}, [isMounted]);

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
	}, [open, popStateHandlerRef]);

	return (
		<FloatingPortal>
			{isMounted && (
				<SidePanelContext.Provider value={{ setHasModalOpened }}>
					<>
						<div
							className={cn(
								"fixed inset-0 z-40 bg-[#212225]/10 backdrop-blur-xl duration-300 dim:bg-[#101627CC]/90 dim:backdrop-blur-sm dark:bg-[#191d22]/90 dark:backdrop-blur-none",
								{
									"opacity-100": !isMinimized,
									"pointer-events-none opacity-0": isMinimized,
									"transition-none": isExpanded,
									"transition-opacity": !isExpanded,
								},
							)}
						/>
						<FloatingOverlay
							className={cn("transition-all duration-300", {
								"pointer-events-none z-40": isMinimized,
								"z-50": !isMinimized,
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
										data-testid={isMinimized ? "MinimizedSidePanel" : "MaximizedSidePanel"}
										style={styles}
										className={cn("fixed right-0", className, {
											"animate-shake": shake,
											"left-0": isExpanded && !isMinimized,
											"left-0 md:left-[40%] lg:left-[50%] xl:left-[60%]":
												!isExpanded && !isMinimized,
											"left-auto sm:top-0 sm:max-w-[425px]": isMinimized,
											"top-0": !isMinimized && !isExpanded,
											"top-[-56px]": !hasFixedFormButtons && isMinimized,
											"top-[-68px]": hasFixedFormButtons && isMinimized,
											"transform-none!": isExpanded,
										})}
									>
										<div
											data-testid="SidePanel__scrollable-content"
											className={cn(
												"navy-scroll flex h-dvh w-full flex-col bg-theme-background text-theme-text shadow-[0_15px_35px_0px_rgba(33,34,37,0.08)] transition-colors duration-300",
												{
													"border-transparent": !isMinimized,
													"rounded-tl-sm rounded-tr-sm border-l border-r border-t border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:rounded-tl-xl sm:rounded-tr-none sm:border-r-0":
														isMinimized,
												},
											)}
											ref={scrollRef}
										>
											<div className="relative">
												<div className="rounded-tl-sm rounded-tr-sm bg-theme-background sm:rounded-tl-xl sm:rounded-tr-none">
													<div className="relative flex flex-col">
														<div
															onClick={isMinimized ? () => toggleMinimize() : undefined}
															className={cn(
																"flex justify-between transition-all duration-150",
																{
																	"border-b border-b-theme-secondary-300 dim:border-b-theme-dim-700 dark:border-b-theme-secondary-800":
																		!hasSteps,
																	"cursor-pointer items-center py-3.5 pl-6 pr-6":
																		isMinimized,
																	"items-start px-6 py-3.5": !isMinimized,
																},
															)}
														>
															<div
																className={cn(
																	"lg:w-4xl mx-auto flex w-full justify-between transition-all duration-300",
																	{
																		"lg:px-6": isExpanded,
																	},
																)}
															>
																<div className="flex items-center gap-2">
																	{titleIcon && (
																		<div
																			className={cn(
																				"hidden shrink-0 text-theme-primary-600 dark:text-theme-navy-500 sm:block [&_svg]:transition-all [&_svg]:duration-300",
																				{
																					"[&_:has(svg)]:h-5!": isMinimized,
																				},
																			)}
																		>
																			{titleIcon}
																		</div>
																	)}
																	<h2
																		data-testid="SidePanel__title"
																		className={cn(
																			"mb-0 text-base font-semibold transition-all duration-300 md:pt-0",
																			{
																				"text-base leading-5 md:text-lg md:leading-[21px]":
																					!isMinimized,
																				"truncate text-base leading-5":
																					isMinimized,
																			},
																		)}
																	>
																		{title}
																	</h2>
																</div>

																<div className="flex flex-row items-center gap-3">
																	<div
																		className={cn(
																			"text-theme-secondary-700 hover:bg-theme-navy-200 hover:text-theme-navy-700 dim:text-theme-dim-200 dim:hover:bg-theme-dim-700 dim:hover:text-theme-dim-50 dark:text-theme-secondary-200 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50",
																			"rounded transition-all duration-100 ease-linear",
																		)}
																	>
																		<Button
																			data-testid="SidePanel__expand-button"
																			variant="transparent"
																			size="md"
																			className="hidden h-6 w-6 p-0 lg:flex"
																			onClick={() => {
																				toggleExpand();
																			}}
																		>
																			{isExpanded ? (
																				<Icon name="Shrink" />
																			) : (
																				<Icon name="Expand" />
																			)}
																		</Button>
																	</div>

																	{minimizeable && (
																		<div
																			className={cn(
																				"text-theme-secondary-700 hover:bg-theme-navy-200 hover:text-theme-navy-700 dim:text-theme-dim-200 dim:hover:bg-theme-dim-700 dim:hover:text-theme-dim-50 dark:text-theme-secondary-200 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50",
																				"rounded transition-all duration-100 ease-linear",
																				{
																					"h-5 w-5": isMinimized,
																					"h-6 w-6": !isMinimized,
																				},
																			)}
																		>
																			<Tooltip
																				visible={
																					isMinimized &&
																					!minimizedHintHasShown
																				}
																				content={
																					<div className="flex items-center gap-4 rounded-lg px-3 py-1.5">
																						<span className="font-semibold text-white">
																							{t(
																								"COMMON.YOU_CAN_RESUME_THIS_ACTION_LATER_BY_REOPENING_IT",
																							)}
																						</span>
																						<Button
																							size="xs"
																							variant="transparent"
																							data-testid="SidePanel__minimize-button-hint"
																							className="w-full whitespace-nowrap bg-theme-primary-500 px-4 py-1.5 dim:bg-theme-dim-navy-600 sm:w-auto"
																							onClick={() => {
																								persistMinimizedHint(
																									true,
																								);
																							}}
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
																					className={cn("p-0", {
																						"h-5 w-5": isMinimized,
																						"h-6 w-6": !isMinimized,
																					})}
																					onClick={(e) => {
																						e.stopPropagation();
																						toggleMinimize();
																					}}
																				>
																					{isMinimized ? (
																						<Icon name="Maximize" />
																					) : (
																						<Icon name="Minimize" />
																					)}
																				</Button>
																			</Tooltip>
																		</div>
																	)}

																	<div
																		className={cn(
																			"text-theme-secondary-700 hover:bg-theme-navy-200 hover:text-theme-navy-700 dim:text-theme-dim-200 dim:hover:bg-theme-dim-700 dim:hover:text-theme-dim-50 dark:text-theme-secondary-200 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50",
																			"rounded transition-all duration-100 ease-linear",
																			{
																				"h-5 w-5": isMinimized,
																				"h-6 w-6": !isMinimized,
																			},
																		)}
																	>
																		<Button
																			data-testid="SidePanel__close-button"
																			variant="transparent"
																			size="md"
																			onClick={(e) => {
																				e.stopPropagation();
																				toggleOpen();
																			}}
																			className={cn("p-0", {
																				"h-5 w-5": isMinimized,
																				"h-6 w-6": !isMinimized,
																			})}
																		>
																			<Icon name="Cross" />
																		</Button>
																	</div>
																</div>
															</div>
														</div>

														{hasSteps && (
															<ul className="flex w-full flex-row">
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
												className={cn(
													"lg:w-4xl mx-auto flex w-full max-w-full flex-1 flex-col gap-4 overflow-y-auto px-6 py-4",
												)}
												data-testid="SidePanel__content"
												inert={isMinimized}
											>
												{subtitle && (
													<div className="text-sm font-normal leading-[21px] text-theme-secondary-text md:text-base md:leading-7">
														{subtitle}
													</div>
												)}
												<div className="flex flex-col">{children}</div>
											</div>

											{footer && (
												<SidepanelFooter isScrolled={isScrolled}>{footer}</SidepanelFooter>
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

export const SidePanel = (props: SidePanelProps): JSX.Element => (
	<div className="display-contents">
		<SidePanelContent {...props} />
	</div>
);
