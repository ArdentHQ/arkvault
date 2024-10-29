import cn from "classnames";
import React, { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import tw, { styled } from "twin.macro";

import { HeaderSearchInputProperties } from "./HeaderSearchInput.contracts";
import { Icon } from "@/app/components/Icon";
import { Input } from "@/app/components/Input";
import { useDebounce } from "@/app/hooks";

const SearchBarInputWrapper = styled.div`
	${tw`xs:[min-width:300px] sm:[min-width:448px] dark:border dark:border-theme-secondary-800`}
`;

export const HeaderSearchInput: FC<HeaderSearchInputProperties> = ({
	placeholder,
	onSearch,
	onReset,
	defaultQuery = "",
	debounceTimeout = 500,
	resetFields = false,
	maxLength,
}) => {
	const { t } = useTranslation();

	const [query, setQuery] = useState(defaultQuery);

	const reference = useRef(null);

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
		<div data-testid="HeaderSearchInput" className="relative">
			<SearchBarInputWrapper
				data-testid="HeaderSearchInput__input"
				ref={reference}
				className="flex items-center overflow-hidden rounded-lg border border-theme-secondary-400 bg-theme-background px-4 text-base dark:border-theme-secondary-700"
			>
				<button
					data-testid="HeaderSearchInput__input__reset"
					className={cn("transition-all duration-300 focus:outline-none", { "mr-4": query !== "" })}
					onClick={handleQueryReset}
					type="button"
				>
					<Icon
						className={cn(
							"text-theme-text transition-all duration-300",
							{ "w-0": query === "" },
							{ "w-4": query !== "" },
						)}
						name="Cross"
						size="md"
					/>
				</button>

				<div className="flex-1">
					<Input
						data-testid="HeaderSearchInput__input__input"
						className="-ml-4"
						placeholder={placeholder || `${t("COMMON.SEARCH")}...`}
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
					className="text-theme-secondary-700 dark:text-theme-secondary-600"
					name="MagnifyingGlassAlt"
					size="lg"
				/>
			</SearchBarInputWrapper>
		</div>
	);
};
