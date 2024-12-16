import { BigNumber } from "@ardenthq/sdk-helpers";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PaginationSearchFormProperties, PaginationSearchProperties } from "./Pagination.contracts";
import { Button } from "@/app/components/Button";
import { Form } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { clickOutsideHandler } from "@/app/hooks";
import { PaginationSearchToggleButton, PaginationSearchWrapper, SearchInput } from "./Pagination.blocks";

export const PaginationSearchForm = ({
	onClose,
	totalPages = Number.POSITIVE_INFINITY,
	onSelectPage,
}: PaginationSearchFormProperties) => {
	const { t } = useTranslation();

	const form = useForm({ mode: "onChange" });
	const { register, watch } = form;

	const { page } = watch();

	useEffect(() => {
		if (!page) {
			return;
		}

		if (totalPages === Number.POSITIVE_INFINITY) {
			return;
		}

		if (BigNumber.make(page).isGreaterThan(totalPages)) {
			form.setValue("page", totalPages);
		}
	}, [page, form, totalPages]);

	const handleSelectPage = () => {
		if (!page) {
			return;
		}

		const pageNumber = BigNumber.make(page);

		if (pageNumber.isGreaterThan(0)) {
			onSelectPage(pageNumber.toNumber());
		}
	};

	const reference = useRef<HTMLFormElement>(null);

	useEffect(() => {
		const searchInput = reference.current!.querySelector("input") as HTMLInputElement;

		searchInput.focus();

		clickOutsideHandler(reference, onClose);
	}, [reference, onClose]);

	return (
		<PaginationSearchWrapper>
			<Form
				data-testid="PaginationSearchForm"
				context={form}
				onSubmit={handleSelectPage}
				name="searchForm"
				className="search-form"
				ref={reference}
			>
				<SearchInput
					ref={register}
					type="number"
					min="1"
					max={totalPages}
					name="page"
					data-testid="PaginationSearch__input"
					placeholder={t("COMMON.PAGINATION.ENTER_NUMBER")}
				/>

				<Button
					variant="transparent"
					type="submit"
					size="sm"
					className="search-control"
					data-testid="PaginationSearch__submit"
				>
					<Icon name="MagnifyingGlass" />
				</Button>

				<Button
					variant="transparent"
					size="sm"
					onClick={onClose}
					type="button"
					className="search-control"
					data-testid="PaginationSearch__cancel"
				>
					<Icon name="Cross" />
				</Button>
			</Form>
		</PaginationSearchWrapper>
	);
};

export const PaginationSearch = ({
	children,
	onClick,
	onSelectPage,
	totalPages,
	isDisabled,
}: PaginationSearchProperties) => {
	const [isFormVisible, setIsFormVisible] = useState(false);

	return (
		<>
			<PaginationSearchToggleButton
				data-testid="PaginationSearchButton"
				className={`group${isFormVisible ? "invisible" : ""}`}
				type="button"
				disabled={isDisabled}
				onClick={(event) => {
					onClick();
					setIsFormVisible(true);
					(event.currentTarget as HTMLButtonElement).blur();
				}}
			>
				<span className="group-hover:invisible">{children}</span>

				<span
					data-testid="PaginationSearchButton__search"
					className="invisible absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center group-hover:visible"
				>
					<Icon name="MagnifyingGlass" />
				</span>
			</PaginationSearchToggleButton>

			{isFormVisible && (
				<PaginationSearchForm
					totalPages={totalPages}
					onClose={() => {
						onSelectPage(undefined);
						setIsFormVisible(false);
					}}
					onSelectPage={onSelectPage}
				/>
			)}
		</>
	);
};
