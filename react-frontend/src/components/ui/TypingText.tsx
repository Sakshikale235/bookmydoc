import { useState, useEffect } from "react";

const TypingText = ({ text, speed = 50, className = "" }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed(""); // reset for every new text
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <h1 className={`${className} relative inline-block`}>
      {displayed}
      <span className="animate-pulse"></span>
    </h1>
  );
};

export default TypingText;
