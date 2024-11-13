import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import cn from "classnames";
import { Networks } from "@ardenthq/sdk";
import { Numeral } from "@ardenthq/sdk-intl";
import { Contracts } from "@ardenthq/sdk-profiles";

import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Button } from "@/app/components/Button";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Spinner } from "@/app/components/Spinner";
import { useAccordion, useBreakpoint } from "@/app/hooks";
import { Divider } from "@/app/components/Divider";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { Toggle } from "@/app/components/Toggle";
import { useServerStatus } from "@/domains/setting/pages/Servers/hooks/use-server-status";
import { useEnvironmentContext } from "@/app/contexts";
import { AccordionContent, AccordionHeader, AccordionWrapper } from "@/app/components/Accordion";
import { networkDisplayName } from "@/utils/network-utils";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";

interface PeerRowProperties {
	name: string;
	address: string;
	checked: boolean;
	height: number | undefined;
	network: Networks.Network;
	serverStatus?: boolean;
	serverType: Networks.NetworkHost["type"];
	onToggle: (isEnabled: boolean) => void;
	onSelectOption: ({ value }: DropdownOption) => void;
}

const PeerRow = ({
	name,
	address,
	checked,
	height,
	network,
	serverStatus,
	serverType,
	onToggle,
	onSelectOption,
}: PeerRowProperties) => {
	const { t } = useTranslation();

	const dropdownOptions: DropdownOption[] = [
		{ icon: "Pencil", iconPosition: "start", label: t("COMMON.EDIT"), value: "edit" },
		{ icon: "Trash", iconPosition: "start", label: t("COMMON.DELETE"), value: "delete" },
		{ icon: "ArrowRotateLeft", iconPosition: "start", label: t("COMMON.REFRESH"), value: "refresh" },
	];

	const formattedHeight = useMemo(() => Numeral.make("en").format(height || 0), [height]);

	const rowColor = useMemo(() => {
		if (checked) {
			if (serverStatus === false) {
				return "bg-theme-danger-50 dark:bg-transparent dark:border-theme-danger-400";
			} else {
				return "bg-theme-primary-50 dark:bg-transparent dark:border-theme-primary-600";
			}
		}
	}, [checked, serverStatus]);

	return (
		<TableRow data-testid={checked ? "CustomPeers-network-item--checked" : "CustomPeers-network-item"}>
			<TableCell variant="start" innerClassName={cn("py-3 border-2 border-r-0 border-transparent", rowColor)}>
				<div className="flex h-11 w-full items-center space-x-3">
					<div
						className={cn(
							"relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl dark:border-2 dark:border-theme-secondary-800",
							{
								"bg-theme-primary-100 text-theme-primary-600 dark:bg-transparent": network.isLive(),
								"bg-theme-secondary-100 text-theme-secondary-700 dark:bg-transparent": network.isTest(),
							},
						)}
					>
						<NetworkIcon network={network} showTooltip={false} isCompact />

						{network.isTest() && (
							<Tooltip content={t("COMMON.TEST_NETWORK")}>
								<span
									className={cn(
										"absolute bottom-0 right-0 -mb-2 -mr-2 flex h-6 w-6 items-center justify-center rounded-full",
										{
											"bg-theme-background": !checked,
											"bg-theme-primary-50 dark:bg-theme-background": checked,
										},
									)}
								>
									<Icon className="text-theme-secondary-500" name="Code" size="md" />
								</span>
							</Tooltip>
						)}
					</div>

					<div className="flex flex-col overflow-auto">
						<div
							className={cn("cursor-pointer truncate font-semibold transition-colors duration-100", {
								"text-theme-primary-600": checked,
								"text-theme-secondary-900 dark:text-theme-secondary-200": !checked,
							})}
						>
							<TruncateEnd text={name} maxChars={20} />
						</div>
						<div className="truncate text-sm font-semibold text-theme-secondary-500">{address}</div>
					</div>
				</div>
			</TableCell>

			<TableCell
				className="hidden md:table-cell"
				innerClassName={cn("py-3 justify-center border-t-2 border-b-2 border-transparent", rowColor)}
			>
				<div className="flex h-11 items-center">
					{height === undefined ? (
						<span className="text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</span>
					) : (
						<span>{formattedHeight}</span>
					)}
				</div>
			</TableCell>

			<TableCell innerClassName={cn("py-3 justify-center border-t-2 border-b-2 border-transparent", rowColor)}>
				<div className="flex h-11 items-center">
					<Tooltip content={serverType === "musig" ? t("COMMON.MULTISIG") : t("COMMON.PEER")}>
						<div className="flex cursor-pointer justify-center">
							<Icon
								className="text-theme-secondary-700"
								size="lg"
								name={serverType === "musig" ? "ServerMultisign" : "ServerPeer"}
							/>
						</div>
					</Tooltip>
				</div>
			</TableCell>

			<TableCell innerClassName={cn("py-3 justify-center border-t-2 border-b-2 border-transparent", rowColor)}>
				<div className="flex h-11 items-center">
					<CustomPeerStatusIcon status={serverStatus} />
				</div>
			</TableCell>

			<TableCell variant="end" innerClassName={cn("py-3 border-2 border-l-0 border-transparent", rowColor)}>
				<div className="flex h-11 items-center">
					<div className="flex items-center border-r border-theme-secondary-300 pr-3 dark:border-theme-secondary-800">
						<Toggle
							data-testid="CustomPeers-toggle"
							defaultChecked={checked}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => onToggle(event.target.checked)}
						/>
					</div>

					<Dropdown
						data-testid="CustomPeers--dropdown"
						toggleContent={
							<Button
								variant="transparent"
								size="icon"
								className="text-theme-primary-300 hover:text-theme-primary-600"
							>
								<Icon name="EllipsisVertical" size="md" />
							</Button>
						}
						onSelect={onSelectOption}
						options={dropdownOptions}
					/>
				</div>
			</TableCell>
		</TableRow>
	);
};

const CustomPeersPeerMobileRow: React.VFC<{
	label: string;
	children: React.ReactNode;
}> = ({ label, children }) => (
	<div className="flex items-start space-x-3 border-t border-dashed border-theme-secondary-300 py-4 dark:border-theme-secondary-800">
		<div className="font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">{label}</div>
		<div className="flex flex-1 justify-end text-theme-secondary-700 dark:text-theme-secondary-500">{children}</div>
	</div>
);

const CustomPeerStatusIcon = ({ status }: { status?: boolean }) => {
	const { t } = useTranslation();

	return (
		<div
			className="flex cursor-pointer justify-center"
			onClick={(event: React.MouseEvent) => event.stopPropagation()}
		>
			{status === true && (
				<Tooltip content={t("SETTINGS.SERVERS.PEERS_STATUS_TOOLTIPS.HEALTHY")}>
					<div data-testid="CustomPeersPeer--statusok">
						<Icon name="StatusOk" className="text-theme-success-600" size="lg" />
					</div>
				</Tooltip>
			)}

			{status === false && (
				<Tooltip content={t("SETTINGS.SERVERS.PEERS_STATUS_TOOLTIPS.WITH_ISSUES")}>
					<div data-testid="CustomPeersPeer--statuserror">
						<Icon name="StatusError" className="text-theme-danger-400" size="lg" />
					</div>
				</Tooltip>
			)}

			{status === undefined && (
				<div data-testid="CustomPeersPeer--statusloading">
					<Spinner size="sm" />
				</div>
			)}
		</div>
	);
};

const CustomPeersPeer: React.VFC<{
	profile: Contracts.IProfile;
	normalizedNetwork: NormalizedNetwork;
	onDelete: (network: NormalizedNetwork) => void;
	onUpdate: (network: NormalizedNetwork) => void;
	onToggle: (isEnabled: boolean) => void;
	// TODO: break it down into smaller components.
	// eslint-disable-next-line sonarjs/cognitive-complexity
}> = ({ normalizedNetwork, onDelete, onUpdate, onToggle, profile }) => {
	const { persist } = useEnvironmentContext();
	const { name, network, serverType, address, height, enabled } = normalizedNetwork;

	const { serverStatus, syncStatus } = useServerStatus({
		network: normalizedNetwork,
		profile,
	});

	const { t } = useTranslation();

	useEffect(() => {
		const interval = setInterval(() => syncStatus(), 60 * 1000 * 5);
		syncStatus();

		return () => clearInterval(interval);
	}, []);

	const handleSelectOption = async ({ value }) => {
		if (value === "delete") {
			onDelete(normalizedNetwork);
			return;
		}

		if (value === "edit") {
			onUpdate(normalizedNetwork);
		}

		if (value === "refresh") {
			await syncStatus();
			await persist();
		}
	};

	const { isXs } = useBreakpoint();

	const { isExpanded, handleHeaderClick } = useAccordion("custom_peers");

	if (isXs) {
		return (
			<div className="-mx-8">
				<AccordionWrapper
					data-testid={
						enabled ? "CustomPeers-network-item--mobile--checked" : "CustomPeers-network-item--mobile"
					}
					isCollapsed={!isExpanded}
				>
					<AccordionHeader isExpanded={isExpanded} onClick={handleHeaderClick}>
						<div
							className={cn("flex w-0 flex-grow items-center space-x-3", {
								"text-theme-primary-600": network.isLive(),
								"text-theme-secondary-700": !network.isLive(),
							})}
						>
							<div className="flex shrink-0 items-center">
								<NetworkIcon network={network} showTooltip={false} isCompact />
							</div>

							<div
								className={cn("truncate font-semibold", {
									"text-theme-primary-600": enabled,
									"text-theme-secondary-900 dark:text-theme-secondary-200": !enabled,
								})}
							>
								{name}
							</div>

							{network.isTest() && (
								<Tooltip content={t("COMMON.TEST_NETWORK")}>
									<span>
										<Icon
											className="text-theme-secondary-500 dark:text-theme-secondary-700"
											name="Code"
											size="md"
										/>
									</span>
								</Tooltip>
							)}
						</div>

						<div className="ml-5 flex items-center space-x-3">
							<CustomPeerStatusIcon status={serverStatus} />

							<Divider type="vertical" />

							<Toggle
								data-testid="CustomPeers-toggle"
								defaultChecked={enabled}
								onClick={(event: React.MouseEvent | React.KeyboardEvent) => event.stopPropagation()}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									onToggle(event.target.checked)
								}
							/>

							<Divider type="vertical" />
						</div>
					</AccordionHeader>

					{isExpanded && (
						<AccordionContent data-testid="CustomPeers-network-item--mobile--expanded">
							<div className="flex flex-col">
								<CustomPeersPeerMobileRow label={t("COMMON.NETWORK")}>
									<div className="break-all text-right">{networkDisplayName(network)}</div>
								</CustomPeersPeerMobileRow>

								<CustomPeersPeerMobileRow label={t("COMMON.TYPE")}>
									<div className="flex items-center space-x-3">
										<div>{serverType === "musig" ? t("COMMON.MULTISIG") : t("COMMON.PEER")}</div>
										<Icon
											className="text-theme-secondary-700"
											size="lg"
											name={serverType === "musig" ? "ServerMultisign" : "ServerPeer"}
										/>
									</div>
								</CustomPeersPeerMobileRow>

								<CustomPeersPeerMobileRow label={t("COMMON.ADDRESS")}>
									<div className="break-all text-right">{address}</div>
								</CustomPeersPeerMobileRow>

								<CustomPeersPeerMobileRow label={t("COMMON.STATUS")}>
									<div className="flex w-0 flex-1 items-center justify-end space-x-3 overflow-hidden">
										{serverStatus === true && (
											<span className="truncate">
												{t("SETTINGS.SERVERS.PEERS_STATUS_TOOLTIPS.HEALTHY")}
											</span>
										)}

										{serverStatus === false && (
											<span className="truncate">
												{t("SETTINGS.SERVERS.PEERS_STATUS_TOOLTIPS.WITH_ISSUES")}
											</span>
										)}

										<CustomPeerStatusIcon status={serverStatus} />
									</div>
								</CustomPeersPeerMobileRow>

								<div className="mt-3 flex space-x-3">
									<Button
										data-testid="CustomPeers-network-item--mobile--delete"
										variant="danger"
										onClick={(event) => {
											handleSelectOption({ value: "delete" });
											handleHeaderClick(event);
										}}
									>
										<Icon name="Trash" />
									</Button>

									<Button
										data-testid="CustomPeers-network-item--mobile--refresh"
										variant="secondary"
										onClick={() => handleSelectOption({ value: "refresh" })}
									>
										<Icon name="ArrowRotateLeft" />
									</Button>

									<Button
										data-testid="CustomPeers-network-item--mobile--edit"
										className="w-full"
										variant="secondary"
										onClick={() => handleSelectOption({ value: "edit" })}
									>
										<Icon name="Pencil" />
										<span>{t("COMMON.EDIT")}</span>
									</Button>
								</div>
							</div>
						</AccordionContent>
					)}
				</AccordionWrapper>
			</div>
		);
	}

	return (
		<PeerRow
			name={name}
			address={address}
			network={network}
			checked={enabled}
			height={height}
			serverStatus={serverStatus}
			serverType={serverType}
			onToggle={onToggle}
			onSelectOption={handleSelectOption}
		/>
	);
};

const CustomPeers: React.VFC<{
	addNewServerHandler: () => void;
	networks: NormalizedNetwork[];
	onDelete: (network: NormalizedNetwork) => void;
	onUpdate: (network: NormalizedNetwork) => void;
	onToggle: (isEnabled: boolean, network: NormalizedNetwork) => void;
	profile: Contracts.IProfile;
}> = ({ addNewServerHandler, networks, onDelete, onUpdate, profile, onToggle }) => {
	const { t } = useTranslation();

	const { isXs } = useBreakpoint();

	const columns: Column[] = [
		{
			Header: t("COMMON.NETWORK"),
			disableSortBy: true,
			headerClassName: "no-border",
		},
		{
			Header: t("COMMON.HEIGHT"),
			disableSortBy: true,
			headerClassName: "hidden md:table-cell",
			minimumWidth: true,
		},
		{
			Header: t("COMMON.TYPE"),
			disableSortBy: true,
			minimumWidth: true,
		},
		{
			Header: t("COMMON.STATUS"),
			disableSortBy: true,
			minimumWidth: true,
		},
		{
			Header: "-",
			className: "hidden",
			disableSortBy: true,
			headerClassName: "no-border",
			minimumWidth: true,
		},
	];

	const renderPeers = () => {
		if (networks.length === 0) {
			return <EmptyBlock>{t("SETTINGS.SERVERS.CUSTOM_PEERS.EMPTY_MESSAGE")}</EmptyBlock>;
		}

		return (
			<Table columns={columns} data={networks} rowsPerPage={networks.length} hideHeader={isXs}>
				{(network: NormalizedNetwork) => (
					<CustomPeersPeer
						profile={profile}
						key={network.name}
						onDelete={onDelete}
						onUpdate={onUpdate}
						onToggle={(isEnabled) => onToggle(isEnabled, network)}
						normalizedNetwork={network}
					/>
				)}
			</Table>
		);
	};

	return (
		<div data-testid="CustomPeers--list" className={networks.length === 0 ? "mt-3" : "mt-1 sm:mt-3"}>
			{renderPeers()}

			<Button
				data-testid="CustomPeers--addnew"
				onClick={addNewServerHandler}
				variant="secondary"
				className="mt-6 w-full space-x-2 sm:mt-3"
			>
				<Icon name="Plus" />
				<span>{t("COMMON.ADD_NEW")}</span>
			</Button>
		</div>
	);
};

export default CustomPeers;
