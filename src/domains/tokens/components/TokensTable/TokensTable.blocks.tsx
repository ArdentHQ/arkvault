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
			<tr className="border-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 border-t border-solid md:border-b-4">
				<td colSpan={columnsCount} className="px-6 pt-3 pb-4">
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
				className="border-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 border-solid md:border-b-4"
			>
				<td colSpan={columnsCount} className="pt-[11px] pb-4">
					<p className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500 px-6 py-4 text-center text-sm sm:py-0">
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
			<div className="flex items-center gap-1">
				<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 mr-2 leading-5 font-semibold whitespace-nowrap">
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
				className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 hidden md:block"
			/>

			{!isManageMode && (
				<Button
					data-testid="TokensTable_Manage"
					variant="transparent"
					className="text-theme-primary-600 hover:text-theme-primary-700 dark:text-theme-dark-navy-400 dark:hover:text-theme-navy-500 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-700 px-2 py-1 text-sm hover:underline"
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
						className="text-theme-primary-600 hover:text-theme-primary-700 dark:text-theme-dark-navy-400 dark:hover:text-theme-navy-500 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-700 px-2 py-1 text-sm hover:underline"
						onClick={onCancel}
					>
						{t("COMMON.CANCEL")}
					</Button>

					<Divider type="vertical" size="md" />

					<Button
						data-testid="TokensTable_Save"
						variant="transparent"
						className="text-theme-primary-600 hover:text-theme-primary-700 dark:text-theme-dark-navy-400 dark:hover:text-theme-navy-500 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-700 px-2 py-1 text-sm hover:underline"
						onClick={onSave}
					>
						{t("COMMON.SAVE")}
					</Button>
				</div>
			)}
		</>
	);
};
