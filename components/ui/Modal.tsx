"use client";

import React, { useEffect } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	closeOnClickOutside?: boolean; // Por defecto true
	closeOnEscape?: boolean; // Por defecto true
}

export const Modal: React.FC<ModalProps> = ({ 
	isOpen, 
	onClose, 
	title, 
	children,
	closeOnClickOutside = true,
	closeOnEscape = true
}) => {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && closeOnEscape) onClose();
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose, closeOnEscape]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
			<div 
				className="fixed inset-0 bg-black bg-opacity-50" 
				onClick={closeOnClickOutside ? onClose : undefined}
			/>
			<div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
					<h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 pr-2">{title}</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl sm:text-2xl shrink-0 w-8 h-8 flex items-center justify-center"
						aria-label="Cerrar"
					>
						×
					</button>
				</div>
				<div className="p-4 sm:p-6">{children}</div>
			</div>
		</div>
	);
};
