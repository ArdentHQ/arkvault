import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import cn from "classnames";
import { Networks } from "@ardenthq/sdk";
import { Numeral } from "@ardenthq/sdk-intl";
import { Contracts } from "@ardenthq/sdk-profiles";
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

interface PeerRowProperties {
	name: string;
	publicApiEndpoint: string;
	evmApiEndpoint: string;
	transactionApiEndpoint: string;
	checked: boolean;
	height: number | undefined;
	serverStatus?: boolean;
	onToggle: (isEnabled: boolean) => void;
	onSelectOption: ({ value }: DropdownOption) => void;
	dropdownOptions: DropdownOption[];
}

const PeerRow = ({
	name,
	publicApiEndpoint,
	transactionApiEndpoint,
	evmApiEndpoint,
	checked,
	height,
	serverStatus,
	onToggle,
	onSelectOption,
	dropdownOptions,
}: PeerRowProperties) => {
	const { t } = useTranslation();

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
			<TableCell variant="start" innerClassName={rowColor}>
				<div className="relative flex w-full flex-col md-lg:h-5 md-lg:overflow-hidden">
					<div className="flex max-w-72 flex-col md-lg:absolute md-lg:inset-0 md-lg:max-w-full">
						<TruncatedWithTooltip
							className="cursor-pointer truncate text-sm font-semibold text-theme-secondary-900 transition-colors duration-100 dark:text-theme-dark-50"
							text={name}
						/>

						<TruncatedWithTooltip
							className="text-xs font-semibold text-theme-secondary-700 dark:text-theme-dark-200 md-lg:hidden"
							text={publicApiEndpoint}
						/>
					</div>
				</div>
			</TableCell>

			<TableCell className="hidden md-lg:table-cell" innerClassName={rowColor}>
				<TruncatedWithTooltip
					text={publicApiEndpoint}
					className="cursor-pointer text-sm font-semibold text-theme-secondary-900 transition-colors duration-100 dark:text-theme-dark-50 md:max-w-72 lg:max-w-44 xl:max-w-72"
				/>
				{/*<div>*/}
				{/*	<span className="text-blue-600 font-medium">Tx:</span> 194.168.4.67:8002*/}
				{/*</div>*/}
				{/*<div>*/}
				{/*	<span className="text-blue-600 font-medium">EVM:</span> 194.168.4.67:8003*/}
				{/*</div>*/}
			</TableCell>

			<TableCell innerClassName={rowColor}>
				<div className="flex h-11 items-center text-theme-secondary-900 dark:text-theme-dark-50">
					{height === undefined ? (
						<span className="text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</span>
					) : (
						<span className="text-sm font-semibold">{formattedHeight}</span>
					)}
				</div>
			</TableCell>

			<TableCell innerClassName={rowColor}>
				<div className="flex h-11 items-center">
					<CustomPeerStatusIcon status={serverStatus} />
				</div>
			</TableCell>

			<TableCell variant="end" innerClassName={rowColor}>
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
								className="text-theme-secondary-700 dark:text-theme-dark-200"
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
	index: number;
	profile: Contracts.IProfile;
	normalizedNetwork: NormalizedNetwork;
	onDelete: (network: NormalizedNetwork) => void;
	onUpdate: (network: NormalizedNetwork) => void;
	onToggle: (isEnabled: boolean) => void;
	// TODO: break it down into smaller components.
}> = ({ index, normalizedNetwork, onDelete, onUpdate, onToggle, profile }) => {
	const { persist } = useEnvironmentContext();
	const { name, publicApiEndpoint, transactionApiEndpoint, evmApiEndpoint, height, enabled } = normalizedNetwork;

	const { t } = useTranslation();

	const { serverStatus, syncStatus } = useServerStatus({
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
								<div
									className={cn("items-center gap-1", {
										flex: !isExpanded,
										"hidden sm:flex": isExpanded,
									})}
								>
									<CustomPeerStatusIcon status={serverStatus} />

									<Divider type="vertical" />
								</div>

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
						bodyClassName={cn("overflow-auto sm:grid-cols-3", { "hidden sm:grid": !isExpanded })}
					>
						<MobileTableElementRow
							title={t("COMMON.IP_ADDRESS")}
							className="overflow-auto"
							bodyClassName="overflow-auto"
						>
							<TruncatedWithTooltip
								text={publicApiEndpoint}
								className="block text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50"
							/>
						</MobileTableElementRow>

						<MobileTableElementRow title={t("COMMON.HEIGHT")}>
							<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
								{height}
							</span>
						</MobileTableElementRow>

						<MobileTableElementRow title={t("COMMON.TYPE")}>
							<div className="flex items-center space-x-3 text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
								<Icon
									className="text-theme-secondary-700"
									size="lg"
									name="ServerPeer"
								/>
								<div>{t("COMMON.PEER")}</div>
							</div>
						</MobileTableElementRow>

						<MobileTableElementRow title={t("COMMON.STATUS")} className="sm:hidden">
							<div className="flex items-center space-x-3 text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
								<CustomPeerStatusIcon status={serverStatus} />
								<div>
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
								</div>
							</div>
						</MobileTableElementRow>

						<div className="grid grid-cols-3 gap-2 border-t border-dashed border-theme-secondary-300 pt-4 dark:border-theme-dark-700 sm:hidden">
							<Button variant="secondary" size="sm" onClick={() => handleSelectOption({ value: "edit" })}>
								<Icon name="Pencil" />
							</Button>

							<Button
								variant="secondary"
								size="sm"
								onClick={() => handleSelectOption({ value: "refresh" })}
							>
								<Icon name="ArrowRotateLeft" />
							</Button>

							<Button variant="danger" size="sm" onClick={() => handleSelectOption({ value: "delete" })}>
								<Icon name="Trash" />
							</Button>
						</div>
					</MobileTableElement>
				</td>
			</tr>
		);
	}

	const render = () => {
		return Array.from({length: 3}, (_, index) => (
			<PeerRow
				name={name}
				publicApiEndpoint={publicApiEndpoint}
				evmApiEndpoint={evmApiEndpoint}
				transactionApiEndpoint={transactionApiEndpoint}
				checked={index === 0}
				height={height}
				serverStatus={serverStatus}
				onToggle={onToggle}
				onSelectOption={handleSelectOption}
				dropdownOptions={dropdownOptions}
			/>
		))
	}

	return render();
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
			Header: t("COMMON.NETWORK"),
			disableSortBy: true,
			headerClassName: "no-border w-1/3",
		},
		{
			Header: t("COMMON.IP_ADDRESS"),
			disableSortBy: true,
			headerClassName: "hidden md-lg:table-cell no-border",
		},
		{
			Header: t("COMMON.HEIGHT"),
			disableSortBy: true,
			headerClassName: "no-border",
			minimumWidth: true,
		},
		{
			Header: t("COMMON.STATUS"),
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
