import React, { useEffect, useRef, useState } from "react";
import { sparkSuccessScene } from "./sparkSuccessScene.js";
import "../styles/motion.css";

const sparkIds = [0, 1, 2, 3, 4, 5];

function prefersReducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function GalaceanStage({ kind, active = true, className = "" }) {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [mode, setMode] = useState(() => reducedMotion ? "reduced" : "loading");

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);
    return () => mediaQuery.removeEventListener?.("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!active) {
      setMode("inactive");
      return undefined;
    }
    if (reducedMotion) {
      setMode("reduced");
      return undefined;
    }

    let player;
    let cancelled = false;
    setMode("loading");

    const disposePlayer = () => {
      player?.dispose();
      player = undefined;
    };

    async function start() {
      try {
        const { Player } = await import("@galacean/effects");
        if (cancelled || !containerRef.current) return;
        player = new Player({ container: containerRef.current });
        await player.loadScene(sparkSuccessScene, { autoplay: true });
        if (cancelled) {
          disposePlayer();
          return;
        }
        setMode("ready");
      } catch {
        disposePlayer();
        if (!cancelled) setMode("fallback");
      }
    }

    start();
    return () => {
      cancelled = true;
      disposePlayer();
    };
  }, [active, kind, reducedMotion]);

  const classes = ["galacean-stage", className].filter(Boolean).join(" ");
  return (
    <div className={classes} data-kind={kind} data-motion-mode={mode} data-active={active ? "true" : "false"} aria-hidden="true">
      <div className="galacean-stage__canvas" ref={containerRef} />
      <div className="spark-fallback" data-kind={kind}>
        {sparkIds.map((id) => <i key={id} />)}
      </div>
    </div>
  );
}

export default GalaceanStage;
