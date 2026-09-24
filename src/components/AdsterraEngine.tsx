import React, { useEffect, useRef } from 'react';
import { AppSettings } from '../types';

interface AdsterraEngineProps {
  settings: AppSettings;
  currentPage: 'homepage' | 'video_page';
}

/**
 * Adsterra Ads Engine
 * Supports:
 * 1. Multi-Script Multiplier Injection (1x to 10x parallel script instances)
 * 2. Continuous Execution (Always active - never shuts down after N clicks)
 * 3. Reactive Placement & Real-time Sync ('homepage' | 'video_page' | 'both')
 */
export const AdsterraEngine: React.FC<AdsterraEngineProps> = ({
  settings,
  currentPage,
}) => {
  const isEnabled = settings.adsterraEnabled !== false;
  const scriptCode = settings.adsterraScriptCode || '//pl25910243.highratecpm.com/a4/09/b3/a409b300f2e0e5d17bb66487779f76a5.js';
  const multiplier = Math.max(1, Math.min(20, Number(settings.adsterraMultiplier) || 5));
  const isContinuous = settings.adsterraContinuous !== false;
  const placement = settings.adsterraPlacement || 'both';
  const directLinkUrl = settings.adsterraDirectLinkUrl || settings.unlockAdUrl || settings.telegramChannelUrl || '';

  // Determine if ads should run on the current active view
  const shouldRunOnCurrentPage =
    isEnabled &&
    (placement === 'both' ||
      (placement === 'homepage' && currentPage === 'homepage') ||
      (placement === 'video_page' && currentPage === 'video_page'));

  const injectedElementsRef = useRef<HTMLElement[]>([]);
  const clickCounterRef = useRef<number>(0);
  const lastTriggerTimeRef = useRef<number>(0);

  // --- 1. MULTI-SCRIPT MULTIPLIER INJECTION ---
  useEffect(() => {
    // Clean up previous instances
    const cleanUpOldScripts = () => {
      // Remove previously tracked injected nodes
      injectedElementsRef.current.forEach((el) => {
        try {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } catch {}
      });
      injectedElementsRef.current = [];

      // Also clean up any loose tags with our data attribute
      try {
        const existing = document.querySelectorAll('[data-adsterra-engine]');
        existing.forEach((node) => {
          try {
            node.parentNode?.removeChild(node);
          } catch {}
        });
      } catch {}
    };

    cleanUpOldScripts();

    if (!shouldRunOnCurrentPage || !scriptCode.trim()) {
      return;
    }

    const createdNodes: HTMLElement[] = [];

    // Helper to parse script sources or inline code from given snippet
    const extractScriptInfo = (rawCode: string) => {
      const trimmed = rawCode.trim();

      // Check if it's pure URL (starts with // or http:// or https://)
      if (
        (trimmed.startsWith('//') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
        !trimmed.includes('<script') &&
        !trimmed.includes('\n')
      ) {
        return [{ src: trimmed, inline: '' }];
      }

      // If it contains <script> tags, parse via DOMParser
      if (trimmed.includes('<script') || trimmed.includes('<iframe') || trimmed.includes('<div')) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, 'text/html');
        const scriptTags = Array.from(doc.querySelectorAll('script'));
        
        if (scriptTags.length > 0) {
          return scriptTags.map((s) => ({
            src: s.getAttribute('src') || '',
            inline: s.innerHTML || '',
            type: s.getAttribute('type') || 'text/javascript',
          }));
        }
      }

      // Fallback: treated as inline JS or single script URL
      if (trimmed.endsWith('.js') && !trimmed.includes(' ') && !trimmed.includes(';')) {
        return [{ src: trimmed, inline: '' }];
      }

      return [{ src: '', inline: trimmed }];
    };

    const scriptItems = extractScriptInfo(scriptCode);

    // Multiplier Loop: Inject `multiplier` parallel instances
    for (let instanceIdx = 1; instanceIdx <= multiplier; instanceIdx++) {
      scriptItems.forEach((item, itemIdx) => {
        try {
          const scriptEl = document.createElement('script');
          scriptEl.type = 'text/javascript';
          scriptEl.async = true;
          scriptEl.setAttribute('data-adsterra-engine', 'true');
          scriptEl.setAttribute('data-adsterra-instance', `${instanceIdx}`);
          scriptEl.setAttribute('data-adsterra-item', `${itemIdx}`);

          if (item.src) {
            // Append instance query parameter to guarantee unique evaluation across parallel instances
            let srcUrl = item.src;
            const separator = srcUrl.includes('?') ? '&' : '?';
            const cacheBuster = `_inst=${instanceIdx}&_t=${Date.now()}`;
            scriptEl.src = srcUrl.startsWith('//') ? `https:${srcUrl}` : srcUrl;
            
            // For external scripts, also add query if not already parameterized
            if (!scriptEl.src.includes('_inst=')) {
              scriptEl.src = `${scriptEl.src}${separator}${cacheBuster}`;
            }
          } else if (item.inline) {
            scriptEl.text = `
              try {
                // Adsterra Multiplier Instance #${instanceIdx}
                window._adsterra_inst_${instanceIdx} = true;
                ${item.inline}
              } catch(e) {
                console.warn('Adsterra instance error:', e);
              }
            `;
          }

          document.head.appendChild(scriptEl);
          createdNodes.push(scriptEl);
        } catch (err) {
          console.warn('Adsterra injection instance error:', err);
        }
      });
    }

    injectedElementsRef.current = createdNodes;

    return () => {
      cleanUpOldScripts();
    };
  }, [shouldRunOnCurrentPage, scriptCode, multiplier, placement, currentPage]);

  // --- 2. CONTINUOUS EXECUTION (কখনো অফ হবে না) ---
  useEffect(() => {
    if (!shouldRunOnCurrentPage || !isContinuous) {
      return;
    }

    // Clear anti-spam / session frequency caps set by popunder networks in cookies or localStorage
    const clearAdFrequencyCaps = () => {
      try {
        const keysToPurge = [
          'adsterra',
          'popunder',
          'pl25910',
          'highratecpm',
          'highperformanceformat',
          'has_shown_ad',
          'ad_shown',
          'pop_shown',
        ];

        // Clean matching localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && keysToPurge.some((p) => key.toLowerCase().includes(p))) {
            localStorage.removeItem(key);
          }
        }

        // Clean matching sessionStorage keys
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && keysToPurge.some((p) => key.toLowerCase().includes(p))) {
            sessionStorage.removeItem(key);
          }
        }
      } catch {}
    };

    // Global Capture Click Listener for Continuous Execution
    const handleContinuousGlobalClick = (e: MouseEvent | TouchEvent) => {
      const now = Date.now();
      clickCounterRef.current += 1;

      // Periodically refresh frequency caps every few clicks
      if (clickCounterRef.current % 3 === 0) {
        clearAdFrequencyCaps();
      }

      // Check if user clicked an input, select or button to avoid disrupting standard form controls
      const target = e.target as HTMLElement | null;
      const isInteractiveFormInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.closest('form') !== null);

      // Trigger popunder re-activation if continuous mode is running
      // Adsterra scripts hook document click listeners, but if suppressed by timer, re-fire
      if (now - lastTriggerTimeRef.current > 4000) {
        lastTriggerTimeRef.current = now;
        
        // Dispatch synthetic event or ensure window popunder functions are triggered
        try {
          if (typeof (window as any)._atPopunder === 'function') {
            (window as any)._atPopunder();
          }
        } catch {}
      }
    };

    // Attach capture listeners to catch all user interactions continuously
    window.addEventListener('click', handleContinuousGlobalClick, { capture: true, passive: true });
    window.addEventListener('touchstart', handleContinuousGlobalClick, { capture: true, passive: true });

    // Periodic cleanup of session blockers to ensure it never expires
    const blockerInterval = setInterval(clearAdFrequencyCaps, 15000);

    return () => {
      window.removeEventListener('click', handleContinuousGlobalClick, { capture: true } as any);
      window.removeEventListener('touchstart', handleContinuousGlobalClick, { capture: true } as any);
      clearInterval(blockerInterval);
    };
  }, [shouldRunOnCurrentPage, isContinuous, directLinkUrl]);

  // Adsterra Engine runs headlessly in background without creating visual clutter
  return null;
};
