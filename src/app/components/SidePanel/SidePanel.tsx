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
import React, { useEffect, useRef, JSX, useCallback, useState, useContext } from "react";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import cn from "classnames";
import { isUnit } from "@/utils/test-helpers";
import { SidePanelStyledStep } from "./SidePanelStyledStep";
import { useIsScrolled } from "@/app/hooks/use-is-scrolled";

interface SidePanelProps {
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
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

export const SidePanel = ({
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
}: SidePanelProps): JSX.Element => {
	const popStateHandlerRef = useRef<() => void>(() => {});

	const [shake, setShake] = useState(false);
	const [hasModalOpened, setHasModalOpened] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const showMinimized = isMinimized && open;
	const shouldPreventClosing = useCallback(() => preventClosing, [preventClosing]);

	const toggleOpen = useCallback(
		(open: boolean = false) => {
			if (open === false && shakeWhenClosing && shouldPreventClosing()) {
				setShake(true);
				setTimeout(() => setShake(false), 900);

				return;
			}

			if (open === false && isMinimized) {
				// Reset the minimized state after the transition is complete
				setTimeout(() => setIsMinimized(false), 350);
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
		enabled: !hasModalOpened,
		// Allow escape attempts when we need to show shake due to preventClosing
		escapeKey: !disableEscapeKey || (shakeWhenClosing && preventClosing),
		outsidePress: disableOutsidePress ? false : (event) => !(event.target as HTMLElement).closest(".Toastify"),
		outsidePressEvent: "pointerdown",
	});

	const scrollContainerRef = useRef<HTMLDivElement | null>(null);

	const isScrolled = useIsScrolled({ active: open && !!footer, scrollContainerRef });

	const { getFloatingProps } = useInteractions([click, role, dismiss]);

	const { isMounted, styles } = useTransitionStyles(context, {
		close: {
			transform: showMinimized ? "translateY(100%)" : "translateX(100%)",
			transitionTimingFunction: "ease-in",
		},
		common: {
			transformOrigin: "right",
			transitionProperty: "transform",
		},
		duration: 350,
		initial: {
			transform: "translateX(100%)",
		},
		open: {
			transform: "translateX(0%)",
			transitionTimingFunction: "ease-out",
		},
	});

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

	const toggleMinimize = () => {
		setIsMinimized(!isMinimized);
	};

	return (
		<FloatingPortal>
			{isMounted && (
				<SidePanelContext.Provider value={{ setHasModalOpened }}>
					<>
						<div
							className={cn(
								"dim:bg-[#101627CC]/90 dim:backdrop-blur-sm fixed inset-0 z-40 bg-[#212225]/10 backdrop-blur-xl transition-opacity duration-300 dark:bg-[#191d22]/90 dark:backdrop-blur-none",
								{
									"opacity-0": showMinimized,
									"opacity-100": !showMinimized,
								},
							)}
						/>
						<FloatingOverlay
							className="z-50 transition-all duration-300"
							style={{
								transform: showMinimized ? "translateY(calc(100dvh - 48px))" : undefined,
							}}
							lockScroll={!showMinimized}
						>
							<FloatingFocusManager context={context} disabled={isUnit()}>
								<div
									data-testid={dataTestId}
									className="Dialog"
									ref={refs.setFloating}
									{...getFloatingProps()}
								>
									<div
										style={{ ...styles }}
										className={cn(
											"fixed top-0 right-0 w-full translate-y-0 transition-all duration-300 md:max-w-[608px]",
											className,
											{
												"animate-shake": shake,
												"translate-x-[148px]": showMinimized,
											},
										)}
									>
										<div
											data-testid="SidePanel__scrollable-content"
											className={cn(
												"navy-scroll bg-theme-background text-theme-text flex h-dvh w-full flex-col shadow-[0_15px_35px_0px_rgba(33,34,37,0.08)] transition-colors duration-300",
												{
													"border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 overflow-hidden rounded-tl-xl border-t border-l":
														showMinimized,
													"border-transparent": !showMinimized,
												},
											)}
											ref={scrollRef}
										>
											<div className="relative">
												<div className="bg-theme-background">
													<div className="relative flex flex-col">
														<div
															className={cn(
																"flex justify-between px-6 transition-all duration-300",
																{
																	"border-b-theme-secondary-300 dark:border-b-theme-secondary-800 dim:border-b-theme-dim-700 border-b":
																		!hasSteps,
																	"items-start py-4": !showMinimized,
																	"max-w-[460px] items-center py-3.5": showMinimized,
																},
															)}
														>
															<div className="flex items-center gap-2">
																{titleIcon && (
																	<div
																		className={cn(
																			"text-theme-primary-600 dark:text-theme-navy-500 hidden shrink-0 sm:block [&_svg]:transition-all [&_svg]:duration-300",
																			{
																				"[&_:has(svg)]:h-5!": showMinimized,
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
																			"text-lg leading-[21px]": !showMinimized,
																			"truncate text-base leading-5":
																				showMinimized,
																		},
																	)}
																>
																	{title}
																</h2>
															</div>

															<div className="flex flex-row items-center gap-3">
																<div
																	className={cn(
																		"text-theme-secondary-700 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 hover:bg-theme-primary-800 dim:text-theme-dim-200 dim:bg-transparent dim-hover:bg-theme-dim-navy-500 dim-hover:text-white rounded bg-transparent transition-all duration-100 ease-linear hover:text-white dark:bg-transparent dark:hover:text-white",
																		{
																			"h-5 w-5": showMinimized,
																			"h-6 w-6": !showMinimized,
																		},
																	)}
																>
																	<Button
																		data-testid="SidePanel__minimize-button"
																		variant="transparent"
																		size="md"
																		className={cn("p-0", {
																			"h-5 w-5": showMinimized,
																			"h-6 w-6": !showMinimized,
																		})}
																		onClick={() => toggleMinimize()}
																	>
																		<Icon name="Minimize" />
																	</Button>
																</div>

																<div
																	className={cn(
																		"text-theme-secondary-700 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 hover:bg-theme-primary-800 dim:text-theme-dim-200 dim:bg-transparent dim-hover:bg-theme-dim-navy-500 dim-hover:text-white rounded bg-transparent transition-all duration-100 ease-linear hover:text-white dark:bg-transparent dark:hover:text-white",
																		{
																			"h-5 w-5": showMinimized,
																			"h-6 w-6": !showMinimized,
																		},
																	)}
																>
																	<Button
																		data-testid="SidePanel__close-button"
																		variant="transparent"
																		size="md"
																		onClick={() => toggleOpen()}
																		className={cn("p-0", {
																			"h-5 w-5": showMinimized,
																			"h-6 w-6": !showMinimized,
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
											>
												{subtitle && (
													<div className="text-theme-secondary-text text-sm leading-7 font-normal md:text-base">
														{subtitle}
													</div>
												)}
												<div className="flex flex-col">{children}</div>
											</div>

											{footer && (
												<div
													data-testid="SidePanel__footer"
													className={cn(
														"bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 flex w-full flex-col border-t px-6 py-4",
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
