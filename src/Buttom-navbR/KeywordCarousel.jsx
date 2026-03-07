import React, { useRef, useState, useEffect } from "react";
import { Zap } from "lucide-react";

const KEYWORD_SNIPPETS = {
  python: [
    { label:'print',snippet:'print("")',cursorBack:2 },
    { label:'input',snippet:'input("")',cursorBack:2 },
    { label:'for',snippet:'for i in range():',cursorBack:1 },
    { label:'while',snippet:'while True:',cursorBack:0 },
    { label:'if',snippet:'if condition:',cursorBack:0 },
    { label:'elif',snippet:'elif condition:',cursorBack:0 },
    { label:'else',snippet:'else:',cursorBack:0 },
    { label:'def',snippet:'def func():',cursorBack:0 },
    { label:'class',snippet:'class MyClass:',cursorBack:0 },
    { label:'try',snippet:'try:',cursorBack:0 },
    { label:'except',snippet:'except:',cursorBack:0 }
  ],

  java: [
    { label:"sysout",snippet:'System.out.println("");',cursorBack:3 },
    { label:"main()",snippet:"public static void main(String[] args) {\n\n}",cursorBack:0 },
    { label:"for",snippet:"for(int i=0;i<n;i++){}",cursorBack:0 },
    { label:"while",snippet:"while(condition){}",cursorBack:0 }
  ]
};

export default function KeywordCarousel({ language="python", accentColor="#4da3ff", onInsert }) {

  const keywords = KEYWORD_SNIPPETS[language] || [];
  const scrollRef = useRef(null);
  const [flashIdx, setFlashIdx] = useState(null);
  const isPausedRef = useRef(false);
  const scrollDirectionRef = useRef(1);

  /* ---------------- auto scroll ---------------- */
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId;
    const scrollSpeed = 0.8; // pixels per frame

    const autoScroll = () => {
      if (!isPausedRef.current) {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

        // Only scroll if there's content to scroll
        if (maxScroll > 0) {
          scrollContainer.scrollLeft += scrollSpeed * scrollDirectionRef.current;

          // Change direction at boundaries
          if (scrollContainer.scrollLeft >= maxScroll) {
            scrollDirectionRef.current = -1;
          } else if (scrollContainer.scrollLeft <= 0) {
            scrollDirectionRef.current = 1;
          }
        }
      }

      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [language]);

  /* ---------------- snippet click ---------------- */
  const handleClick = (kw, idx) => {
    setFlashIdx(idx);
    setTimeout(() => setFlashIdx(null), 400);

    if (onInsert) {
      onInsert(kw.snippet, kw.cursorBack);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 36,
        background: "rgba(0,0,0,0.35)",
        overflow: "hidden",
        width: "100%"
      }}
    >
      {/* label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "0 10px",
          color: accentColor,
          fontSize: 10,
          fontWeight: 700,
          flexShrink: 0,
          letterSpacing: "0.5px"
        }}
      >
        <Zap size={10} />
        SNIPPETS
      </div>

      {/* scroll area - KEY FIX HERE */}
      <div
        ref={scrollRef}
        onMouseEnter={() => isPausedRef.current = true}
        onMouseLeave={() => isPausedRef.current = false}
        style={{
          display: "flex",
          gap: 8,
          overflow: "scroll", // CHANGED FROM hidden to scroll
          flex: 1,
          padding: "0 8px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch"
        }}
        className="hide-scrollbar"
      >
        {keywords.map((kw, idx) => {
          const active = flashIdx === idx;

          return (
            <button
              key={idx}
              onClick={() => handleClick(kw, idx)}
              style={{
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 500,
                borderRadius: 6,
                border: `1px solid ${active ? accentColor : "#444"}`,
                background: active ? accentColor + "22" : "#111",
                color: active ? accentColor : "#ccc",
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                userSelect: "none"
              }}
            >
              {kw.label}
            </button>
          );
        })}
      </div>

      {/* Hide scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
}