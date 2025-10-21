import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { DetailLabelText, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import cn from "classnames";
import { Label } from "@/app/components/Label";
import { Amount } from "@/app/components/Amount";
import { ConfirmationTimeFooter } from "@/domains/transaction/components/TotalAmountBox";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { TransactionFee } from "./components/TransactionFee";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { Button } from "@/app/components/Button";
import { useMessageSigner } from "@/domains/message/hooks/use-message-signer";
import { MessageService } from "@/app/lib/mainsail/message.service";
import { Divider } from "@/app/components/Divider";

const generateVerificationCode = (): string => Math.random().toString(36).slice(2, 8).toUpperCase();

export const LedgerTransactionOverview = ({
	transfer,
	children,
}: {
	transfer: DraftTransfer;
	onVerifyAddress?: () => void;
	children?: React.ReactElement;
}) => {
	const { t } = useTranslation();
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationCode, setVerificationCode] = useState<string | undefined>(undefined);
	const [isVerified, setIsVerified] = useState(false);
	const [verificationError, setVerificationError] = useState<string | undefined>(undefined);

	const abortReference = useRef(new AbortController());

	const { sign } = useMessageSigner();

	const handleVerifyAddress = async () => {
		abortReference.current = new AbortController();

		const code = generateVerificationCode();
		setVerificationCode(code);
		setIsVerifying(true);
		setVerificationError(undefined);
		setIsVerified(false);

		try {
			// Request the user to sign the verification code message
			const recipientWallet = transfer.recipient();
			if (!recipientWallet) {
				throw new Error("Recipient wallet not found");
			}

			const signedMessage = await sign(recipientWallet, code, undefined, undefined, undefined, {
				abortSignal: abortReference.current.signal,
			});

			// Verify the signature matches the recipient address
			const isValid = new MessageService().verify(signedMessage);

			setIsVerifying(false);
			setIsVerified(isValid);

			if (!isValid) {
				setVerificationError(t("COMMON.LEDGER_MIGRATION.VERIFICATION_FAILED_MESSAGE"));
			}
		} catch {
			setIsVerifying(false);
			setVerificationError(t("COMMON.LEDGER_MIGRATION.VERIFICATION_FAILED_MESSAGE"));
		}
	};

	const handleCancelVerification = () => {
		abortReference.current.abort();

		setIsVerified(false);
		setIsVerifying(false);
		setVerificationCode(undefined);
		setVerificationError(undefined);
	};

	console.log({isVerified, isVerifying, verificationError})
	return (
		<div data-testid="LedgerMigration__Review-step">
			<div className="space-y-4">
				<DetailWrapper
					label={t("TRANSACTION.ADDRESSING")}
					className={cn({
						"border-theme-danger-400": verificationError,
						"border-theme-success-300": isVerified,
						"border-theme-warning-300": isVerifying && !isVerified && verificationError === undefined,
					})}
				>
					<div className="space-y-3">
						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle>{t("COMMON.OLD")}</DetailTitle>
							<Address
								address={transfer.sender().address()}
								walletName={transfer.sender().displayName()}
								showCopyButton
								walletNameClass="text-theme-text text-sm sm:text-base"
								wrapperClass="justify-end sm:justify-start"
								addressClass={cn("text-sm sm:text-base w-full w-3/4", {
									"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200":
										!!transfer.sender().displayName(),
								})}
							/>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle>{t("COMMON.NEW")}</DetailTitle>
							<Address
								address={transfer.recipient()?.address()}
								showCopyButton
								walletNameClass="text-theme-text text-sm sm:text-base"
								wrapperClass="justify-end sm:justify-start w-full"
							/>
						</div>

						{isVerifying && (
							<div className="dark:bg-theme-dark-800 dark:text-theme-dark-200 dim:bg-theme-dim-800 dim:text-theme-dim-200 text-theme-secondary-900 bg-theme-warning-50 -mx-6 -mb-5 rounded-b-lg px-6 py-3">
								<div className="border-theme-warning-300 mb-2 flex gap-1 border-b border-dashed pb-2 text-sm leading-[17px] font-semibold">
									<p>{t("COMMON.LEDGER_MIGRATION.VERIFY_MESSAGE_LABEL")}:</p>
									<span className="text-theme-warning-900">{verificationCode}</span>
								</div>
								<p className="text-sm leading-5 font-normal">
									{t("COMMON.LEDGER_MIGRATION.PENDING_VERIFICATION_MESSAGE")}
								</p>

								<div className="mt-4 flex justify-end">
									<Button
										variant="secondary-icon"
										onClick={handleCancelVerification}
										className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent w-auto px-2 py-[3px] whitespace-nowrap"
									>
										<span>{t("COMMON.CANCEL")}</span>
									</Button>
								</div>
							</div>
						)}

						{verificationError && (
							<div className="dark:bg-theme-dark-800 dark:text-theme-dark-200 dim:bg-theme-dim-800 dim:text-theme-dim-200 bg-theme-danger-50 -mx-6 -mb-5 rounded-b-lg px-6 py-3">
								<div className="flex items-center gap-1">
									<div className="text-theme-danger-700 dark:text-theme-danger-info-border dim:text-theme-danger-400 flex items-center space-x-2">
										<Icon name="CircleCross" size="md" className="h-4" />
										<p className="font-semibold text-sm leading-[17px]">{t("COMMON.ERROR")}</p>
									</div>
									<Divider type="vertical"/>
									<p className="text-sm leading-[17px] font-normal">
										{verificationError}
									</p>
								</div>
								<div className="mt-4 flex justify-end items-center gap-1">
									<Button
										variant="secondary-icon"
										onClick={handleCancelVerification}
										className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent w-auto px-2 py-[3px] whitespace-nowrap"
									>
										<span>{t("COMMON.CANCEL")}</span>
									</Button>

									<Divider type="vertical"/>

									<Button
										variant="secondary-icon"
										onClick={handleVerifyAddress}
										className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent w-auto px-2 py-[3px] whitespace-nowrap"
									>
										<span>{t("COMMON.TRY_AGAIN")}</span>
									</Button>
								</div>
							</div>
						)}

						{isVerified && (
							<div className="dark:bg-theme-dark-800 dark:text-theme-dark-200 dim:bg-theme-dim-800 dim:text-theme-dim-200 text-theme-secondary-900 bg-theme-success-100 -mx-6 -mb-5 rounded-b-lg px-6 py-3">
								<div className="flex items-center gap-2 text-theme-success-700">
									<Icon name="CheckmarkDouble" size="md" className="h-4" />
									<p className="text-xs leading-[15px] font-semibold">
										{t("COMMON.LEDGER_MIGRATION.VERIFICATION_SUCCESS_MESSAGE")}
									</p>
								</div>
							</div>
						)}

						{!isVerifying && !isVerified && !verificationError && (
							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle> </DetailTitle>
								<div className="flex items-center space-x-2">
									<Button
										variant="secondary-icon"
										onClick={handleVerifyAddress}
										className="-ml-2 text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent w-auto px-2 py-[3px] whitespace-nowrap"
									>
										<span>{t("COMMON.VERIFY_ADDRESS")}</span>
									</Button>
									<Tooltip content={t("COMMON.LEDGER_MIGRATION.VERIFY_MESSAGE_HELP_TEXT")}>
										<span>
											<span className="bg-theme-secondary-100 flex h-5 w-5 items-center justify-center rounded-full dark:hidden">
												<Icon name="QuestionMarkSmall" dimensions={[10, 10]} />
											</span>
											<span className="hidden dark:block">
												<Icon name="CircleQuestionMark" dimensions={[20, 20]} />
											</span>
										</span>
									</Tooltip>
								</div>
							</div>
						)}
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("COMMON.ACTION")}>
					<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
						<DetailTitle>{t("COMMON.METHOD")}</DetailTitle>
						<Label color="neutral" size="xs">
							{t("TRANSACTION.TRANSACTION_TYPES.TRANSFER")}
						</Label>
					</div>
				</DetailWrapper>

				<DetailWrapper
					label={t("TRANSACTION.SUMMARY")}
					footer={<ConfirmationTimeFooter confirmationTime={transfer.confirmationTime("avg")} />}
				>
					<div className="space-y-3">
						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailLabelText>{t("COMMON.AMOUNT")}</DetailLabelText>
							<Amount
								ticker={transfer.network().ticker()}
								value={transfer.amount()}
								className="text-sm font-semibold sm:text-base"
							/>
							<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
								(
								<Amount
									ticker={transfer.sender().exchangeCurrency()}
									value={transfer.sender().convertedBalance()}
									className="text-sm font-semibold sm:text-base"
								/>
								)
							</span>
						</div>

						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailLabelText>{t("COMMON.FEE")}</DetailLabelText>
							<TransactionFee transfer={transfer} />
						</div>
					</div>
				</DetailWrapper>
			</div>

			{children}
		</div>
	);
};
