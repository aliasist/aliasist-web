import { createContext, useCallback, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

const STORAGE_KEY = "aliasist-click-sounds";

type SiteFeedbackValue = {
  clickSoundsOn: boolean;
  toggleClickSounds: () => void;
};

const defaultFeedbackValue: SiteFeedbackValue = {
  clickSoundsOn: false,
  toggleClickSounds: () => {},
};

const SiteFeedbackContext = createContext<SiteFeedbackValue>(defaultFeedbackValue);

export function useSiteFeedback() {
  return useContext(SiteFeedbackContext);
}

export function SiteFeedbackProvider({ children }: { children: ReactNode }) {
  const [clickSoundsOn, setClickSoundsOn] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      setClickSoundsOn(window.localStorage.getItem(STORAGE_KEY) === "on");
    } catch {
      // Keep sounds off when browser storage is unavailable.
    }
  }, []);

  const toggleClickSounds = useCallback(() => {
    setClickSoundsOn(current => {
      const next = !current;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {
        // The preference still works for this page session.
      }
      return next;
    });
  }, []);

  const handleClickCapture = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (!clickSoundsOn) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const control = target.closest<HTMLElement>(
      'button:not(:disabled), a[href], [role="button"], input[type="submit"]',
    );
    if (!control || control.hasAttribute("data-sound-toggle") || control.getAttribute("aria-disabled") === "true") return;

    try {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;
      if (context.state === "suspended") void context.resume();

      const now = context.currentTime;
      const tone = context.createOscillator();
      const volume = context.createGain();
      tone.type = "sine";
      tone.frequency.setValueAtTime(920, now);
      tone.frequency.exponentialRampToValueAtTime(510, now + 0.032);
      volume.gain.setValueAtTime(0.0001, now);
      volume.gain.exponentialRampToValueAtTime(0.018, now + 0.003);
      volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      tone.connect(volume);
      volume.connect(context.destination);
      tone.start(now);
      tone.stop(now + 0.04);
    } catch {
      // Audio is optional; unsupported or blocked audio never affects the action.
    }
  }, [clickSoundsOn]);

  return (
    <SiteFeedbackContext.Provider value={{ clickSoundsOn, toggleClickSounds }}>
      <div className="contents" onClickCapture={handleClickCapture}>
        {children}
      </div>
    </SiteFeedbackContext.Provider>
  );
}
