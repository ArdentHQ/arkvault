import cn from "classnames";
import React, { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HeaderSearchInputProperties } from "./HeaderSearchInput.contracts";
import { Icon } from "@/app/components/Icon";
import { Input } from "@/app/components/Input";
import { useDebounce } from "@/app/hooks";

const SearchBarInputWrapper = (
	props: React.HTMLAttributes<HTMLDivElement> & {
		ref?: React.Ref<HTMLDivElement>;
	},
) => (
	<div
		{...props}
		className={cn(
			"dark:border-theme-secondary-800 xs:[min-width:300px] sm:[min-width:448px] dark:border",
			props.className,
		)}
	/>
);

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
				className="border-theme-secondary-400 bg-theme-background dark:border-theme-secondary-700 dim:border-theme-dim-700 flex items-center overflow-hidden rounded-lg border px-4 text-base"
			>
				<button
					data-testid="HeaderSearchInput__input__reset"
					className={cn("transition-all duration-300 focus:outline-hidden", { "mr-4": query !== "" })}
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
					className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500"
					name="MagnifyingGlassAlt"
					size="lg"
				/>
			</SearchBarInputWrapper>
		</div>
	);
};
