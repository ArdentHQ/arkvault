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

interface SidePanelProps {
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	header?: React.ReactNode | string;
}

export const SidePanel = ({ children, open, onOpenChange, header }: SidePanelProps): JSX.Element => {
	const { refs, context } = useFloating({
		onOpenChange,
		open,
	});

	const click = useClick(context);
	const role = useRole(context);
	const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });

	const { getFloatingProps } = useInteractions([click, role, dismiss]);

	const { isMounted, styles } = useTransitionStyles(context, {
		close: {
			transform: "translateX(100%)",
			transition: "transform 300ms ease-in",
		},
		common: {
			transformOrigin: "right",
		},
		duration: 350,
		initial: {
			transform: "translateX(100%)",
		},
		open: {
			transform: "translateX(0%)",
			transition: "transform 300ms ease-out",
		},
	});

	return (
		<>
			<FloatingPortal>
				{isMounted && (
					<FloatingOverlay
						className="z-50 bg-theme-secondary-900-rgba/40 transition-opacity duration-300 dark:bg-black-rgba/40 dark:bg-opacity-80"
						lockScroll
					>
						<FloatingFocusManager context={context}>
							<div className="Dialog" ref={refs.setFloating} {...getFloatingProps()}>
								<div
									style={{ ...styles }}
									className="custom-scroll fixed right-0 top-0 h-screen w-full overflow-y-scroll bg-theme-background p-4 text-theme-text shadow-[0_15px_35px_0px_rgba(33,34,37,0.08)] md:w-[512px] md:p-8"
								>
									<div className="relative mb-4 flex items-center justify-between">
										{typeof header === "string" ? (
											<h2 className="mb-0 text-lg font-bold md:pt-0 md:text-2xl">{header}</h2>
										) : (
											<>{header}</>
										)}
										<div className="h-8 w-8 rounded bg-theme-primary-100 transition-all duration-100 ease-linear hover:bg-theme-primary-800 hover:text-white green:hover:bg-theme-primary-700 dark:bg-theme-secondary-800 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 dark:hover:text-white">
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
						</FloatingFocusManager>
					</FloatingOverlay>
				)}
			</FloatingPortal>
		</>
	);
};
