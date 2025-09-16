import { Enums, Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { FormField, FormLabel } from "@/app/components/Form";
import { useBreakpoint } from "@/app/hooks";
import { AddRecipient } from "@/domains/transaction/components/AddRecipient";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon, Icon } from "@/app/components/Icon";
import { Button } from "@/app/components/Button";
import { twMerge } from "tailwind-merge";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { SelectAddressDropdown } from "@/domains/profile/components/SelectAddressDropdown";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

const QRCodeButton = ({ ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		{...props}
		className={twMerge(
			"border-theme-primary-100 text-theme-secondary-700 hover:border-theme-primary-100 hover:bg-theme-primary-100 hover:text-theme-primary-600 focus:ring-theme-primary-400 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dark:hover:border-theme-secondary-800 dark:hover:bg-theme-secondary-800 dim:text-theme-secondary-200 dim:border-theme-dim-700 dim-hover:border-theme-dim-700 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 mt-auto flex w-full cursor-pointer items-center space-x-2 rounded border-2 px-5 py-3 transition-colors duration-300 focus:ring-2 focus:outline-hidden sm:w-auto sm:py-5 dark:hover:text-white",
			props.className,
		)}
	/>
);

export const FormStep = ({
	network,
	senderWallet,
	profile,
	deeplinkProps,
	onScan,
	onChange,
	// @TODO: always hide header once the side panel is fully implemented
	hideHeader = false,
}: {
	network: Networks.Network;
	senderWallet?: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
	deeplinkProps: Record<string, string>;
	onScan?: () => void;
	onChange?: ({ sender }: { sender?: Contracts.IReadWriteWallet }) => void;
	hideHeader?: boolean;
}) => {
	const { t } = useTranslation();

	const { isXs } = useBreakpoint();

	const { setValue, getValues, unregister } = useFormContext();

	const { activeNetwork } = useActiveNetwork({ profile });

	useEffect(() => {
		unregister(["gasLimit", "gasPrice"]);
	}, [unregister]);

	const { recipients } = getValues();

	const getRecipients = (): RecipientItem[] => {
		if (deeplinkProps.recipient && deeplinkProps.amount) {
			return [
				{
					address: deeplinkProps.recipient,
					// TODO: Converting to number leads to floating point arithmetic overflow for small numbers.
					//		 As the convertion is not necessary with deeplinks, this needs to be handled to be compliant
					//       with RecipientItem type because it only accepts number, and changing RecipientItem will affect many forms.
					amount: deeplinkProps.amount as any,
				},
			];
		}

		return recipients;
	};

	const handleSelectSender = async (address: any) => {
		const sender = profile.wallets().findByAddressWithNetwork(address, network.id());
		const isFullyRestoredAndSynced = sender?.hasBeenFullyRestored() && sender.hasSyncedWithNetwork();

		if (!isFullyRestoredAndSynced) {
			await sender?.synchroniser().identity();
		}

		onChange?.({
			sender,
		});
	};

	return (
		<section data-testid="SendTransfer__form-step">
			{!hideHeader && (
				<StepHeader
					title={t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE", { ticker: network.ticker() })}
					titleIcon={
						<ThemeIcon
							dimensions={[24, 24]}
							lightIcon="SendTransactionLight"
							darkIcon="SendTransactionDark"
							dimIcon="SendTransactionDim"
						/>
					}
					subtitle={t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.DESCRIPTION")}
					extra={
						!isXs && (
							<div className="hidden sm:flex sm:h-full sm:align-bottom">
								<QRCodeButton
									className="group"
									type="button"
									onClick={onScan}
									data-testid="QRCodeModalButton"
								>
									<Icon size="lg" name="QRCode" />
									<span className="text-base leading-5 font-semibold">
										{t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN")}
									</span>
								</QRCodeButton>
							</div>
						)
					}
				/>
			)}

			<div
				className={cn("space-y-4", {
					"pt-4": !hideHeader,
				})}
			>
				<FormField name="senderAddress">
					<div data-testid="sender-address">
						<div className="mb-2 flex items-center justify-between">
							<FormLabel
								label={t("TRANSACTION.SENDER")}
								className="text-theme-secondary-text hover:text-theme-primary-600! mb-0 text-sm leading-[17px] font-semibold"
							/>
							<Button
								type="button"
								variant="transparent"
								className="text-theme-navy-600 block p-0 text-sm"
								onClick={onScan}
							>
								<span className="hidden sm:block">
									<Icon size="md" name="QRCode" />
								</span>

								<span>{t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN_FULL")}</span>
							</Button>
						</div>

						<SelectAddressDropdown
							disabled={profile.wallets().count() === 0}
							profile={profile}
							onChange={(wallet) => {
								handleSelectSender(wallet?.address() ?? "");
							}}
							wallets={profile.wallets().values()}
							wallet={senderWallet}
							defaultNetwork={activeNetwork}
							disableAction={(wallet) => !WalletCapabilities(wallet).canSendTransfer()}
							showBalance
						/>
					</div>
				</FormField>

				<div data-testid="recipient-address">
					<AddRecipient
						onChange={(value: RecipientItem[]) => {
							setValue("recipients", value, { shouldDirty: true, shouldValidate: true });
						}}
						profile={profile}
						recipients={getRecipients()}
						showMultiPaymentOption={network.allows(Enums.FeatureFlag.TransactionMultiPayment)}
						wallet={senderWallet}
					/>
				</div>
			</div>
		</section>
	);
};
