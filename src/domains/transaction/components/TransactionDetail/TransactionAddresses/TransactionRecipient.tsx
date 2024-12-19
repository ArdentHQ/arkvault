import React, { useState } from "react";
import { Address } from "@/app/components/Address";
import { DetailTitle } from "@/app/components/DetailWrapper";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import cn from "classnames";
import { Button } from "@/app/components/Button";
import { RecipientsModal } from "@/domains/transaction/components/RecipientsModal";
import { Icon } from "@/app/components/Icon";
import { Label } from "@/app/components/Label";

const ContractLabel = () => {
	const { t } = useTranslation();

	return (
		<Label
			color="neutral"
			size="xs"
			noBorder
			className="rounded px-1 py-[2px] dark:border"
			data-testid="TransactionRow__type"
		>
			<div className="flex items-center space-x-1.5">
				<Icon name="Contract" dimensions={[12, 12]} />
				<span className="font-semibold">{t("COMMON.CONTRACT")}</span>
			</div>
		</Label>
	);
};

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
			<div className="mt-3 flex w-full items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
				<DetailTitle
					className={cn(labelClassName, {
						invisible: !showLabel,
					})}
				>
					{t("COMMON.TO")}
				</DetailTitle>

				<div className="flex w-full">
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

					{recipient?.isContract && (
						<div className="flex items-center">
							<Divider type="vertical" />
							<ContractLabel />
						</div>
					)}
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

	if (recipients.length === 0) {
		return <></>;
	}

	if (recipients.length === 1) {
		return <TransactionRecipient recipient={recipients.at(0)} labelClassName={labelClassName} showLabel />;
	}

	return (
		<>
			<div className="mt-3 flex w-full items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
				<DetailTitle className={labelClassName}>{t("COMMON.TO")}</DetailTitle>

				<div className="flex items-center">
					<span className="text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">
						<span>{t("COMMON.MULTIPLE")} </span>
						<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
							({recipients.length}){" "}
						</span>
					</span>
					<div className="hidden h-5 leading-[17px] sm:block sm:leading-5">
						<Divider type="vertical" size="md" />
					</div>

					<Link
						to={explorerLink}
						isExternal
						className="hidden h-5 text-sm leading-[17px] sm:block sm:text-base sm:leading-5"
					>
						{t("TRANSACTION.VIEW_RECIPIENTS_LIST")}
					</Link>
				</div>
			</div>
		</>
	);
};

export const TransactionRecipientsModal = ({
	recipients,
	labelClassName,
	ticker,
}: {
	recipients: RecipientItem[];
	labelClassName?: string;
	ticker: string;
}): JSX.Element => {
	const { t } = useTranslation();

	const [showModal, setShowModal] = useState(false);

	if (recipients.length === 0) {
		return <></>;
	}

	if (recipients.length === 1) {
		return <TransactionRecipient recipient={recipients.at(0)} labelClassName={labelClassName} showLabel />;
	}

	return (
		<>
			<div className="mt-3 flex w-full items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
				<DetailTitle className={labelClassName}>{t("COMMON.TO")}</DetailTitle>

				<div className="flex items-center">
					<span className="inline-flex items-center gap-1 text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">
						<span>{t("COMMON.MULTIPLE")} </span>
						<span
							className="text-theme-secondary-700 dark:text-theme-secondary-500"
							data-testid="TransactionRecipientsModal--RecipientsCount"
						>
							({recipients.length}){" "}
						</span>
					</span>
					<div className="h-5 leading-5">
						<Divider type="vertical" size="md" />
					</div>

					<Button
						onClick={() => setShowModal(true)}
						variant="transparent"
						data-testid="TransactionRecipientsModal--ShowList"
						className="p-0 text-sm leading-[17px] text-theme-navy-600 underline decoration-theme-navy-600 decoration-dashed decoration-1 underline-offset-4 sm:text-base sm:leading-5"
					>
						{t("TRANSACTION.VIEW_RECIPIENTS_LIST")}
					</Button>
				</div>
			</div>
			<RecipientsModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				recipients={recipients}
				ticker={ticker}
			/>
		</>
	);
};
