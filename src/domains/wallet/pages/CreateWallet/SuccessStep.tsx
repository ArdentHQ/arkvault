import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { assertNetwork, assertWallet } from "@/utils/assertions";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { Divider } from "@/app/components/Divider";

export const SuccessStep = ({ onClickEditAlias }: { onClickEditAlias: () => void }) => {
	const { t } = useTranslation();

	const { getValues, watch } = useFormContext();

	// getValues does not get the value of `defaultValues` on first render
	const [defaultNetwork] = useState(() => watch("network"));
	const network = getValues("network") || defaultNetwork;

	const [defaultWallet] = useState(() => watch("wallet"));
	const wallet = getValues("wallet") || defaultWallet;

	assertNetwork(network);
	assertWallet(wallet);

	return (
		<section data-testid="CreateWallet__SuccessStep">
			<Header
				title={t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.TITLE")}
				titleIcon={
					<Icon
						className="text-theme-success-100 dark:text-theme-success-900"
						dimensions={[24, 24]}
						name="Completed"
						data-testid="icon-Completed"
					/>
				}
				subtitle={t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.SUBTITLE")}
				className="hidden sm:block"
			/>

			<div className="mt-4 space-y-4">
				<DetailWrapper label={t("COMMON.ADDRESSING")}>
					<div className="mb-3 flex w-full items-center justify-between leading-5 sm:mb-0 sm:justify-start">
						<DetailTitle> {t("COMMON.ADDRESS")} </DetailTitle>
						<Address
							address={wallet.address()}
							addressClass="leading-[17px] sm:leading-5"
							wrapperClass="!w-max sm:!w-full"
							showCopyButton
						/>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("WALLETS.WALLET_NAME")}>
					<div className="flex w-full items-center justify-between sm:justify-start">
						<DetailTitle> {t("COMMON.NAME")}</DetailTitle>
						<div className="flex w-full min-w-0 items-center justify-end font-semibold leading-[17px] sm:justify-between sm:leading-5">
							<div className="max-w-[calc(100%_-_80px)] flex-shrink-0 truncate sm:max-w-none">
								{" "}
								{wallet.alias()}{" "}
							</div>

							<div className="flex h-5 items-center sm:hidden">
								<Divider type="vertical" size="md" />
							</div>

							<Button
								size="xs"
								data-testid="CreateWallet__edit-alias"
								type="button"
								variant="transparent"
								className="space-x-0 px-0 py-0 text-theme-navy-600"
								onClick={onClickEditAlias}
							>
								<Icon name="Pencil" />
								<span className="leading-[17px] sm:leading-5">{t("COMMON.EDIT")}</span>
							</Button>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
