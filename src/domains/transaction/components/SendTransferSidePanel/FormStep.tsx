import { Enums, Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormField, FormLabel } from "@/app/components/Form";
import { AddRecipient } from "@/domains/transaction/components/AddRecipient";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { Icon } from "@/app/components/Icon";
import { Button } from "@/app/components/Button";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { SelectAddressDropdown } from "@/domains/profile/components/SelectAddressDropdown";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const FormStep = ({
	network,
	senderWallet,
	profile,
	deeplinkProps,
	onScan,
	onChange,
	isTokenTransfer,
}: {
	network: Networks.Network;
	senderWallet?: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
	deeplinkProps: Record<string, string>;
	onScan?: () => void;
	onChange?: ({ sender }: { sender?: Contracts.IReadWriteWallet }) => void;
	isTokenTransfer?: boolean;
}) => {
	const { t } = useTranslation();

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
			<div className="space-y-4">
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
						isTokenTransfer={isTokenTransfer}
						onChange={(value: RecipientItem[]) => {
							setValue("recipients", value, { shouldDirty: true, shouldValidate: true });
						}}
						profile={profile}
						recipients={getRecipients()}
						showMultiPaymentOption={
							network.allows(Enums.FeatureFlag.TransactionMultiPayment) && !isTokenTransfer
						}
						wallet={senderWallet}
					/>
				</div>
			</div>
		</section>
	);
};
