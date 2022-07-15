import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { QRCameraReader } from "@/app/components/QRCameraReader";
import { Spinner } from "@/app/components/Spinner";

interface QrError {
	title?: string;
	message: string;
}

interface QrModalProperties {
	isOpen: boolean;
	onCancel: () => void;
	onRead: (text: string) => void;
}

const AccessDeniedErrors = [
	"Permission denied", // Chrome
	"is not allowed", // Firefox & Safari
];

const ViewFinder = ({ error, isLoading }: { error?: QrError; isLoading: boolean }) => (
	<div
		data-testid="ViewFinder"
		className="relative z-10 flex h-[300px] w-[300px] flex-col items-center justify-center border-2 border-theme-secondary-500"
		style={{ boxShadow: "0px 0px 0px 9999px rgba(0, 0, 0, 0.75)" }}
	>
		<div className="absolute left-8 right-8 -top-[2px] h-0.5 bg-theme-secondary-800" />
		<div className="absolute left-8 right-8 -bottom-[2px] h-0.5 bg-theme-secondary-800" />
		<div className="absolute top-8 bottom-8 -left-[2px] w-0.5 bg-theme-secondary-800" />
		<div className="absolute top-8 bottom-8 -right-[2px] w-0.5 bg-theme-secondary-800" />

		{(error || isLoading) && (
			<>
				<div
					className="absolute inset-0 -z-10"
					style={{ boxShadow: "inset 9999px 0px 0px rgba(0, 0, 0, 0.75)" }}
				/>

				{error && (
					<>
						<Image className="w-22" name="ErrorSmall" useAccentColor={false} />

						<Alert title={error.title} variant="danger" className="mx-5 mt-8">
							{error.message}
						</Alert>
					</>
				)}

				{isLoading && <Spinner size="xl" theme="dark" />}
			</>
		)}
	</div>
);

export const QrModal = ({ isOpen, onCancel, onRead }: QrModalProperties) => {
	const [error, setError] = useState<QrError | undefined>(undefined);
	const [ready, setReady] = useState(false);

	const { t } = useTranslation();

	const handleError = (error: Error) => {
		if (AccessDeniedErrors.some((message: string) => message.includes(error.message))) {
			setError({
				message: t("TRANSACTION.MODAL_QR_CODE.PERMISSION_ERROR.DESCRIPTION"),
				title: t("TRANSACTION.MODAL_QR_CODE.PERMISSION_ERROR.TITLE"),
			});
			return;
		}

		if (error.message) {
			setError({
				message: t("TRANSACTION.MODAL_QR_CODE.ERROR"),
			});
		}
	};

	const handleReady = () => {
		if (!ready) {
			setReady(true);
		}
	};

	useEffect(() => {
		if (!isOpen) {
			setError(undefined);
			setReady(false);
		}
	}, [isOpen]);

	return (
		<Modal
			isOpen={isOpen}
			title={t("TRANSACTION.MODAL_QR_CODE.TITLE")}
			description={t("TRANSACTION.MODAL_QR_CODE.DESCRIPTION")}
			size="4xl"
			noButtons
			onClose={() => onCancel()}
		>
			<div
				className="relative -mx-10 -mb-10 mt-8 flex justify-center overflow-hidden"
				style={{
					backgroundImage: "url('/qr-background.png')",
					backgroundPosition: "center",
					backgroundSize: "cover",
				}}
			>
				<div className="absolute inset-0 z-10">
					<QRCameraReader onError={handleError} onRead={onRead} onReady={handleReady} />
				</div>

				<div className="flex h-full flex-col items-center justify-center space-y-8 py-8">
					<ViewFinder error={error} isLoading={!ready} />

					<Button variant="secondary" theme="dark" className="z-20 space-x-2">
						<Icon name="ArrowUpBracket" />
						<span>{t("TRANSACTION.MODAL_QR_CODE.UPLOAD")}</span>
					</Button>
				</div>
			</div>
		</Modal>
	);
};
