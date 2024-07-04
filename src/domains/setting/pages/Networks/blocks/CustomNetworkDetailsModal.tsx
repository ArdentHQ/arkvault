import React from "react";
import { useTranslation } from "react-i18next";
import { Networks } from "@ardenthq/sdk";
import { Modal } from "@/app/components/Modal";
import { Tooltip } from "@/app/components/Tooltip";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";

const CustomNetworkDetailsModalRow: React.VFC<{
	label: string;
	children: React.ReactNode;
}> = ({ label, children }) => (
	<div className="flex space-x-4 pt-3">
		<div>
			<div className="text-theme-secondary-700 dark:text-theme-secondary-500">{label}:</div>
		</div>
		<div className="flex flex-grow justify-end overflow-auto">
			<div className="truncate font-semibold text-theme-secondary-900 dark:text-theme-secondary-300">
				{children}
			</div>
		</div>
	</div>
);

const CustomNetworkDetailsModal: React.VFC<{
	onCancel: () => void;
	network: Networks.NetworkManifest;
}> = ({ onCancel, network }) => {
	const { t } = useTranslation();

	return (
		<Modal
			data-testid="CustomNetworkDetailsModal"
			title={t("SETTINGS.NETWORKS.DETAILS_MODAL.TITLE")}
			description={t("SETTINGS.NETWORKS.DETAILS_MODAL.DESCRIPTION")}
			size="lg"
			isOpen
			onClose={onCancel}
		>
			<div className="flex flex-col space-y-3 divide-y divide-theme-secondary-300 dark:divide-theme-secondary-800">
				<CustomNetworkDetailsModalRow label={t("COMMON.TOKEN")}>
					{network.currency.ticker}
				</CustomNetworkDetailsModalRow>
				<CustomNetworkDetailsModalRow label={t("COMMON.SYMBOL")}>
					{network.currency.symbol}
				</CustomNetworkDetailsModalRow>
				<CustomNetworkDetailsModalRow label={t("COMMON.NETHASH")}>
					<div className="flex grow items-center space-x-2">
						<Tooltip content={network.meta?.nethash} disabled={!network.meta?.nethash}>
							<span className="truncate">{network.meta?.nethash}</span>
						</Tooltip>

						<div className="text-theme-primary-300 dark:text-theme-secondary-600">
							<Clipboard variant="icon" data={network.meta?.nethash}>
								<Icon name="Copy" />
							</Clipboard>
						</div>
					</div>
				</CustomNetworkDetailsModalRow>
				<CustomNetworkDetailsModalRow label={t("COMMON.EPOCH")}>
					{network.meta?.epoch}
				</CustomNetworkDetailsModalRow>
				<CustomNetworkDetailsModalRow label={t("COMMON.VERSION")}>
					{network.meta?.version}
				</CustomNetworkDetailsModalRow>
			</div>
		</Modal>
	);
};

export default CustomNetworkDetailsModal;
