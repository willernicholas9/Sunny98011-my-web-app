import React, { useRef, useState, useEffect, useCallback } from "react";
import { Project } from "../types";
import { 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Image as ImageIcon, 
  Palette, 
  RefreshCw, 
  Smartphone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Tag,
  Globe2,
  DollarSign,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { applyOpenGraphMetaTags, OpenGraphMetaResult } from "../services/openGraphGenerator";

interface ProjectShareImageGeneratorProps {
  project: Project;
  computedDistance?: string | number;
}

type CardTheme = "midnight" | "emerald" | "slate" | "amber";

export default function ProjectShareImageGenerator({
  project,
  computedDistance,
}: ProjectShareImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cardTheme, setCardTheme] = useState<CardTheme>("midnight");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [ogMeta, setOgMeta] = useState<OpenGraphMetaResult | null>(null);
  const [showMetaInspector, setShowMetaInspector] = useState(true);
  const [copiedMetaSnippet, setCopiedMetaSnippet] = useState(false);

  // Theme palettes configuration
  const themes = {
    midnight: {
      name: "Midnight Pro",
      bgGradStart: "#0a0f1d",
      bgGradEnd: "#15243e",
      accentGradStart: "#f59e0b",
      accentGradEnd: "#d97706",
      cardBg: "rgba(15, 23, 42, 0.75)",
      cardBorder: "rgba(51, 65, 85, 0.7)",
      badgeBg: "#1e293b",
      badgeText: "#f8fafc",
      priceBg: "#059669",
      priceText: "#ffffff",
      accentGlow: "rgba(245, 158, 11, 0.15)",
    },
    emerald: {
      name: "Forest Trade",
      bgGradStart: "#052e16",
      bgGradEnd: "#0f172a",
      accentGradStart: "#10b981",
      accentGradEnd: "#059669",
      cardBg: "rgba(6, 78, 59, 0.4)",
      cardBorder: "rgba(16, 185, 129, 0.3)",
      badgeBg: "#064e3b",
      badgeText: "#a7f3d0",
      priceBg: "#10b981",
      priceText: "#ffffff",
      accentGlow: "rgba(16, 185, 129, 0.15)",
    },
    slate: {
      name: "Steel Blue",
      bgGradStart: "#0f172a",
      bgGradEnd: "#1e293b",
      accentGradStart: "#38bdf8",
      accentGradEnd: "#0284c7",
      cardBg: "rgba(30, 41, 59, 0.6)",
      cardBorder: "rgba(56, 189, 248, 0.3)",
      badgeBg: "#1e3a5f",
      badgeText: "#bae6fd",
      priceBg: "#0284c7",
      priceText: "#ffffff",
      accentGlow: "rgba(56, 189, 248, 0.15)",
    },
    amber: {
      name: "Warm Gold",
      bgGradStart: "#1c1917",
      bgGradEnd: "#292524",
      accentGradStart: "#fbbf24",
      accentGradEnd: "#d97706",
      cardBg: "rgba(41, 37, 36, 0.6)",
      cardBorder: "rgba(251, 191, 36, 0.3)",
      badgeBg: "#451a03",
      badgeText: "#fde68a",
      priceBg: "#d97706",
      priceText: "#ffffff",
      accentGlow: "rgba(251, 191, 36, 0.18)",
    },
  };

  // Canvas drawing routine
  const generateCanvasImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions: 1200 x 630 (Standard OpenGraph Social Card size)
    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    const t = themes[cardTheme];

    // 1. Draw Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, t.bgGradStart);
    bgGrad.addColorStop(0.5, t.bgGradEnd);
    bgGrad.addColorStop(1, t.bgGradStart);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Draw Subtle Engineering Dot Grid Pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    const dotSpacing = 32;
    for (let x = 16; x < W; x += dotSpacing) {
      for (let y = 16; y < H; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Draw Ambient Glow Circles
    const radGlow1 = ctx.createRadialGradient(200, 150, 20, 200, 150, 400);
    radGlow1.addColorStop(0, t.accentGlow);
    radGlow1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radGlow1;
    ctx.fillRect(0, 0, W, H);

    const radGlow2 = ctx.createRadialGradient(W - 200, H - 150, 20, W - 200, H - 150, 450);
    radGlow2.addColorStop(0, "rgba(16, 185, 129, 0.1)");
    radGlow2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radGlow2;
    ctx.fillRect(0, 0, W, H);

    // 4. Draw Header Brand Bar
    // Logo Mark Box
    const logoX = 60;
    const logoY = 50;
    const logoSize = 48;
    
    // Logo bg
    const logoGrad = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
    logoGrad.addColorStop(0, t.accentGradStart);
    logoGrad.addColorStop(1, t.accentGradEnd);
    
    ctx.save();
    ctx.fillStyle = logoGrad;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 12);
    ctx.fill();
    ctx.restore();

    // Logo Icon (Hammer & Spark graphic inside logo)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("🔨", logoX + 8, logoY + 34);

    // Brand Name Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("HOT SPOT WORKSHOP", logoX + 64, logoY + 34);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("DIRECT HOME IMPROVEMENT & TRADE EXCHANGE • 0% LEAD FEES", logoX + 64, logoY + 54);

    // Right-aligned status pill
    const statusText = project.isEmergency ? "⚡ EMERGENCY DIRECT REQUEST" : "VERIFIED PROJECT POST";
    ctx.font = "800 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const statusWidth = ctx.measureText(statusText).width + 36;
    const statusX = W - 60 - statusWidth;
    const statusY = 52;
    
    ctx.save();
    ctx.fillStyle = project.isEmergency ? "rgba(225, 29, 72, 0.25)" : t.badgeBg;
    ctx.strokeStyle = project.isEmergency ? "#f43f5e" : t.cardBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(statusX, statusY, statusWidth, 34, 17);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = project.isEmergency ? "#fecdd3" : t.badgeText;
    ctx.fillText(statusText, statusX + 18, statusY + 22);
    ctx.restore();

    // 5. Draw Main Content Card Area
    const cardX = 60;
    const cardY = 120;
    const cardW = W - 120;
    const cardH = 430;

    // Card background
    ctx.save();
    ctx.fillStyle = t.cardBg;
    ctx.strokeStyle = t.cardBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 24);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6. Draw Left Column (Project Information)
    const leftColX = cardX + 44;
    let currY = cardY + 52;

    // Location & Radius Tag
    const locText = `📍 ${project.city.toUpperCase()}, ${project.state} • ${computedDistance} MI RADIUS MATCH`;
    ctx.fillStyle = "#38bdf8";
    ctx.font = "800 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(locText, leftColX, currY);
    currY += 46;

    // Project Title (Wrapped properly for 2 lines max)
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    
    const maxTitleWidth = 620;
    const words = project.title.split(" ");
    let line = "";
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxTitleWidth && n > 0) {
        ctx.fillText(line, leftColX, currY);
        line = words[n] + " ";
        currY += 50;
        lineCount++;
        if (lineCount >= 2) break;
      } else {
        line = testLine;
      }
    }
    if (lineCount < 2) {
      ctx.fillText(line, leftColX, currY);
      currY += 40;
    }

    // Description snippet
    currY += 10;
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const desc = project.description || "Escrow guaranteed contractor matching with $0 lead fees. Submit quotes directly to property owner.";
    const descWords = desc.split(" ");
    let descLine = "";
    let descCount = 0;
    for (let i = 0; i < descWords.length; i++) {
      const testDesc = descLine + descWords[i] + " ";
      if (ctx.measureText(testDesc).width > 620 && i > 0) {
        ctx.fillText(descLine, leftColX, currY);
        descLine = descWords[i] + " ";
        currY += 26;
        descCount++;
        if (descCount >= 2) break;
      } else {
        descLine = testDesc;
      }
    }
    if (descCount < 2) {
      ctx.fillText(descLine, leftColX, currY);
    }

    // Project Feature Badges
    const badgeY = cardY + cardH - 74;
    const badges = [
      { text: "🛡️ Escrow Protected", bg: "rgba(16, 185, 129, 0.2)", border: "#059669", color: "#6ee7b7" },
      { text: "💬 Direct Owner Chat", bg: "rgba(56, 189, 248, 0.2)", border: "#0284c7", color: "#7dd3fc" },
      { text: "⚡ $0 Lead Deductions", bg: "rgba(245, 158, 11, 0.2)", border: "#d97706", color: "#fde68a" },
    ];

    let badgeX = leftColX;
    badges.forEach((b) => {
      ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const bWidth = ctx.measureText(b.text).width + 24;
      
      ctx.save();
      ctx.fillStyle = b.bg;
      ctx.strokeStyle = b.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, bWidth, 32, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = b.color;
      ctx.fillText(b.text, badgeX + 12, badgeY + 21);
      ctx.restore();

      badgeX += bWidth + 12;
    });

    // 7. Draw Right Column (Large Verified Budget Card & Call to Action)
    const rightColW = 380;
    const rightColX = cardX + cardW - rightColW - 36;
    const rightColY = cardY + 36;
    const rightColH = cardH - 72;

    // Budget Box Background
    ctx.save();
    const budgetBg = ctx.createLinearGradient(rightColX, rightColY, rightColX, rightColY + rightColH);
    budgetBg.addColorStop(0, "rgba(15, 23, 42, 0.85)");
    budgetBg.addColorStop(1, "rgba(30, 41, 59, 0.95)");
    ctx.fillStyle = budgetBg;
    ctx.strokeStyle = t.accentGradStart;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rightColX, rightColY, rightColW, rightColH, 20);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Budget Header label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("VERIFIED TARGET BUDGET", rightColX + 30, rightColY + 44);

    // Large Budget Number
    ctx.fillStyle = "#34d399";
    ctx.font = "900 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(`$${project.budget.toLocaleString()}`, rightColX + 30, rightColY + 104);

    // Sub-budget detail
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("100% Guaranteed Client Budget Allocation", rightColX + 30, rightColY + 134);

    // Divider line inside budget box
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rightColX + 30, rightColY + 158);
    ctx.lineTo(rightColX + rightColW - 30, rightColY + 158);
    ctx.stroke();

    // Job specs mini metrics
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("• Category:", rightColX + 30, rightColY + 188);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(project.type === "business" ? "Commercial Job" : "Residential Home", rightColX + 115, rightColY + 188);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("• Active Bids:", rightColX + 30, rightColY + 214);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "800 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("Open for Contractor Proposals", rightColX + 115, rightColY + 214);

    // Call to action button box
    const btnY = rightColY + rightColH - 74;
    const btnH = 50;
    const btnW = rightColW - 60;
    const btnX = rightColX + 30;

    const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
    btnGrad.addColorStop(0, t.accentGradStart);
    btnGrad.addColorStop(1, t.accentGradEnd);

    ctx.save();
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 14);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("VIEW & SUBMIT QUOTE ➔", btnX + btnW / 2, btnY + 31);
    ctx.restore();

    // 8. Footer Watermark & Direct Link
    ctx.fillStyle = "#64748b";
    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      `🔗 Direct Link: hotspotworkshop.com/project/${project.id.slice(0, 8)}`,
      cardX + 10,
      H - 30
    );

    ctx.textAlign = "right";
    ctx.fillText(
      "© Hot Spot Work Shop Inc. • Powered by Real-Time Universal Synchronizer",
      cardX + cardW - 10,
      H - 30
    );

    // Convert canvas to Data URL for thumbnail preview
    const dataUrl = canvas.toDataURL("image/png");
    setImagePreviewUrl(dataUrl);

    // Dynamically set Open-Graph & Twitter meta tags (title, description, image, price) in document.head
    try {
      const metaResult = applyOpenGraphMetaTags(project, dataUrl);
      setOgMeta(metaResult);
    } catch (metaErr) {
      console.warn("Could not inject OpenGraph tags:", metaErr);
    }

    setIsGenerating(false);
  }, [project, computedDistance, cardTheme]);

  // Generate on mount and whenever theme changes
  useEffect(() => {
    generateCanvasImage();
  }, [generateCanvasImage]);

  // Copy HTML Meta Snippet
  const handleCopyMetaSnippet = async () => {
    if (!ogMeta) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(ogMeta.htmlSnippet);
        setCopiedMetaSnippet(true);
        setTimeout(() => setCopiedMetaSnippet(false), 2500);
      }
    } catch (e) {
      console.error("Failed to copy meta snippet:", e);
    }
  };

  // Download high-resolution PNG image
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const cleanTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
      link.download = `hotspotworkshop-${project.city.toLowerCase()}-${cleanTitle}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to download canvas image:", err);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setCopyError(null);
    try {
      if (typeof window !== "undefined" && window.navigator && window.navigator.clipboard && window.ClipboardItem) {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setCopyError("Could not create image blob");
            return;
          }
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2500);
          } catch (clipErr) {
            console.warn("Clipboard write failed, downloading instead", clipErr);
            handleDownloadImage();
          }
        }, "image/png");
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      console.error("Clipboard copy error:", err);
      handleDownloadImage();
    }
  };

  // Share using Web Share API with attached generated file
  const handleShareWithAttachedImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const cleanTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
        const imageFile = new File([blob], `hotspotworkshop-${cleanTitle}.png`, { type: "image/png" });

        const shareData: ShareData = {
          title: `Hot Spot Workshop: ${project.title}`,
          text: `🔨 Check out "${project.title}" in ${project.city}, ${project.state} (Target Budget: $${project.budget.toLocaleString()}). Verified listing with 0% contractor lead fees!`,
          url: `https://hotspotworkshop.com/project/${project.id}`,
        };

        if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
          shareData.files = [imageFile];
        }

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (shareErr) {
            console.log("Device share dismissed", shareErr);
          }
        } else {
          handleDownloadImage();
        }
      }, "image/png");
    } catch (e) {
      console.error("Share with image error:", e);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white space-y-4 shadow-xl" id={`canvas-share-generator-${project.id}`}>
      
      {/* Hidden high-res canvas rendering buffer */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Client-Side Social Media Card Generator</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] px-1.5 py-0.5 rounded font-mono">
                1200 × 630 HD
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Generate a branded mock graphic to attach when posting to social platforms for higher engagement.
            </p>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <Palette className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
          {(["midnight", "emerald", "slate", "amber"] as CardTheme[]).map((themeKey) => (
            <button
              key={themeKey}
              type="button"
              onClick={() => setCardTheme(themeKey)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                cardTheme === themeKey
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id={`theme-btn-${themeKey}-${project.id}`}
            >
              {themes[themeKey].name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Canvas Image Render Preview */}
      <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950/80 shadow-2xl group">
        {imagePreviewUrl ? (
          <img
            src={imagePreviewUrl}
            alt={`Social Share Preview for ${project.title}`}
            className="w-full h-auto object-contain rounded-xl transition duration-200"
            id={`canvas-preview-img-${project.id}`}
          />
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs font-semibold">Generating high-definition share image...</span>
          </div>
        )}

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs flex items-center justify-center gap-2.5 p-4">
          <button
            type="button"
            onClick={handleDownloadImage}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Save PNG</span>
          </button>
          <button
            type="button"
            onClick={handleCopyImageToClipboard}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-600 shadow-lg transition cursor-pointer"
          >
            {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedImage ? "Copied!" : "Copy to Clipboard"}</span>
          </button>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleDownloadImage}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md ${
            downloadSuccess
              ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
              : "bg-amber-500 hover:bg-amber-400 text-slate-950"
          }`}
          id={`download-share-card-btn-${project.id}`}
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Image (.png)!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Image (.png)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyImageToClipboard}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer border shadow-md ${
            copiedImage
              ? "bg-emerald-900/60 border-emerald-500 text-emerald-200"
              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
          }`}
          id={`copy-share-image-btn-${project.id}`}
        >
          {copiedImage ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Copied Image!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-300" />
              <span>Copy Image</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleShareWithAttachedImage}
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer shadow-md border border-blue-500/50"
          id={`device-share-image-btn-${project.id}`}
        >
          <Smartphone className="w-4 h-4 text-blue-200" />
          <span>Share with Image</span>
        </button>
      </div>

      {/* Helper notice */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tip: Paste or attach this image on X, Facebook, LinkedIn, or Nextdoor to increase CTR by up to 300%.</span>
        </span>
        <span className="text-slate-500 font-mono text-[10px]">PNG &bull; 1200x630</span>
      </div>

      {/* Open Graph Meta Tags Live Status & Inspector */}
      <div className="border border-slate-700/80 bg-slate-950/90 rounded-xl overflow-hidden text-xs">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex items-center gap-1.5 font-extrabold text-slate-200">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <span>Open-Graph & Twitter Meta Tags Active</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] px-1.5 py-0.25 rounded font-mono font-bold">
              &lt;head&gt; Injected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMetaSnippet}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2 py-1 rounded-lg text-[10px] transition cursor-pointer border border-slate-700"
              title="Copy raw HTML meta tags to clipboard"
            >
              {copiedMetaSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Code2 className="w-3 h-3 text-amber-400" />}
              <span>{copiedMetaSnippet ? "Copied Snippet!" : "Copy <meta> Code"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMetaInspector(!showMetaInspector)}
              className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
            >
              {showMetaInspector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showMetaInspector && (
          <div className="p-3 space-y-2.5 bg-slate-950/50 text-[11px] animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block text-[10px]">og:title</span>
                <span className="text-slate-300 block truncate" title={ogMeta?.title || project.title}>
                  {ogMeta?.title || project.title}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1">
                <span className="text-amber-400 font-bold block text-[10px]">og:price:amount & currency</span>
                <span className="text-slate-200 font-bold flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span>{project.budget.toLocaleString()} USD</span>
                  <span className="text-slate-500 font-normal">(& product:price:amount)</span>
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1 md:col-span-2">
                <span className="text-sky-400 font-bold block text-[10px]">og:description</span>
                <span className="text-slate-300 block line-clamp-2" title={ogMeta?.description}>
                  {ogMeta?.description || project.description}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1 md:col-span-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-fuchsia-400 font-bold block text-[10px]">og:image (1200×630 Canvas Buffer)</span>
                  <span className="text-slate-400 text-[10px] truncate block font-mono">
                    {imagePreviewUrl ? `${imagePreviewUrl.slice(0, 48)}... [Live Data URL Attached]` : "Generating Canvas Stream..."}
                  </span>
                </div>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[9px] px-2 py-0.5 rounded font-bold shrink-0">
                  Active in &lt;head&gt;
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span>Dynamic crawler metadata automatically generated for Facebook, X, LinkedIn & WhatsApp web scrapers.</span>
              <span className="font-mono text-slate-500">twitter:card=summary_large_image</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
