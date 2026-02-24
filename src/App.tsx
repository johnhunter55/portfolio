import { useEffect, useRef, useCallback } from "react";
import "./App.css";

import backgroundImage from "./assets/IMG_0354-1.jpg";
import cutoutImage from "./assets/IMG_0354-1.png";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const solidFrontRef = useRef<HTMLHeadingElement>(null);
  const nameTopRef = useRef<number | null>(null);

  const updatePosition = useCallback(() => {
    if (nameRef.current) {
      const originalTransform = nameRef.current.style.transform;
      nameRef.current.style.transform = "none";

      const rect = nameRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      nameTopRef.current = rect.top + scrollTop;

      nameRef.current.style.transform = originalTransform;
    }
    // setWindowWidth removed from here
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const progress = Math.min(scrollY / windowHeight, 1);

      // Update CSS variables for performance
      const style = containerRef.current.style;
      style.setProperty("--scroll-y", `${scrollY}`);
      style.setProperty("--progress", `${progress}`);
      style.setProperty("--window-height", `${windowHeight}`);

      // Sticky Logic (Direct DOM manipulation to avoid re-renders)
      if (nameTopRef.current !== null) {
        const isSticky = scrollY >= nameTopRef.current - 5;
        const position = isSticky ? "fixed" : "relative";
        const top = isSticky ? "10px" : "auto";

        if (nameRef.current) {
          nameRef.current.style.position = position;
          nameRef.current.style.top = top;
        }
        if (solidFrontRef.current) {
          solidFrontRef.current.style.position = position;
          solidFrontRef.current.style.top = top;
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Update on resize as well since windowHeight changes
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    const timer = setTimeout(updatePosition, 500);
    return () => {
      window.removeEventListener("resize", updatePosition);
      clearTimeout(timer);
    };
  }, [updatePosition]);

  const gradualColorStyle: React.CSSProperties = {
    backgroundColor: `rgb(
      calc(25 + (20 - 25) * var(--progress, 0)),
      calc(50 + (20 - 50) * var(--progress, 0)),
      calc(45 + (25 - 45) * var(--progress, 0))
    )`,
    color: `rgb(
      calc(255 * var(--progress, 0)),
      calc(255 * var(--progress, 0)),
      calc(255 * var(--progress, 0))
    )`,
    minHeight: "100vh",
  };

  const baseNameStyle: React.CSSProperties = {
    // Use the CSS variable for the shrinking math
    transform: "scale(calc(1 - var(--progress, 0) * 0.5)) translateZ(0)",

    transformOrigin: "top center",
    textAlign: "center",
    whiteSpace: "nowrap",
    width: "100%",

    // Set defaults. Your useEffect DOM manipulation will override these!
    position: "relative",
    top: "auto",
    left: 0,
  };

  return (
    <div
      ref={containerRef}
      style={gradualColorStyle}
      className="transition-none"
    >
      <svg
        style={{ width: 0, height: 0, position: "absolute" }}
        aria-hidden="true"
      >
        <filter id="grainy-text">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.6"
            numOctaves="3"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComposite operator="in" in2="SourceGraphic" result="noiseText" />
          <feComponentTransfer in="noiseText" result="fadedNoise">
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feBlend mode="overlay" in="fadedNoise" in2="SourceGraphic" />
        </filter>
      </svg>
      <div className="center">
        <div className="hero-holder">
          {/* Layer 0: Background */}
          <img
            className="under-photo"
            src={backgroundImage}
            alt="background landscape"
            onLoad={updatePosition}
          />
          <div className="content-holder">
            <h2 className="top-text">Full Stack Web Developer</h2>

            {/* Layer 1: Solid Text (Behind Cutout) */}
            <h1
              ref={nameRef}
              className="my-name"
              style={{ ...baseNameStyle, zIndex: 4 }}
            >
              John Hunter
            </h1>
          </div>

          {/* Layer 2: Foreground Subject */}
          <img
            className="over-photo"
            src={cutoutImage}
            alt="John Hunter cutout"
            onLoad={updatePosition}
          />
        </div>
        {/* Layer 3: Outline Text (In Front of Cutout, Flies Up) */}
        <div className="content-holder outline-text">
          <h1
            className="my-name"
            style={{
              ...baseNameStyle,
              zIndex: 6,
              // 1. Override the sticky lock so it keeps moving natively with the page
              position: "relative",
              top: "auto",
              // 2. Add the fly-away math back in!
              transform: `scale(calc(1 - var(--progress, 0) * 0.5)) translateY(calc(var(--scroll-y, 0) * -0.6px)) translateZ(0)`,
            }}
          >
            John Hunter
          </h1>
        </div>

        {/* Layer 4: NEW Solid Text (In Front of Cutout, Fades In) */}
        <div className="content-holder solid-front-text">
          <h1
            ref={solidFrontRef}
            className="my-name"
            style={{
              ...baseNameStyle,
              zIndex: 7,
              // Wrap the math in calc() so the browser can read it
              opacity:
                "min(1, calc(var(--scroll-y, 0) / (var(--window-height, 1000) * 0.8)))",
            }}
          >
            John Hunter
          </h1>
        </div>
      </div>

      <div className="contact"></div>
    </div>
  );
}

export default App;
