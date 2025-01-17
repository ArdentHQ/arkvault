import {
	FloatingFocusManager,
	FloatingOverlay,
	FloatingPortal,
	useClick,
	useDismiss,
	useFloating, useInteractions,
	useRole, useTransitionStyles,
} from "@floating-ui/react";
import React from "react";

interface SidePanelProps {
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const SidePanel = ({children, open, onOpenChange}: SidePanelProps): JSX.Element => {
	const { refs, context } = useFloating({
		onOpenChange,
		open,
	});

	const click = useClick(context);
	const role = useRole(context);
	const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });

	const { getFloatingProps } = useInteractions([
		click,
		role,
		dismiss
	]);

	const {isMounted, styles} = useTransitionStyles(context, {
		common: {
			transformOrigin: 'right',
		},
	});

	return (
		<>
			<FloatingPortal>
				{isMounted && (
					<FloatingOverlay
						style={{ ...styles }}
						className="z-50 bg-theme-secondary-900-rgba/40 backdrop-blur-md dark:bg-black-rgba/40 dark:bg-opacity-80"
						lockScroll
					>
						<FloatingFocusManager context={context}>
							<div className="Dialog" ref={refs.setFloating} {...getFloatingProps()}>
								<div className="custom-scroll overflow-y-scroll fixed right-0 top-0 h-screen w-full bg-theme-background p-4 shadow-[0_15px_35px_0px_rgba(33,34,37,0.08)] md:w-[512px] md:p-8">
									{children}
									<button onClick={() => onOpenChange(false)}>Cancel</button>
								</div>
							</div>
						</FloatingFocusManager>
					</FloatingOverlay>
				)}
			</FloatingPortal>
		</>
	);
}
