import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import cn from "classnames";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { Button } from "@/app/components/Button";
import { useMessageSigner } from "@/domains/message/hooks/use-message-signer";
import { MessageService } from "@/app/lib/mainsail/message.service";
import { Divider } from "@/app/components/Divider";

const generateVerificationCode = (): string => Math.random().toString(36).slice(2, 8).toUpperCase();

export const LedgerAddressVerification = ({ transfer }: { transfer: DraftTransfer }) => {
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

	return (
		<DetailWrapper
			label={t("TRANSACTION.ADDRESSING")}
			className={cn({
				"-mx-1 mt-3 border border-theme-danger-400 dim:border-theme-danger-400 dark:border-theme-danger-400 sm:mx-0 sm:mt-2":
					verificationError,
				"-mx-1 mt-3 border border-theme-success-300 dim:border-theme-success-500 dark:border-theme-success-500 sm:mx-0 sm:mt-2":
					isVerified,
				"-mx-1 mt-3 border border-theme-warning-300 dim:border-theme-warning-300 dark:border-theme-warning-300 sm:mx-0 sm:mt-2":
					isVerifying && !isVerified && verificationError === undefined,
			})}
		>
			<div className="space-y-3" data-testid="LedgerAddressVerification">
				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle>{t("COMMON.OLD")}</DetailTitle>
					<Address
						address={transfer.sender().address()}
						walletName={transfer.sender().displayName()}
						showCopyButton
						walletNameClass="text-theme-text text-sm sm:text-base"
						wrapperClass="justify-end sm:justify-start"
						addressClass={cn("text-sm sm:text-base w-full w-3/4", {
							"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200": !!transfer
								.sender()
								.displayName(),
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
					<div className="-mx-4 -mb-3 rounded-b-xl bg-theme-warning-50 px-4 py-3 dim:bg-theme-dim-950 dark:bg-theme-dark-950 sm:-mx-6 sm:-mb-5 sm:px-6">
						<div className="mb-2 flex gap-1 border-b border-dashed border-theme-warning-300 pb-2 text-sm font-semibold leading-[17px] dim:border-theme-dim-700 dark:border-theme-dark-700">
							<p>{t("COMMON.LEDGER_MIGRATION.VERIFY_MESSAGE_LABEL")}:</p>
							<span className="text-theme-warning-900">{verificationCode}</span>
						</div>
						<p className="text-sm font-normal leading-5">
							{t("COMMON.LEDGER_MIGRATION.PENDING_VERIFICATION_MESSAGE")}
						</p>

						<div className="mt-4 flex justify-end">
							<Button
								variant="secondary-icon"
								onClick={handleCancelVerification}
								className="w-auto whitespace-nowrap px-2 py-[3px] text-theme-primary-600 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent dark:text-theme-dark-navy-400"
							>
								<span>{t("COMMON.CANCEL")}</span>
							</Button>
						</div>
					</div>
				)}

				{verificationError && (
					<div
						data-testid="LedgerAddressVerification__error"
						className="-mx-4 -mb-3 rounded-b-xl bg-theme-warning-50 px-4 py-3 dim:bg-theme-dim-950 dark:bg-theme-dark-950 sm:-mx-6 sm:-mb-5 sm:px-6"
					>
						<div className="flex items-center gap-1">
							<div className="flex items-center space-x-2 text-theme-danger-700 dim:text-theme-danger-400 dark:text-theme-danger-400">
								<Icon name="CircleCross" size="md" className="h-4" />
								<p className="text-sm font-semibold leading-[17px]">{t("COMMON.ERROR")}</p>
							</div>
							<Divider type="vertical" />
							<p className="text-sm font-normal leading-[17px]">{verificationError}</p>
						</div>
						<div className="mt-4 flex items-center justify-end gap-1">
							<Button
								variant="secondary-icon"
								onClick={handleCancelVerification}
								className="w-auto whitespace-nowrap px-2 py-[3px] text-theme-primary-600 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent dark:text-theme-dark-navy-400"
							>
								<span>{t("COMMON.CANCEL")}</span>
							</Button>

							<Divider type="vertical" />

							<Button
								variant="secondary-icon"
								onClick={handleVerifyAddress}
								className="w-auto whitespace-nowrap px-2 py-[3px] text-theme-primary-600 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent dark:text-theme-dark-navy-400"
							>
								<span>{t("COMMON.TRY_AGAIN")}</span>
							</Button>
						</div>
					</div>
				)}

				{isVerified && (
					<div className="-mx-4 -mb-3 rounded-b-xl bg-theme-success-100 px-4 py-3 dim:bg-theme-success-900 dark:bg-theme-success-900 sm:-mx-6 sm:-mb-5 sm:px-6">
						<div className="flex items-center gap-2 text-theme-success-700 dim:text-theme-success-500 dark:text-theme-success-500">
							<Icon name="CheckmarkDouble" size="md" className="h-4" />
							<p className="text-xs font-semibold leading-[15px]">
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
								data-testid="LedgerAddressVerification__VerifyAddress-button"
								variant="secondary-icon"
								onClick={handleVerifyAddress}
								className="-ml-2 w-auto whitespace-nowrap px-2 py-[3px] text-theme-primary-600 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent dark:text-theme-dark-navy-400"
							>
								<span>{t("COMMON.VERIFY_ADDRESS")}</span>
							</Button>
							<Tooltip content={t("COMMON.LEDGER_MIGRATION.VERIFY_MESSAGE_HELP_TEXT")}>
								<span className="text-theme-primary-600 dim:text-theme-dim-navy-600 dark:text-theme-dark-navy-400">
									<span className="flex h-5 w-5 items-center justify-center rounded-full bg-theme-secondary-100 dark:hidden">
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
	);
};
