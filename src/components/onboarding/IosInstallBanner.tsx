import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

export const IosInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Detect iOS device
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream: unknown }).MSStream;
    // Detect if running in standalone mode (already added to Home Screen)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // Show banner if on iOS (or mobile testing) and not yet installed to home screen
    const dismissed = localStorage.getItem('planflow_pwa_banner_dismissed');
    if ((isIos || true) && !isStandalone && !dismissed) {
      setShowBanner(true);
    }
  }, []);

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem('planflow_pwa_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <aside aria-label="iOS Installation Guide" className="mx-4 mt-3 mb-2 p-3.5 rounded-2xl bg-gradient-to-r from-ios-card to-ios-cardElevated border border-ios-separator shadow-lg relative animate-fade-in">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-ios-textSecondary hover:text-white p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-9 h-9 rounded-xl bg-ios-blue/20 text-ios-blue flex items-center justify-center shrink-0 mt-0.5">
          <Share className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Install as Native iOS App</h2>
          <p className="text-xs text-ios-textSecondary mt-1 leading-relaxed">
            Tap <span className="inline-flex items-center text-ios-blue font-medium"><Share className="w-3 h-3 mx-1 inline" /> Share</span> in Safari, then scroll down and tap <span className="inline-flex items-center text-white font-medium"><PlusSquare className="w-3 h-3 mx-1 inline" /> Add to Home Screen</span> to run full-screen with offline support and alarm alerts.
          </p>
        </div>
      </div>
    </aside>
  );
};
