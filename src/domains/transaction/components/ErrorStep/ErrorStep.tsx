import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { FormButtons } from "@/app/components/Form";
import { TextArea } from "@/app/components/TextArea";

interface Properties {
	title?: string;
	description?: string;
	isBackDisabled?: boolean;
	onClose?: () => void;
	onBack?: () => void;
	errorMessage?: string;
	hideFooter?: boolean;
	withCopyErrorButton?: boolean;
}

export const ErrorStep = ({
	description,
	onBack,
	onClose,
	isBackDisabled = false,
	errorMessage,
	hideFooter = false,
	withCopyErrorButton,
}: Properties) => {
	const { t } = useTranslation();
	const errorMessageReference = useRef(null);
	const deniedByUser = errorMessage?.includes("denied by the user");

	return (
		<div data-testid="ErrorStep">
			<div className="space-y-2">
				<div className="space-y-4">
					<p className="hidden text-theme-secondary-text md:block">
						{description ||
							(deniedByUser
								? t("TRANSACTION.REJECTED_ERROR.DESCRIPTION")
								: t("TRANSACTION.ERROR.DESCRIPTION"))}
					</p>

					<Alert className="md:hidden" variant="danger">
						{description ||
							(deniedByUser
								? t("TRANSACTION.REJECTED_ERROR.DESCRIPTION")
								: t("TRANSACTION.ERROR.DESCRIPTION"))}
					</Alert>

					{errorMessage ? (
						<TextArea
							data-testid="ErrorStep__errorMessage"
							className="py-4"
							initialHeight={70}
							defaultValue={errorMessage}
							ref={errorMessageReference}
							disabled
						/>
					) : (
						<Image
							name="TransactionErrorBanner"
							domain="transaction"
							className="mx-auto mt-4 block w-full max-w-[400px]"
						/>
					)}
				</div>
			</div>

			{!hideFooter && (
				<FormButtons className="sm:pt-4">
					{errorMessage && (
						<div className="mr-auto">
							<Clipboard variant="button" data={errorMessage}>
								<Icon name="Copy" size="lg" />
								<span className="hidden sm:block">{t("COMMON.COPY_ERROR")}</span>
							</Clipboard>
						</div>
					)}

					{!!onClose && (
						<Button onClick={() => onClose()} data-testid="ErrorStep__close-button" variant="secondary">
							<div className="whitespace-nowrap">{t("COMMON.CLOSE")}</div>
						</Button>
					)}

					{!!onBack && (
						<Button data-testid="ErrorStep__back-button" disabled={isBackDisabled} onClick={() => onBack()}>
							<div className="whitespace-nowrap">{t("COMMON.BACK")}</div>
						</Button>
					)}
				</FormButtons>
			)}

			{withCopyErrorButton && (
				<div className="mt-2 flex justify-end">
					<Clipboard
						variant="icon"
						data={errorMessage!}
						iconButtonClassName="rounded px-2 py-[3px] flex items-center transition-colors-shadow duration-100 ease-linear cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-theme-primary-400 hover:text-theme-primary-700 hover:bg-theme-primary-200 dark:hover:bg-theme-secondary-800 dark:hover:text-white dim-hover:text-theme-dim-50 dim-hover:bg-theme-dim-700 text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 font-semibold gap-2"
					>
						<Icon name="Copy" size="md" />
						<span className="leading-5">{t("COMMON.COPY_ERROR")}</span>
					</Clipboard>
				</div>
			)}
		</div>
	);
};
