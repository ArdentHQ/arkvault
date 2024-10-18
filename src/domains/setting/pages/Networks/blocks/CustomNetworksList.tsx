import React, { useMemo } from "react";
import { Networks } from "@ardenthq/sdk";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { Icon } from "@/app/components/Icon";
import { Checkbox } from "@/app/components/Checkbox";
import { networkInitials, networkName } from "@/utils/network-utils";
import { Divider } from "@/app/components/Divider";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";

const CustomNetworksListNetwork: React.VFC<{
	network: Networks.NetworkManifest;
	selectedNetworks: string[];
	onToggle: (event: React.ChangeEvent<HTMLInputElement>, network: string) => void;
	onDelete: (network: string) => void;
	onInfo: (network: string) => void;
	onUpdate: (network: string) => void;
}> = ({ network, onToggle, onDelete, onInfo, onUpdate, selectedNetworks }) => {
	const { t } = useTranslation();

	const isChecked = useMemo<boolean>(() => selectedNetworks.includes(network.id), [network, selectedNetworks]);

	const actions: DropdownOption[] = [
		{ icon: "Pencil", iconPosition: "start", label: t("COMMON.EDIT"), value: "edit" },
		{ icon: "CircleExclamationMark", iconPosition: "start", label: t("COMMON.INFO"), value: "info" },
		{ icon: "Trash", iconPosition: "start", label: t("COMMON.DELETE"), value: "delete" },
	];

	const onSelect = ({ value }) => {
		switch (value) {
			case "edit": {
				onUpdate(network.id);
				break;
			}
			case "info": {
				onInfo(network.id);
				break;
			}
			case "delete": {
				onDelete(network.id);
				break;
			}
		}
	};

	return (
		<label
			data-testid="CustomNetworksListNetwork"
			htmlFor={`CustomNetworksListNetwork-${network.id}`}
			className={cn(
				"transition-color flex cursor-pointer items-start justify-between space-x-4 rounded-xl border-2 px-4 py-3 duration-100",
				{
					"border-theme-primary-100 hover:border-theme-primary-400 dark:border-theme-secondary-800 dark:hover:border-theme-primary-400":
						!isChecked,
					"border-theme-primary-600 bg-theme-primary-50 dark:bg-theme-primary-900": isChecked,
				},
			)}
		>
			<div className="flex space-x-3 text-theme-secondary-700 dark:text-theme-secondary-200">
				<div className="flex h-7 items-center">
					<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-theme-secondary-100 text-2xs font-semibold text-theme-secondary-700 dark:bg-theme-secondary-800 dark:text-theme-secondary-500">
						{networkInitials(network)}
					</div>
				</div>
				<div className="flex min-h-7 items-center break-all font-semibold leading-tight">
					{networkName(network)}
				</div>
			</div>

			<div className="flex items-center">
				<Checkbox
					data-testid="CustomNetworksListNetwork-checkbox"
					id={`CustomNetworksListNetwork-${network.id}`}
					checked={isChecked}
					readOnly={true}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => onToggle(event, network.id)}
				/>
				<div className="ml-0.5 flex items-center">
					<Divider type="vertical" />
				</div>
				<Dropdown
					options={actions}
					onSelect={onSelect}
					toggleContent={
						<div
							data-testid="CustomNetworksListNetwork-menu"
							className="flex justify-center overflow-hidden"
						>
							<Icon
								name="EllipsisVertical"
								className="cursor-pointer p-1 text-theme-primary-300 transition-colors duration-200 hover:text-theme-primary-400 dark:text-theme-secondary-600 dark:hover:text-theme-secondary-200"
								size="lg"
							/>
						</div>
					}
				/>
			</div>
		</label>
	);
};

const CustomNetworksList: React.VFC<{
	networks: Networks.NetworkManifest[];
	selectedNetworks: string[];
	onToggle: (event: React.ChangeEvent<HTMLInputElement>, network: string) => void;
	onDelete: (network: string) => void;
	onInfo: (network: string) => void;
	onUpdate: (network: string) => void;
	onAdd: () => void;
}> = ({ networks, onToggle, onUpdate, onDelete, onInfo, onAdd, selectedNetworks }) => {
	const { t } = useTranslation();

	return (
		<div data-testid="CustomNetworksList" className="mt-4 grid gap-3 xl:grid-cols-2">
			<button
				type="button"
				className="transition-color flex cursor-pointer items-center space-x-3 rounded-xl border-2 border-theme-primary-100 px-4 py-3 text-theme-primary-600 duration-100 hover:border-theme-primary-700 hover:bg-theme-primary-700 hover:text-white dark:border-theme-secondary-800 dark:hover:border-theme-primary-700"
				onClick={onAdd}
				data-testid="CustomNetworksList--add"
			>
				<Icon name="Plus" />
				<span className="font-semibold">{t("SETTINGS.NETWORKS.CUSTOM_NETWORKS.ADD_NETWORK")}</span>
			</button>

			{networks.map((network) => (
				<CustomNetworksListNetwork
					network={network}
					key={network.id}
					onToggle={onToggle}
					onUpdate={onUpdate}
					onInfo={onInfo}
					onDelete={onDelete}
					selectedNetworks={selectedNetworks}
				/>
			))}
		</div>
	);
};

export default CustomNetworksList;
