import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useState } from "react";
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
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { getRecipientsFromDeeplink } from "./utils";
import { SelectToken } from "@/domains/tokens/components/SelectToken";
import { useTransferAssets } from "@/domains/transaction/hooks/use-send-transfer-assets";
import { ContractAddressHint } from "@/domains/transaction/components/ContractAddressHint/ContractAddressHint";
import cn from "classnames";

export const FormStep = ({
	network,
	senderWallet,
	profile,
	deeplinkProps,
	onScan,
	onChange,
	isTokenTransfer,
	tokens,
}: {
	network: Networks.Network;
	senderWallet?: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
	deeplinkProps: Record<string, string>;
	onScan?: () => void;
	onChange?: ({ sender }: { sender?: Contracts.IReadWriteWallet }) => void;
	isTokenTransfer?: boolean;
	tokens: WalletToken[];
}) => {
	const { t } = useTranslation();

	const { setValue, getValues, unregister, watch, trigger } = useFormContext();

	const { amount, tokenContractAddress } = watch();

	const { activeNetwork } = useActiveNetwork({ profile });

	useEffect(() => {
		unregister(["gasLimit", "gasPrice"]);
	}, [unregister]);

	const { recipients } = getValues();

	const [isSingle, setIsSingle] = useState(recipients.length <= 1);

	const handleSelectSender = async (address: string) => {
		const sender = profile.wallets().findByAddressWithNetwork(address, network.id());
		const isFullyRestoredAndSynced = sender?.hasBeenFullyRestored() && sender.hasSyncedWithNetwork();

		if (!isFullyRestoredAndSynced) {
			await sender?.synchroniser().identity();
		}

		onChange?.({
			sender,
		});
	};

	const selectedToken = tokens.find((token) => token.token().address() === tokenContractAddress);

	const { assets } = useTransferAssets({
		isSingle: recipients.length === 1,
		profile,
		selectedAsset: recipients.length > 0 ? tokenContractAddress : undefined,
		tokens,
	});

	return (
		<section data-testid="SendTransfer__form-step">
			<div className="space-y-4">
				<FormField name="senderAddress">
					<div data-testid="sender-address">
						<div className="mb-2 flex items-center justify-between">
							<FormLabel
								label={t("TRANSACTION.SENDER")}
								className="hover:text-theme-primary-600! mb-0 text-sm font-semibold leading-[17px] text-theme-secondary-text sm:text-base sm:leading-5"
							/>
							<Button
								type="button"
								variant="transparent"
								className="group block p-0 text-sm text-theme-navy-600 hover:text-theme-navy-700 dim:hover:text-theme-dim-navy-700 dark:hover:text-theme-dark-navy-500"
								onClick={onScan}
							>
								<span className="hidden sm:block">
									<Icon size="md" name="QRCode" />
								</span>

								<span className="underline-offset-4 group-hover:underline">
									{t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN_FULL")}
								</span>
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

				<FormField name="asset">
					<div className="relative block space-y-2">
						<FormLabel>
							<div>{t("COMMON.ASSET")}</div>
						</FormLabel>
						<SelectToken
							disabled={!isSingle && recipients.length >= 1 && tokenContractAddress}
							className={cn({ "rounded-b-none focus-within:rounded hover:rounded": selectedToken })}
							value={tokenContractAddress}
							tokens={assets}
							wallet={senderWallet}
							onChange={({ value }) => {
								const tokenAddress = value;

								if (amount) {
									void trigger("amount");
								}

								setValue("tokenContractAddress", tokenAddress, {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
						/>
					</div>
					{selectedToken && senderWallet && (
						<ContractAddressHint
							token={selectedToken}
							link={senderWallet.link().wallet(selectedToken.token().address())}
						/>
					)}
				</FormField>

				<div data-testid="recipient-address">
					<AddRecipient
						tokens={tokens}
						isTokenTransfer={isTokenTransfer}
						onChange={(value: RecipientItem[]) => {
							setValue("recipients", value, { shouldDirty: true, shouldValidate: true });
						}}
						profile={profile}
						recipients={getRecipientsFromDeeplink(recipients, deeplinkProps)}
						wallet={senderWallet}
						isSingle={isSingle}
						onIsSingleChange={setIsSingle}
					/>
				</div>
			</div>
		</section>
	);
};
