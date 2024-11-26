import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { t } from "i18next";
import { WalletHeaderProperties } from "@/domains/wallet/pages/WalletDetails/components/WalletHeader/WalletHeader.contracts";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { WalletIcons } from "@/app/components/WalletIcons";
import { Icon } from "@/app/components/Icon";
import { useWalletActions } from "@/domains/wallet/hooks";
import { Clipboard } from "@/app/components/Clipboard";
import { useWalletAlias } from "@/app/hooks";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { assertString } from "@/utils/assertions";
import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";
import { WalletActionsModals } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals";
import { Copy } from "@/app/components/Copy";
import { twMerge } from "tailwind-merge";

const WalletHeaderButtonMobile = ({...props}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button
			{...props}
			className={twMerge("inline-flex items-center justify-center w-6 h-6 transition-all duration-100 ease-linear rounded outline-none focus:(outline-none ring-2 ring-theme-primary-400) text-theme-secondary-text disabled:text-theme-secondary-800", props.className)}
		/>
	)

export const WalletHeaderMobile: React.FC<WalletHeaderProperties> = ({ profile, wallet, onUpdate }) => {
	const { activeModal, handleSelectOption, handleToggleStar, handleSend, setActiveModal } = useWalletActions(wallet);
	const { primaryOptions, secondaryOptions, additionalOptions, registrationOptions } = useWalletOptions(wallet);

	const exchangeCurrency = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);
	assertString(exchangeCurrency);

	const { getWalletAlias } = useWalletAlias();
	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile,
	});

	return (
		<>
			<div className="h-13 flex items-center justify-between bg-black px-6 py-4">
				<div className="flex items-center space-x-2">
					<NetworkIcon
						network={wallet.network()}
						size="xs"
						className="text-theme-secondary-text"
						isCompact
						noShadow
						tooltipDarkTheme
					/>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex items-center space-x-1 border-r border-theme-secondary-800 pr-3 empty:border-0">
						<WalletIcons
							wallet={wallet}
							iconColor="text-theme-secondary-text"
							iconSize="md"
							exclude={["isStarred", "isTestNetwork"]}
							tooltipDarkTheme
						/>
					</div>

					<WalletHeaderButtonMobile type="button" className="p-1" onClick={handleToggleStar}>
						<Icon
							className={wallet.isStarred() ? "text-theme-warning-400" : "text-theme-secondary-text"}
							name={wallet.isStarred() ? "StarFilled" : "Star"}
						/>
					</WalletHeaderButtonMobile>
				</div>
			</div>

			<div className="flex flex-col items-center px-6 pt-4 text-white">
				<div className="mx-auto flex w-full items-center justify-center space-x-2">
					<div className="w-full">
						<Address
							alignment="center"
							address={wallet.address()}
							walletName={alias}
							truncateOnTable
							addressClass="text-sm text-theme-secondary-600 leading-[17px]"
							walletNameClass="text-theme-secondary-200 text-sm leading-[17px]"
						/>
					</div>

					<div className="flex items-center space-x-3 text-theme-secondary-text">
						<Copy address={wallet.address()} />

						{!!wallet.publicKey() && (
							<Clipboard
								variant="icon"
								data={wallet.publicKey() as string}
								tooltip={t("WALLETS.PAGE_WALLET_DETAILS.COPY_PUBLIC_KEY")}
								tooltipDarkTheme
							>
								<Icon name="CopyKey" className="hover:text-theme-secondary-500" />
							</Clipboard>
						)}
					</div>
				</div>

				<Amount
					className="mt-4 text-xl font-semibold leading-6 text-theme-secondary-200"
					ticker={wallet.currency()}
					value={wallet.balance()}
				/>

				{!wallet.network().isTest() && (
					<div data-testid="WalletHeaderMobile__currency-balance" className="flex">
						<Amount
							className="mt-2 text-sm font-semibold leading-4 text-theme-secondary-700"
							ticker={exchangeCurrency}
							value={wallet.convertedBalance()}
						/>
					</div>
				)}
			</div>

			<div className="mt-6 flex items-center space-x-3 px-6">
				<Button
					data-testid="WalletHeaderMobile__send-button"
					className="my-auto flex-1"
					disabled={
						wallet.balance() === 0 || !wallet.hasBeenFullyRestored() || !wallet.hasSyncedWithNetwork()
					}
					theme="dark"
					variant="primary"
					onClick={handleSend}
				>
					<>{t("COMMON.SEND")}</>
				</Button>

				<div data-testid="WalletHeaderMobile__more-button" className="my-auto ml-3">
					<Dropdown
						options={[primaryOptions, registrationOptions, additionalOptions, secondaryOptions]}
						toggleContent={
							<Button
								variant="transparent"
								size="icon"
								className="bg-theme-secondary-800 text-white hover:bg-theme-primary-700"
							>
								<Icon name="EllipsisVertical" size="lg" />
							</Button>
						}
						onSelect={handleSelectOption}
					/>
				</div>
			</div>

			<WalletActionsModals
				wallet={wallet}
				activeModal={activeModal}
				setActiveModal={setActiveModal}
				onUpdateWallet={() => {
					onUpdate?.(true);
				}}
			/>
		</>
	);
};
