import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdBlockNotice: React.FC = () => {
  const [isAdBlockDetected, setIsAdBlockDetected] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('streampulse_adblock_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isRechecking, setIsRechecking] = useState(false);

  const checkAdBlocker = async () => {
    let detected = false;

    // Check 1: DOM Bait Element
    try {
      const bait = document.createElement('div');
      bait.className = 'ad-banner adsbox textads banner-ads banner_ads pub_300x250 pub_728x90 text-ad textAd text_ads';
      bait.style.position = 'absolute';
      bait.style.top = '-1000px';
      bait.style.left = '-1000px';
      bait.style.width = '1px';
      bait.style.height = '1px';
      bait.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bait);

      // Check if bait was hidden or removed by adblocker extension rules
      if (
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetLeft === 0 ||
        bait.offsetTop === 0 ||
        bait.offsetWidth === 0 ||
        bait.clientHeight === 0 ||
        window.getComputedStyle(bait).display === 'none' ||
        window.getComputedStyle(bait).visibility === 'hidden'
      ) {
        detected = true;
      }
      document.body.removeChild(bait);
    } catch {
      detected = true;
    }

    // Check 2: Network probe on common ad script domain
    if (!detected) {
      try {
        const response = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
        });
        if (!response) {
          detected = true;
        }
      } catch (err) {
        // Network errors or extension net::ERR_BLOCKED_BY_CLIENT indicate adblocker
        detected = true;
      }
    }

    setIsAdBlockDetected(detected);
    setIsRechecking(false);
  };

  useEffect(() => {
    // Initial check after short delay to let browser extensions evaluate DOM
    const timer = setTimeout(() => {
      checkAdBlocker();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('streampulse_adblock_dismissed', 'true');
    } catch {}
  };

  const handleRecheck = () => {
    setIsRechecking(true);
    setTimeout(() => {
      checkAdBlocker();
    }, 600);
  };

  if (!isAdBlockDetected || isDismissed) {
    return null;
  }

  return (
    <div className="relative z-40 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Warning Icon & Text */}
        <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1.5 rounded-lg bg-black/20 shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
          </div>
          <div className="text-xs sm:text-sm font-medium leading-tight">
            <span className="font-bold text-amber-100">⚠️ AdBlock Detected: </span>
            <span className="opacity-95">
              বিজ্ঞাপন ও নিরবচ্ছিন্ন স্ট্রিমিং পরীক্ষা করার জন্য আপনার ব্রাউজারের AdBlocker বন্ধ করুন (Please disable AdBlock to test Adsterra ads & popunders).
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
          <button
            onClick={handleRecheck}
            disabled={isRechecking}
            className="px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/40 text-white text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95"
            title="Recheck AdBlock Status"
          >
            <RefreshCw className={`w-3 h-3 ${isRechecking ? 'animate-spin' : ''}`} />
            <span>{isRechecking ? 'Checking...' : 'Recheck'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 transition-colors active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            <span>Dismiss</span>
          </button>
        </div>

      </div>
    </div>
  );
};
