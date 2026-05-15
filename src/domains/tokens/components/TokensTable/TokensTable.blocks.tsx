import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import React from "react";
import { useEnvironmentContext } from "@/app/contexts";
import { Toggle } from "@/app/components/Toggle";
import { ProfileSetting } from "@/app/lib/profiles/profile.enum.contract";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { Contracts } from "@/app/lib/profiles";

export const TokensTableFooter = ({
	tokensCount,
	columnsCount,
	hasMore,
	isLoadingMore,
	isLoading,
	fetchMore,
}: {
	tokensCount: number;
	columnsCount: number;
	hasMore: boolean;
	isLoading: boolean;
	isLoadingMore: boolean;
	fetchMore: () => Promise<void>;
}) => {
	const { t } = useTranslation();

	if (isLoading) {
		return;
	}

	if (hasMore) {
		return (
			<tr className="border-t border-solid border-theme-secondary-200 dim:border-theme-dim-700 dark:border-theme-secondary-800 md:border-b-4">
				<td colSpan={columnsCount} className="px-6 pb-4 pt-3">
					<Button
						data-testid="tokens__fetch-more-button"
						variant="secondary"
						className="w-full py-1.5 leading-5"
						disabled={isLoadingMore}
						onClick={() => fetchMore()}
					>
						{isLoadingMore ? t("COMMON.LOADING") : t("COMMON.LOAD_MORE")}
					</Button>
				</td>
			</tr>
		);
	}

	if (tokensCount === 0) {
		return (
			<tr
				data-testid="EmptyResults"
				className="border-solid border-theme-secondary-200 dim:border-theme-dim-700 dark:border-theme-secondary-800 md:border-b-4"
			>
				<td colSpan={columnsCount} className="pb-4 pt-[11px]">
					<p className="px-6 py-4 text-center text-sm text-theme-secondary-700 dim:text-theme-dim-500 dark:text-theme-secondary-600 sm:py-0">
						{t("TOKENS.EMPTY_TOKENS")}
					</p>
				</td>
			</tr>
		);
	}
};

export const TokensTableHeader = ({
	activeProfile,
	toggleManageMode,
	isManageMode,
	onCancel,
	onSave,
}: {
	activeProfile: Contracts.IProfile;
	isManageMode: boolean;
	toggleManageMode: (isManageMode: boolean) => void;
	onSave: () => void;
	onCancel: () => void;
}) => {
	const { persist } = useEnvironmentContext();
	const { t } = useTranslation();

	return (
		<>
			<div className="flex items-center gap-1" data-testid="HideDustTokens__Wrapper">
				<div className="mr-2 whitespace-nowrap font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
					{t("TOKENS.HIDE_DUST")}
				</div>

				<Toggle
					data-testid="HideDustTokens"
					name="hideDust"
					defaultChecked={activeProfile.settings().get(ProfileSetting.HideDustTokens)}
					onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
						activeProfile.settings().set(ProfileSetting.HideDustTokens, event.target.checked);
						await persist();
					}}
				/>
			</div>

			<Divider
				type="vertical"
				size="md"
				className="hidden border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-secondary-800"
			/>

			{!isManageMode && (
				<Button
					data-testid="TokensTable_Manage"
					variant="transparent"
					className="group px-2 py-1 text-sm text-theme-primary-600 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dark:bg-transparent dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50"
					onClick={() => {
						toggleManageMode(true);
					}}
				>
					<Icon name="Gear" />
					{t("COMMON.MANAGE")}
				</Button>
			)}

			{isManageMode && (
				<div className="flex items-center gap-1">
					<Button
						data-testid="TokensTable_Cancel"
						variant="transparent"
						className="group px-2 py-1 text-sm text-theme-primary-600 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dark:bg-transparent dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50"
						onClick={onCancel}
					>
						{t("COMMON.CANCEL")}
					</Button>

					<Divider type="vertical" size="md" />

					<Button
						data-testid="TokensTable_Save"
						variant="transparent"
						className="group px-2 py-1 text-sm text-theme-primary-600 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dark:bg-transparent dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50"
						onClick={onSave}
					>
						{t("COMMON.SAVE")}
					</Button>
				</div>
			)}
		</>
	);
};
