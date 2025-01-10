import React from "react";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { useWalletAlias } from "@/app/hooks";
import { useWalletActions } from "@/domains/wallet/hooks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";
import { Dropdown } from "@/app/components/Dropdown";
import { t } from "i18next";
import { Amount } from "@/app/components/Amount";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { WalletIcons } from "@/app/components/WalletIcons";
import { Copy } from "@/app/components/Copy";
import { Clipboard } from "@/app/components/Clipboard";

export const NewWalletHeader = ({
	profile,
	wallet,
}: {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	onUpdate?: (status: boolean) => void;
}) => {
	const { handleImport, handleCreate, handleSelectOption, handleSend } = useWalletActions();
	const { primaryOptions, secondaryOptions, additionalOptions, registrationOptions } = useWalletOptions(wallet);
	const { convert } = useExchangeRate({ exchangeTicker: wallet.exchangeCurrency(), ticker: wallet.currency() });

	const { getWalletAlias } = useWalletAlias();
	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile,
	});

	return (
		<div className="flex flex-col gap-3 bg-theme-primary-100 px-2 py-3 dark:bg-theme-dark-950">
			<div className="flex w-full flex-row items-center justify-between px-4">
				<div className="h-fit flex flex-row gap-1 items-center">
					<p className="hidden text-base font-semibold leading-5 text-theme-secondary-900 sm:block">
						{t("COMMON.VIEWING")}:
					</p>
					<Address
						alignment="center"
						walletName={alias}
						truncateOnTable
						maxNameChars={20}
						walletNameClass="text-theme-primary-600 text-sm leading-[17px] sm:text-base sm:leading-5"
					/>
				</div>
				<div className="flex flex-row items-center gap-1">
					<Button
						variant="secondary"
						className="flex h-6 w-6 items-center justify-center p-0 sm:w-auto sm:px-2 sm:h-8"
						onClick={handleImport}
					>
						<Icon name="ArrowTurnDownBracket" size="md" />
						<p className="hidden pl-2 text-base font-semibold leading-5 sm:block">{t("COMMON.IMPORT")}</p>
					</Button>
					<Divider type="vertical" className="h-4 border-theme-primary-300" />
					<Button
						variant="secondary"
						className="flex h-6 w-6 items-center justify-center p-0 sm:w-auto sm:px-2 sm:h-8"
						onClick={handleCreate}
					>
						<Icon name="Plus" size="md" />
						<p className="hidden pl-2 text-base font-semibold leading-5 sm:block">{t("COMMON.CREATE")}</p>
					</Button>
				</div>
			</div>

			<div className="flex w-full flex-col gap-3 rounded bg-white p-4">
				<div className="flex w-full flex-row items-center justify-between">
					<div className="flex flex-row items-center gap-1.5">
						<p className="hidden text-sm font-semibold leading-[17px] text-theme-secondary-700 sm:block">
							{t("COMMON.ADDRESS")}
						</p>
						<div className="w-32 h-[17px]">
							<Address
								alignment="center"
								address={wallet.address()}
								truncateOnTable
								addressClass="text-theme-primary-900 text-sm font-semibold leading-[17px]"
							/>
						</div>
						<WalletIcons
							wallet={wallet}
							exclude={["isKnown", "isSecondSignature", "isStarred", "isTestNetwork"]}
							iconColor="text-theme-secondary-300"
						/>
					</div>
					<div className="flex flex-row items-center gap-2">
						<Copy address={wallet.address()} className="text-theme-secondary-700" />

						{!!wallet.publicKey() && (
							<Clipboard
								variant="icon"
								data={wallet.publicKey() as string}
								tooltip={t("WALLETS.PAGE_WALLET_DETAILS.COPY_PUBLIC_KEY")}
								tooltipDarkTheme
							>
								<Icon
									name="CopyKey"
                                    size="md"
									className="text-theme-secondary-700 hover:text-theme-secondary-500"
								/>
							</Clipboard>
						)}
					</div>
				</div>
				<Divider type="horizontal" className="my-0 h-px border-dashed border-theme-secondary-300" />
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:w-full sm:gap-0">
					<div className="flex flex-col gap-3 sm:gap-2" data-testid="WalletHeader__balance">
						<div className="flex flex-row items-center text-sm font-semibold leading-[17px] text-theme-secondary-700">
							<p>{t("COMMON.TOTAL_BALANCE")}</p>
							<Divider type="vertical" className="h-3 border-theme-secondary-300" />
							<Amount value={convert(wallet.balance())} ticker={wallet.exchangeCurrency() || ""} />
						</div>

						<div className="text-lg font-semibold leading-[21px] text-theme-primary-900">
							<Amount value={wallet.balance()} ticker={wallet.currency() || ""} />
						</div>
					</div>

					<div className="flex flex-row items-center gap-3">
						<Button
							data-testid="WalletHeader__send-button"
							className="my-auto flex-1"
							disabled={
								wallet.balance() === 0 ||
								!wallet.hasBeenFullyRestored() ||
								!wallet.hasSyncedWithNetwork()
							}
							variant="primary"
							onClick={handleSend}
						>
							<>{t("COMMON.SEND")}</>
						</Button>

						<div data-testid="WalletHeaderMobile__more-button" className="my-auto">
							<Dropdown
								options={[primaryOptions, registrationOptions, additionalOptions, secondaryOptions]}
								toggleContent={
									<Button variant="secondary" size="icon" className="text-theme-primary-600">
										<Icon name="EllipsisVerticalFilled" size="lg" />
									</Button>
								}
								onSelect={handleSelectOption}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
