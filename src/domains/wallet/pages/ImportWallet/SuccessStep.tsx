import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { assertWallet } from "@/utils/assertions";
import { Address } from "@/app/components/Address";
import { Divider } from "@/app/components/Divider";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";

export const SuccessStep = ({
	importedWallet,
	onClickEditAlias,
}: {
	importedWallet: Contracts.IReadWriteWallet | undefined;
	onClickEditAlias: () => void;
}) => {
	assertWallet(importedWallet);

	const { t } = useTranslation();

	const network = importedWallet.network();

	return (
		<section data-testid="ImportWallet__success-step">
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.TITLE")}
				titleIcon={
					<Icon
						className="text-theme-success-100 dark:text-theme-success-900"
						dimensions={[24, 24]}
						name="Completed"
						data-testid="icon-Completed"
					/>
				}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.SUBTITLE")}
				className="hidden sm:block"
			/>

			<div className="mt-4 space-y-4">
				<DetailWrapper label={t("COMMON.IMPORTED")}>
					<div className="mb-3 flex w-full items-center justify-between leading-5 sm:mb-0 sm:justify-start">
						<DetailTitle> {t("COMMON.ADDRESS")} </DetailTitle>
						<Address
							address={importedWallet.address()}
							addressClass="leading-[17px] sm:leading-5"
							wrapperClass="!w-max sm:!w-full"
							showCopyButton
						/>
					</div>

					<div className="hidden h-8 w-full items-center sm:flex">
						<Divider dashed />
					</div>

					<div className="flex w-full items-center justify-between leading-[17px] sm:justify-start sm:leading-5">
						<DetailTitle> {t("COMMON.BALANCE")}</DetailTitle>
						<div className="font-semibold">
							<Amount value={importedWallet.balance()} ticker={network.ticker()} />
						</div>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("WALLETS.WALLET_NAME")}>
					<div className="flex w-full items-center justify-between sm:justify-start">
						<DetailTitle> {t("COMMON.NAME")}</DetailTitle>
						<div className="flex w-full min-w-0 items-center justify-end font-semibold leading-[17px] sm:justify-between sm:leading-5">
							<div className="max-w-[calc(100%_-_80px)] flex-shrink-0 truncate sm:max-w-none">
								{" "}
								{importedWallet.alias()}{" "}
							</div>

							<div className="flex h-5 items-center sm:hidden">
								<Divider type="vertical" size="md" />
							</div>

							<Button
								size="xs"
								data-testid="ImportWallet__edit-alias"
								type="button"
								variant="transparent"
								className="space-x-0 px-2 py-1 text-theme-primary-700 hover:bg-theme-primary-100 dark:text-theme-primary-600 dark:hover:bg-theme-secondary-800 dark:hover:text-white"
								onClick={onClickEditAlias}
							>
								<Icon name="Pencil" size="md" />
								<span className="leading-[17px] sm:leading-5">{t("COMMON.EDIT")}</span>
							</Button>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
