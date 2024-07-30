import { Networks } from "@ardenthq/sdk";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { Form } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { Modal } from "@/app/components/Modal";
import { ReceiveFundsForm, useQRCode } from "@/domains/wallet/components/ReceiveFunds";
import { toasts } from "@/app/services";
import { useFiles } from "@/app/hooks/use-files";

interface ReceiveFundsProperties {
	address: string;
	name?: string;
	network: Networks.Network;
	onClose?: () => void;
}

export const ReceiveFunds = ({ address, name, network, onClose }: ReceiveFundsProperties) => {
	const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

	const { t } = useTranslation();
	const form = useForm({ mode: "onChange" });
	const { amount, memo } = form.watch();

	const { uri, image } = useQRCode({
		address,
		amount,
		coin: network.coin(),
		memo,
		nethash: network.meta().nethash,
	});

	const { isLegacy, showImageSaveDialog } = useFiles();

	const handleQRDownload = async (qrContent: string) => {
		try {
			const filePath = await showImageSaveDialog(qrContent, { extensions: [".png"], fileName: `${address}.png` });

			if (!isLegacy()) {
				toasts.success(<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath }} />);
			}
		} catch {
			//
		}
	};

	return (
		<Modal
			size="lg"
			title={t("WALLETS.MODAL_RECEIVE_FUNDS.TITLE")}
			description={<p className="mb-4">{t("WALLETS.MODAL_RECEIVE_FUNDS.DESCRIPTION")}</p>}
			isOpen
			onClose={onClose}
		>
			<div
				className="rounded-xl border border-theme-secondary-300 px-6 py-4 dark:border-theme-secondary-800"
				data-testid="ReceiveFunds__Name_Address"
			>
				<Address
					address={address}
					walletName={name}
					addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 leading-5"
					walletNameClass="leading-5"
					showCopyButton
				/>
			</div>

			<div>
				{!isFormOpen && (
					<Button
						variant="secondary"
						className="mt-4 w-full"
						onClick={() => setIsFormOpen(true)}
						data-testid="ReceiveFunds__toggle"
					>
						{t("WALLETS.MODAL_RECEIVE_FUNDS.SPECIFY_AMOUNT")}
					</Button>
				)}

				{isFormOpen && (
					<Form context={form}>
						<ReceiveFundsForm network={network} />
					</Form>
				)}
			</div>

			<div className="mt-4">
				{image && (
					<img
						src={image}
						className="h-auto w-full rounded-xl border border-theme-secondary-200 p-3 dark:border-theme-secondary-800 dark:bg-theme-secondary-200"
						alt={t("COMMON.QR_CODE")}
						data-testid="ReceiveFunds__qrcode"
					/>
				)}
			</div>

			<div className="mt-4">
				{image && (
					<Button
						variant="secondary"
						className="flex w-full space-x-2"
						onClick={() => handleQRDownload(image)}
						data-testid="ReceiveFunds__download-qr"
					>
						<Icon name="Download" />
						<span>{t("WALLETS.MODAL_RECEIVE_FUNDS.DOWNLOAD_QR_CODE")}</span>
					</Button>
				)}
			</div>

			{isFormOpen && (
				<>
					<div className="mx-auto mt-4 max-w-sm text-center text-theme-secondary-600">
						{t("COMMON.QR_CODE_HELP_TEXT")}
					</div>

					<div className="relative mt-4 h-14 border border-transparent">
						<div
							className="absolute flex max-w-full overflow-auto rounded-lg border border-theme-secondary-300 font-medium dark:border-theme-secondary-800"
							data-testid="ReceiveFundsForm__uri"
						>
							<div className="bg-theme-secondary-200 px-4 py-4.5 leading-5 dark:bg-theme-secondary-800">
								<span className="text-theme-secondary-text">{t("COMMON.QR_SHORT")}</span>
							</div>

							<div className="flex grow items-center justify-between space-x-4 overflow-auto bg-theme-secondary-100 pl-6 pr-5 dark:bg-theme-background">
								{!!uri && (
									<>
										<span className="truncate leading-5">{uri}</span>
										<span className="flex text-theme-primary-300 hover:text-theme-primary-700 dark:text-theme-secondary-600">
											<Clipboard variant="icon" data={uri}>
												<Icon name="Copy" className="p-1" />
											</Clipboard>
										</span>
									</>
								)}
							</div>
						</div>
					</div>
				</>
			)}
		</Modal>
	);
};
