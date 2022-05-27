import { Networks } from "@payvo/sdk";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { Form } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { Modal } from "@/app/components/Modal";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail";
import { ReceiveFundsForm, useQRCode } from "@/domains/wallet/components/ReceiveFunds";

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
		network: network.id(),
	});

	return (
		<Modal
			size="lg"
			title={t("WALLETS.MODAL_RECEIVE_FUNDS.TITLE")}
			description={<p className="mb-4">{t("WALLETS.MODAL_RECEIVE_FUNDS.DESCRIPTION")}</p>}
			isOpen
			onClose={onClose}
		>
			{name && (
				<div data-testid="ReceiveFunds__name">
					<TransactionDetail
						useDesktop
						borderPosition="bottom"
						label={t("COMMON.NAME")}
						extra={
							<span className="flex-shrink-0">
								<NetworkIcon size="lg" network={network} />
							</span>
						}
					>
						{name}
					</TransactionDetail>
				</div>
			)}

			<div data-testid="ReceiveFunds__address">
				<TransactionDetail
					useDesktop
					className="flex"
					label={t("COMMON.ADDRESS")}
					borderPosition="bottom"
					extra={
						<div className="-space-x-1 whitespace-nowrap">
							{!name && <NetworkIcon size="lg" network={network} />}
							<Avatar address={address} size="lg" />
						</div>
					}
				>
					<div className="relative flex h-6 grow justify-start">
						<div className="absolute flex max-w-full items-center space-x-2 overflow-auto">
							<Address address={address} />

							<span className="flex grow text-theme-primary-300 dark:text-theme-secondary-600">
								<Clipboard variant="icon" data={address}>
									<Icon name="Copy" />
								</Clipboard>
							</span>
						</div>
					</div>
				</TransactionDetail>
			</div>

			<div>
				{!isFormOpen && (
					<Button
						variant="secondary"
						className="mt-8 w-full"
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

			<div className="mx-auto mt-8 h-64 w-64">
				{image && (
					<img
						src={image}
						className="h-64 w-64 rounded-lg border border-theme-secondary-300 p-3 dark:border-theme-secondary-800"
						alt={t("COMMON.QR_CODE")}
						data-testid="ReceiveFunds__qrcode"
					/>
				)}
			</div>

			{isFormOpen && (
				<>
					<div className="mx-auto mt-6 max-w-sm text-center text-theme-secondary-600">
						{t("COMMON.QR_CODE_HELP_TEXT")}
					</div>

					<div className="relative mt-8 h-18 border border-transparent">
						<div
							className="absolute flex max-w-full overflow-auto rounded-lg border border-theme-secondary-300 font-medium dark:border-theme-secondary-800"
							data-testid="ReceiveFundsForm__uri"
						>
							<div className="bg-theme-secondary-200 p-6 dark:bg-theme-secondary-800">
								<span className="text-theme-secondary-text">{t("COMMON.QR_SHORT")}</span>
							</div>

							<div className="flex grow items-center justify-between space-x-4 overflow-auto bg-theme-secondary-100 pr-5 pl-6 dark:bg-theme-background">
								{!!uri && (
									<>
										<span className="truncate">{uri}</span>
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
