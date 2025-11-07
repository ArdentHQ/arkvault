import cn from "classnames";
import { Size } from "@/types";
import { ReactElement, ReactNode, useRef, useState } from "react";
import {
	offset as tooltipOffset,
	shift,
	flip,
	useFloating,
	autoUpdate,
	useInteractions,
	useHover,
	useFocus,
	useDismiss,
	useRole,
	arrow,
	FloatingArrow,
	useTransitionStyles,
	Placement,
} from "@floating-ui/react";
import { twMerge } from "tailwind-merge";
import { FloatingPortal } from "@floating-ui/react";

interface TooltipProps {
	content: ReactNode;
	children?: ReactNode;
	placement?: Placement;
	size?: Size;
	disabled?: boolean;
	className?: string;
	visible?: boolean;
	offset?: number;
	showFloatingArrow?: boolean;
	wrapperClass?: string;
	floatingWrapperClass?: string;
	usePortal?: boolean;
}

export const Tooltip = ({
	visible,
	disabled,
	content,
	children,
	placement = "top",
	size,
	className,
	offset = 12,
	showFloatingArrow = true,
	wrapperClass,
	floatingWrapperClass,
	usePortal,
}: TooltipProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const arrowRef = useRef(null);

	const isTooltipOpen = visible === undefined ? isOpen : visible;
	const isDisabled = disabled || content?.toString().trim().length === 0;

	const {
		refs: { setReference, setFloating },
		floatingStyles,
		context,
	} = useFloating({
		middleware: [tooltipOffset(offset), flip(), shift(), arrow({ element: arrowRef })],
		onOpenChange: setIsOpen,
		open: isTooltipOpen && !disabled,
		placement,
		whileElementsMounted: autoUpdate,
	});

	const hover = useHover(context, { move: false });
	const focus = useFocus(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "tooltip" });

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

	const { styles: transitionStyles } = useTransitionStyles(context, {
		initial: { opacity: 0, transform: "scale(0.9)" },
	});

	return (
		<span className={wrapperClass}>
			<span ref={setReference} {...getReferenceProps()}>
				{children}
			</span>

			{isTooltipOpen && !isDisabled && (
				<FloatingPortalWrapper usePortal={usePortal}>
					<div
						ref={setFloating}
						style={{ ...floatingStyles, zIndex: 50 }}
						{...getFloatingProps()}
						className={floatingWrapperClass}
					>
						<div style={transitionStyles}>
							{showFloatingArrow && (
								<FloatingArrow
									className="fill-theme-secondary-900 dark:fill-theme-secondary-700 dim:fill-theme-dim-700"
									tipRadius={2}
									height={8}
									ref={arrowRef}
									context={context}
								/>
							)}
							<div
								style={{ fontFeatureSettings: '"liga" off, "calt" off' }}
								className={twMerge(
									cn(
										"overflow-wrap-anywhere dark:bg-theme-secondary-700 dark:text-theme-secondary-200 bg-theme-secondary-900 dim:text-theme-dim-50 dim:bg-theme-dim-700 max-w-[600px] rounded-md px-2 py-1 text-sm font-semibold break-words whitespace-nowrap text-white",
										{
											"text-xs font-medium": size === "sm",
										},
										className,
									),
								)}
							>
								<div>{content}</div>
							</div>
						</div>
					</div>
				</FloatingPortalWrapper>
			)}
		</span>
	);
};

const FloatingPortalWrapper = ({ usePortal = true, children }: { usePortal?: boolean; children?: ReactElement }) => {
	if (usePortal) {
		return <FloatingPortal>{children}</FloatingPortal>;
	}

	return <>{children}</>;
};
