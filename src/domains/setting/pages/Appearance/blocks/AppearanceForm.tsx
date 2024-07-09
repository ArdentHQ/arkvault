import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { ListDivided } from "@/app/components/ListDivided";
import { useEnvironmentContext } from "@/app/contexts";
import { useAccentColor, useBreakpoint, useTheme } from "@/app/hooks";
import { toasts } from "@/app/services";
import { useSettingsPrompt } from "@/domains/setting/hooks/use-settings-prompt";
import { AppearanceSettingsState } from "@/domains/setting/pages/Appearance/Appearance.contracts";
import { useAppearanceItems, useAppearanceSettings } from "@/domains/setting/pages/Appearance/Appearance.helpers";
import { useZendesk } from "@/app/contexts/Zendesk";

interface AppearanceFormProperties {
	profile: Contracts.IProfile;
}

export const AppearanceForm: React.FC<AppearanceFormProperties> = ({ profile }) => {
	const { t } = useTranslation();

	const { getValues, setValues } = useAppearanceSettings(profile);
	const { hideSupportChat, showSupportChat, isSupportChatOpen } = useZendesk();

	const items = useAppearanceItems();

	const form = useForm<AppearanceSettingsState>({
		defaultValues: getValues(),
		mode: "onChange",
	});

	const { formState, register, reset } = form;
	const { dirtyFields, isDirty, isSubmitting, isValid } = formState;

	const { isXs } = useBreakpoint();

	const { persist } = useEnvironmentContext();
	const { getPromptMessage: _ } = useSettingsPrompt({ dirtyFields, isDirty });

	const { setProfileTheme } = useTheme();
	const { setProfileAccentColor } = useAccentColor();

	useEffect(() => {
		register("accentColor", { required: true });
		register("viewingMode", { required: true });
	}, [register]);

	const save = async (values: AppearanceSettingsState) => {
		const isChatOpen = isSupportChatOpen();

		hideSupportChat();
		setValues(values);

		await persist();

		setProfileTheme(profile);
		setProfileAccentColor(profile);

		reset(getValues());

		toasts.success(t("SETTINGS.GENERAL.SUCCESS"));
		window.scrollTo({ behavior: "smooth", top: 0 });

		if (isChatOpen) {
			showSupportChat(profile);
		}
	};

	return (
		<Form data-testid="AppearanceForm" context={form} onSubmit={save} className="mt-8">
			<ListDivided items={items} noBorder={isXs} />

			<FormButtons>
				<Button
					data-testid="AppearanceFooterButtons__save"
					disabled={isSubmitting || isDirty ? !isValid : true}
					type="submit"
				>
					{t("COMMON.SAVE")}
				</Button>
			</FormButtons>

			{/*<Prompt message={getPromptMessage} />*/}
		</Form>
	);
};
