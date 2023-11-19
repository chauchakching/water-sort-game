import { motion } from "framer-motion";
import { range } from "../utils/fp";

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
      className={`flex flex-col border-b-2 border-l-2 border-r-2 rounded-b-full w-7 cursor-pointer`}
      onClick={onClick}
      animate={
        selected
          ? { scale: 1.1, boxShadow: "6px 6px 8px rgba(0,0,0,0.2)" }
          : { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" }
      }
      transition={{ type: "spring", stiffness: 1500, damping: 30 }}
    >
      <div className={`w-6 h-3`}></div>
      {range(0, size - 1)
        .reverse()
        .map((i: number) => {
          const color = colors[i] ? `bg-${colors[i]}` : "";
          return (
            <div
              key={i}
              className={`w-6 h-6 ${color}`}
              style={
                i === 0
                  ? {
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    }
                  : {}
              }
            ></div>
          );
        })}
    </motion.div>
  );
};
