import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Prompt } from "react-router-dom";
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import NetworkFormModal from "./blocks/NetworkFormModal";
import UpdateNetworkFormModal from "./blocks/UpdateNetworkFormModal";
import { useSettingsPrompt } from "@/domains/setting/hooks/use-settings-prompt";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { ListDivided } from "@/app/components/ListDivided";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { SettingsWrapper } from "@/domains/setting/components/SettingsPageWrapper";
import { toasts } from "@/app/services";
import { Toggle } from "@/app/components/Toggle";
import { useEnvironmentContext } from "@/app/contexts";
import NetworksList from "@/domains/setting/pages/Networks/blocks/NetworksList";
import CustomNetworksList from "@/domains/setting/pages/Networks/blocks/CustomNetworksList";
import DeleteCustomNetworkModal from "@/domains/setting/pages/Networks/blocks/DeleteCustomNetworkModal";
import CustomNetworkDetailsModal from "@/domains/setting/pages/Networks/blocks/CustomNetworkDetailsModal";
import { isCustomNetwork, profileEnabledNetworkIds } from "@/utils/network-utils";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";
import { useWalletConfig } from "@/domains/wallet/hooks";
import { getProfileStoredPassword } from "@/utils/profile-utils";

export const NetworksSettings = () => {
	const { t } = useTranslation();

	const { isXs } = useBreakpoint();

	const getProfileNetworksList = () => {
		const profileNetworks = profile.networks().all();

		return Object.keys(profileNetworks).flatMap((key) => {
			const networkGroup = profileNetworks[key];
			return Object.keys(networkGroup).map((networkKey) => networkGroup[networkKey]);
		});
	};

	const getSelectedNetworks = () =>
		getProfileNetworksList()
			.filter((network) => !isCustomNetwork(network) || network.meta.enabled)
			.map((network) => network.id);

	const getCustomNetworks = () => getProfileNetworksList().filter((network) => isCustomNetwork(network));

	const { env, persist } = useEnvironmentContext();
	const profile = useActiveProfile();
	const [selectedNetworks, setSelectedNetworks] = useState(getSelectedNetworks());
	const [mounted, setMounted] = useState(false);
	const [showNetworkFormModal, setShowNetworkFormModal] = useState(false);
	const [networkToDelete, setNetworkToDelete] = useState<Networks.NetworkManifest | undefined>(undefined);
	const [deletedNetworkIds, setDeletedNetworkIds] = useState<string[]>([]);
	const [networkToUpdate, setNetworkToUpdate] = useState<Networks.NetworkManifest | undefined>(undefined);
	const [networkToShowDetails, setNetworkToShowDetails] = useState<Networks.NetworkManifest | undefined>(undefined);
	const { setValue: setWalletConfig } = useWalletConfig({ profile });

	const defaultNetworks = useMemo(
		() => env.availableNetworks().filter((item) => ["ark.devnet", "ark.mainnet"].includes(item.id())),
		[env, profile],
	);

	const getDefaultValues = () => {
		const selectedNetworks: string[] = getSelectedNetworks();

		const customNetworks = getCustomNetworks();

		return {
			customNetworks: customNetworks,
			selectedNetworks: selectedNetworks,
			useCustomNetworks: customNetworks.some((customNetwork) => customNetwork.meta.enabled),
		};
	};

	const form = useForm<{
		useCustomNetworks: boolean;
		selectedNetworks: string[];
		customNetworks: Networks.NetworkManifest[];
	}>({
		defaultValues: getDefaultValues(),
		mode: "onChange",
	});

	const {
		formState: { isValid, isSubmitting, isDirty, dirtyFields },
		register,
		setValue,
		watch,
		reset,
	} = form;

	useEffect(() => {
		register("selectedNetworks");
		register("customNetworks");
	}, [register]);

	const { customNetworks, useCustomNetworks } = watch();

	const isProfileRestored = useMemo(() => profile.status().isRestored(), [profile]);

	const isSaveButtonDisabled = useMemo(
		() => isSubmitting || !isProfileRestored || (isDirty ? !isValid : true),
		[isSubmitting, isProfileRestored, isDirty, isValid],
	);

	const hasMoreThanOneDefaultNetworkSelected = useMemo(
		() => defaultNetworks.filter((item) => selectedNetworks.includes(item.id())).length > 1,
		[defaultNetworks, selectedNetworks],
	);

	const selectNetwork = (networkId: string) => {
		setSelectedNetworks((state) => [...state, networkId]);
	};

	const unselectNetwork = (networkId: string) => {
		setSelectedNetworks((state) => state.filter((item) => item !== networkId));
	};

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		setValue("selectedNetworks", selectedNetworks, {
			shouldDirty: true,
		});
	}, [selectedNetworks]);

	const enableCustomNetworks = () => {
		setValue(
			"customNetworks",
			customNetworks.map((customNetwork) => {
				const enabled = !!customNetwork.meta?.previouslyEnabled;

				if (enabled) {
					selectNetwork(customNetwork.id);
				}

				return {
					...customNetwork,
					meta: {
						...customNetwork.meta,
						enabled,
						previouslyEnabled: undefined,
					},
				};
			}),
			{ shouldDirty: true },
		);

		setValue("useCustomNetworks", true);
	};

	const disableCustomNetworks = () => {
		setValue(
			"customNetworks",
			customNetworks.map((customNetwork) => ({
				...customNetwork,
				meta: {
					...customNetwork.meta,
					enabled: false,
					previouslyEnabled: !!customNetwork.meta?.enabled,
				},
			})),
			{ shouldDirty: true },
		);

		setSelectedNetworks((state) => state.filter((networkId) => !networkId.endsWith(".custom")));

		setValue("useCustomNetworks", false);
	};

	const onToggleNetwork = (event: React.ChangeEvent<HTMLInputElement>, networkId: string) => {
		const isCustomNetwork = customNetworks.some((item) => item.id === networkId);

		if (selectedNetworks.includes(networkId)) {
			if (!isCustomNetwork && !hasMoreThanOneDefaultNetworkSelected) {
				toasts.warning(t("SETTINGS.NETWORKS.MESSAGES.AT_LEAST_ONE_DEFAULT_NETWORK"));

				event.target.checked = true;
				event.preventDefault();
				return;
			}

			unselectNetwork(networkId);
		} else {
			selectNetwork(networkId);
		}
	};

	const showDeleteNetworkConfirmation = (networkId: string) => {
		setNetworkToDelete(customNetworks.find((network) => network.id === networkId));
	};

	const deleteNetworkHandler = () => {
		// At this point the networkToDelete is always set
		const deletedNetworkId = networkToDelete!.id;

		setValue(
			"customNetworks",
			customNetworks.filter((network) => network.id !== networkToDelete!.id),
			{ shouldDirty: true },
		);

		toasts.success(
			<Trans
				i18nKey="SETTINGS.NETWORKS.MESSAGES.CUSTOM_NETWORK_DELETED"
				values={{ networkName: networkToDelete!.name }}
			/>,
		);

		setNetworkToDelete(undefined);

		setDeletedNetworkIds((networkIds) => [...networkIds, deletedNetworkId]);
	};

	const showUpdateNetworkModal = (networkId: string) => {
		setNetworkToUpdate(customNetworks.find((network) => network.id === networkId));
	};

	const networkUpdateHandler = (newNetworkData: Networks.NetworkManifest) => {
		const networkToUpdateIndex = customNetworks.findIndex((network) => network.id === networkToUpdate!.id);
		const currentCustomNetworks = [...customNetworks];
		currentCustomNetworks[networkToUpdateIndex] = { ...newNetworkData, id: networkToUpdate!.id };
		setValue("customNetworks", currentCustomNetworks, { shouldDirty: true });
		setNetworkToUpdate(undefined);
	};

	const showNetworkDetails = (networkId: string) => {
		setNetworkToShowDetails(customNetworks.find((network) => network.id === networkId));
	};

	const networkCreateHandler = (network: Networks.NetworkManifest) => {
		setValue("customNetworks", [...customNetworks, network], { shouldDirty: true, shouldValidate: true });

		selectNetwork(network.id);

		setShowNetworkFormModal(false);

		toasts.success(
			<Trans i18nKey="SETTINGS.NETWORKS.MESSAGES.CUSTOM_NETWORK_ADDED" values={{ networkName: network.name }} />,
		);
	};

	const networksOptions = useMemo(
		() => [
			{
				content: (
					<div data-testid="NetworksList--main">
						<NetworksList
							selectedNetworks={selectedNetworks}
							networks={defaultNetworks}
							onToggleNetwork={onToggleNetwork}
						/>
					</div>
				),
				label: t("SETTINGS.NETWORKS.OPTIONS.DEFAULT_NETWORKS.TITLE"),
				labelDescription: t("SETTINGS.NETWORKS.OPTIONS.DEFAULT_NETWORKS.DESCRIPTION"),
				wrapperClass: "pb-6",
			},
			{
				content: useCustomNetworks && (
					<div data-testid="NetworksList--custom">
						<CustomNetworksList
							selectedNetworks={selectedNetworks}
							networks={customNetworks}
							onToggle={onToggleNetwork}
							onDelete={showDeleteNetworkConfirmation}
							onUpdate={showUpdateNetworkModal}
							onInfo={showNetworkDetails}
							onAdd={() => setShowNetworkFormModal(true)}
						/>
					</div>
				),
				label: t("SETTINGS.NETWORKS.OPTIONS.CUSTOM_NETWORKS.TITLE"),
				labelAddon: (
					<Toggle
						ref={register}
						name="useCustomNetworks"
						defaultChecked={useCustomNetworks}
						data-testid="Plugin-settings__networks--useCustomNetworks"
						onChange={({ target }) => {
							if (target.checked) {
								enableCustomNetworks();
							} else {
								disableCustomNetworks();
							}
						}}
					/>
				),
				labelDescription: t("SETTINGS.NETWORKS.OPTIONS.CUSTOM_NETWORKS.DESCRIPTION"),
				wrapperClass: "pt-6 sm:pb-6",
			},
		],
		[selectedNetworks, useCustomNetworks, customNetworks],
	);

	const deleteUnsupportedWallets = (profile: Contracts.IProfile) => {
		const walletsToDelete = profile
			.wallets()
			.values()
			.filter((wallet) => deletedNetworkIds.includes(wallet.network().id()));

		for (const wallet of walletsToDelete) {
			profile.wallets().forget(wallet.id());
		}
	};

	const deleteUnsupportedContacts = (profile: Contracts.IProfile) => {
		for (const contact of profile.contacts().values()) {
			for (const address of contact.addresses().values()) {
				if (deletedNetworkIds.includes(address.network())) {
					contact.addresses().forget(address.id());
				}
			}
		}

		for (const contact of profile.contacts().values()) {
			if (contact.addresses().count() === 0) {
				profile.contacts().forget(contact.id());
			}
		}
	};

	const handleSubmit = async ({
		selectedNetworks,
		customNetworks,
	}: {
		selectedNetworks: string[];
		customNetworks: Networks.NetworkManifest[];
	}) => {
		const networkEntries = {};

		for (const networkId of selectedNetworks.filter((networkId) => !networkId.endsWith(".custom"))) {
			networkEntries[networkId] = env
				.availableNetworks()
				.find((network) => network.id() === networkId)
				?.toObject();
		}

		for (const customNetwork of customNetworks) {
			networkEntries[customNetwork.id] = {
				...customNetwork,
				meta: {
					...customNetwork.meta,
					enabled: selectedNetworks.includes(customNetwork.id),
				},
			};
		}

		// Clean network repository
		for (const networkId of Object.keys(profile.networks().all())) {
			profile.networks().forget(networkId);
		}

		// Add selected networks
		profile.networks().fill(networkEntries);

		deleteUnsupportedContacts(profile);
		deleteUnsupportedWallets(profile);
		setDeletedNetworkIds([]);

		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, {
			...(profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration) as DashboardConfiguration),
			selectedNetworkIds: profileEnabledNetworkIds(profile),
		});

		setWalletConfig("selectedNetworkIds", profileEnabledNetworkIds(profile));

		await persist();

		await env.profiles().restore(profile, getProfileStoredPassword(profile));
		await profile.sync();

		toasts.success(t("SETTINGS.GENERAL.SUCCESS"));

		window.scrollTo({ behavior: "smooth", top: 0 });

		reset(getDefaultValues());
	};

	const { getPromptMessage } = useSettingsPrompt({ dirtyFields, isDirty });

	return (
		<SettingsWrapper profile={profile} activeSettings="networks">
			<Header
				title={t("SETTINGS.NETWORKS.TITLE")}
				subtitle={t("SETTINGS.NETWORKS.SUBTITLE")}
				titleClassName="mb-2"
			/>

			<Form id="Networks--form" context={form} onSubmit={handleSubmit} className="mt-6">
				<ListDivided items={networksOptions} noBorder={isXs} />

				<FormButtons>
					<Button disabled={isSaveButtonDisabled} data-testid="Networks--submit-button" type="submit">
						{t("COMMON.SAVE")}
					</Button>
				</FormButtons>
			</Form>

			{showNetworkFormModal && (
				<NetworkFormModal
					customNetworks={customNetworks}
					onClose={() => setShowNetworkFormModal(false)}
					onCreate={networkCreateHandler}
				/>
			)}

			{!!networkToUpdate && (
				<UpdateNetworkFormModal
					network={networkToUpdate}
					customNetworks={customNetworks}
					onClose={() => setNetworkToUpdate(undefined)}
					onUpdate={networkUpdateHandler}
				/>
			)}

			{!!networkToDelete && (
				<DeleteCustomNetworkModal
					network={networkToDelete}
					onCancel={() => setNetworkToDelete(undefined)}
					onDelete={deleteNetworkHandler}
				/>
			)}

			{!!networkToShowDetails && (
				<CustomNetworkDetailsModal
					network={networkToShowDetails}
					onCancel={() => setNetworkToShowDetails(undefined)}
				/>
			)}

			<Prompt message={getPromptMessage} />
		</SettingsWrapper>
	);
};
