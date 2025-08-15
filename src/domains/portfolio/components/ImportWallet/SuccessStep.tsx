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
			<div className="-mx-3 space-y-4 sm:mx-0">
				<DetailWrapper label={t("COMMON.IMPORTED")}>
					<div className="mb-3 flex w-full items-center justify-between leading-5 sm:mb-0 sm:justify-start">
						<DetailTitle> {t("COMMON.ADDRESS")} </DetailTitle>
						<Address
							address={importedWallet.address()}
							addressClass="leading-[17px] sm:leading-5 text-sm sm:text-base"
							wrapperClass="w-max! sm:w-full! text-sm sm:text-base"
							showCopyButton
						/>
					</div>

					<div className="hidden h-8 w-full items-center sm:flex">
						<Divider dashed />
					</div>

					<div className="flex w-full items-center justify-between leading-[17px] sm:justify-start sm:leading-5">
						<DetailTitle> {t("COMMON.BALANCE")}</DetailTitle>
						<div className="text-sm font-semibold sm:text-base">
							<Amount value={importedWallet.balance()} ticker={network.ticker()} />
						</div>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("COMMON.WALLET_NAME")}>
					<div className="flex w-full items-center justify-between sm:justify-start">
						<DetailTitle> {t("COMMON.NAME")}</DetailTitle>
						<div className="flex w-full min-w-0 items-center justify-end pr-4 leading-[17px] font-semibold sm:justify-between sm:leading-5">
							<div className="max-w-[calc(100%_-_80px)] shrink-0 truncate text-sm sm:max-w-none sm:text-base">
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
								className="text-theme-primary-600 dark:hover:bg-theme-secondary-800 dim-hover:bg-theme-dim-700 hover:bg-theme-primary-100 dim:text-theme-dim-200 dim-hover:text-white space-x-0 rounded px-2 py-1 dark:text-white"
								onClick={onClickEditAlias}
							>
								<Icon name="Pencil" size="md" />
								<span className="text-sm leading-[17px] sm:text-base sm:leading-5">
									{t("COMMON.EDIT")}
								</span>
							</Button>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
