import { motion } from 'framer-motion';
import * as React from 'react';

export const Button = (props: React.ComponentProps<typeof motion.button>) => {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98, backgroundColor: '#f9f9f9' }}
      style={{ backgroundColor: '#fff' }}
      {...props}
      className={`border px-2 rounded ml-4 ${props.className ?? ''}`}
    ></motion.button>
  );
};
