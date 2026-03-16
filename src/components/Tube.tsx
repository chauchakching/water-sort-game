import { motion } from 'framer-motion';
import { range } from '../utils/fp';

const TUBE_INNER_WIDTH = 48;
const SEGMENT_HEIGHT = 36;
const TOP_HEIGHT = 18;

type TubeState = 'default' | 'selected' | 'completed' | 'hintSource' | 'hintDest' | 'invalid';

function getTubeState({
  selected,
  completed,
  isHintSource,
  isHintDest,
  isInvalid,
}: {
  selected: boolean;
  completed: boolean;
  isHintSource: boolean;
  isHintDest: boolean;
  isInvalid: boolean;
}): TubeState {
  if (isInvalid) return 'invalid';
  if (completed) return 'completed';
  if (isHintSource) return 'hintSource';
  if (isHintDest) return 'hintDest';
  if (selected) return 'selected';
  return 'default';
}

const STATE_STYLES: Record<
  TubeState,
  { borderColor: string; boxShadow: string; y: number }
> = {
  default: {
    borderColor: 'rgba(255,255,255,0.18)',
    boxShadow: '0 0 0px transparent',
    y: 0,
  },
  selected: {
    borderColor: '#38bdf8',
    boxShadow: '0 0 20px rgba(56,189,248,0.5)',
    y: -12,
  },
  completed: {
    borderColor: '#34d399',
    boxShadow: '0 0 20px rgba(52,211,153,0.45)',
    y: 0,
  },
  hintSource: {
    borderColor: '#fbbf24',
    boxShadow: '0 0 22px rgba(251,191,36,0.6)',
    y: -8,
  },
  hintDest: {
    borderColor: '#a78bfa',
    boxShadow: '0 0 22px rgba(167,139,250,0.6)',
    y: 0,
  },
  invalid: {
    borderColor: '#f87171',
    boxShadow: '0 0 16px rgba(248,113,113,0.5)',
    y: 0,
  },
};

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

export const Tube = ({
  size,
  colors,
  selected,
  completed,
  isHintSource,
  isHintDest,
  isInvalid,
  onClick,
}: {
  size: number;
  colors: string[];
  selected: boolean;
  completed: boolean;
  isHintSource: boolean;
  isHintDest: boolean;
  isInvalid: boolean;
  onClick: () => void;
}) => {
  const state = getTubeState({ selected, completed, isHintSource, isHintDest, isInvalid });
  const { borderColor, boxShadow, y } = STATE_STYLES[state];

  const isPulsing = state === 'hintSource' || state === 'hintDest';

  return (
    <motion.div
      onClick={onClick}
      variants={shakeVariants}
      animate={isInvalid ? 'shake' : 'idle'}
      style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}
      aria-label={`Tube with ${colors.filter(Boolean).length} of ${size} slots filled`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <motion.div
        animate={{ y, boxShadow }}
        transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        style={{
          width: TUBE_INNER_WIDTH + 4,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `2px solid ${borderColor}`,
          borderRight: `2px solid ${borderColor}`,
          borderBottom: `2px solid ${borderColor}`,
          borderRadius: '0 0 9999px 9999px',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease',
        }}
      >
        {/* tube opening */}
        <div style={{ height: TOP_HEIGHT }} />

        {/* water segments */}
        {range(0, size - 1)
          .reverse()
          .map((i: number) => {
            const colorClass = colors[i] ? `bg-${colors[i]}` : '';
            return (
              <motion.div
                key={i}
                className={colorClass}
                initial={false}
                animate={
                  isPulsing && colors[i]
                    ? { opacity: [1, 0.65, 1] }
                    : { opacity: 1 }
                }
                transition={
                  isPulsing
                    ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                    : {}
                }
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
    </motion.div>
  );
};
