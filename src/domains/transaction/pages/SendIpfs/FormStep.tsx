import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { InputDefault } from "@/app/components/Input";
import { useFees } from "@/app/hooks";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { StepHeader } from "@/app/components/StepHeader";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { ThemeIcon } from "@/app/components/Icon";

const FormStep = ({ profile, wallet }: { profile: Contracts.IProfile; wallet: Contracts.IReadWriteWallet }) => {
	const { t } = useTranslation();

	const { calculate } = useFees(profile);

	const { getValues, setValue, watch } = useFormContext();
	const { hash } = watch();

	const network = useMemo(() => wallet.network(), [wallet]);
	const feeTransactionData = useMemo(() => ({ hash }), [hash]);

	useEffect(() => {
		const setTransactionFees = async (wallet: Contracts.IReadWriteWallet) => {
			const transactionFees = await calculate({
				coin: wallet.coinId(),
				network: wallet.networkId(),
				type: "ipfs",
			});

			setValue("fees", transactionFees);

			if (!getValues("fee")) {
				setValue("fee", transactionFees.avg, {
					shouldDirty: true,
					shouldValidate: true,
				});
			}
		};

		setTransactionFees(wallet);
	}, [calculate, getValues, setValue, network]);

	return (
		<section data-testid="SendIpfs__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_IPFS.FIRST_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_IPFS.FIRST_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SendTransactionLight"
						darkIcon="SendTransactionDark"
					/>
				}
			/>

			<div className="space-y-4 pt-4">
				<FormField name="senderAddress">
					<FormLabel label={t("TRANSACTION.SENDER")} />
					<div data-testid="sender-address" className="mb-3 sm:mb-0">
						<SelectAddress
							showWalletAvatar={false}
							showUserIcon={false}
							disabled
							wallet={{ address: wallet.address(), network: wallet.network() }}
							wallets={profile.wallets().findByCoinWithNetwork(network.coin(), network.id())}
							profile={profile}
						/>
					</div>
				</FormField>

				<FormField name="hash">
					<FormLabel label={t("TRANSACTION.IPFS_HASH")} />
					<InputDefault
						data-testid="Input__hash"
						type="text"
						placeholder=" "
						defaultValue={hash}
						onChange={(event: any) =>
							setValue("hash", event.target.value, {
								shouldDirty: true,
								shouldValidate: true,
							})
						}
					/>
				</FormField>

				<FormField name="fee">
					<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
					<FeeField type="ipfs" data={feeTransactionData} network={network} profile={profile} />
				</FormField>
			</div>
		</section>
	);
};

export { FormStep };
