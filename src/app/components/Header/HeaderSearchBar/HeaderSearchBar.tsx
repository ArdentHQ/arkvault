import cn from "classnames";
import React, { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import tw, { styled } from "twin.macro";

import { HeaderSearchBarProperties } from "./HeaderSearchBar.contracts";
import { ControlButton } from "@/app/components/ControlButton";
import { Icon } from "@/app/components/Icon";
import { Input } from "@/app/components/Input";
import { clickOutsideHandler, useDebounce } from "@/app/hooks";

const SearchBarInputWrapper = styled.div`
	${tw`xs:[min-width:300px] sm:[min-width:448px] dark:border dark:border-theme-secondary-800`}
`;

export const HeaderSearchBar: FC<HeaderSearchBarProperties> = ({
	offsetClassName,
	placeholder,
	label = "Search",
	noToggleBorder,
	onSearch,
	extra,
	maxLength,
	onReset,
	defaultQuery = "",
	debounceTimeout = 500,
	resetFields = false,
	alwaysDisplayClearButton = false,
	...properties
}) => {
	const { t } = useTranslation();

	const [searchbarVisible, setSearchbarVisible] = useState(false);
	const [query, setQuery] = useState(defaultQuery);

	const reference = useRef(null);
	useEffect(() => clickOutsideHandler(reference, () => setSearchbarVisible(false)), [reference]);

	const [debouncedQuery] = useDebounce(query, debounceTimeout);
	useEffect(() => onSearch?.(debouncedQuery), [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleQueryReset = useCallback(() => {
		setQuery("");
		onReset?.();
	}, [onReset]);

	useEffect(() => {
		if (resetFields) {
			handleQueryReset();
		}
	}, [resetFields, handleQueryReset]);
	return (
		<div data-testid="HeaderSearchBar" className="relative -my-2" {...properties}>
			<ControlButton
				isChanged={!!query}
				noBorder={noToggleBorder}
				onClick={() => setSearchbarVisible(true)}
				type="button"
			>
				<div className="flex h-5 items-center gap-2">
					<span className="hidden md:block">{label}</span>
					<Icon name="MagnifyingGlassAlt" size="lg" />
				</div>
			</ControlButton>

			{searchbarVisible && (
				<SearchBarInputWrapper
					data-testid="HeaderSearchBar__input"
					ref={reference}
					className={cn(
						"absolute z-50 -mx-10 flex items-center rounded-lg bg-theme-background px-6 py-2.5 text-base shadow-xl",
						offsetClassName || "top-1/2 -translate-y-1/2",
						{
							"right-0": noToggleBorder,
							"right-3": !noToggleBorder,
						},
					)}
				>
					{extra && (
						<div className="flex items-center">
							<div>{extra}</div>
							<div className="mr-8 h-10 border-l border-theme-secondary-300 dark:border-theme-secondary-800" />
						</div>
					)}

					<button
						data-testid="header-search-bar__reset"
						className={cn("transition-all duration-300 focus:outline-none", {
							"mr-4": query !== "" || alwaysDisplayClearButton,
						})}
						onClick={handleQueryReset}
						type="button"
					>
						<Icon
							className={cn(
								"text-theme-text transition-all duration-300",
								{ "w-0": query === "" && !alwaysDisplayClearButton },
								{ "w-4": query !== "" || alwaysDisplayClearButton },
							)}
							name="Cross"
							size="md"
							data-testid="header-search-bar__reset-icon"
						/>
					</button>

					<div className="flex-1">
						<Input
							className="-ml-4"
							placeholder={placeholder || `${t("COMMON.SEARCH")}...`}
							innerClassName="font-normal"
							value={query}
							maxLength={maxLength}
							isFocused
							ignoreContext
							onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
							noBorder
							noShadow
						/>
					</div>

					<Icon
						className="text-theme-primary-300 dark:text-theme-secondary-600"
						name="MagnifyingGlass"
						size="lg"
					/>
				</SearchBarInputWrapper>
			)}
		</div>
	);
};
