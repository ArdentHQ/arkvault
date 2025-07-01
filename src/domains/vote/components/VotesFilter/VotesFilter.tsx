import React from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";

import { FilterProperties } from "./VotesFilter.contracts";
import { Checkbox } from "@/app/components/Checkbox";
import { Dropdown } from "@/app/components/Dropdown";
import { Tooltip } from "@/app/components/Tooltip";
import { Button } from "@/app/components/Button";

export const VotesFilter = ({
	onChange,
	selectedOption = "all",
	totalCurrentVotes,
	...properties
}: FilterProperties) => {
	const { t } = useTranslation();

	return (
		<div {...properties} className="mr-6 hidden md:block">
			<Dropdown
				data-testid="VotesFilter"
				variant="votesFilter"
				placement="bottom-end"
				toggleContent={
					<Button variant="secondary" size="sm" icon="Funnel" className="h-8">
						<span className="text-base font-semibold">{t("COMMON.TYPE")}</span>
					</Button>
				}
			>
				<div className="text-theme-secondary-700 dark:text-theme-secondary-200 dim:text-theme-dim-200 flex w-56 flex-col items-start space-y-5 px-10 py-7">
					<label
						className="flex h-5 cursor-pointer items-center space-x-3 rounded-md"
						data-testid="VotesFilter__option--all"
					>
						<Checkbox
							name="all"
							checked={selectedOption === "all"}
							onChange={() => onChange?.("all")}
							onKeyDown={(event) => {
								/* istanbul ignore next -- @preserve */
								if (event.key === "Enter" || event.key === " ") {
									onChange?.("all");
								}
							}}
						/>
						<span className="text-base font-medium">{t("VOTE.FILTERS.ALL")}</span>
					</label>

					<Tooltip placement="bottom-start" content={totalCurrentVotes === 0 && t("VOTE.FILTERS.NO_VOTES")}>
						<label
							className={cn("flex h-5 items-center space-x-3 rounded-md", {
								"cursor-pointer": totalCurrentVotes,
								"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-700":
									!totalCurrentVotes,
							})}
							data-testid="VotesFilter__option--current"
						>
							<Checkbox
								disabled={totalCurrentVotes === 0}
								name="current"
								checked={selectedOption === "current"}
								onChange={() => onChange?.("current")}
								onKeyDown={(event) => {
									/* istanbul ignore next -- @preserve */
									if (event.key === "Enter" || event.key === " ") {
										onChange?.("current");
									}
								}}
							/>
							<span className="text-base font-medium">{t("VOTE.FILTERS.CURRENT_VOTES")}</span>
						</label>
					</Tooltip>
				</div>
			</Dropdown>
		</div>
	);
};
