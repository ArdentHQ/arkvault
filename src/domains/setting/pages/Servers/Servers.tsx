import React, { useEffect, useMemo, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useForm } from "react-hook-form";
import { useTranslation, Trans } from "react-i18next";
import { Prompt } from "react-router-dom";
import { NormalizedNetwork } from "./Servers.contracts";
import { useHosts } from "./hooks/use-hosts";
import { useCustomNetworks } from "./hooks/use-custom-networks";
import { FallbackToDefaultNodesToggle } from "@/domains/setting/pages/Servers/blocks/FallbackToDefaultNodesToggle";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { ListDivided } from "@/app/components/ListDivided";
import { useActiveProfile, useBreakpoint, useNetworks, useProfileJobs } from "@/app/hooks";
import { SettingsWrapper } from "@/domains/setting/components/SettingsPageWrapper";
import NodesStatus from "@/domains/setting/pages/Servers/blocks/NodesStatus";
import CustomPeers from "@/domains/setting/pages/Servers/blocks/CustomPeers";
import ServerFormModal from "@/domains/setting/pages/Servers/blocks/ServerFormModal";
import { toasts } from "@/app/services";
import { useEnvironmentContext } from "@/app/contexts";
import { DeleteResource } from "@/app/components/DeleteResource";
import { useSettingsPrompt } from "@/domains/setting/hooks/use-settings-prompt";
import { networkDisplayName, profileAllEnabledNetworkIds } from "@/utils/network-utils";

export const ServersSettings = () => {
	const { t } = useTranslation();

	const { isXs } = useBreakpoint();

	const { persist, env } = useEnvironmentContext();
	const profile = useActiveProfile();
	const { syncServerStatus } = useProfileJobs(profile);
	const { updateNetworks } = useHosts({ profile });
	const { allCustomNetworks, updateNetwork, removeNetwork, addNetwork } = useCustomNetworks(env, profile);
	const [showServerFormModal, setShowServerFormModal] = useState(false);
	const [networkToDelete, setNetworkToDelete] = useState<NormalizedNetwork | undefined>(undefined);
	const [networkToUpdate, setNetworkToUpdate] = useState<NormalizedNetwork | undefined>(undefined);

	const enabledNetworks = useNetworks({
		filter: (network) => profileAllEnabledNetworkIds(profile).includes(network.id()),
		profile,
	});

	const form = useForm({
		defaultValues: {
			customNetworks: allCustomNetworks,
			fallbackToDefaultNodes: profile.settings().get<boolean>(Contracts.ProfileSetting.FallbackToDefaultNodes),
		},
		mode: "onChange",
	});

	useEffect(() => {
		register("customNetworks");
	}, []);

	const {
		formState: { isValid, isSubmitting, isDirty, dirtyFields },
		reset,
		watch,
		setValue,
		register,
	} = form;

	const { customNetworks } = watch();

	const { getPromptMessage } = useSettingsPrompt({ dirtyFields, isDirty });
	const isProfileRestored = useMemo(() => profile.status().isRestored(), [profile]);

	const isSaveButtonDisabled = useMemo(
		() => isSubmitting || !isProfileRestored || (isDirty ? !isValid : true),
		[isSubmitting, isProfileRestored, isDirty, isValid],
	);

	const closeServerFormModalHandler = () => {
		setShowServerFormModal(false);
		setNetworkToUpdate(undefined);
	};

	const deleteNetworkHandler = (network: NormalizedNetwork) => {
		const updatedNetworks = removeNetwork(network);
		setValue("customNetworks", updatedNetworks, { shouldDirty: true });

		setNetworkToDelete(undefined);
	};

	const handleNetworkUpdate = (network: NormalizedNetwork) => {
		const updatedNetworks = updateNetwork(network);
		setValue("customNetworks", updatedNetworks, { shouldDirty: true });

		toasts.success(
			<Trans
				i18nKey="SETTINGS.SERVERS.EDIT_SERVER.SUCCESS_MESSAGE"
				values={{
					serverName: network.name,
				}}
				components={{ strong: <strong /> }}
			/>,
		);
		closeServerFormModalHandler();
	};

	const handleNetworkCreate = (network: NormalizedNetwork) => {
		const updatedNetworks = addNetwork(network);
		setValue("customNetworks", updatedNetworks, { shouldDirty: true });

		toasts.success(
			<Trans
				i18nKey="SETTINGS.SERVERS.ADD_NEW_SERVER.SUCCESS_MESSAGE"
				values={{
					networkName: networkDisplayName(network.network),
					networkType: network.serverType === "musig" ? "multisig server" : "network peer",
					serverName: network.name,
				}}
				components={{ strong: <strong /> }}
			/>,
		);

		closeServerFormModalHandler();
	};

	const toggleNetwork = (enabled: boolean, network: NormalizedNetwork) => {
		const updatedNetworks = updateNetwork({ ...network, enabled });
		setValue("customNetworks", updatedNetworks, { shouldDirty: true });
	};

	const serverOptions = useMemo(
		() => [
			{
				label: t("SETTINGS.SERVERS.OPTIONS.FALLBACK_TO_DEFAULT_NODES.TITLE"),
				labelAddon: <FallbackToDefaultNodesToggle />,
				labelDescription: t("SETTINGS.SERVERS.OPTIONS.FALLBACK_TO_DEFAULT_NODES.DESCRIPTION"),
				wrapperClass: "py-6",
			},
			{
				content: <NodesStatus networks={enabledNetworks} />,
				label: t("SETTINGS.SERVERS.OPTIONS.DEFAULT_NODE_STATUS.TITLE"),
				labelDescription: t("SETTINGS.SERVERS.OPTIONS.DEFAULT_NODE_STATUS.DESCRIPTION"),
				wrapperClass: "pt-6 pb-3",
			},
			{
				content: (
					<CustomPeers
						profile={profile}
						addNewServerHandler={() => setShowServerFormModal(true)}
						networks={customNetworks}
						onDelete={setNetworkToDelete}
						onUpdate={setNetworkToUpdate}
						onToggle={toggleNetwork}
					/>
				),
				contentClass: "sm:mt-3",
				label: t("SETTINGS.SERVERS.OPTIONS.CUSTOM_PEERS.TITLE"),
				labelDescription: t("SETTINGS.SERVERS.OPTIONS.CUSTOM_PEERS.DESCRIPTION"),
				wrapperClass: "pt-6 sm:pb-6",
			},
		],
		[enabledNetworks, customNetworks],
	);

	const saveSettings = async ({ fallbackToDefaultNodes }) => {
		profile.settings().set(Contracts.ProfileSetting.FallbackToDefaultNodes, fallbackToDefaultNodes);
		updateNetworks(customNetworks);

		await persist();

		toasts.success(t("SETTINGS.GENERAL.SUCCESS"));

		window.scrollTo({ behavior: "smooth", top: 0 });

		reset({
			customNetworks: allCustomNetworks,
			fallbackToDefaultNodes: profile.settings().get<boolean>(Contracts.ProfileSetting.FallbackToDefaultNodes),
		});
		register("customNetworks");

		syncServerStatus();
	};

	return (
		<SettingsWrapper profile={profile} activeSettings="servers">
			<Header
				title={t("SETTINGS.SERVERS.TITLE")}
				subtitle={t("SETTINGS.SERVERS.SUBTITLE")}
				titleClassName="mb-2"
			/>

			<Form id="servers__form" context={form} onSubmit={saveSettings} className="mt-2">
				<ListDivided items={serverOptions} noBorder={isXs} />

				<FormButtons>
					<Button disabled={isSaveButtonDisabled} data-testid="Server-settings__submit-button" type="submit">
						{t("COMMON.SAVE")}
					</Button>
				</FormButtons>
			</Form>

			{(showServerFormModal || networkToUpdate) && (
				<ServerFormModal
					onClose={closeServerFormModalHandler}
					onCreate={handleNetworkCreate}
					onUpdate={handleNetworkUpdate}
					networks={enabledNetworks}
					customNetworks={customNetworks}
					networkToUpdate={networkToUpdate}
				/>
			)}

			{!!networkToDelete && (
				<DeleteResource
					data-testid="ServersSettings--delete-confirmation"
					title={t("SETTINGS.SERVERS.DELETE_MODAL.TITLE")}
					description={
						<Trans
							i18nKey="SETTINGS.SERVERS.DELETE_MODAL.DESCRIPTION"
							values={{
								networkName: networkDisplayName(networkToDelete.network),
								serverName: networkToDelete.name,
							}}
							components={{ strong: <strong /> }}
						/>
					}
					isOpen
					onClose={() => setNetworkToDelete(undefined)}
					onCancel={() => setNetworkToDelete(undefined)}
					onDelete={() => deleteNetworkHandler(networkToDelete)}
				/>
			)}

			<Prompt message={getPromptMessage} />
		</SettingsWrapper>
	);
};
