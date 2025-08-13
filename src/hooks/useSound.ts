"use client";
import { useCallback, useRef } from "react";

export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = useCallback(() => {
    if (!enabled) return null;
    if (!ctxRef.current) {
      interface ExtendedWindow extends Window {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      }
      const win = window as ExtendedWindow;
      const Ctx = win.AudioContext || win.webkitAudioContext;
      if (!Ctx) return null;
      ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  }, [enabled]);

  const click = useCallback(() => {
    const ctx = ensure(); if (!ctx) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "square"; o.frequency.value = 220; g.gain.value = 0.02;
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.03);
  }, [ensure]);

  const beep = useCallback(() => {
    const ctx = ensure(); if (!ctx) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = 480; g.gain.value = 0.04;
    o.connect(g).connect(ctx.destination); o.start();
    o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
    o.stop(ctx.currentTime + 0.1);
  }, [ensure]);

  return { click, beep };
}
