import { Enums } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import tw, { styled } from "twin.macro";

import { getFeeType } from "./utils";
import { FormField, FormLabel } from "@/app/components/Form";
import { InputCounter } from "@/app/components/Input";
import { useBreakpoint } from "@/app/hooks";
import { SelectNetworkDropdown } from "@/app/components/SelectNetworkDropdown";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { AddRecipient } from "@/domains/transaction/components/AddRecipient";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { buildTransferData } from "@/domains/transaction/pages/SendTransfer/SendTransfer.helpers";
import { assertNetwork } from "@/utils/assertions";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";

const QRCodeButton = styled.button`
	${tw`mt-auto flex w-full items-center space-x-2 rounded py-3 px-5 transition-colors duration-300 sm:w-auto sm:py-5`}
	${tw`border-2 border-theme-primary-100 dark:border-theme-secondary-800`}
	${tw`hover:(bg-theme-primary-700 border-theme-primary-700)`}
	${tw`focus:(outline-none ring-2 ring-theme-primary-400)`}
`;

export const FormStep = ({
	profile,
	deeplinkProps,
	onScan,
}: {
	profile: Contracts.IProfile;
	deeplinkProps: Record<string, string>;
	onScan?: () => void;
}) => {
	const isMounted = useRef(true);

	const { t } = useTranslation();

	const { isXs } = useBreakpoint();

	const [wallets, setWallets] = useState<Contracts.IReadWriteWallet[]>([]);

	const { getValues, setValue, watch } = useFormContext();
	const { recipients, memo = "" } = getValues();
	const { network, senderAddress } = watch();

	const senderWallet = useMemo(() => {
		if (!network) {
			return;
		}
		assertNetwork(network);
		return profile.wallets().findByAddressWithNetwork(senderAddress, network.id());
	}, [network, profile, senderAddress]);

	const [feeTransactionData, setFeeTransactionData] = useState<Record<string, any> | undefined>();

	useEffect(() => {
		if (!network) {
			return;
		}

		const updateFeeTransactionData = async () => {
			const transferData = await buildTransferData({
				coin: profile.coins().get(network.coin(), network.id()),
				memo,
				recipients,
			});

			/* istanbul ignore next -- @preserve */
			if (isMounted.current) {
				setFeeTransactionData(transferData);
			}
		};

		updateFeeTransactionData();
	}, [network, memo, recipients, profile, isMounted]);

	useEffect(() => {
		if (!network) {
			return;
		}

		setWallets(profile.wallets().findByCoinWithNetwork(network.coin(), network.id()));
	}, [network, profile]);

	useEffect(
		/* istanbul ignore next -- @preserve */
		() => () => {
			isMounted.current = false;
		},
		[],
	);

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

	const handleSelectSender = (address: any) => {
		setValue("senderAddress", address, { shouldDirty: true, shouldValidate: false });

		const newSenderWallet = profile.wallets().findByAddressWithNetwork(address, network.id());
		const isFullyRestoredAndSynced =
			newSenderWallet?.hasBeenFullyRestored() && newSenderWallet.hasSyncedWithNetwork();

		if (!isFullyRestoredAndSynced) {
			newSenderWallet?.synchroniser().identity();
		}
	};

	const showFeeInput = useMemo(() => !network?.chargesZeroFees(), [network]);

	return (
		<section data-testid="SendTransfer__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE", { ticker: network?.ticker() })}
				subtitle={t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.DESCRIPTION")}
				extra={
					<div className="flex h-full align-bottom">
						<QRCodeButton className="group" type="button" onClick={onScan} data-testid="QRCodeModalButton">
							<Icon
								size="lg"
								name="QRCode"
								className="text-theme-secondary-700 transition-colors group-hover:text-white dark:text-theme-secondary-600"
							/>
							<span className="font-semibold text-theme-secondary-700 transition-colors group-hover:text-white dark:text-theme-secondary-200">
								{isXs
									? t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN_FULL")
									: t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN")}
							</span>
						</QRCodeButton>
					</div>
				}
			/>

			<div className="space-y-6 pt-6">
				<FormField name="network">
					<FormLabel label={t("COMMON.CRYPTOASSET")} />
					<SelectNetworkDropdown
						profile={profile}
						networks={[network]}
						selectedNetwork={network}
						isDisabled
					/>
				</FormField>

				<FormField name="senderAddress">
					<FormLabel label={t("TRANSACTION.SENDER")} />

					<div data-testid="sender-address">
						<SelectAddress
							wallet={
								senderWallet
									? {
											address: senderWallet.address(),
											network: senderWallet.network(),
										}
									: undefined
							}
							wallets={wallets}
							profile={profile}
							disabled={wallets.length === 0}
							onChange={handleSelectSender}
						/>
					</div>
				</FormField>

				<div data-testid="recipient-address">
					<AddRecipient
						disableMultiPaymentOption={senderWallet?.isLedger()}
						onChange={(value: RecipientItem[]) => {
							setValue("recipients", value, { shouldDirty: true, shouldValidate: true });
						}}
						profile={profile}
						recipients={getRecipients()}
						showMultiPaymentOption={network?.allows(Enums.FeatureFlag.TransactionMultiPayment)}
						wallet={senderWallet}
					/>
				</div>

				{network?.usesMemo() && (
					<FormField name="memo" className="relative">
						<FormLabel label={t("COMMON.MEMO")} optional />
						<InputCounter
							data-testid="Input__memo"
							type="text"
							placeholder=" "
							maxLengthLabel="255"
							value={memo}
							onChange={(event: ChangeEvent<HTMLInputElement>) =>
								setValue("memo", event.target.value, { shouldDirty: true, shouldValidate: true })
							}
						/>
					</FormField>
				)}

				{showFeeInput && (
					<FormField name="fee">
						<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
						{!!network && (
							<FeeField
								type={getFeeType(recipients?.length)}
								data={feeTransactionData}
								network={network}
								profile={profile}
							/>
						)}
					</FormField>
				)}
			</div>
		</section>
	);
};
