import React, { useMemo } from "react";
import { Networks } from "@ardenthq/sdk";
import cn from "classnames";
import { Icon } from "@/app/components/Icon";
import { Checkbox } from "@/app/components/Checkbox";
import { networkDisplayName } from "@/utils/network-utils";

const NetworksListNetwork: React.VFC<{
	network: Networks.Network;
	selectedNetworks: string[];
	onToggleNetwork: (event: React.ChangeEvent<HTMLInputElement>, network: string) => void;
}> = ({ network, onToggleNetwork, selectedNetworks }) => {
	const isChecked = useMemo<boolean>(() => selectedNetworks.includes(network.id()), [network, selectedNetworks]);

	return (
		<label
			data-testid="NetworksListNetwork"
			htmlFor={`NetworksListNetwork-${network.id()}`}
			className={cn(
				"transition-color flex cursor-pointer justify-between space-x-4 rounded-xl border-2 px-4 py-3 duration-100",
				{
					"border-theme-primary-100 hover:border-theme-primary-400 dark:border-theme-secondary-800 dark:hover:border-theme-primary-400":
						!isChecked,
					"border-theme-primary-600 bg-theme-primary-50 dark:bg-theme-primary-900": isChecked,
				},
			)}
		>
			<div className="flex items-center space-x-3 text-theme-secondary-700 dark:text-theme-secondary-200">
				<div className="shrink-0">
					<Icon
						name={network.ticker()}
						size="md"
						className={cn({
							"dark:text-theme-secondary-200": isChecked,
							"dark:text-theme-secondary-600": !isChecked,
						})}
					/>
				</div>
				<div className="font-semibold">{networkDisplayName(network)}</div>
			</div>

			<div className="flex items-center">
				<Checkbox
					data-testid="NetworksListNetwork-checkbox"
					id={`NetworksListNetwork-${network.id()}`}
					defaultChecked={isChecked}
					readOnly={true}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => onToggleNetwork(event, network.id())}
				/>
			</div>
		</label>
	);
};

const NetworksList: React.VFC<{
	networks: Networks.Network[];
	selectedNetworks: string[];
	onToggleNetwork: (event: React.ChangeEvent<HTMLInputElement>, network: string) => void;
}> = ({ networks, onToggleNetwork, selectedNetworks }) => (
	<div data-testid="NetworksList" className="mt-4 grid gap-3 xl:grid-cols-2">
		{networks.map((network) => (
			<NetworksListNetwork
				network={network}
				key={network.id()}
				onToggleNetwork={onToggleNetwork}
				selectedNetworks={selectedNetworks}
			/>
		))}
	</div>
);

export default NetworksList;
