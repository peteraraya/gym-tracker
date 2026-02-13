'use client';

import React from 'react';
import Image from 'next/image';
import { MuscleGroup } from '@/data/exercises';

interface IconProps {
    className?: string;
    size?: number;
}

// Mapeo de grupos musculares a sus imágenes correspondientes
const MUSCLE_GROUP_IMAGES: Record<MuscleGroup, string> = {
    pecho: '/icons/muscles/pectoral.png',
    espalda: '/icons/muscles/espalda.png',
    piernas: '/icons/muscles/piernas.png',
    hombros: '/icons/muscles/hombros.png',
    biceps: '/icons/muscles/biceps.png',
    triceps: '/icons/muscles/biceps.png', // Usar la misma imagen de brazos
    antebrazos: '', // SVG inline
    trapecio: '', // SVG inline
    cuello: '', // SVG inline
    core: '/icons/muscles/abdomen.png',
    gluteos: '/icons/muscles/gluteos.png',
    gemelos: '/icons/muscles/gemelos.png',
    cardio: '' // SVG inline
};

// Componente wrapper para usar dinámicamente
interface MuscleGroupIconProps extends IconProps {
    muscleGroup: MuscleGroup;
}

export const MuscleGroupIcon: React.FC<MuscleGroupIconProps> = ({
    muscleGroup,
    className,
    size = 250
}) => {
    const imagePath = MUSCLE_GROUP_IMAGES[muscleGroup];

    // Ícono SVG para cardio
    if (muscleGroup === 'cardio') {
        return (
            <div
                className={className}
                style={{
                    width: size,
                    height: size,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    <path
                        d="M3.5 12h3l2 3 2-6 2 3h3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>
            </div>
        );
    }

    // Ícono SVG para antebrazos
    if (muscleGroup === 'antebrazos') {
        return (
            <div
                className={className}
                style={{
                    width: size,
                    height: size,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {/* Brazo/antebrazo */}
                    <path
                        d="M8 4 L8 12 L6 14 L6 20 L10 20 L10 14 L8 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    <path
                        d="M16 4 L16 12 L18 14 L18 20 L14 20 L14 14 L16 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    {/* Mancuerna */}
                    <circle cx="8" cy="3" r="1.5" fill="currentColor" />
                    <circle cx="16" cy="3" r="1.5" fill="currentColor" />
                    <line x1="8" y1="3" x2="16" y2="3" stroke="currentColor" strokeWidth="1.5" />
                    {/* Líneas de músculo */}
                    <line x1="7" y1="15" x2="9" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <line x1="7" y1="17" x2="9" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <line x1="15" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <line x1="15" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                </svg>
            </div>
        );
    }

    // Ícono SVG para trapecio
    if (muscleGroup === 'trapecio') {
        return (
            <div
                className={className}
                style={{
                    width: size,
                    height: size,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {/* Cabeza */}
                    <circle cx="12" cy="5" r="2.5" stroke="currentColor" strokeWidth="2" fill="none" />
                    {/* Trapecio - forma de trapecio */}
                    <path
                        d="M7 8 L5 14 L10 16 L12 15 L14 16 L19 14 L17 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    {/* Líneas de músculo */}
                    <line x1="9" y1="10" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                    <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                    <line x1="15" y1="10" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                    {/* Hombros */}
                    <circle cx="7" cy="8" r="1" fill="currentColor" />
                    <circle cx="17" cy="8" r="1" fill="currentColor" />
                </svg>
            </div>
        );
    }

    // Ícono SVG para cuello
    if (muscleGroup === 'cuello') {
        return (
            <div
                className={className}
                style={{
                    width: size,
                    height: size,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {/* Cabeza */}
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                    {/* Cuello */}
                    <path
                        d="M10 11 L10 16 L14 16 L14 11"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    {/* Líneas de músculo del cuello */}
                    <line x1="10.5" y1="12" x2="10.5" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    <line x1="13.5" y1="12" x2="13.5" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    {/* Hombros */}
                    <path
                        d="M8 16 L6 18 M16 16 L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        );
    }

    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Image
                src={imagePath}
                alt={muscleGroup}
                width={size}
                height={size}
                style={{
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%'
                }}
                unoptimized
            />
        </div>
    );
};

// Exportar el mapeo por si se necesita en otro lugar
export { MUSCLE_GROUP_IMAGES };
