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
					<div className="flex justify-between items-center mb-3 w-full leading-5 sm:justify-start sm:mb-0">
						<DetailTitle> {t("COMMON.ADDRESS")} </DetailTitle>
						<Address
							address={wallet.address()}
							addressClass="leading-[17px] sm:leading-5"
							wrapperClass="w-max! sm:w-full!"
							showCopyButton
						/>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("COMMON.ADDRESS_NAME")}>
					<div className="flex justify-between items-center w-full sm:justify-start">
						<DetailTitle> {t("COMMON.NAME")}</DetailTitle>
						<div className="flex justify-end items-center w-full min-w-0 font-semibold sm:justify-between sm:leading-5 leading-[17px]">
							<div className="max-w-[calc(100%_-_80px)] shrink-0 truncate sm:max-w-none">
								{" "}
								{wallet.alias()}{" "}
							</div>

							<div className="flex items-center h-5 sm:hidden">
								<Divider type="vertical" size="md" />
							</div>

							<Button
								size="xs"
								data-testid="CreateWallet__edit-alias"
								type="button"
								variant="transparent"
								className="py-0 px-0 space-x-0 text-theme-navy-600"
								onClick={onClickEditAlias}
							>
								<Icon name="Pencil" />
								<span className="sm:leading-5 leading-[17px]">{t("COMMON.EDIT")}</span>
							</Button>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
