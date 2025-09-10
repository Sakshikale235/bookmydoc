import React from "react";

// Two-line infinite autoplay marquee for promo sentences
// TailwindCSS required. Drop this component anywhere in your page.
// Hover to pause. Fully responsive. No external libs.

export default function TwoLineMarquee() {
  const items = [
    "Skip the long queues, connect with doctors",
    "Book your slot in seconds and spend your time on what really matters — your health.",
    "From booking to consultation, healthcare made seamless",
    "No more waiting rooms. Just quick, reliable doctor access at your fingertips.",
  ];

  return (
    <div className="w-full space-y-6 box-border max-w-full">
      {/* Inline keyframes so you don't need to touch tailwind.config.js */}
      <style>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes marquee-right { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>

      {/* Row 1 */}
      <MarqueeRow items={items} direction="left" />

      {/* Row 2 */}
      <MarqueeRow items={[...items].reverse()} direction="right" />
    </div>
  );
}

function MarqueeRow({ items, direction = "left", speed = 30 }) {
  const isLeft = direction === "left";
  return (
    <div
      className="group relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-primary05 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 box-border"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0, black 4%, black 96%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 4%, black 96%, transparent 100%)",
      }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `${isLeft ? "marquee-left" : "marquee-right"} ${speed}s linear infinite`,
        }}
      >
        {/* Repeat track twice to make loop seamless */}
        {[0, 1].map((block) => (
          <div key={block} className="flex items-center gap-12 py-4 pr-12">
            {items.map((text, i) => (
              <Item key={`${block}-${i}`} text={text} />
            ))}
          </div>
        ))}
      </div>

      {/* Pause on hover */}
      <style>{`
        .group:hover > div { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

function Item({ text }) {
  return (
    <div className="flex items-center gap-6 flex-shrink-0">
      <h1 className="text-2xl sm:text-4xl font-bold text-zinc-800 dark:text-zinc-100 whitespace-nowrap">{text}</h1>
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" aria-hidden />
    </div>
  );
}