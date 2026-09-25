import React, { useEffect, useRef } from 'react';
import { AppSettings } from '../types';

interface AdsterraEngineProps {
  settings: AppSettings;
  currentPage: 'homepage' | 'video_page';
}

/**
 * Adsterra Ads Engine
 * Specifically handles the 2 requested Adsterra features:
 * 1. Social Bar Ads: Floating Social Bar ad at the top/screen when script is configured in Admin.
 * 2. Popunder Ads: Triggers Popunder immediately when user clicks anywhere on page or videos.
 */

/**
 * Programmatic trigger helper to activate Popunder whenever user clicks cards, buttons or videos
 */
export function triggerAdsterraPopunder(): void {
  try {
    // 1. If Adsterra popunder function exists on window, invoke it
    if (typeof (window as any)._atPopunder === 'function') {
      (window as any)._atPopunder();
    }
  } catch (e) {
    // Safe error handling
  }
}

export const AdsterraEngine: React.FC<AdsterraEngineProps> = ({
  settings,
}) => {
  // 1. Social Bar Ads Configurations
  const isSocialBarEnabled = settings.adsterraSocialBarEnabled !== false;
  const socialBarScript = (settings.adsterraSocialBarScript || settings.adsterraScriptCode || '').trim();

  // 2. Popunder Ads Configurations
  const isPopunderEnabled = settings.adsterraPopunderEnabled !== false;
  const popunderScript = (settings.adsterraPopunderScript || settings.adsterraScriptCode || '').trim();

  const injectedElementsRef = useRef<HTMLElement[]>([]);
  const popunderTriggeredCountRef = useRef<number>(0);
  const lastPopunderTimeRef = useRef<number>(0);

  // Helper to extract script sources or inline code from given snippet/URL
  const parseScriptCode = (rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed) return [];

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

  // --- 1. SOCIAL BAR ADS INJECTION & FLOATING DISPLAY ---
  useEffect(() => {
    if (!isSocialBarEnabled || !socialBarScript) {
      return;
    }

    const scriptItems = parseScriptCode(socialBarScript);
    const createdNodes: HTMLElement[] = [];

    scriptItems.forEach((item, idx) => {
      try {
        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.async = true;
        scriptEl.setAttribute('data-adsterra-socialbar', 'true');
        scriptEl.setAttribute('data-index', String(idx));

        if (item.src) {
          const srcUrl = item.src.startsWith('//') ? `https:${item.src}` : item.src;
          scriptEl.src = srcUrl;
        } else if (item.inline) {
          scriptEl.text = `
            try {
              // Adsterra Social Bar Execution
              ${item.inline}
            } catch(e) {
              console.warn('Adsterra Social Bar error:', e);
            }
          `;
        }

        document.head.appendChild(scriptEl);
        createdNodes.push(scriptEl);
      } catch (err) {
        console.warn('Adsterra Social Bar injection error:', err);
      }
    });

    injectedElementsRef.current.push(...createdNodes);

    return () => {
      createdNodes.forEach((el) => {
        try {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } catch {}
      });
    };
  }, [isSocialBarEnabled, socialBarScript]);

  // --- 2. POPUNDER ADS INJECTION & ON-CLICK TRIGGER ---
  useEffect(() => {
    if (!isPopunderEnabled || !popunderScript) {
      return;
    }

    const scriptItems = parseScriptCode(popunderScript);
    const createdNodes: HTMLElement[] = [];

    scriptItems.forEach((item, idx) => {
      try {
        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.async = true;
        scriptEl.setAttribute('data-adsterra-popunder', 'true');
        scriptEl.setAttribute('data-index', String(idx));

        if (item.src) {
          const srcUrl = item.src.startsWith('//') ? `https:${item.src}` : item.src;
          scriptEl.src = srcUrl;
        } else if (item.inline) {
          scriptEl.text = `
            try {
              // Adsterra Popunder Execution
              ${item.inline}
            } catch(e) {
              console.warn('Adsterra Popunder error:', e);
            }
          `;
        }

        document.head.appendChild(scriptEl);
        createdNodes.push(scriptEl);
      } catch (err) {
        console.warn('Adsterra Popunder injection error:', err);
      }
    });

    injectedElementsRef.current.push(...createdNodes);

    // Global Capture Click Listener: Triggers Popunder on ANY click on page or video
    const handleGlobalPopunderClick = (e: MouseEvent | TouchEvent) => {
      const now = Date.now();
      popunderTriggeredCountRef.current += 1;

      // Allow popunder trigger on click
      if (now - lastPopunderTimeRef.current > 1000) {
        lastPopunderTimeRef.current = now;

        // Try standard Adsterra Popunder global methods if exposed
        try {
          if (typeof (window as any)._atPopunder === 'function') {
            (window as any)._atPopunder();
          }
        } catch {}
      }
    };

    // Attach click and touchstart in capture phase so video wrappers & cards trigger popunder
    window.addEventListener('click', handleGlobalPopunderClick, { capture: true, passive: true });
    window.addEventListener('touchstart', handleGlobalPopunderClick, { capture: true, passive: true });

    return () => {
      window.removeEventListener('click', handleGlobalPopunderClick, { capture: true } as any);
      window.removeEventListener('touchstart', handleGlobalPopunderClick, { capture: true } as any);

      createdNodes.forEach((el) => {
        try {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } catch {}
      });
    };
  }, [isPopunderEnabled, popunderScript]);

  // Clean, headless execution of Adsterra Social Bar and Popunder
  return null;
};
