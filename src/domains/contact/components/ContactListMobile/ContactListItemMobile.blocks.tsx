import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import { Address } from "@/app/components/Address";
import { Icon } from "@/app/components/Icon";
import { AvailableNetwork } from "@/domains/contact/pages/Contacts";
import { Tooltip } from "@/app/components/Tooltip";
import { useNetworkOptions, useNetworks } from "@/app/hooks";
import { networkDisplayName } from "@/utils/network-utils";
interface ContactListItemMobileAddressProperties {
	profile: Contracts.IProfile;
	address: Contracts.IContactAddress;
	onSend: () => void;
	availableNetworks: AvailableNetwork[];
}

export const ContactListItemMobileAddress: React.VFC<ContactListItemMobileAddressProperties> = ({
	address,
	onSend,
	availableNetworks,
	profile,
}) => {
	const { t } = useTranslation();

	const { networkById } = useNetworkOptions({ profile });

	let sendButtonTooltip = "";

	const availableNetwork = availableNetworks.find((network) => network.id === address.network());
	const hasBalance = availableNetwork?.hasBalance ?? false;

	if (!availableNetwork) {
		sendButtonTooltip = t("CONTACTS.VALIDATION.NO_WALLETS");
	} else if (!hasBalance) {
		sendButtonTooltip = t("CONTACTS.VALIDATION.NO_BALANCE");
	}

	const profileAvailableNetworks = useNetworks({ profile });

	const sendIsDisabled = useMemo(() => {
		if (!hasBalance) {
			return true;
		}

		return !profileAvailableNetworks.some((network) => network.id() === address.network());
	}, [hasBalance, profileAvailableNetworks]);

	const network = networkById(address.network());

	return (
		<div className="flex h-18 items-center justify-between overflow-hidden">
			<div
				className={cn(
					"flex h-full flex-1 flex-col justify-center overflow-hidden rounded-l-xl px-6 dark:border-2 dark:border-r-0 dark:border-theme-secondary-800 dark:bg-theme-secondary-900",
					{
						"bg-theme-primary-100": !sendIsDisabled,
						"bg-theme-secondary-100": sendIsDisabled,
					},
				)}
			>
				<div className="mb-2 text-xs font-semibold leading-[15px] text-theme-secondary-700 dark:text-theme-secondary-700">
					{network && networkDisplayName(network)}
				</div>
				<div className="flex items-center overflow-hidden">
					<Address address={address.address()} showCopyButton />
				</div>
			</div>
			<Tooltip content={sendButtonTooltip}>
				<div className="flex h-full">
					<button
						data-testid="ContactListItemMobileAddress__send-button"
						type="button"
						disabled={sendIsDisabled}
						onClick={onSend}
						className={cn("flex h-full items-center justify-center rounded-r-xl px-3", {
							"bg-theme-primary-600 text-white hover:bg-theme-primary-700": !sendIsDisabled,
							"bg-theme-secondary-200 text-theme-secondary-500 dark:bg-theme-secondary-800 dark:text-theme-secondary-700":
								sendIsDisabled,
						})}
					>
						<Icon size="lg" name="DoubleArrowRight" />
					</button>
				</div>
			</Tooltip>
		</div>
	);
};
