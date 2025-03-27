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
import React from "react";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import cn from "classnames";

interface SidePanelProps {
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	header?: React.ReactNode | string;
	dataTestId?: string;
	className?: string;
}

export const SidePanel = ({
	children,
	open,
	onOpenChange,
	header,
	dataTestId,
	className,
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

	return (
		<>
			<FloatingPortal>
				{isMounted && (
					<>
						<div className="fixed inset-0 z-40 bg-[#212225] bg-opacity-10 backdrop-blur-xl dark:bg-[#191d22]/90 dark:backdrop-blur-none" />
						<FloatingOverlay className="z-50 transition-opacity duration-300" lockScroll>
							<FloatingFocusManager context={context}>
								<div
									data-testid={dataTestId}
									className="Dialog"
									ref={refs.setFloating}
									{...getFloatingProps()}
								>
									<div
										style={{ ...styles }}
										className={cn("fixed right-0 top-0 w-full md:w-[608px]", className)}
									>
										<div className="custom-scroll h-dvh w-full overflow-y-scroll bg-theme-background p-4 text-theme-text shadow-[0_15px_35px_0px_rgba(33,34,37,0.08)] sm:p-6 md:p-8">
											<div className="relative mb-4 flex items-start justify-between">
												{typeof header === "string" ? (
													<h2 className="mb-0 text-lg font-bold md:pt-0 md:text-2xl md:leading-[29px]">
														{header}
													</h2>
												) : (
													<>{header}</>
												)}
												<div className="h-8 w-8 rounded bg-theme-primary-100 transition-all duration-100 ease-linear hover:bg-theme-primary-800 hover:text-white dark:bg-theme-secondary-800 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 dark:hover:text-white">
													<Button
														data-testid="SidePanel__close-button"
														variant="transparent"
														size="icon"
														onClick={() => onOpenChange(false)}
														className="h-8 w-8"
													>
														<Icon name="Cross" />
													</Button>
												</div>
											</div>
											<div>{children}</div>
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
