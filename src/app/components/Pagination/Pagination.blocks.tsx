import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export const PaginationSearchWrapper = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    (properties, ref) => {
        return <span {...properties} ref={ref} className={twMerge("pagination-search-wrapper", properties.className)} />;
    }
);

PaginationSearchWrapper.displayName = "PaginationSearchWrapper";

export const SearchInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (properties, ref) => {
        return <input {...properties} ref={ref} className={twMerge("search-input", properties.className)} />;
    }
);

SearchInput.displayName = "SearchInput";

export const PaginationSearchToggleButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (properties, ref) => {
        return <button {...properties} ref={ref} className={twMerge("pagination-search-toggle-button", properties.className)} />;
    }
);

PaginationSearchToggleButton.displayName = "PaginationSearchToggleButton";

export const PaginationButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (properties, ref) => {
        return <button {...properties} ref={ref} className={twMerge("pagination-button", properties.className)} />;
    }
);

PaginationButton.displayName = "PaginationButton";

export const PaginationWrapper = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
    (properties, ref) => {
        return <nav {...properties} ref={ref} className={twMerge("pagination-wrapper", properties.className)} />;
    }
);

PaginationWrapper.displayName = "PaginationWrapper";