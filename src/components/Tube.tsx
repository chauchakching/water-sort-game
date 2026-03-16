import { motion } from 'framer-motion';
import { range } from '../utils/fp';

const TUBE_INNER_WIDTH = 48;
const SEGMENT_HEIGHT = 36;
const TOP_HEIGHT = 18;

export const Tube = ({
  size,
  colors,
  selected,
  completed,
  onClick,
}: {
  size: number;
  colors: string[];
  selected: boolean;
  completed: boolean;
  onClick: () => void;
}) => {
  const borderColor = completed
    ? '#34d399' // emerald-400
    : selected
      ? '#38bdf8' // sky-400
      : 'rgba(255,255,255,0.2)';

  const boxShadow = completed
    ? '0 0 18px rgba(52,211,153,0.55)'
    : selected
      ? '0 0 18px rgba(56,189,248,0.55)'
      : '0 0 0px transparent';

  return (
    <motion.div
      onClick={onClick}
      animate={{
        y: selected ? -12 : 0,
        boxShadow,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        width: TUBE_INNER_WIDTH + 4,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `2px solid ${borderColor}`,
        borderRight: `2px solid ${borderColor}`,
        borderBottom: `2px solid ${borderColor}`,
        borderRadius: '0 0 9999px 9999px',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {/* tube opening indicator */}
      <div style={{ height: TOP_HEIGHT }} />

      {/* water segments, rendered top→bottom (index size-1 down to 0) */}
      {range(0, size - 1)
        .reverse()
        .map((i: number) => {
          const colorClass = colors[i] ? `bg-${colors[i]}` : '';
          return (
            <div
              key={i}
              className={colorClass}
              style={{
                width: TUBE_INNER_WIDTH,
                height: SEGMENT_HEIGHT,
                borderBottomLeftRadius: i === 0 ? 9999 : 0,
                borderBottomRightRadius: i === 0 ? 9999 : 0,
              }}
            />
          );
        })}
    </motion.div>
  );
};
