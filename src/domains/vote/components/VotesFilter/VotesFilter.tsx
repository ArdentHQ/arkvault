import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";

import { FilterProperties } from "./VotesFilter.contracts";
import { Checkbox } from "@/app/components/Checkbox";
import { ControlButton } from "@/app/components/ControlButton";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";

export const VotesFilter = ({
	onChange,
	selectedOption = "all",
	totalCurrentVotes,
	...properties
}: FilterProperties) => {
	const { t } = useTranslation();

	return (
		<div data-testid="VotesFilter" {...properties}>
			<Dropdown
				variant="votesFilter"
				placement="bottom-end"
				toggleContent={
					<ControlButton isChanged={selectedOption !== "all"}>
						<div className="flex h-5 w-5 items-center justify-center">
							<Icon name="SlidersVertical" size="lg" />
						</div>
					</ControlButton>
				}
			>
				<div className="flex w-56 flex-col items-start space-y-5 px-10 py-7 text-theme-secondary-700 dark:text-theme-secondary-200">
					<label
						className="flex h-5 cursor-pointer items-center space-x-3 rounded-md"
						data-testid="VotesFilter__option--all"
					>
						<Checkbox name="all" checked={selectedOption === "all"} onChange={() => onChange?.("all")} />
						<span className="text-base font-medium">{t("VOTE.FILTERS.ALL")}</span>
					</label>

					<Tooltip
						placement="bottom-start"
						content={totalCurrentVotes === 0 && "You have not yet voted for delegates"}
					>
						<label
							className={cn("flex h-5 items-center space-x-3 rounded-md", {
								"cursor-pointer": totalCurrentVotes,
								"text-theme-secondary-500 dark:text-theme-secondary-700": !totalCurrentVotes,
							})}
							data-testid="VotesFilter__option--current"
						>
							<Checkbox
								disabled={totalCurrentVotes === 0}
								name="current"
								checked={selectedOption === "current"}
								onChange={() => onChange?.("current")}
							/>
							<span className="text-base font-medium">{t("VOTE.FILTERS.CURRENT_VOTES")}</span>
						</label>
					</Tooltip>
				</div>
			</Dropdown>
		</div>
	);
};
