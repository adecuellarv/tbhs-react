import { useEffect, useMemo, useRef, useCallback } from 'react';
import { driver } from 'driver.js';

export function useDriverTour(steps, { runOnMount = false, storageKey = 'tour_seen_v1', onFinish, driverOptions } = {}) {
  const d = useMemo(() => driver({
    showProgress: true,
    overlayOpacity: 0.45,
    onDestroyed: () => {
      onFinish && onFinish();
      storageKey && localStorage.setItem(storageKey, '1');
    },
    ...(driverOptions || {}),
  }), [driverOptions, onFinish, storageKey]);

  // << antes: d.defineSteps(steps)
  useEffect(() => {
    d.setSteps(steps || []);
  }, [d, steps]);

  const start = useCallback(() => d.drive(), [d]);

  useEffect(() => {
    if (!runOnMount) return;
    const seen = storageKey ? localStorage.getItem(storageKey) : null;
    if (!seen) d.drive();
  }, [d, runOnMount, storageKey]);

  return { start, instance: d };
}
