import { Contracts } from "@payvo/sdk-profiles";
import React from "react";

import tw, { styled } from "twin.macro";
import { t } from "i18next";
import { WalletHeaderProperties } from "@/domains/wallet/pages/WalletDetails/components/WalletHeader/WalletHeader.contracts";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { Avatar } from "@/app/components/Avatar";
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

const WalletHeaderButtonMobile = styled.button`
	${tw`inline-flex items-center justify-center w-6 h-6 transition-all duration-100 ease-linear rounded outline-none focus:(outline-none ring-2 ring-theme-primary-400) text-theme-secondary-text disabled:text-theme-secondary-800`}
`;

export const WalletHeaderMobile: React.VFC<WalletHeaderProperties> = ({ profile, wallet, onUpdate }) => {
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
			<div className="-mx-8 -mt-8 flex h-13 items-center justify-between bg-black px-8 py-4">
				<div className="flex items-center space-x-2">
					<NetworkIcon
						network={wallet.network()}
						size="xs"
						className="text-theme-secondary-text"
						isCompact
						noShadow
						tooltipDarkTheme
					/>
					<Avatar size="xs" address={wallet.address()} noShadow />
				</div>

				<div className="flex items-center">
					<div className="mr-2 flex items-center space-x-1 border-r border-theme-secondary-800 pr-2 empty:border-0">
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

			<div className="flex flex-col items-center pt-4 text-white">
				<div className="mx-auto flex w-full items-center justify-center space-x-2">
					<Address
						alignment="center"
						address={wallet.address()}
						walletName={alias}
						walletNameClass="text-theme-secondary-200"
					/>

					<div className="flex items-center space-x-3 text-theme-secondary-text">
						<Clipboard
							variant="icon"
							data={wallet.address()}
							tooltip={t("WALLETS.PAGE_WALLET_DETAILS.COPY_ADDRESS")}
							tooltipDarkTheme
						>
							<Icon name="Copy" className="hover:text-theme-secondary-500" />
						</Clipboard>

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
					className="mt-4 text-xl font-semibold leading-6 text-white"
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

			<div className="mt-6 flex items-center space-x-3">
				<Button
					data-testid="WalletHeaderMobile__send-button"
					className="bg-theme-dark-500 my-auto flex-1"
					disabled={
						wallet.balance() === 0 || !wallet.hasBeenFullyRestored() || !wallet.hasSyncedWithNetwork()
					}
					theme="dark"
					onClick={handleSend}
				>
					{t("COMMON.SEND")}
				</Button>

				<div data-testid="WalletHeaderMobile__more-button" className="my-auto ml-3">
					<Dropdown
						dropdownClass="mx-4"
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
