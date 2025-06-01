import React from "react";
import { AuroraBackground } from "./aurora-background";

export function AuroraBackgroundDemo() {
  return (
    <AuroraBackground>
      <div
        className="relative flex flex-col gap-4 items-center justify-center px-4"
        style={{
          opacity: 1,
          transform: "translateY(0)",
          transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
        }}
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          HR Interview Practice
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
          Improve your interview skills with AI-powered feedback
        </div>
        <button className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2">
          Start Practice
        </button>
      </div>
    </AuroraBackground>
  );
}
