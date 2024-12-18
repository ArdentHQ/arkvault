import React from "react";
import { WalletActions, WalletAddress, WalletBalance } from "./WalletHeader.blocks";
import { WalletHeaderProperties } from "./WalletHeader.contracts";
import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { WalletActionsModals } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";

export const WalletHeader: React.VFC<WalletHeaderProperties> = ({
	profile,
	wallet,
	currencyDelta,
	isUpdatingTransactions,
	onUpdate,
}) => {
	const { handleSelectOption, activeModal, setActiveModal } = useWalletActions(wallet);
	const { primaryOptions, secondaryOptions, additionalOptions, registrationOptions } = useWalletOptions(
		wallet,
		profile,
	);

	return (
		<>
			<header data-testid="WalletHeader" className="flex flex-col items-center lg:flex-row">
				<WalletAddress profile={profile} wallet={wallet} />

				<div className="my-6 self-stretch border-t border-theme-secondary-800 lg:my-0 lg:border-r" />

				<div className="h-13 flex w-full items-center lg:w-full lg:pl-6">
					<WalletBalance profile={profile} wallet={wallet} currencyDelta={currencyDelta} />

					<WalletActions
						profile={profile}
						wallet={wallet}
						isUpdatingTransactions={isUpdatingTransactions}
						onUpdate={onUpdate}
						setActiveModal={setActiveModal}
					/>

					<div data-testid="WalletHeader__more-button" className="my-auto ml-3">
						<Dropdown
							placement="bottom-end"
							toggleContent={
								<Button
									variant="transparent"
									size="icon"
									className="bg-theme-secondary-800 p-[14px] text-theme-secondary-200 hover:bg-theme-primary-500 hover:text-white"
								>
									<Icon name="EllipsisVerticalFilled" size="md" />
								</Button>
							}
							onSelect={handleSelectOption}
							options={[primaryOptions, registrationOptions, additionalOptions, secondaryOptions]}
						/>
					</div>
				</div>
			</header>

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
