import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
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
			<div className="space-y-4">
				<DetailWrapper label={t("COMMON.ADDRESSING")}>
					<div className="mb-3 flex w-full items-center justify-between leading-5 sm:mb-0 sm:justify-start">
						<DetailTitle> {t("COMMON.ADDRESS")} </DetailTitle>
						<Address
							address={wallet.address()}
							addressClass="leading-[17px] sm:leading-5 text-sm sm:text-base"
							wrapperClass="w-max! sm:w-full! text-sm sm:text-base"
							showCopyButton
						/>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("COMMON.ADDRESS_NAME")}>
					<div className="flex w-full items-center justify-between sm:justify-start">
						<DetailTitle> {t("COMMON.NAME")}</DetailTitle>
						<div className="flex w-full min-w-0 items-center justify-end leading-[17px] font-semibold sm:justify-between sm:leading-5">
							<div className="max-w-[calc(100%_-_80px)] shrink-0 truncate sm:max-w-none text-sm sm:text-base">
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
								className="text-theme-navy-600 space-x-0 px-0 py-0"
								onClick={onClickEditAlias}
							>
								<Icon name="Pencil" />
								<span className="leading-[17px] sm:leading-5 text-sm sm:text-base">{t("COMMON.EDIT")}</span>
							</Button>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
