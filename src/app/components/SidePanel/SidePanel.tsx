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
			"bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 flex w-full flex-col border-t px-6 py-4",
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
	const { isMinimized, toggleMinimize } = usePanels();

	const [minimizedHintHasShown, persistMinimizedHint] = useLocalStorage("minimized-hint", false);
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
								"dim:bg-[#101627CC]/90 dim:backdrop-blur-sm fixed inset-0 z-40 bg-[#212225]/10 backdrop-blur-xl transition-opacity duration-300 dark:bg-[#191d22]/90 dark:backdrop-blur-none",
								{
									"opacity-100": !isMinimized,
									"pointer-events-none opacity-0": isMinimized,
								},
							)}
						/>
						<FloatingOverlay
							className={cn("z-50 transition-all duration-300", {
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
										className={cn(
											"fixed top-0 right-0 w-full transition-all duration-300 md:max-w-[608px]",
											className,
											{
												"animate-shake": shake,
											},
										)}
									>
										<div
											data-testid="SidePanel__scrollable-content"
											className={cn(
												"navy-scroll bg-theme-background text-theme-text flex h-dvh w-full flex-col shadow-[0_15px_35px_0px_rgba(33,34,37,0.08)] transition-colors duration-300",
												{
													"border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 overflow-hidden rounded-tl-xl border-t border-l":
														isMinimized,
													"border-transparent": !isMinimized,
												},
											)}
											ref={scrollRef}
										>
											<div className="relative">
												<div className="bg-theme-background">
													<div className="relative flex flex-col">
														<div
															onClick={isMinimized ? () => toggleMinimize() : undefined}
															className={cn(
																"flex justify-between transition-all duration-150",
																{
																	"border-b-theme-secondary-300 dark:border-b-theme-secondary-800 dim:border-b-theme-dim-700 border-b":
																		!hasSteps,
																	// THe padding on the right is to compensate for the header content width
																	"cursor-pointer items-center py-3.5 pr-[162px] pl-6":
																		isMinimized,
																	"items-start px-6 py-4": !isMinimized,
																},
															)}
														>
															<div className="flex items-center gap-2">
																{titleIcon && (
																	<div
																		className={cn(
																			"text-theme-primary-600 dark:text-theme-navy-500 hidden shrink-0 sm:block [&_svg]:transition-all [&_svg]:duration-300",
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
																		"mb-0 font-semibold transition-all duration-300 md:pt-0",
																		{
																			"text-lg leading-[21px]": !isMinimized,
																			"truncate text-base leading-5": isMinimized,
																		},
																	)}
																>
																	{title}
																</h2>
															</div>

															<div className="flex flex-row items-center gap-3">
																{minimizeable && (
																	<div
																		className={cn(
																			"text-theme-secondary-700 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 hover:bg-theme-primary-800 dim:text-theme-dim-200 dim:bg-transparent dim-hover:bg-theme-dim-navy-500 dim-hover:text-white rounded bg-transparent transition-all duration-100 ease-linear hover:text-white dark:bg-transparent dark:hover:text-white",
																			{
																				"h-5 w-5": isMinimized,
																				"h-6 w-6": !isMinimized,
																			},
																		)}
																	>
																		<Tooltip
																			visible={
																				isMinimized && !minimizedHintHasShown
																			}
																			appendTo={() => document.body}
																			interactive={true}
																			offset={[0, 30]}
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
																						className="bg-theme-primary-500 dim:bg-theme-dim-navy-600 w-full px-4 py-1.5 whitespace-nowrap sm:w-auto"
																						onClick={() => {
																							persistMinimizedHint(true);
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
																				<Icon name="Minimize" />
																			</Button>
																		</Tooltip>
																	</div>
																)}

																<div
																	className={cn(
																		"text-theme-secondary-700 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 hover:bg-theme-primary-800 dim:text-theme-dim-200 dim:bg-transparent dim-hover:bg-theme-dim-navy-500 dim-hover:text-white rounded bg-transparent transition-all duration-100 ease-linear hover:text-white dark:bg-transparent dark:hover:text-white",
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
												className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4"
												data-testid="SidePanel__content"
												inert={isMinimized}
											>
												{subtitle && (
													<div className="text-theme-secondary-text text-sm leading-7 font-normal md:text-base">
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

export const SidePanel = (props: SidePanelProps): JSX.Element => {
	const { resetKey } = usePanels();

	return (
		<div key={resetKey} className="display-contents">
			<SidePanelContent {...props} />
		</div>
	);
};
