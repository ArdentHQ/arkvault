import React, { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { DTO } from "@/app/lib/profiles";
import cn from "classnames";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { Divider } from "@/app/components/Divider";
import { Button } from "@/app/components/Button";
import { Amount } from "@/app/components/Amount";
import { BigNumber } from "@/app/lib/helpers";
import { Address } from "@/app/components/Address";
import { useActiveProfile, useWalletAlias } from "@/app/hooks";
import { Link } from "@/app/components/Link";
import { Icon } from "@/app/components/Icon";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Skeleton } from "@/app/components/Skeleton";

const validatorPublickey = (transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData) => {
	try {
		return transaction.validatorPublicKey();
	} catch {
		// Exception is thrown if public key is invalid. Return zeros to match explorer.
		return "0x0000000000000000000000000000000000000000000000000000000000000000";
	}
};

export const TransactionType = ({
	transaction,
	isRefreshingTransaction,
}: {
	isRefreshingTransaction?: boolean;
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}) => {
	const { t } = useTranslation();

	const [showFullBytecode, setShowFullByteCode] = useState(false);

	const { getLabel } = useTransactionTypes();

	if (transaction.isApprove() || transaction.isRevoke()) {
		return isRefreshingTransaction ? <ActionTypeSkeleton /> : <ActionType transaction={transaction} />;
	}

	const isValidatorRegistrationOrResignation =
		transaction.isValidatorRegistration() || transaction.isValidatorResignation();

	const labelClassName = cn({
		"min-w-24": !isValidatorRegistrationOrResignation,
		"min-w-[138px]": isValidatorRegistrationOrResignation,
	});

	let bytecode: string | undefined;

	if (transaction.isContractDeployment()) {
		// @ts-expect-error data property exists on Extended transaction types
		bytecode = transaction.isConfirmed() ? transaction.data().data.data : transaction.data().data().data;
	}

	return (
		<div data-testid="TransactionType">
			<DetailWrapper label={t("COMMON.ACTION")}>
				<div className="space-y-3">
					<div className="flex w-full justify-between gap-2 sm:justify-start">
						<DetailLabelText className={labelClassName}>{t("COMMON.METHOD")}</DetailLabelText>
						<Label color="neutral" size="xs">
							{getLabel(transaction)}
						</Label>
					</div>

					{transaction.isUsernameRegistration() && (
						<div className="flex w-full justify-between gap-2 sm:justify-start">
							<DetailLabelText>{t("COMMON.USERNAME")}</DetailLabelText>

							<div className="no-ligatures min-w-0 truncate font-semibold leading-5">
								{transaction.username()}
							</div>
						</div>
					)}

					{bytecode && (
						<div className="flex w-full justify-between gap-2 sm:justify-start">
							<DetailLabelText className="min-w-auto sm:min-w-24">{t("COMMON.BYTECODE")}</DetailLabelText>

							<div className="flex items-center">
								<div className="no-ligatures min-w-0 truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
									<TruncateEnd text={bytecode} maxChars={9} showTooltip={false} />
								</div>
								<div className="h-5 leading-[17px] sm:leading-5">
									<Divider type="vertical" size="md" />
								</div>

								<Button
									onClick={() => setShowFullByteCode(!showFullBytecode)}
									variant="transparent"
									data-testid="ContractDeploymentForm--ShowFullByteCode"
									className="p-0 text-sm leading-[17px] text-theme-navy-600 underline decoration-theme-navy-600 decoration-dashed decoration-1 underline-offset-4 sm:text-base sm:leading-5"
								>
									{showFullBytecode ? t("COMMON.HIDE") : t("TRANSACTION.VIEW_FULL")}
								</Button>
							</div>
						</div>
					)}

					{(transaction.isValidatorRegistration() || transaction.isUpdateValidator()) && (
						<div className="flex w-full justify-between gap-2 sm:justify-start">
							<DetailLabelText className={labelClassName}>{t("COMMON.PUBLIC_KEY")}</DetailLabelText>

							<div className="no-ligatures min-w-0 truncate font-semibold leading-5">
								{validatorPublickey(transaction)}
							</div>
						</div>
					)}
				</div>
				<div
					className={cn(
						"max-h-0 overflow-y-scroll border-t border-theme-secondary-300 text-sm leading-5 opacity-0 transition-all dim:border-theme-dim-700 dark:border-theme-dark-700 sm:text-base sm:leading-7",
						{
							"-mb-3 mt-3 max-h-64 pt-3 opacity-100 sm:-mx-6 sm:-mb-1 sm:mt-5 sm:px-6 sm:pt-4":
								showFullBytecode,
						},
					)}
				>
					{bytecode}
				</div>
			</DetailWrapper>
		</div>
	);
};

export const ActionType = ({
	transaction,
}: {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const approveDetails = transaction.approveDetails();

	const { getWalletAlias } = useWalletAlias();

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: transaction.from(),
				network: transaction.wallet().network(),
				profile,
			}),
		[profile, getWalletAlias, transaction],
	);

	const token = transaction.token()?.token();

	if (!token) {
		return;
	}

	const isRevoke = transaction.isRevoke();

	const maxUint256 = BigInt(2) ** BigInt(256) - BigInt(1);

	return (
		<div data-testid="ActionType">
			<DetailWrapper label={t("COMMON.ACTION")}>
				<div className="space-y-3">
					<div className="flex w-full justify-between gap-2 sm:justify-start">
						<DetailLabelText>{isRevoke ? t("COMMON.REVOKE") : t("COMMON.APPROVE")}</DetailLabelText>
						<div className="w-full text-right font-semibold leading-6 sm:text-left">
							<Trans
								i18nKey={isRevoke ? "TRANSACTION.REVOKE_DETAILS" : "TRANSACTION.APPROVE_DETAILS"}
								components={{
									Address: (
										<Link
											to={transaction.wallet().link().wallet(transaction.from())}
											showExternalIcon={false}
											isExternal
										>
											<span className="flex flex-row items-center gap-2">
												<Address
													walletName={alias}
													address={alias ? undefined : transaction.from()}
													truncateOnTable
													wrapperClass={cn("flex-inline", { "w-44": !alias })}
													addressClass="leading-6 text-theme-navy-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 w-44 min-w-44"
													walletNameClass="leading-6 text-theme-navy-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600"
												/>

												<Icon
													data-testid="Link__external"
													name="ArrowExternal"
													dimensions={[12, 12]}
													className="leading-6 text-theme-navy-600 dim:text-theme-dim-navy-600 dark:text-theme-dark-navy-400"
												/>
											</span>
										</Link>
									),
									Amount:
										approveDetails.amount === maxUint256 ? (
											<span>
												{t("COMMON.UNLIMITED")} {token.displaySymbol()}
											</span>
										) : (
											<Amount
												ticker={token.displaySymbol()}
												className="leading-6"
												value={BigNumber.make(approveDetails.amount, token.decimals()).divide(
													BigNumber.powerOfTen(token.decimals()),
												)}
												showTicker
												showCompactFormat
											/>
										),
									ContractAddress: (
										<span className="inline-flex items-center gap-2">
											<Link
												to={transaction.wallet().link().wallet(approveDetails.address)}
												showExternalIcon={false}
												isExternal
											>
												<span className="flex flex-row items-center gap-2">
													<TruncateMiddle
														text={approveDetails.address}
														className="leading-6 text-theme-navy-600 dim:text-theme-dim-navy-600 dark:text-theme-dark-navy-400"
													/>

													<Icon
														data-testid="Link__external"
														name="ArrowExternal"
														dimensions={[12, 12]}
														className="leading-6 text-theme-navy-600 dim:text-theme-dim-navy-600 dark:text-theme-dark-navy-400"
													/>
												</span>
											</Link>
											<Icon
												className="rounded bg-theme-secondary-200 px-1 py-[3px] text-theme-secondary-700 dim:bg-theme-dark-700 dim:bg-theme-dim-200 dark:bg-theme-dark-700 dark:text-theme-dark-200"
												name="Contract"
												dimensions={[12, 12]}
											/>
										</span>
									),
									Token: <span>{token.displaySymbol()}</span>,
								}}
							/>
						</div>
					</div>
				</div>
			</DetailWrapper>
		</div>
	);
};

export const ActionTypeSkeleton = () => {
	const { t } = useTranslation();

	return (
		<div data-testid="ActionTypeSkeleton">
			<DetailWrapper label={t("COMMON.ACTION")}>
				<div className="space-y-3">
					<div className="flex w-full justify-between gap-2 sm:justify-start">
						<DetailLabelText>
							<Skeleton height={20} width={75} />
						</DetailLabelText>
						<div className="flex w-full flex-col gap-2.5 font-semibold leading-6 [&>*]:flex-row-reverse sm:[&>*]:flex-row">
							<Skeleton height={20} className="!w-[85%]" />
							<Skeleton height={20} className="!w-[75%]" />
							<div className="lg:hidden [&>*]:flex-row-reverse sm:[&>*]:flex-row">
								<Skeleton height={20} className="!w-[35%]" />
							</div>
						</div>
					</div>
				</div>
			</DetailWrapper>
		</div>
	);
};
