import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import cn from "classnames";
import { Numeral } from "@/app/lib/intl";
import { Contracts } from "@/app/lib/profiles";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { Button } from "@/app/components/Button";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Spinner } from "@/app/components/Spinner";
import { useAccordion, useBreakpoint } from "@/app/hooks";
import { Divider } from "@/app/components/Divider";
import { Toggle } from "@/app/components/Toggle";
import { useServerStatus } from "@/domains/setting/pages/Servers/hooks/use-server-status";
import { useEnvironmentContext } from "@/app/contexts";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { MobileTableElement, MobileTableElementRow } from "@/app/components/MobileTableElement";
import { TruncatedWithTooltip } from "@/app/components/TruncatedWithTooltip";
import { networkDisplayName } from "@/utils/network-utils";

interface HostDetails {
	url: string;
	status?: boolean;
}

interface PeerRowProperties {
	name: string;
	checked: boolean;
	height: number | undefined;
	serverStatus?: boolean;
	onToggle: (isEnabled: boolean) => void;
	networkName: string;
	onSelectOption: ({ value }: DropdownOption) => void;
	dropdownOptions: DropdownOption[];
	hosts: {
		publicApi: HostDetails;
		txApi: HostDetails;
		evmApi: HostDetails;
	};
}

const PeerRow = ({
	name,
	hosts,
	checked,
	height,
	networkName,
	serverStatus,
	onToggle,
	onSelectOption,
	dropdownOptions,
}: PeerRowProperties) => {
	const { t } = useTranslation();

	const { publicApi, txApi, evmApi } = hosts;

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

	const tdClasses = cn(rowColor, "flex flex-col items-start min-h-20 justify-center py-2.5 my-[2px]");

	return (
		<TableRow data-testid={checked ? "CustomPeers-network-item--checked" : "CustomPeers-network-item"}>
			<TableCell variant="start" innerClassName={tdClasses}>
				<div className="relative flex h-20 w-full flex-col md-lg:overflow-hidden">
					<div className="flex max-w-72 flex-col md-lg:absolute md-lg:inset-0 md-lg:max-w-full">
						<TruncatedWithTooltip
							className="cursor-pointer truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 transition-colors duration-100 dark:text-theme-dark-50 md:max-w-28 lg:max-w-56 xl:max-w-64"
							text={name}
						/>
						<div className="mt-[2px] text-xs font-semibold leading-[15px] text-theme-secondary-500 dark:text-theme-dark-500">
							{networkName}
						</div>
					</div>
				</div>
			</TableCell>

			<TableCell innerClassName={tdClasses}>
				<div className="h-20 space-y-3">
					<div className="flex items-center space-x-5">
						<div className="w-9 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200">
							{t("SETTINGS.SERVERS.API")}:
						</div>
						<TruncatedWithTooltip
							text={publicApi.url}
							className="cursor-pointer text-sm font-semibold leading-[17px] text-theme-secondary-900 transition-colors duration-100 dark:text-theme-dark-50 md:max-w-40 md-lg:max-w-72 lg:max-w-44 xl:max-w-72"
						/>
					</div>

					<div className="flex items-center space-x-5">
						<div className="w-9 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200">
							{t("SETTINGS.SERVERS.TX")}:
						</div>
						<TruncatedWithTooltip
							text={txApi.url}
							className="cursor-pointer text-sm font-semibold leading-[17px] text-theme-secondary-900 transition-colors duration-100 dark:text-theme-dark-50 md:max-w-40 md-lg:max-w-72 lg:max-w-44 xl:max-w-72"
						/>
					</div>

					<div className="flex items-center space-x-5">
						<div className="w-9 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200">
							{t("SETTINGS.SERVERS.EVM")}:
						</div>
						<TruncatedWithTooltip
							text={evmApi.url}
							className="cursor-pointer text-sm font-semibold leading-[17px] text-theme-secondary-900 transition-colors duration-100 dark:text-theme-dark-50 md:max-w-40 md-lg:max-w-72 lg:max-w-44 xl:max-w-72"
						/>
					</div>
				</div>
			</TableCell>

			<TableCell innerClassName={tdClasses} variant="middle">
				<div className="flex h-20 w-full flex-col items-center space-y-2.5">
					<CustomPeerStatusIcon status={publicApi.status} />
					<CustomPeerStatusIcon status={txApi.status} />
					<CustomPeerStatusIcon status={evmApi.status} />
				</div>
			</TableCell>

			<TableCell innerClassName={tdClasses}>
				<div className="flex h-20 items-start text-theme-secondary-900 dark:text-theme-dark-50">
					{height === undefined ? (
						<span className="text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</span>
					) : (
						<span className="text-sm font-semibold">{formattedHeight}</span>
					)}
				</div>
			</TableCell>

			<TableCell variant="end" innerClassName={cn(tdClasses, "pr-0")}>
				<div className="flex h-20 items-start">
					<div className="mt-px flex items-start border-r border-theme-secondary-300 pr-3 dark:border-theme-secondary-800">
						<Toggle
							data-testid="CustomPeers-toggle"
							defaultChecked={checked}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => onToggle(event.target.checked)}
						/>
					</div>

					<Dropdown
						placement="right-start"
						data-testid="CustomPeers--dropdown"
						toggleContent={
							<Button
								variant="transparent"
								size="icon"
								className="-mr-3 -mt-3 text-theme-secondary-700 dark:text-theme-dark-200"
							>
								<Icon name="EllipsisVerticalFilled" size="md" />
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

const CustomPeerStatusIcon = ({ status }: { status?: boolean }) => {
	const { t } = useTranslation();

	return (
		<div
			className="flex cursor-pointer justify-center"
			onClick={(event: React.MouseEvent) => event.stopPropagation()}
		>
			{status && (
				<Tooltip content={t("SETTINGS.SERVERS.PEERS_STATUS_TOOLTIPS.RESPONSIVE")}>
					<div data-testid="CustomPeersPeer--statusok">
						<Icon name="StatusOk" className="text-theme-success-600" size="lg" />
					</div>
				</Tooltip>
			)}

			{status === false && (
				<Tooltip content={t("SETTINGS.SERVERS.PEERS_STATUS_TOOLTIPS.UNRESPONSIVE")}>
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
	index: number;
	profile: Contracts.IProfile;
	normalizedNetwork: NormalizedNetwork;
	onDelete: (network: NormalizedNetwork) => void;
	onUpdate: (network: NormalizedNetwork) => void;
	onToggle: (isEnabled: boolean) => void;
	// TODO: break it down into smaller components.
}> = ({ index, normalizedNetwork, onDelete, onUpdate, onToggle, profile }) => {
	const { persist } = useEnvironmentContext();
	const { name, publicApiEndpoint, transactionApiEndpoint, evmApiEndpoint, height, enabled, network } =
		normalizedNetwork;

	const { t } = useTranslation();

	const { publicApiStatus, txApiStatus, evmApiStatus, syncStatus } = useServerStatus({
		network: normalizedNetwork,
		profile,
	});

	const dropdownOptions: DropdownOption[] = [
		{ icon: "Pencil", iconPosition: "start", label: t("COMMON.EDIT"), value: "edit" },
		{ icon: "Trash", iconPosition: "start", label: t("COMMON.DELETE"), value: "delete" },
		{ icon: "ArrowRotateLeft", iconPosition: "start", label: t("COMMON.REFRESH"), value: "refresh" },
	];

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

	const { isXs, isSm } = useBreakpoint();

	const { isExpanded, handleHeaderClick } = useAccordion(`${profile.id()}_custom_peers`);

	if (isSm || isXs) {
		return (
			<tr
				data-testid={enabled ? "CustomPeers-network-item--mobile--checked" : "CustomPeers-network-item--mobile"}
			>
				<td className={cn({ "pt-3": index !== 0 })}>
					<MobileTableElement
						title={name}
						onHeaderClick={handleHeaderClick}
						titleExtra={
							<div className="flex items-center gap-1">
								<Toggle
									data-testid="CustomPeers-toggle"
									defaultChecked={enabled}
									onClick={(event: React.MouseEvent | React.KeyboardEvent) => event.stopPropagation()}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										onToggle(event.target.checked)
									}
								/>

								<Divider type="vertical" />

								<div className="hidden h-4 sm:block">
									<Dropdown
										data-testid="CustomPeers--dropdown"
										toggleContent={
											<Button
												variant="transparent"
												size="icon"
												className="-m-3 text-theme-secondary-700 dark:text-theme-dark-200"
											>
												<Icon name="EllipsisVerticalFilled" size="md" />
											</Button>
										}
										onSelect={handleSelectOption}
										options={dropdownOptions}
									/>
								</div>

								<div className="sm:hidden">
									<Icon
										name="ChevronDownSmall"
										className={cn(
											"text-theme-secondary-700 transition-transform dark:text-theme-dark-200",
											{ "rotate-180": isExpanded },
										)}
										size="sm"
									/>
								</div>
							</div>
						}
						bodyClassName={cn("overflow-auto sm:grid-cols-[2.5fr_1fr_0.5fr]", {
							"hidden sm:grid": !isExpanded,
						})}
					>
						<MobileTableElementRow title={t("COMMON.ENDPOINTS")}>
							<div className="space-y-3">
								<div className="flex items-center space-x-5">
									<div className="flex min-w-0 flex-1 items-center space-x-5">
										<div className="w-9 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200 sm:flex-shrink-0">
											{t("SETTINGS.SERVERS.API")}:
										</div>
										<TruncatedWithTooltip
											text={publicApiEndpoint}
											className="block text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50 sm:max-w-52"
										/>
									</div>
									<CustomPeerStatusIcon status={publicApiStatus} />
								</div>

								<div className="flex items-center space-x-5">
									<div className="flex min-w-0 flex-1 items-center space-x-5">
										<div className="w-9 flex-shrink-0 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200">
											{t("SETTINGS.SERVERS.TX")}:
										</div>
										<TruncatedWithTooltip
											text={transactionApiEndpoint}
											className="block text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50 sm:max-w-52"
										/>
									</div>
									<CustomPeerStatusIcon status={txApiStatus} />
								</div>

								<div className="flex items-center space-x-5">
									<div className="flex min-w-0 flex-1 items-center space-x-5">
										<div className="w-9 flex-shrink-0 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200">
											{t("SETTINGS.SERVERS.EVM")}:
										</div>
										<TruncatedWithTooltip
											text={evmApiEndpoint}
											className="block text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50 sm:max-w-52"
										/>
									</div>
									<CustomPeerStatusIcon status={evmApiStatus} />
								</div>
							</div>
						</MobileTableElementRow>

						<MobileTableElementRow title={t("COMMON.NETWORK")} className="place-content-start">
							<div className="flex items-center space-x-3 text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
								{networkDisplayName(network)}
							</div>
						</MobileTableElementRow>

						<MobileTableElementRow title={t("COMMON.HEIGHT")} className="place-content-start">
							<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
								{height}
							</span>
						</MobileTableElementRow>

						<div className="grid grid-cols-3 gap-2 border-t border-dashed border-theme-secondary-300 pt-4 dark:border-theme-dark-700 sm:hidden">
							<Button
								variant="secondary"
								size="sm"
								onClick={() => handleSelectOption({ value: "edit" })}
								data-testid="CustomPeers-network-item--mobile--edit"
							>
								<Icon name="Pencil" />
							</Button>

							<Button
								variant="secondary"
								size="sm"
								onClick={() => handleSelectOption({ value: "refresh" })}
								data-testid="CustomPeers-network-item--mobile--refresh"
							>
								<Icon name="ArrowRotateLeft" />
							</Button>

							<Button
								variant="danger"
								size="sm"
								onClick={() => handleSelectOption({ value: "delete" })}
								data-testid="CustomPeers-network-item--mobile--delete"
							>
								<Icon name="Trash" />
							</Button>
						</div>
					</MobileTableElement>
				</td>
			</tr>
		);
	}

	return (
		<PeerRow
			name={name}
			hosts={{
				evmApi: {
					status: evmApiStatus,
					url: evmApiEndpoint,
				},
				publicApi: {
					status: publicApiStatus,
					url: publicApiEndpoint,
				},
				txApi: {
					status: txApiStatus,
					url: transactionApiEndpoint,
				},
			}}
			networkName={networkDisplayName(network)}
			checked={enabled}
			height={height}
			onToggle={onToggle}
			onSelectOption={handleSelectOption}
			dropdownOptions={dropdownOptions}
		/>
	);
};

const CustomPeersTableFooter = ({
	totalColumns,
	addNewServerHandler,
	isEmpty,
}: {
	totalColumns: number;
	isEmpty: boolean;
	addNewServerHandler: () => void;
}) => {
	const { t } = useTranslation();

	return (
		<tr data-testid="EmptyResults">
			<td colSpan={totalColumns}>
				{isEmpty && (
					<div className="py-3 text-center text-theme-secondary-700 dark:text-theme-dark-200">
						{t("SETTINGS.SERVERS.CUSTOM_PEERS.EMPTY_MESSAGE")}
					</div>
				)}
				<div className="hidden border-t border-theme-secondary-300 px-6 pb-2 pt-3 dark:border-theme-dark-700 md:block">
					<Button
						data-testid="CustomPeers--addnew"
						onClick={addNewServerHandler}
						variant="secondary"
						className="w-full space-x-2"
					>
						<Icon name="Plus" />
						<span>{t("COMMON.ADD_NEW")}</span>
					</Button>
				</div>
			</td>
		</tr>
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

	const { isXs, isSm } = useBreakpoint();

	const columns: Column[] = [
		{
			Header: t("COMMON.NAME") + " / " + t("COMMON.NETWORK"),
			cellWidth: "md:w-28 md-lg:w-36 lg:w-56 xl:w-64",
			disableSortBy: true,
			headerClassName: "no-border w-1/3",
		},
		{
			Header: t("COMMON.ENDPOINTS"),
			cellWidth: "md:w-40 xl:w-72",
			disableSortBy: true,
			headerClassName: " no-border",
		},
		{
			Header: t("COMMON.STATUS"),
			disableSortBy: true,
			headerClassName: "no-border",
			minimumWidth: true,
		},
		{
			Header: t("COMMON.HEIGHT"),
			disableSortBy: true,
			headerClassName: "no-border",
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

	return (
		<div data-testid="CustomPeers--list">
			<TableWrapper noBorder className="-mb-2 md:-mb-0">
				<Table
					columns={columns}
					data={networks}
					hideHeader={isXs || isSm}
					rowsPerPage={networks.length}
					className="with-x-padding"
					footer={
						<CustomPeersTableFooter
							isEmpty={networks.length === 0}
							totalColumns={columns.length}
							addNewServerHandler={addNewServerHandler}
						/>
					}
				>
					{(network: NormalizedNetwork, index: number) => (
						<CustomPeersPeer
							index={index}
							profile={profile}
							key={network.name}
							onDelete={onDelete}
							onUpdate={onUpdate}
							onToggle={(isEnabled) => onToggle(isEnabled, network)}
							normalizedNetwork={network}
						/>
					)}
				</Table>
			</TableWrapper>
		</div>
	);
};

export default CustomPeers;
