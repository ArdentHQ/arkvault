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
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { Toggle } from "@/app/components/Toggle";
import { useServerStatus } from "@/domains/setting/pages/Servers/hooks/use-server-status";
import { useEnvironmentContext } from "@/app/contexts";
import { AccordionContent, AccordionHeader, AccordionWrapper } from "@/app/components/Accordion";
import { networkDisplayName } from "@/utils/network-utils";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { MobileTableElement, MobileTableElementRow } from "@/app/components/MobileTableElement";

interface PeerRowProperties {
	name: string;
	address: string;
	checked: boolean;
	height: number | undefined;
	serverStatus?: boolean;
	serverType: Networks.NetworkHost["type"];
	onToggle: (isEnabled: boolean) => void;
	onSelectOption: ({ value }: DropdownOption) => void;
	dropdownOptions: DropdownOption[];
}

const PeerRow = ({
	name,
	address,
	checked,
	height,
	serverStatus,
	serverType,
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
				<div className="flex flex-col overflow-auto">
					<div className="cursor-pointer truncate text-sm font-semibold text-theme-secondary-900 transition-colors duration-100 dark:text-theme-dark-50">
						<TruncateEnd text={name} maxChars={20} />
					</div>
					<div className="truncate text-xs font-semibold text-theme-secondary-700 dark:text-theme-dark-200 md-lg:hidden">
						{address}
					</div>
				</div>
			</TableCell>

			<TableCell className="hidden md-lg:table-cell" innerClassName={rowColor}>
				<div className="cursor-pointer truncate text-sm font-semibold text-theme-secondary-900 transition-colors duration-100 dark:text-theme-dark-50">
					{address}
				</div>
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
	index: number;
	profile: Contracts.IProfile;
	normalizedNetwork: NormalizedNetwork;
	onDelete: (network: NormalizedNetwork) => void;
	onUpdate: (network: NormalizedNetwork) => void;
	onToggle: (isEnabled: boolean) => void;
	// TODO: break it down into smaller components.
}> = ({ index, normalizedNetwork, onDelete, onUpdate, onToggle, profile }) => {
	const { persist } = useEnvironmentContext();
	const { name, network, serverType, address, height, enabled } = normalizedNetwork;

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
			<tr>
				<td className={cn({ "pt-3": index !== 0 })}>
					<MobileTableElement
						title={name}
						titleExtra={
							<div className="flex items-center gap-1">
								<div className="hidden items-center gap-1 sm:flex">
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

								<div className="h-4">
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
							</div>
						}
						bodyClassName="sm:grid-cols-3"
					>
						<MobileTableElementRow title={t("COMMON.IP_ADDRESS")}>
							<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
								{address}
							</span>
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
									name={serverType === "musig" ? "ServerMultisign" : "ServerPeer"}
								/>
								<div>{serverType === "musig" ? t("COMMON.MULTISIG") : t("COMMON.PEER")}</div>
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
					</MobileTableElement>
				</td>
			</tr>
		);
	}

	if (isXs) {
		return (
			<tr>
				<td>
					<div className="-mx-8">
						<AccordionWrapper
							data-testid={
								enabled
									? "CustomPeers-network-item--mobile--checked"
									: "CustomPeers-network-item--mobile"
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

									<div className="truncate font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
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
										onClick={(event: React.MouseEvent | React.KeyboardEvent) =>
											event.stopPropagation()
										}
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
												<div>
													{serverType === "musig" ? t("COMMON.MULTISIG") : t("COMMON.PEER")}
												</div>
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
				</td>
			</tr>
		);
	}

	return (
		<PeerRow
			name={name}
			address={address}
			checked={enabled}
			height={height}
			serverStatus={serverStatus}
			serverType={serverType}
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
			Header: t("COMMON.NETWORK"),
			disableSortBy: true,
			headerClassName: "no-border",
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
			Header: t("COMMON.TYPE"),
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
