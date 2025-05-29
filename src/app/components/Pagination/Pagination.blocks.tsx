import React from "react";
import { twMerge } from "tailwind-merge";

export const PaginationSearchWrapper = (
	properties: React.HTMLAttributes<HTMLSpanElement> & { ref?: React.Ref<HTMLSpanElement> },
) => (
	<span {...properties} ref={properties.ref} className={twMerge("pagination-search-wrapper", properties.className)} />
);

export const SearchInput = (
	properties: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> },
) => <input {...properties} ref={properties.ref} className={twMerge("search-input", properties.className)} />;

export const PaginationSearchToggleButton = (
	properties: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> },
) => (
	<button
		{...properties}
		ref={properties.ref}
		className={twMerge("pagination-search-toggle-button", properties.className)}
	/>
);

export const PaginationButton = (
	properties: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> },
) => <button {...properties} ref={properties.ref} className={twMerge("pagination-button", properties.className)} />;

export const PaginationWrapper = (
	properties: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLDivElement> },
) => <nav {...properties} ref={properties.ref} className={twMerge("pagination-wrapper", properties.className)} />;
