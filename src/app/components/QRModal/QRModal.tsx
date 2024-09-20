import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/app/components/Alert";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { QRCameraReader } from "@/app/components/QRCameraReader";
import { Spinner } from "@/app/components/Spinner";
import { QRFileUpload } from "@/app/components/QRFileUpload";
import { FormButtons } from "@/app/components/Form";
import { toasts } from "@/app/services";
import { useBreakpoint } from "@/app/hooks";

interface QRError {
	title?: string;
	message: string;
}

interface QRModalProperties {
	isOpen: boolean;
	onCancel: () => void;
	onRead: (text: string) => void;
}

const ERROR_THRESHOLD = 5;

const AccessDeniedErrors = [
	"Permission denied", // Chrome
	"is not allowed", // Firefox & Safari
];

const ViewFinder = ({ error, isLoading }: { error?: QRError; isLoading: boolean }) => (
	<div
		data-testid="ViewFinder"
		className="relative z-10 flex h-[300px] w-[300px] flex-col items-center justify-center border-2 border-theme-secondary-500"
		style={{ boxShadow: "0px 0px 0px 9999px rgba(0, 0, 0, 0.75)" }}
	>
		<div className="absolute -top-[2px] left-8 right-8 h-0.5 bg-theme-secondary-800" />
		<div className="absolute -bottom-[2px] left-8 right-8 h-0.5 bg-theme-secondary-800" />
		<div className="absolute -left-[2px] bottom-8 top-8 w-0.5 bg-theme-secondary-800" />
		<div className="absolute -right-[2px] bottom-8 top-8 w-0.5 bg-theme-secondary-800" />

		{(error || isLoading) && (
			<>
				<div
					data-testid="QRModal__placeholder"
					className="absolute inset-0 -z-10"
					style={{ boxShadow: "inset 9999px 0px 0px rgba(0, 0, 0, 0.75)" }}
				/>

				{error && (
					<>
						<Image className="w-22" name="ErrorSmall" useAccentColor={false} />
					</>
				)}

				{isLoading && <Spinner size="xl" theme="dark" />}
			</>
		)}
	</div>
);

export const QRModal = ({ isOpen, onCancel, onRead }: QRModalProperties) => {
	const { isSmAndAbove } = useBreakpoint();
	const [error, setError] = useState<QRError | undefined>(undefined);
	const [ready, setReady] = useState(false);

	const errorCounter = useRef(0);

	const { t } = useTranslation();

	const handleError = (qrError: Error) => {
		if (error) {
			return;
		}

		if (AccessDeniedErrors.some((message: string) => message.includes(qrError.message))) {
			setError({
				message: t("TRANSACTION.MODAL_QR_CODE.PERMISSION_ERROR.DESCRIPTION"),
				title: t("TRANSACTION.MODAL_QR_CODE.PERMISSION_ERROR.TITLE"),
			});
			return;
		}

		if (qrError.message === "InvalidQR") {
			toasts.error(t("TRANSACTION.MODAL_QR_CODE.INVALID_QR_CODE"));

			return;
		}

		/* istanbul ignore else -- @preserve */
		if (qrError.message) {
			errorCounter.current++;

			if (errorCounter.current >= ERROR_THRESHOLD) {
				resetErrorCounter();

				toasts.error(t("TRANSACTION.MODAL_QR_CODE.ERROR"));
			}
		}
	};

	const handleReady = () => {
		if (!ready) {
			setReady(true);
		}
	};

	const handleRead = (qrCodeString: string) => {
		setError(undefined);
		onRead?.(qrCodeString);
	};

	const resetErrorCounter = () => (errorCounter.current = 0);

	useEffect(() => {
		/* istanbul ignore next -- @preserve */
		if (!isOpen) {
			setError(undefined);
			setReady(false);

			resetErrorCounter;
		}
	}, [isOpen]);

	return (
		<Modal
			isOpen={isOpen}
			title={t("TRANSACTION.MODAL_QR_CODE.TITLE")}
			description={t("TRANSACTION.MODAL_QR_CODE.DESCRIPTION")}
			size="4xl"
			noButtons
			contentClassName="px-4 pt-4 md:pt-8 md:px-8"
			onClose={() => onCancel()}
		>
			<div className="relative -mx-10 -mb-10 mt-4 flex min-h-full flex-1 items-center justify-center overflow-hidden bg-black">
				<div className="absolute inset-0 z-10">
					<QRCameraReader onError={handleError} onRead={handleRead} onReady={handleReady} />
				</div>

				<div className="flex h-full flex-col items-center justify-center py-8">
					<ViewFinder error={error} isLoading={!ready} />
					{error && (
						<Alert
							title={error.title}
							variant="danger-dark"
							className="z-10 mt-6 w-full max-w-[300px] sm:max-w-[531px]"
							collapsible={!isSmAndAbove}
						>
							{error.message}
						</Alert>
					)}

					<div className="z-10">
						<FormButtons>
							<QRFileUpload onError={handleError} onRead={handleRead} />
						</FormButtons>
					</div>
				</div>
			</div>
		</Modal>
	);
};
