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
    brazos: '/icons/muscles/biceps.png',
    core: '/icons/muscles/abdomen.png',
    gluteos: '/icons/muscles/gluteos.png',
    pantorrillas: '/icons/muscles/pantorrilla.png'
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
