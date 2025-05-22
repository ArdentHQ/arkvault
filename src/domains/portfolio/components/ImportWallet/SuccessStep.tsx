import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
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
			<div className="space-y-4">
				<DetailWrapper label={t("COMMON.IMPORTED")}>
					<div className="flex justify-between items-center mb-3 w-full leading-5 sm:justify-start sm:mb-0">
						<DetailTitle> {t("COMMON.ADDRESS")} </DetailTitle>
						<Address
							address={importedWallet.address()}
							addressClass="leading-[17px] sm:leading-5"
							wrapperClass="w-max! sm:w-full!"
							showCopyButton
						/>
					</div>

					<div className="hidden items-center w-full h-8 sm:flex">
						<Divider dashed />
					</div>

					<div className="flex justify-between items-center w-full sm:justify-start sm:leading-5 leading-[17px]">
						<DetailTitle> {t("COMMON.BALANCE")}</DetailTitle>
						<div className="font-semibold">
							<Amount value={importedWallet.balance()} ticker={network.ticker()} />
						</div>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("WALLETS.WALLET_NAME")}>
					<div className="flex justify-between items-center w-full sm:justify-start">
						<DetailTitle> {t("COMMON.NAME")}</DetailTitle>
						<div className="flex justify-end items-center pr-4 w-full min-w-0 font-semibold sm:justify-between sm:leading-5 leading-[17px]">
							<div className="max-w-[calc(100%_-_80px)] shrink-0 truncate sm:max-w-none">
								{" "}
								{importedWallet.alias()}{" "}
							</div>

							<div className="flex items-center h-5 sm:hidden">
								<Divider type="vertical" size="md" />
							</div>

							<Button
								size="xs"
								data-testid="ImportWallet__edit-alias"
								type="button"
								variant="transparent"
								className="py-1 px-2 space-x-0 rounded dark:text-white text-theme-primary-600 dark:hover:bg-theme-secondary-800 hover:bg-theme-primary-100"
								onClick={onClickEditAlias}
							>
								<Icon name="Pencil" size="md" />
								<span className="sm:leading-5 leading-[17px]">{t("COMMON.EDIT")}</span>
							</Button>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
