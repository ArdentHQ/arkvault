import React, { useEffect, useRef } from "react";

import { DefaultTReturn, TOptions } from "i18next";
import { useModal } from "./hooks";
import { ModalContainer, ModalContent } from "./Modal.blocks";
import { Size } from "@/types";
import { useNavigationContext } from "@/app/contexts";

interface ModalProperties extends JSX.IntrinsicAttributes {
	children: React.ReactNode;
	title: string | React.ReactNode;
	titleClass?: string;
	description?: string | JSX.Element | DefaultTReturn<TOptions>;
	banner?: React.ReactNode;
	image?: React.ReactNode;
	noButtons?: boolean;
	hideCloseButton?: boolean;
	size?: Size;
	isOpen: boolean;
	onClose?: any;
	onClick?: any;
	contentClassName?: string;
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
	contentClassName,
	...attributes
}: ModalProperties) => {
	const referenceShouldClose = useRef<boolean>();
	const { setShowMobileNavigation } = useNavigationContext();
	const modalContainerReference = useRef<HTMLDivElement>(null);

	const { overflowYClass } = useModal({
		isOpen,
		modalContainerReference,
		onClose,
	});

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
			className={`custom-scroll overflow-overlay fixed inset-0 z-50 flex w-full ${overflowYClass} bg-theme-secondary-900-rgba/40 dark:bg-black-rgba/40 dark:bg-opacity-80 md:py-20 backdrop-blur-xl`}
			onClick={handleClickOverlay}
			data-testid="Modal__overlay"
			{...attributes}
		>
			<ModalContainer
				ref={modalContainerReference}
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
					className={contentClassName}
				>
					{children}
				</ModalContent>
			</ModalContainer>
		</div>
	);
};

Modal.displayName = "Modal";

export { Modal };
