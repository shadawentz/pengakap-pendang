import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface CardQrCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export const CardQrCode: React.FC<CardQrCodeProps> = ({ data, size = 68, className = "" }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(
      data,
      {
        width: size * 3, // High DPI
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err, url) => {
        if (!err && url && isMounted) {
          setDataUrl(url);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [data, size]);

  if (!dataUrl) {
    return (
      <div
        className={`bg-white flex items-center justify-center p-1 rounded-sm shadow-sm ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[8px] text-slate-400 font-mono">...</span>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-1 rounded-sm shadow-sm flex items-center justify-center border border-slate-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={dataUrl}
        alt="Scout QR Verification"
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
};
