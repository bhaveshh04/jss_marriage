// Logo component using Khandesh Maratha Mandal branding
// Sthapana: 1 May 1986 | R. No. Maharashtra 2889/86 F 3978-Pune
export default function Logo({ light = true, size = "default" }: { light?: boolean; size?: "default" | "large" | "small" }) {
  const textColor = light ? "text-white" : "text-kumkum-900";
  const subColor = light ? "text-haldi-300" : "text-stone-500";

  if (size === "large") {
    return (
      <div className="flex flex-col items-center gap-2">
        {/* Shivaji Maharaj inspired decorative icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-haldi-500 to-haldi-600 shadow-lg">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
            {/* Crown / kalash */}
            <path d="M26 4 L32 16 L40 12 L36 22 L44 20 L38 30 L26 48 L14 30 L8 20 L16 22 L12 12 L20 16 Z" fill="#3A0A13" opacity="0.9"/>
            <path d="M26 8 L31 18 L38 15 L35 23 L41 22 L36 30 L26 44 L16 30 L11 22 L17 23 L14 15 L21 18 Z" fill="#D9A21B"/>
            <circle cx="26" cy="26" r="5" fill="#3A0A13"/>
            <circle cx="26" cy="26" r="2.5" fill="#D9A21B"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="font-marathiHead text-3xl font-bold text-kumkum-800">खान्देश मराठा मंडळ</p>
          <p className="font-marathi text-base text-stone-600">पिंपरी चिंचवड व पुणे जिल्हा परिसर</p>
          <p className="mt-1 font-marathi text-xs text-stone-400">स्थापना : १ मे १९८६ | र. नं. महाराष्ट्र २८८९/८६ एफ ३९७८-पुणे</p>
        </div>
      </div>
    );
  }

  if (size === "small") {
    return (
      <span className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-haldi-500 shadow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2 L15 9 L20 7 L18 12 L22 11 L19 16 L12 23 L5 16 L2 11 L6 12 L4 7 L9 9 Z" fill="#3A0A13" opacity="0.9"/>
            <circle cx="12" cy="12" r="3" fill="#D9A21B"/>
          </svg>
        </span>
        <span className="leading-tight">
          <span className={`block font-marathiHead text-[13px] font-bold ${textColor}`}>खान्देश मराठा मंडळ</span>
          <span className={`block font-marathi text-[10px] ${subColor}`}>वधू-वर मेळावा</span>
        </span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-haldi-500 shadow-md">
        <svg width="26" height="26" viewBox="0 0 52 52" fill="none" aria-hidden>
          <path d="M26 4 L32 16 L40 12 L36 22 L44 20 L38 30 L26 48 L14 30 L8 20 L16 22 L12 12 L20 16 Z" fill="#3A0A13" opacity="0.9"/>
          <path d="M26 8 L31 18 L38 15 L35 23 L41 22 L36 30 L26 44 L16 30 L11 22 L17 23 L14 15 L21 18 Z" fill="#fff" opacity="0.5"/>
          <circle cx="26" cy="26" r="5" fill="#3A0A13"/>
          <circle cx="26" cy="26" r="2.5" fill="#D9A21B"/>
        </svg>
      </span>
      <span className="leading-tight">
        <span className={`block font-marathiHead text-[16px] font-bold ${textColor}`}>खान्देश मराठा मंडळ</span>
        <span className={`block font-marathi text-[11px] ${subColor}`}>पिंपरी चिंचवड व पुणे जिल्हा परिसर</span>
      </span>
    </span>
  );
}
