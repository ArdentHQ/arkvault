import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";

import { FormField } from "@/app/components/Form";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { SelectAddressDropdown } from "@/domains/profile/components/SelectAddressDropdown";

interface FormStepProperties {
	senderWallet?: ProfilesContracts.IReadWriteWallet;
	profile: ProfilesContracts.IProfile;
	onWalletChange: (wallet: ProfilesContracts.IReadWriteWallet) => void;
}

export const FormStep = ({ senderWallet, profile, onWalletChange }: FormStepProperties) => {
	const { t } = useTranslation();

	const { activeNetwork: network } = useActiveNetwork({ profile });

	const handleSelectSender = (address: string) => {
		const newSenderWallet = profile.wallets().findByAddressWithNetwork(address, network.id());
		const isFullyRestoredAndSynced =
			newSenderWallet?.hasBeenFullyRestored() && newSenderWallet.hasSyncedWithNetwork();

		if (!isFullyRestoredAndSynced) {
			newSenderWallet?.synchroniser().identity();
		}

		if (newSenderWallet) {
			onWalletChange(newSenderWallet);
		}
	};

	return (
		<section data-testid="SendUsernameResignation__form-step" className="space-y-6 sm:space-y-4">
			<div className="space-y-3 sm:space-y-4">
				<FormField name="senderAddress">
					<SelectAddressDropdown
						disabled={profile.wallets().count() === 0}
						profile={profile}
						onChange={(wallet) => {
							handleSelectSender(wallet?.address() ?? "");
						}}
						wallets={profile.wallets().values()}
						wallet={senderWallet}
						defaultNetwork={profile.activeNetwork()}
						disableAction={(wallet) => !WalletCapabilities(wallet).canSendUsernameResignation()}
						showBalance
					/>
				</FormField>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="flex flex-col gap-3">
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.METHOD")}</DetailTitle>
							<div className="flex items-center rounded bg-theme-secondary-200 px-1 py-[3px] dim:border-theme-dim-700 dark:border dark:border-theme-secondary-800 dark:bg-transparent">
								<span className="text-[12px] font-semibold leading-[15px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500">
									{t("TRANSACTION.TRANSACTION_TYPES.RESIGN_USERNAME")}
								</span>
							</div>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.USERNAME")}</DetailTitle>
							<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
								{senderWallet && senderWallet.username()}
							</div>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
