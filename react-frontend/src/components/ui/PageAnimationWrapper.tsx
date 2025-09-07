// components/PageAnimationWrapper.tsx
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, Children, cloneElement, isValidElement } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  delay?: number;
  className?: string;
}

const AnimatedSection = ({ 
  children, 
  direction = "left", 
  delay = 0, 
  className = "" 
}: AnimatedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-100px 0px -100px 0px" 
  });

  const slideVariants = {
    hidden: {
      opacity: 0,
      x: direction === "left" ? -100 : 100,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={slideVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Main Page Animation Wrapper
interface PageAnimationWrapperProps {
  children: React.ReactNode;
}

export const PageAnimationWrapper = ({ children }: PageAnimationWrapperProps) => {
  const childrenArray = Children.toArray(children);
  
  return (
    <div>
      {childrenArray.map((child, index) => {
        // Check if child is a valid React element (component)
        if (isValidElement(child)) {
          return (
            <AnimatedSection
              key={index}
              direction={index % 2 === 0 ? "left" : "right"}
              delay={0.1}
              className="w-full"
            >
              {child}
            </AnimatedSection>
          );
        }
        return child;
      })}
    </div>
  );
};

// Updated App.tsx
