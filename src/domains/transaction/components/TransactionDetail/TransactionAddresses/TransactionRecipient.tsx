import React from "react";
import { Address } from "@/app/components/Address";
import { DetailDivider, DetailTitle } from "@/app/components/DetailWrapper";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import cn from "classnames";

export const TransactionRecipient = ({
	recipient,
	showLabel,
	labelClassName,
}: {
	labelClassName?: string;
	showLabel: boolean;
	recipient?: RecipientItem;
}) => {
	const { t } = useTranslation();

	return (
		<>
			<DetailDivider />

			<div className="mt-3 flex w-full items-center justify-between space-x-2 sm:mt-0 sm:justify-start sm:space-x-0">
				<DetailTitle
					className={cn(labelClassName, {
						invisible: !showLabel,
					})}
				>
					{t("COMMON.TO")}
				</DetailTitle>

				<Address
					truncateOnTable
					address={recipient?.address}
					walletName={recipient?.alias}
					showCopyButton
					walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
					addressClass={cn("text-sm leading-[17px] sm:leading-5 sm:text-base", {
						"text-theme-secondary-500 dark:text-theme-secondary-700 ": !!recipient?.alias,
					})}
					wrapperClass="justify-end sm:justify-start"
				/>
			</div>
		</>
	);
};

export const TransactionRecipients = ({
	recipients,
	explorerLink,
	labelClassName,
}: {
	recipients: RecipientItem[];
	explorerLink: string;
	labelClassName?: string;
}) => {
	const { t } = useTranslation();

	if (recipients.length === 0) {
		return <></>;
	}

	if (recipients.length === 1) {
		return <TransactionRecipient recipient={recipients.at(0)} labelClassName={labelClassName} showLabel />;
	}

	return (
		<>
			<DetailDivider />

			<div className="mt-3 flex w-full items-center justify-between space-x-2 sm:mt-0 sm:justify-start sm:space-x-0">
				<DetailTitle className={labelClassName}>{t("COMMON.TO")}</DetailTitle>

				<div className="flex items-center">
					<span className="font-semibold leading-5">
						<span>{t("COMMON.MULTIPLE")} </span>
						<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
							({recipients.length}){" "}
						</span>
					</span>
					<div className="hidden h-5 leading-5 sm:block">
						<Divider type="vertical" size="md" />
					</div>

					<Link to={explorerLink} isExternal className="hidden h-5 leading-5 sm:block">
						{t("TRANSACTION.VIEW_RECIPIENTS_LIST")}
					</Link>
				</div>
			</div>
		</>
	);
};
