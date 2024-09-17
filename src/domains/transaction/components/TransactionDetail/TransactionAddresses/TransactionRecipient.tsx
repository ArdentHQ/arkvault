import React from "react";
import { Address } from "@/app/components/Address";
import { DetailTitle } from "@/app/components/DetailWrapper";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import cn from "classnames";

export const TransactionRecipient = ({
	recipient = [],
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
			<div className="hidden h-8 w-full items-center sm:flex">
				<Divider dashed />
			</div>

			<div className="mt-3 flex w-full items-center justify-between gap-4 space-x-2 sm:mt-0 sm:justify-start sm:space-x-0">
				<DetailTitle
					className={cn(labelClassName, {
						invisible: !showLabel,
					})}
				>
					{t("COMMON.TO")}
				</DetailTitle>

				<div className="w-3/4">
					<Address
						address={recipient.address}
						walletName={recipient.alias}
						showCopyButton
						walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
						addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm leading-[17px] sm:leading-5 sm:text-base"
						wrapperClass="justify-end sm:justify-start"
					/>
				</div>
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

	if (recipients.length === 1) {
		return <TransactionRecipient recipient={recipients.at(0)} labelClassName={labelClassName} showLabel />;
	}

	return (
		<>
			<div className="hidden h-8 w-full items-center sm:flex">
				<Divider dashed />
			</div>

			<div className="mt-3 flex w-full items-center justify-between gap-4 space-x-2 sm:mt-0 sm:justify-start sm:space-x-0">
				<DetailTitle className={labelClassName}>{t("COMMON.TO")}</DetailTitle>

				<div className="flex items-center space-x-4">
					<span>{t("TRANSACTION.MULTIPLE_COUNT", { count: recipients.length })}</span>
					<div className="hidden sm:inline-block">
						<Divider type="vertical" size="md" />
					</div>

					<Link to={explorerLink} isExternal className="hidden sm:block">
						{t("TRANSACTION.VIEW_RECIPIENTS_LIST")}
					</Link>
				</div>
			</div>
		</>
	);
};
