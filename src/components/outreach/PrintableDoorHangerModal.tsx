import React, { useState } from "react";
import {
  Printer, X, Download, QrCode, Check, ShieldCheck,
  Sparkles, DollarSign, MapPin, Phone, Globe, Scissors
} from "lucide-react";

interface PrintableDoorHangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export default function PrintableDoorHangerModal({
  isOpen,
  onClose,
  appUrl = window.location.origin,
}: PrintableDoorHangerModalProps) {
  const [headline, setHeadline] = useState("NEED RELIABLE LOCAL HOME REPAIRS?");
  const [discountCode, setDiscountCode] = useState("NEIGHBOR50");
  const [discountAmount, setDiscountAmount] = useState("$50 OFF");
  const [neighborhoodName, setNeighborhoodName] = useState("Your Local Community");
  const [phoneNumber, setPhoneNumber] = useState("(800) 555-WORK");

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-8 space-y-0">
        
        {/* Modal Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Printable Door Hanger & Postcard Designer</h3>
              <p className="text-[11px] text-zinc-400">Customizable 2-sided local marketing collateral with QR codes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customization Bar */}
        <div className="bg-zinc-50 border-b border-zinc-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1">
              Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs font-bold text-zinc-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1">
              Discount Voucher
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="$50 OFF"
                className="w-1/2 bg-white border border-zinc-300 rounded-lg p-2 text-xs font-bold text-zinc-900"
              />
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="PROMO CODE"
                className="w-1/2 bg-white border border-zinc-300 rounded-lg p-2 text-xs font-mono font-bold text-red-600 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-600 mb-1">
              Neighborhood / City
            </label>
            <input
              type="text"
              value={neighborhoodName}
              onChange={(e) => setNeighborhoodName(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs font-bold text-zinc-900"
            />
          </div>
        </div>

        {/* Printable Canvas Preview */}
        <div className="p-6 bg-zinc-100 flex justify-center">
          <div
            className="bg-white border-2 border-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-lg text-zinc-900 space-y-4 printable-door-hanger"
            style={{ width: "380px" }}
          >
            {/* Top Cutout Circle Representation for Door Knob */}
            <div className="flex flex-col items-center justify-center border-b-2 border-dashed border-zinc-300 pb-3">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-400 bg-zinc-50 flex items-center justify-center text-[9px] text-zinc-400 font-mono">
                [Door Knob]
              </div>
              <span className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">
                DOOR HANGER CUTOUT
              </span>
            </div>

            {/* Brand Header */}
            <div className="text-center space-y-1">
              <div className="inline-block bg-red-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-0.5 rounded-full">
                HOTSPOT TRADESMEN NETWORK
              </div>
              <h2 className="text-xl font-black font-display tracking-tight text-zinc-900 leading-tight">
                {headline}
              </h2>
              <p className="text-xs font-bold text-blue-900">
                Exclusive to {neighborhoodName} Residents
              </p>
            </div>

            {/* Value Bullet Points */}
            <div className="bg-zinc-50 rounded-2xl p-3.5 border border-zinc-200 space-y-2 text-xs font-medium">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Broker Markups — Direct Quotes</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Roofing, Lawn, Plumbing, HVAC & Handymen</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Escrow Protected Payments</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Compare Bids from Background-Checked Pros</span>
              </div>
            </div>

            {/* Promo Voucher Box */}
            <div className="bg-red-50 border-2 border-dashed border-red-400 rounded-2xl p-3 text-center space-y-1">
              <div className="text-[10px] font-black uppercase text-red-700 tracking-wider">
                NEIGHBORHOOD DISCOUNT VOUCHER
              </div>
              <div className="text-xl font-black text-red-600 font-display">
                {discountAmount}
              </div>
              <div className="text-xs font-mono font-bold text-zinc-800 bg-white py-1 px-3 rounded-lg border border-red-200 inline-block">
                USE CODE: {discountCode}
              </div>
            </div>

            {/* QR Code & Web Access */}
            <div className="bg-zinc-900 text-white rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">
                  SCAN WITH PHONE CAMERA
                </div>
                <div className="text-[11px] text-zinc-200 leading-snug">
                  Post your repair in 60 seconds and receive instant bids!
                </div>
                <div className="text-[10px] font-mono text-zinc-400 truncate">
                  {appUrl.replace(/^https?:\/\//, "")}
                </div>
              </div>

              {/* Real SVG QR code placeholder */}
              <div className="w-18 h-18 bg-white rounded-xl p-1.5 shrink-0 flex items-center justify-center">
                <QrCode className="w-14 h-14 text-zinc-900" />
              </div>
            </div>

            {/* Tear-Off Tabs at Bottom */}
            <div className="border-t-2 border-dashed border-zinc-400 pt-3">
              <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono mb-2 uppercase">
                <span className="flex items-center gap-1">
                  <Scissors className="w-3 h-3" /> TEAR-OFF CONTACT TABS
                </span>
                <span>CODE: {discountCode}</span>
              </div>

              <div className="grid grid-cols-4 gap-1 text-[8px] font-mono text-center">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-zinc-300 p-1 rounded-sm bg-zinc-50 leading-tight">
                    <div className="font-bold text-zinc-900">HOTSPOT</div>
                    <div className="text-red-600 font-bold">{discountAmount}</div>
                    <div className="text-[7px] text-zinc-500 truncate">{appUrl.replace(/^https?:\/\//, "")}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
