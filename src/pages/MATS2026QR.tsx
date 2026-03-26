import qrCode from "@/assets/crums-mats-2026-qr.svg";

export default function MATS2026QR() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <img src={qrCode} alt="MATS 2026 QR Code" className="w-[80vmin] h-[80vmin] max-w-[512px] max-h-[512px]" />
    </div>
  );
}
