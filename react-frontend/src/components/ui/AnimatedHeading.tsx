import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const AnimatedHeading = () => {
  const texts = ["Find Your Doctor", "Book Appointments", "Get Expert Care"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2500); // ⏱ faster change (1.8s)
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-16 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.h3
          key={texts[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }} // ⏱ faster animation
          className="text-3xl font-bold text-gray-800 text-center"
        >
          {texts[index]}
        </motion.h3>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedHeading;
