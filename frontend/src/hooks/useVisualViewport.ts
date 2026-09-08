'use client';

import { useState, useEffect } from 'react';

export interface VisualViewportState {
  height: number;
  width: number;
  offsetTop: number;
  isKeyboardOpen: boolean;
  isMobile: boolean;
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    height: 0,
    width: 0,
    offsetTop: 0,
    isKeyboardOpen: false,
    isMobile: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      const isMobile = window.innerWidth < 768;
      const vv = window.visualViewport;

      if (!vv) {
        setState({
          height: window.innerHeight,
          width: window.innerWidth,
          offsetTop: 0,
          isKeyboardOpen: false,
          isMobile,
        });
        return;
      }

      // If the visual viewport height is significantly less than window.innerHeight,
      // the software keyboard is open.
      const heightDiff = window.innerHeight - vv.height;
      const isKeyboardOpen = isMobile && heightDiff > 120;

      // When in mobile chat and keyboard opens, prevent body/document scroll
      if (isMobile && window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }

      setState({
        height: Math.round(vv.height),
        width: Math.round(vv.width),
        offsetTop: Math.round(vv.offsetTop),
        isKeyboardOpen,
        isMobile,
      });
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
    }
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);

    // Initial update
    update();

    return () => {
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      }
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, []);

  return state;
}
