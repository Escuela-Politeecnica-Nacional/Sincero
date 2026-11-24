import type { CSSProperties } from 'react';
import { ASSETS } from '../data/mockData';

export type MascotPose = keyof Omit<typeof ASSETS.tico, 'logo'>;

const ALT: Record<MascotPose, string> = {
  saludando: 'Tico, el osito de anteojos con bufanda azul, saluda con la mano.',
  celebrando: 'Tico celebra con los brazos en alto.',
  respirando: 'Tico respira tranquilo con los ojos cerrados y las manos en la pancita.',
  lupa: 'Tico observa con una lupa.',
};

interface MascotProps {
  pose: MascotPose;
  size?: number;
  ring?: number;
  /** Color del borde inferior del círculo. */
  edgeColor?: string;
  /** Si es decorativo, se oculta a lectores de pantalla. */
  decorative?: boolean;
  className?: string;
  imagePosition?: string;
}

export function Mascot({
  pose,
  size = 120,
  ring = 6,
  edgeColor = '#d8b878',
  decorative = false,
  className,
  imagePosition = 'center',
}: MascotProps) {
  const style = {
    '--mascot-size': `${size}px`,
    '--mascot-ring': `${ring}px`,
    '--mascot-edge-color': edgeColor,
  } as CSSProperties;

  return (
    <div className={['mascot', className].filter(Boolean).join(' ')} style={style}>
      <img
        src={ASSETS.tico[pose]}
        alt={decorative ? '' : ALT[pose]}
        aria-hidden={decorative || undefined}
        style={{ objectPosition: imagePosition }}
        draggable={false}
      />
    </div>
  );
}
