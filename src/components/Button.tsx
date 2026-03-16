import { motion } from 'framer-motion';
import * as React from 'react';

type Variant = 'primary' | 'ghost' | 'icon';

interface ButtonProps extends React.ComponentProps<typeof motion.button> {
  variant?: Variant;
}

export const Button = ({ variant = 'ghost', className, ...props }: ButtonProps) => {
  const variantClass =
    variant === 'primary'
      ? 'bg-sky-500 hover:bg-sky-400 text-white px-5 py-2'
      : variant === 'icon'
        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 p-2'
        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      {...props}
      className={`rounded-lg font-medium text-sm cursor-pointer transition-colors ${variantClass} ${className ?? ''}`}
    />
  );
};
