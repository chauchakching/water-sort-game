import { motion } from 'framer-motion';
import * as React from 'react';

export const Button = (props: React.ComponentProps<typeof motion.button>) => {
  return (
    <motion.button
      type="button"
      whileHover={{ backgroundColor: '#f9f9f9' }}
      whileTap={{ scale: 0.98, backgroundColor: '#f9f9f9' }}
      {...props}
      className={`border px-2 rounded ml-4 bg-white ${props.className ?? ''}`}
    ></motion.button>
  );
};
