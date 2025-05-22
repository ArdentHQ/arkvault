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
import React, { useEffect } from "react";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import cn from "classnames";
import { isUnit } from "@/utils/test-helpers";
import { SidePanelStyledStep } from "./SidePanelStyledStep";

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
}

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
}: SidePanelProps): JSX.Element => {
	const { refs, context } = useFloating({
		onOpenChange,
		open,
	});

	const click = useClick(context);
	const role = useRole(context);
	const dismiss = useDismiss(context, {
		outsidePress: (event) => !(event.target as HTMLElement).closest(".Toastify"),
		outsidePressEvent: "pointerdown",
	});

	const { getFloatingProps } = useInteractions([click, role, dismiss]);

	const { isMounted, styles } = useTransitionStyles(context, {
		close: {
			transform: "translateX(100%)",
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

	return (
		<>
			<FloatingPortal>
				{isMounted && (
					<>
						<div className="fixed inset-0 z-40 bg-[#212225]/10 backdrop-blur-xl dark:bg-[#191d22]/90 dark:backdrop-blur-none" />
						<FloatingOverlay className="z-50 transition-opacity duration-300" lockScroll>
							<FloatingFocusManager context={context} disabled={isUnit()}>
								<div
									data-testid={dataTestId}
									className="Dialog"
									ref={refs.setFloating}
									{...getFloatingProps()}
								>
									<div
										style={{ ...styles }}
										className={cn("fixed top-0 right-0 w-full md:w-[608px]", className)}
									>
										<div
											data-testid="SidePanel__scrollable-content"
											className="overflow-y-scroll pt-14 w-full navy-scroll bg-theme-background text-theme-text h-dvh shadow-[0_15px_35px_0px_rgba(33,34,37,0.08)]"
											ref={scrollRef}
										>
											<div className="relative">
												<div className="fixed top-0 right-0 left-0 z-10 w-full bg-theme-background">
													<div className="flex relative flex-col">
														<div
															className={cn(
																"flex items-start justify-between px-6 py-4",
																{
																	"border-b-theme-secondary-300 dark:border-b-theme-secondary-800 border-b":
																		!hasSteps,
																},
															)}
														>
															<div className="flex gap-2 items-center">
																{titleIcon && (
																	<div className="text-theme-primary-600 shrink-0 dark:text-theme-navy-500">
																		{titleIcon}
																	</div>
																)}
																<h2 className="mb-0 text-lg font-semibold md:pt-0 leading-[21px]">
																	{title}
																</h2>
															</div>

															<div className="w-6 h-6 bg-transparent rounded transition-all duration-100 ease-linear dark:bg-transparent hover:text-white text-theme-secondary-700 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 dark:hover:text-white hover:bg-theme-primary-800">
																<Button
																	data-testid="SidePanel__close-button"
																	variant="transparent"
																	size="md"
																	onClick={() => onOpenChange(false)}
																	className="p-0 w-6 h-6"
																>
																	<Icon name="Cross" />
																</Button>
															</div>
														</div>

														{hasSteps && (
															<ul className="flex flex-row w-full">
																{Array.from({ length: totalSteps }).map((_, index) => (
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

											<div className="flex flex-col gap-4 py-4 px-6">
												{subtitle && (
													<div className="text-sm font-normal leading-5 md:text-base text-theme-secondary-text">
														{subtitle}
													</div>
												)}
												<div className="flex flex-col">{children}</div>
											</div>
										</div>
									</div>
								</div>
							</FloatingFocusManager>
						</FloatingOverlay>
					</>
				)}
			</FloatingPortal>
		</>
	);
};
