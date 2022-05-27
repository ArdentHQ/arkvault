import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Networks } from "@payvo/sdk";
import { useForm } from "react-hook-form";
import { Modal } from "@/app/components/Modal";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { InputDefault } from "@/app/components/Input";
import { CustomNetwork, NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { useHandleServers } from "@/domains/setting/hooks/use-handle-servers";
import { Button } from "@/app/components/Button";
import { Alert } from "@/app/components/Alert";
import { useActiveProfile, useNetworkOptions, useValidation } from "@/app/hooks";
import { SelectNetworkDropdown } from "@/app/components/SelectNetworkDropdown/SelectNetworkDropdown";
import { networkDisplayName, profileAllEnabledNetworkIds } from "@/utils/network-utils";

const ServerFormModal: React.VFC<{
	onClose: () => void;
	onCreate: (network: NormalizedNetwork) => void;
	onUpdate: (network: NormalizedNetwork) => void;
	networks: Networks.Network[];
	customNetworks: NormalizedNetwork[];
	networkToUpdate: NormalizedNetwork | undefined;
}> = ({ onClose, onCreate, onUpdate, networks, networkToUpdate, customNetworks }) => {
	const profile = useActiveProfile();
	const { networkById } = useNetworkOptions({ profile });
	const { server } = useValidation();
	const [nameWasManuallySet, setNameWasManuallySet] = useState(!!networkToUpdate);

	const { t } = useTranslation();

	const form = useForm<CustomNetwork>({
		defaultValues: {
			address: networkToUpdate?.address ?? "",
			name: networkToUpdate?.name ?? "",
			network: networkToUpdate?.network.id() ?? "",
			serverType: networkToUpdate?.serverType ?? undefined,
		},
		mode: "onChange",
	});

	const { formState, setValue, register, watch } = form;
	const { isValid } = formState;
	const { address, network } = watch();

	const addressIsValid = useMemo(() => {
		const { errors } = formState;
		return errors.address === undefined;
	}, [formState]);

	const { fetchingDetails, networkMismatch, serverType, serverHeight, fetchingError } = useHandleServers({
		address,
		addressIsValid,
		network: networks.find((item) => item.id() === network),
		profile,
	});

	useEffect(() => {
		if (!network || !serverType || nameWasManuallySet) {
			return;
		}

		const getName = (counter: number) =>
			`${networkDisplayName(networkObject)} ${serverType === "musig" ? "Musig" : "Peer"} #${counter}`;

		const networkObject = networkById(network)!;

		const filteredNetworks = customNetworks.filter(
			(customNetwork) =>
				customNetwork.network.id() === networkObject.id() && customNetwork.serverType === serverType,
		);

		let counter = filteredNetworks.length;

		if (counter === 0) {
			counter = 1;
		}

		while (filteredNetworks.some((network) => network.name === getName(counter))) {
			counter++;
		}

		setValue("name", getName(counter), {
			shouldDirty: true,
			shouldValidate: true,
		});
	}, [network, serverType, customNetworks, nameWasManuallySet, address]);

	const renderServerType = useCallback(() => {
		if (fetchingDetails) {
			return (
				<div data-testid="Servertype-fetching" className="flex items-center space-x-2">
					<Icon className="text-theme-secondary-300 dark:text-theme-secondary-800" name="Clock" />

					<span className="font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("SETTINGS.SERVERS.ADD_NEW_SERVER.FETCHING_DETAILS")}
					</span>
				</div>
			);
		}

		if (!serverType || networkMismatch) {
			return (
				<div data-testid="Servertype-unknown" className="flex items-center space-x-2">
					<Icon className="text-theme-secondary-300 dark:text-theme-secondary-800" name="Forbidden" />

					<span className="font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("COMMON.NOT_AVAILABLE")}
					</span>
				</div>
			);
		}

		return (
			<div data-testid="Servertype-type" className="flex items-center space-x-2">
				<Icon
					className="text-theme-secondary-600 dark:text-theme-secondary-700"
					name={serverType === "musig" ? "ServerMultisign" : "ServerPeer"}
				/>

				<span className="font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{serverType === "musig"
						? t("SETTINGS.SERVERS.ADD_NEW_SERVER.MULTISIG_SERVER")
						: t("SETTINGS.SERVERS.ADD_NEW_SERVER.PEER_SERVER")}
				</span>
			</div>
		);
	}, [fetchingDetails, serverType]);

	const formIsValid = useMemo(() => {
		if (fetchingDetails) {
			return false;
		}

		if (!serverType) {
			return false;
		}

		if (networkMismatch) {
			return false;
		}

		return isValid;
	}, [isValid, serverType, isValid, fetchingDetails, networkMismatch]);

	const handleSubmit = (values: CustomNetwork) => {
		if (networkToUpdate) {
			return onUpdate({
				address: values.address,
				enabled: !!networkToUpdate?.enabled,
				height: serverHeight,
				name: values.name,
				network: networkById(values.network)!,
				serverType: serverType!,
			});
		}

		onCreate({
			address: values.address,
			enabled: false,
			height: serverHeight,
			name: values.name,
			network: networkById(values.network)!,
			serverType: serverType!,
		});
	};

	return (
		<Modal
			data-testid="ServerFormModal"
			isOpen
			size="xl"
			title={
				networkToUpdate ? t("SETTINGS.SERVERS.EDIT_SERVER.TITLE") : t("SETTINGS.SERVERS.ADD_NEW_SERVER.TITLE")
			}
			description={
				networkToUpdate
					? t("SETTINGS.SERVERS.EDIT_SERVER.DESCRIPTION")
					: t("SETTINGS.SERVERS.ADD_NEW_SERVER.DESCRIPTION")
			}
			onClose={onClose}
		>
			<Form context={form} onSubmit={handleSubmit} className="mt-6 space-y-4">
				<FormField name="network">
					<FormLabel label={t("COMMON.NETWORK")} />
					<div data-testid="ServerFormModal--network">
						<SelectNetworkDropdown
							networks={networks.filter((network) =>
								profileAllEnabledNetworkIds(profile).includes(network.id()),
							)}
							profile={profile}
							ref={register(server.network())}
							selectedNetwork={networks.find((networkOption) => networkOption.id() === network)}
							placeholder={t("COMMON.INPUT_NETWORK.PLACEHOLDER")}
							onChange={(selectedNetwork) => {
								setValue("network", selectedNetwork?.id(), {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
						/>
					</div>
				</FormField>
				<FormField name="address">
					<FormLabel label={t("COMMON.ADDRESS")} />
					<InputDefault
						data-testid="ServerFormModal--address"
						placeholder={t("SETTINGS.SERVERS.ADD_NEW_SERVER.NETWORK_PLACEHOLDER")}
						ref={register(server.address(customNetworks, networkToUpdate))}
					/>
				</FormField>
				<FormField name="name">
					<FormLabel label={t("COMMON.NAME")} />
					<InputDefault
						data-testid="ServerFormModal--name"
						ref={register(server.name(customNetworks, networkToUpdate))}
						onChange={() => setNameWasManuallySet(true)}
					/>
				</FormField>
				<FormField name="type">
					<FormLabel label={t("COMMON.TYPE")} />

					{renderServerType()}

					{fetchingError && !networkMismatch && (
						<Alert data-testid="ServerFormModal-alert" className="mt-3" variant="danger">
							{t("SETTINGS.SERVERS.ADD_NEW_SERVER.FETCHING_ERROR")}
						</Alert>
					)}

					{networkMismatch && (
						<Alert data-testid="ServerFormModal-alert" className="mt-3" variant="danger">
							{t("SETTINGS.SERVERS.ADD_NEW_SERVER.NETWORK_MISMATCH_ERROR")}
						</Alert>
					)}
				</FormField>

				<FormButtons>
					<Button data-testid="ServerFormModal--save" disabled={!formIsValid} type="submit">
						{networkToUpdate ? t("COMMON.SAVE") : t("COMMON.ADD")}
					</Button>
				</FormButtons>
			</Form>
		</Modal>
	);
};

export default ServerFormModal;
