import cn from "classnames";
import React from "react";
import { Id as ToastId, toast, ToastContent, ToastContentProps, ToastOptions, TypeOptions } from "react-toastify";

import { Color } from "@/types";
import { Toast } from "@/app/components/Toast";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";

type ToastTypeOptions = Exclude<TypeOptions, "default" | "dark">;

export const ToastMessage = ({
	children,
	type,
	closeToast,
}: { children: React.ReactNode; type: ToastTypeOptions } & ToastContentProps) => {
	const typeVariants: Record<ToastTypeOptions, Color> = {
		error: "danger",
		info: "info",
		success: "success",
		warning: "warning",
	};

	const variant = typeVariants[type];

	return (
		<Toast variant={variant}>
			<div className="flex items-center space-x-4 break-words">
				<div data-testid="ToastMessage__content" className="flex-1 overflow-hidden text-theme-text">
					{children}
				</div>

				<Button
					data-testid="ToastMessage__close-button"
					variant="transparent"
					size="icon"
					onClick={closeToast}
					className={cn(
						"h-11 w-11 text-theme-secondary-900",
						`bg-theme-${variant === "info" ? "primary" : variant}-100 hover:bg-theme-${
							variant === "info" ? "primary" : variant
						}-200`,
						"dark:bg-theme-secondary-900 dark:text-theme-secondary-600 dark:hover:bg-theme-secondary-700 dark:hover:text-theme-secondary-400",
					)}
				>
					<Icon name="Cross" />
				</Button>
			</div>
		</Toast>
	);
};

export class ToastService {
	#toastAnimationDuration = 1300;

	private readonly defaultOptions: ToastOptions = {
		autoClose: 5000,
		closeButton: false,
		hideProgressBar: true,
		pauseOnFocusLoss: true,
		position: "bottom-right",
	};

	public options() {
		return this.defaultOptions;
	}

	private toast(type: ToastTypeOptions, content: ToastContent, options?: ToastOptions): ToastId {
		return toast((properties: ToastContentProps<any>) => this.renderContent(type, content, properties), {
			...this.options(),
			...options,
		});
	}

	public info(content: ToastContent, options?: ToastOptions): ToastId {
		return this.toast("info", content, options);
	}

	public success(content: ToastContent, options?: ToastOptions): ToastId {
		return this.toast("success", content, options);
	}

	public warning(content: ToastContent, options?: ToastOptions): ToastId {
		return this.toast("warning", content, options);
	}

	public error(content: ToastContent, options?: ToastOptions): ToastId {
		return this.toast("error", content, options);
	}

	public dismiss(id?: ToastId) {
		toast.dismiss(id);
		return new Promise((resolve) => setTimeout(() => resolve(""), this.#toastAnimationDuration));
	}

	public update(id: ToastId, type: ToastTypeOptions, content: ToastContent): void {
		toast.update(id, {
			render: (properties: ToastContentProps<any>) => this.renderContent(type, content, properties),
		});
	}

	public isActive(id: ToastId): boolean {
		return toast.isActive(id);
	}

	private renderContent(type: ToastTypeOptions, content: ToastContent, properties: ToastContentProps) {
		return (
			<ToastMessage type={type} {...properties}>
				<>{content}</>
			</ToastMessage>
		);
	}
}
