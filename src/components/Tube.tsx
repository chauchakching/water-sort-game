import { motion } from 'framer-motion';
import { range } from '../utils/fp';

export const Tube = ({
  size,
  colors,
  selected,
  onClick,
}: {
  size: number;
  colors: string[];
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.div
      className={`flex flex-col border-t-white border-2 w-7 cursor-pointer ${
        selected ? 'border-current' : ''
      }`}
      onClick={onClick}
      animate={{ scale: selected ? 1.1 : 1 }}
      transition={{ type: 'spring', stiffness: 1500, damping: 30 }}
    >
      <div className={`w-3 h-3`}></div>
      {range(0, size - 1)
        .reverse()
        .map((i: number) => {
          const color = colors[i] ? `bg-${colors[i]}` : '';
          return <div key={i} className={`w-6 h-6 ${color}`}></div>;
        })}
    </motion.div>
  );
};
