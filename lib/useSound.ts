"use client";

import { useCallback } from "react";

// Simple sound effect using Web Audio API
// This creates sounds programmatically without needing audio files
export function useSound() {
  const playClick = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "square";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio can't be played
      console.warn("Could not play click sound:", error);
    }
  }, []);

  const playSuccess = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a chime-like sound with multiple frequencies
      const frequencies = [523.25, 659.25, 783.99]; // C, E, G major chord
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = "sine";

        const startTime = audioContext.currentTime + index * 0.1;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
      });
    } catch (error) {
      // Silently fail if audio can't be played
      console.warn("Could not play success sound:", error);
    }
  }, []);

  const playUnlock = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Magical unlock sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail if audio can't be played
      console.warn("Could not play unlock sound:", error);
    }
  }, []);

  return {
    playClick,
    playSuccess,
    playUnlock,
  };
}


