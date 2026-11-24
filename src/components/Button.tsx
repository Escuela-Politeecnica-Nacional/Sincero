import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface StyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: ReactNode;
  className?: string;
}

function classes({ variant = 'secondary', size = 'md', block, className }: StyleProps) {
  return ['btn', `btn--${variant}`, size !== 'md' && `btn--${size}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ');
}

export function Button({
  variant,
  size,
  block,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variant, size, block, className })} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  icon,
  className,
  children,
  ...rest
}: StyleProps & LinkProps) {
  return (
    <Link className={classes({ variant, size, block, className })} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
