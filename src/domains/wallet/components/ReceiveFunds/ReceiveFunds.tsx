import { Networks } from "@/app/lib/mainsail";
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
	const { amount } = form.watch();

	const { uri, image } = useQRCode({
		address,
		amount,
		coin: network.coin(),
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
				className="py-4 px-6 rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800"
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
						className="p-3 w-full h-auto rounded-xl border border-theme-secondary-200 dark:border-theme-secondary-800 dark:bg-theme-secondary-200"
						alt={t("COMMON.QR_CODE")}
						data-testid="ReceiveFunds__qrcode"
					/>
				)}
			</div>

			<div className="mt-4">
				{image && (
					<Button
						variant="secondary"
						className="flex space-x-2 w-full"
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
							className="flex overflow-auto absolute max-w-full font-medium rounded-lg border border-theme-secondary-300 dark:border-theme-secondary-800"
							data-testid="ReceiveFundsForm__uri"
						>
							<div className="px-4 leading-5 bg-theme-secondary-200 py-4.5 dark:bg-theme-secondary-800">
								<span className="text-theme-secondary-text">{t("COMMON.QR_SHORT")}</span>
							</div>

							<div className="flex overflow-auto justify-between items-center pr-5 pl-6 space-x-4 bg-theme-secondary-100 grow dark:bg-theme-background">
								{!!uri && (
									<>
										<span className="leading-5 truncate">{uri}</span>
										<span className="flex text-theme-primary-300 dark:text-theme-secondary-600 hover:text-theme-primary-700">
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
