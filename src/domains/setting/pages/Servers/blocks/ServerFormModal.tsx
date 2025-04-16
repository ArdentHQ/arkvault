import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Networks } from "@ardenthq/sdk";
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
			evmApiEndpoint: networkToUpdate?.evmApiEndpoint ?? "",
			name: networkToUpdate?.name ?? "",
			network: networkToUpdate?.network.id() ?? "",
			publicApiEndpoint: networkToUpdate?.publicApiEndpoint ?? "",
			transactionApiEndpoint: networkToUpdate?.transactionApiEndpoint ?? "",
		},
		mode: "onChange",
	});

	const { formState, setValue, register, watch } = form;
	const { isValid } = formState;
	const { publicApiEndpoint, transactionApiEndpoint, evmApiEndpoint, network } = watch();

	const { errors } = formState;

	const publicApiEndpointIsValid = errors.publicApiEndpoint === undefined;

	const { fetchingDetails, networkMismatch, serverHeight, fetchingError } = useHandleServers({
		addressIsValid: publicApiEndpointIsValid,
		evmApiEndpoint,
		network: networks.find((item) => item.id() === network),
		profile,
		publicApiEndpoint,
		transactionApiEndpoint,
	});

	useEffect(() => {
		if (!network || nameWasManuallySet) {
			return;
		}

		const getName = (counter: number) =>
			`${networkDisplayName(networkObject)} "Peer" #${counter}`;

		const networkObject = networkById(network)!;

		const filteredNetworks = customNetworks.filter(
			(customNetwork) =>
				customNetwork.network.id() === networkObject.id()
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
	}, [network, customNetworks, nameWasManuallySet]);

	const formIsValid = useMemo(() => {
		if (fetchingDetails) {
			return false;
		}

		if (networkMismatch) {
			return false;
		}

		return isValid;
	}, [isValid, isValid, fetchingDetails, networkMismatch]);

	const handleSubmit = (values: CustomNetwork) => {
		if (networkToUpdate) {
			return onUpdate({
				enabled: !!networkToUpdate.enabled,
				evmApiEndpoint: values.evmApiEndpoint,
				height: serverHeight,
				name: values.name,
				network: networkById(values.network)!,
				publicApiEndpoint: values.publicApiEndpoint,
				transactionApiEndpoint: values.transactionApiEndpoint,
			});
		}

		onCreate({
			enabled: false,
			evmApiEndpoint: values.evmApiEndpoint,
			height: serverHeight,
			name: values.name,
			network: networkById(values.network)!,
			publicApiEndpoint: values.publicApiEndpoint,
			transactionApiEndpoint: values.transactionApiEndpoint,
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

				<FormField name="name">
					<FormLabel label={t("COMMON.NAME")} />
					<InputDefault
						data-testid="ServerFormModal--name"
						ref={register(server.name(customNetworks, networkToUpdate))}
						onChange={() => setNameWasManuallySet(true)}
					/>
				</FormField>

				<FormField name="publicApiEndpoint">
					<FormLabel label={t("SETTINGS.SERVERS.ADD_NEW_SERVER.PUBLIC_API_ENDPOINT")} />
					<InputDefault
						data-testid="ServerFormModal--publicApiEndpoint"
						ref={register(server.address(customNetworks, networkToUpdate))}
					/>
				</FormField>

				<FormField name="transactionApiEndpoint">
					<FormLabel label={t("SETTINGS.SERVERS.ADD_NEW_SERVER.TRANSACTION_API_ENDPOINT")} />
					<InputDefault
						data-testid="ServerFormModal--transactionApiEndpoint"
						ref={register(server.address(customNetworks, networkToUpdate))}
					/>
				</FormField>

				<FormField name="transactionApiEndpoint">
					<FormLabel label={t("SETTINGS.SERVERS.ADD_NEW_SERVER.EVM_API_ENDPOINT")} />
					<InputDefault
						data-testid="ServerFormModal--evmApiEndpoint"
						ref={register(server.address(customNetworks, networkToUpdate))}
					/>
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
