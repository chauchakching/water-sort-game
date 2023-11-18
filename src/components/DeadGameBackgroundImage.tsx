import { motion } from 'framer-motion';

export const DeadGameBackgroundImage = () => (
  <motion.img
    className="absolute left-0 bottom-0 w-screen z-0"
    style={{
      // @ts-ignore
      zIndex: -1,
    }}
    src="https://obs.line-scdn.net/0hirg3IkTcNl1aSiTWDuVJCmIcOixpLCxUeHt5P34ebmlyZiQMYntlPi1JO3Eke3dYen97bHgYPG53eXZbNg/w1200"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.1 }}
    transition={{ duration: 30 }} // Duration in seconds
  />
);
