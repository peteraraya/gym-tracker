"use client";

import React, { useEffect, useId, useRef } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	closeOnClickOutside?: boolean; // Por defecto true
	closeOnEscape?: boolean; // Por defecto true
	backdropClassName?: string;
	contentClassName?: string;
	suppressCloseOverlay?: boolean;
	hideHeader?: boolean;
	mobileFullScreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
	isOpen, 
	onClose, 
	title, 
	children,
	contentClassName,
	hideHeader = false,
	mobileFullScreen = false,
	suppressCloseOverlay = false,
	closeOnClickOutside = true,
	closeOnEscape = true,
	backdropClassName,
}) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const onCloseRef = useRef(onClose);
	const titleId = useId();

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (!isOpen) return;
		const previousFocus = document.activeElement instanceof HTMLElement
			? document.activeElement
			: null;
		const previousOverflow = document.body.style.overflow;
		const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
		const focusableElements = contentRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
		(focusableElements?.[0] ?? contentRef.current)?.focus();
		document.body.style.overflow = 'hidden';

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && closeOnEscape) {
				onCloseRef.current();
				return;
			}
			if (event.key !== 'Tab') return;

			const elements = contentRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
			if (!elements?.length) {
				event.preventDefault();
				contentRef.current?.focus();
				return;
			}

			const first = elements[0];
			const last = elements[elements.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = previousOverflow;
			if (previousFocus?.isConnected) previousFocus.focus();
		};
	}, [isOpen, closeOnEscape]);

	if (!isOpen) return null;

	const defaultBackdrop = 'bg-black/60 backdrop-blur-sm';

	return (
		<div className={`fixed inset-0 z-50 flex items-center justify-center ${mobileFullScreen ? 'max-sm:items-end max-sm:p-0' : 'p-2 sm:p-4'}`}>
			<div
				className={`fixed inset-0 ${backdropClassName ? backdropClassName : defaultBackdrop}`}
				aria-hidden="true"
				onClick={closeOnClickOutside ? onClose : undefined}
			/>
			<div
				ref={contentRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={hideHeader ? undefined : titleId}
				aria-label={hideHeader ? title : undefined}
				tabIndex={-1}
				className={`relative w-full max-h-[95vh] overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-800 sm:max-h-[90vh] ${mobileFullScreen ? 'max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:rounded-none max-sm:pb-[env(safe-area-inset-bottom)]' : ''} ${contentClassName ?? 'max-w-2xl'}`}
			>
				{!hideHeader ? (
					<>
						<div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
							<h2 id={titleId} className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 pr-2">{title}</h2>
							<button
								type="button"
								onClick={onClose}
								className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-2xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
								aria-label={`Cerrar ${title}`}
							>
								×
							</button>
						</div>
						<div className="p-4 sm:p-6">{children}</div>
					</>
				) : (
					<>
						{!suppressCloseOverlay && (
							<button
								type="button"
								onClick={onClose}
								aria-label={`Cerrar ${title}`}
								className="absolute top-3 right-3 z-20 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/0 hover:bg-white/10 rounded-full p-1.5"
							>
								×
							</button>
							)}
						<div className="p-4 sm:p-6">{children}</div>
					</>
				)}
			</div>
		</div>
	);
};
