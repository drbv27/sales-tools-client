// src/hooks/useOverlayManager.js
import { useState, useCallback, useEffect } from 'react';

export function useOverlayManager() {
  const [activeOverlays, setActiveOverlays] = useState(new Set());

  const registerOverlay = useCallback((id) => {
    setActiveOverlays(prev => new Set(prev).add(id));
    document.body.style.pointerEvents = 'none';
  }, []);

  const unregisterOverlay = useCallback((id) => {
    setActiveOverlays(prev => {
      const next = new Set(prev);
      next.delete(id);
      if (next.size === 0) {
        document.body.style.pointerEvents = 'auto';
      }
      return next;
    });
  }, []);

  // Limpieza en caso de desmontaje
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = 'auto';
      setActiveOverlays(new Set());
    };
  }, []);

  return { registerOverlay, unregisterOverlay, activeOverlays };
}