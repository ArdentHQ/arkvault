import React, { useEffect, useRef } from "react";

import { useModal } from "./hooks";
import { ModalContainer, ModalContent } from "./Modal.blocks";
import { Size } from "@/types";
import { useNavigationContext } from "@/app/contexts";
import { DefaultTFuncReturn } from "i18next";

interface ModalProperties extends JSX.IntrinsicAttributes {
	children: React.ReactNode;
	title: string | React.ReactNode;
	titleClass?: string;
	description?: string | JSX.Element | DefaultTFuncReturn;
	banner?: React.ReactNode;
	image?: React.ReactNode;
	noButtons?: boolean;
	hideCloseButton?: boolean;
	size?: Size;
	isOpen: boolean;
	onClose?: any;
	onClick?: any;
}

const Modal = ({
	isOpen,
	description,
	title,
	titleClass,
	banner,
	image,
	noButtons,
	hideCloseButton,
	size,
	children,
	onClose,
	...attributes
}: ModalProperties) => {
	const referenceShouldClose = useRef<boolean>();
	const { setShowMobileNavigation } = useNavigationContext();

	useModal({ isOpen, onClose });

	useEffect(() => {
		if (isOpen) {
			setShowMobileNavigation(false);
		} else {
			setShowMobileNavigation(true);
		}

		return () => setShowMobileNavigation(true);
	}, [isOpen]);

	if (!isOpen) {
		return <></>;
	}

	const handleClickOverlay = (event: React.MouseEvent<HTMLElement>) => {
		if (referenceShouldClose.current === undefined) {
			referenceShouldClose.current = true;
		}

		if (!referenceShouldClose.current) {
			referenceShouldClose.current = undefined;
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		onClose?.();
	};

	const handleClickContent = () => {
		referenceShouldClose.current = false;
	};

	return (
		<div
			className="overflow-overlay fixed inset-0 z-50 flex w-full overflow-y-auto bg-theme-secondary-900-rgba bg-opacity-60 dark:bg-black-rgba dark:bg-opacity-80 md:py-20"
			onClick={handleClickOverlay}
			data-testid="Modal__overlay"
			{...attributes}
		>
			<ModalContainer
				size={size}
				onMouseDown={handleClickContent}
				onMouseUp={handleClickContent}
				onClick={handleClickContent}
				tabIndex={-1}
			>
				<ModalContent
					aria-selected={isOpen}
					title={title}
					titleClass={titleClass}
					description={description}
					banner={banner}
					image={image}
					onClose={onClose}
					hideCloseButton={hideCloseButton}
					noButtons={noButtons}
				>
					{children}
				</ModalContent>
			</ModalContainer>
		</div>
	);
};

Modal.displayName = "Modal";

export { Modal };
