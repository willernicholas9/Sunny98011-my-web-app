import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Project, Bid, BaseUser } from "../types";
import {
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Lock,
  Shield,
  ArrowRight,
  DollarSign,
  Image as ImageIcon,
  Share2,
  Copy,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  X,
  Upload,
  Trash2,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileCheck,
  ShieldCheck,
  Hammer,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Flame,
  LayoutGrid,
  QrCode,
  ExternalLink,
  Download,
  MessageSquare,
  Send,
  Home,
  Printer,
} from "lucide-react";
import ProjectMiniMap from "./ProjectMiniMap";
import { CITIES, getDistance } from "../data/cities";
import ProjectShareImageGenerator from "./ProjectShareImageGenerator";
import { applyOpenGraphMetaTags, generateProjectOGImage } from "../services/openGraphGenerator";
import QuickBidModal from "./project-board/QuickBidModal";
import InvoiceEstimateGeneratorModal from "./InvoiceEstimateGeneratorModal";
import MilestoneEscrowManagerModal from "./MilestoneEscrowManagerModal";
import BeforeAfterShowcaseModal from "./BeforeAfterShowcaseModal";
import MaterialAndPermitEstimatorModal from "./MaterialAndPermitEstimatorModal";

interface ProjectCardProps {
  key?: string | number;
  project: Project;
  bids: Bid[];
  currentUser: any;
  currentCityName?: string;
  distanceToProject?: number | null;
  onPlaceBid?: (amount: number, message: string) => void;
  onAgreeToProject?: () => void;
  onAcceptBid?: (bidId: string) => void;
  onCompleteProject?: () => void;
  onStartChat?: (recipientId: string, recipientName: string, recipientRole: "customer" | "contractor") => void;
  onCounterBid?: (bidId: string, amount: number, message: string) => void;
  onContractorAcceptCounter?: (bidId: string) => void;
  onContractorDeclineCounter?: (bidId: string) => void;
  onContractorCounter?: (bidId: string, amount: number, message: string) => void;
  onViewOnMap?: (projectId: string) => void;
  onSimulateContractorBid?: (projectId: string) => void;
  onUpdateProjectImages?: (projectId: string, images: string[]) => void;
}

function ProjectCardComponent({
  project,
  bids,
  currentUser,
  currentCityName,
  distanceToProject,
  onPlaceBid,
  onAgreeToProject,
  onAcceptBid,
  onCompleteProject,
  onStartChat,
  onCounterBid,
  onContractorAcceptCounter,
  onContractorDeclineCounter,
  onContractorCounter,
  onViewOnMap,
  onSimulateContractorBid,
  onUpdateProjectImages,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickBidModal, setShowQuickBidModal] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedImageForLightbox, setSelectedImageForLightbox] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareStudioTab, setShareStudioTab] = useState<"image_generator" | "social_previews">("image_generator");
  const [copied, setCopied] = useState(false);
  const [copiedPostText, setCopiedPostText] = useState(false);
  const [activeSharePlatform, setActiveSharePlatform] = useState<"twitter" | "facebook" | "linkedin" | "nextdoor" | "whatsapp">("twitter");
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [qrMode, setQrMode] = useState<"direct_view" | "instant_bid">("instant_bid");
  
  const [counterAmount, setCounterAmount] = useState<string>("");
  const [counterMessage, setCounterMessage] = useState<string>("");
  const [activeCounterBidId, setActiveCounterBidId] = useState<string | null>(null);
  const [shareSuccessToast, setShareSuccessToast] = useState<string | null>(null);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showBeforeAfterModal, setShowBeforeAfterModal] = useState(false);
  const [showPermitCalcModal, setShowPermitCalcModal] = useState(false);

  const directProjectUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?project=${project.id}${qrMode === "instant_bid" ? "&action=bid" : ""}`
    : `https://hotspotworkshop.com/?project=${project.id}${qrMode === "instant_bid" ? "&action=bid" : ""}`;

  const handleCopyQrUrl = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(directProjectUrl);
        setQrCopied(true);
        setShareSuccessToast(qrMode === "instant_bid" ? "Direct Contractor Quick-Bid Link copied!" : "Unique Project Card Link copied!");
        setTimeout(() => {
          setQrCopied(false);
          setShareSuccessToast(null);
        }, 3000);
      }
    } catch (e) {
      console.warn("Failed to copy QR URL", e);
    }
  };

  const handlePrintJobSheet = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const svgEl = document.getElementById(`qr-svg-${project.id}`);
    const svgHtml = svgEl ? svgEl.outerHTML : "";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project.title} - Job Flyer & QR Access</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; text-align: center; color: #18181b; }
            .card { max-width: 550px; margin: 0 auto; border: 2px solid #e4e4e7; border-radius: 24px; padding: 32px; }
            .badge { display: inline-block; background: #fef3c7; color: #92400e; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px; }
            h1 { font-size: 24px; margin: 8px 0; color: #09090b; }
            .meta { font-size: 14px; color: #71717a; margin-bottom: 20px; }
            .budget { font-size: 32px; font-weight: 900; color: #047857; margin: 16px 0; }
            .qr-container { background: #18181b; padding: 20px; border-radius: 16px; display: inline-block; margin: 16px 0; }
            .qr-container svg { background: white; padding: 12px; border-radius: 12px; }
            .instructions { font-size: 13px; color: #52525b; line-height: 1.5; margin-top: 16px; }
            .url { font-family: monospace; font-size: 11px; color: #a1a1aa; word-break: break-all; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">Hotspot Tradesmen Network • Direct Contractor Bid Opportunity</div>
            <h1>${project.title}</h1>
            <div class="meta">📍 ${project.city}, ${project.state} ${project.zipCode || ""} • ${project.type === "business" ? "Commercial" : "Residential"}</div>
            <div class="budget">${project.budget.toLocaleString()} Target Budget</div>
            <div class="qr-container">
              ${svgHtml}
            </div>
            <div class="instructions">
              <strong>Scan with Phone Camera to View & Bid:</strong><br/>
              Contractors can review project photos, chat with the homeowner, and submit bids with 0% broker lead fees.
            </div>
            <div class="url">${directProjectUrl}</div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadQrCode = () => {
    try {
      setDownloadingQr(true);
      const svg = document.getElementById(`qr-svg-${project.id}`);
      if (!svg) {
        setDownloadingQr(false);
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = 600;
        canvas.height = 600;
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 50, 50, 500, 500);
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          const safeTitle = (project.title || "project").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
          downloadLink.download = `QR_${safeTitle}_HotSpot.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        }
        setDownloadingQr(false);
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.warn("QR download failed", err);
      setDownloadingQr(false);
    }
  };

  // Timeline Progress Steps
  const TIMELINE_STEPS = [
    {
      id: "agreement_signed",
      title: "Agreement Signed",
      subtitle: "Contractor Selected & Terms Confirmed",
      icon: FileCheck,
      description: "Contract details agreed upon by client and contractor. Private contact info unlocked.",
    },
    {
      id: "funds_escrowed",
      title: "Funds Escrowed",
      subtitle: "Payment Secured in Escrow",
      icon: ShieldCheck,
      description: "Customer funds / $20 service fee verified and held safely in platform escrow.",
    },
    {
      id: "work_in_progress",
      title: "Work In Progress",
      subtitle: "Active Tradesman Work",
      icon: Hammer,
      description: "Contractor is on site actively executing project milestones and labor.",
    },
    {
      id: "completed",
      title: "Completed",
      subtitle: "Inspected & Funds Released",
      icon: CheckCircle2,
      description: "Job completed to client satisfaction and escrowed funds released to contractor.",
    },
  ];

  const [projectStep, setProjectStep] = useState<number>(() => {
    if (project.status === "completed") return 3;
    if (project.status === "accepted") {
      if (project.agreedByCustomer && project.agreedByContractor) return 2;
      return 1;
    }
    return 0;
  });

  useEffect(() => {
    if (project.status === "completed") setProjectStep(3);
    else if (project.status === "accepted") {
      if (project.agreedByCustomer && project.agreedByContractor) setProjectStep(2);
      else setProjectStep(1);
    } else {
      setProjectStep(0);
    }
  }, [project.status, project.agreedByCustomer, project.agreedByContractor]);

  const isOwner = currentUser && currentUser.id === project.customerId;
  const isAcceptedContractor = currentUser && currentUser.id === project.acceptedContractorId;
  const isFullyAgreedAndAccepted = project.status === "accepted" || project.status === "completed";
  const canSeePrivateDetails = isOwner || (isAcceptedContractor && isFullyAgreedAndAccepted);
  const projectServiceFee = project.budget <= 25000 ? 5 : 20;

  const baseCity = currentCityName || currentUser?.city || "Austin";
  const userCityObj = CITIES.find((c) => c.name.toLowerCase() === baseCity.toLowerCase()) || CITIES[0];
  const projectCityObj = CITIES.find((c) => c.name.toLowerCase() === project.city.toLowerCase()) || CITIES[0];
  const computedDistance = distanceToProject !== undefined && distanceToProject !== null
    ? distanceToProject
    : getDistance(userCityObj.lat, userCityObj.lng, projectCityObj.lat, projectCityObj.lng);

  const isZeroBid = bids.length === 0 && (project.status === "open" || project.status === "bid_placed");

  // Handle native Web Share API
  const handleNativeShare = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = `https://hotspotworkshop.com/project/${project.id}`;
    const shareData = {
      title: `${project.title} - Hot Spot Workshop`,
      text: `Check out this project opportunity: "${project.title}" in ${project.city}, ${project.state}. Est. Budget: $${project.budget.toLocaleString()}. 100% Free Bidding for contractors!`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Native share failed, falling back to copy:", err);
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setShareSuccessToast("Link copied to clipboard!");
        setTimeout(() => {
          setCopied(false);
          setShareSuccessToast(null);
        }, 2500);
      } catch {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleOpenShareModal = async () => {
    setShowShareModal(true);
    try {
      const ogImageDataUrl = await generateProjectOGImage(project, { computedDistance });
      applyOpenGraphMetaTags(project, ogImageDataUrl);
    } catch {
      applyOpenGraphMetaTags(project);
    }
  };

  // Image Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList: File[] = Array.from(files);
    const imageFiles: File[] = fileList.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      alert("Please choose valid image files.");
      return;
    }
    const loadedUrls: string[] = [];
    let loadedCount = 0;
    imageFiles.forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Skipping ${file.name} because it exceeds the 5MB file size limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          loadedUrls.push(event.target.result);
        }
        loadedCount++;
        if (loadedCount === imageFiles.length) {
          const currentImages = project.images || [];
          const updatedImages = [...currentImages, ...loadedUrls];
          if (onUpdateProjectImages) {
            onUpdateProjectImages(project.id, updatedImages);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!window.confirm("Delete this reference photo?")) return;
    const currentImages = project.images || [];
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    if (onUpdateProjectImages) {
      onUpdateProjectImages(project.id, updatedImages);
      if (activeImageIdx >= updatedImages.length) {
        setActiveImageIdx(Math.max(0, updatedImages.length - 1));
      }
    }
  };

  return (
    <div
      className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
      id={`project-card-${project.id}`}
    >
      <div>
        {/* 1. Clean Top Header Ribbon */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-2.5">
          {/* Badge Row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.isEmergency && (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-rose-600 text-white shadow-2xs animate-pulse flex items-center gap-1">
                <span>⚡ EMERGENCY</span>
              </span>
            )}
            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full select-none ${
              project.type === "business" ? "bg-cyan-100 text-cyan-800" : "bg-zinc-200/80 text-zinc-800"
            }`}>
              {project.type === "business" ? "Commercial" : "Residential"}
            </span>

            {/* Opportunity Competition Pill */}
            {isZeroBid ? (
              <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-3xs">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>⭐ 0 Bids (1st Mover!)</span>
              </span>
            ) : bids.length > 0 && (project.status === "open" || project.status === "bid_placed") ? (
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" />
                <span>{bids.length} Active {bids.length === 1 ? "Bid" : "Bids"}</span>
              </span>
            ) : project.status === "accepted" ? (
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                🤝 Matched & Escrow
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-green-100 text-green-900">
                🏁 Completed
              </span>
            )}
          </div>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-1.5">
            {project.images && project.images.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedImageForLightbox(project.images[0])}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 px-2 py-1 rounded-lg transition shadow-3xs cursor-pointer"
                title="View attached photos"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>📷 {project.images.length} {project.images.length === 1 ? "Photo" : "Photos"}</span>
              </button>
            )}

            {/* Share via QR Code Button */}
            <button
              type="button"
              onClick={() => setShowQrCode(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-950 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-lg transition shadow-3xs cursor-pointer active:scale-95"
              title="Share via QR Code so contractors can quickly bid on this job"
              id={`share-qr-btn-${project.id}`}
            >
              <QrCode className="w-3.5 h-3.5 text-amber-700" />
              <span>Share via QR Code</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="p-1 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
              title="Share job opportunity"
              id={`share-btn-${project.id}`}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Main Opportunity Body */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Title & Large Emerald Budget */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="font-display text-base sm:text-lg font-extrabold text-zinc-900 leading-snug tracking-tight truncate" title={project.title}>
                {project.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  {project.city}, {project.state}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.25 rounded-md">
                  ⚡ {computedDistance} mi away
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-lg sm:text-xl font-display font-black text-emerald-700">
                ${project.budget.toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">
                ${projectServiceFee}.00 escrow fee
              </div>
            </div>
          </div>

          {/* Scope Description */}
          <p className="text-zinc-600 text-xs leading-relaxed line-clamp-2">
            {project.description}
          </p>

          {/* Photo Preview Strip (Compact thumbnail row with tags if photos exist) */}
          {project.images && project.images.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {project.images.map((img, idx) => {
                  const tag = project.photoTags ? project.photoTags[img] : undefined;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageForLightbox(img)}
                      className="relative shrink-0 rounded-xl overflow-hidden border border-zinc-200 hover:border-amber-500 transition-all cursor-pointer group/thumb shadow-3xs"
                      title={tag ? `${tag} (Click to expand)` : "Click to expand photo"}
                    >
                      <div className="w-16 h-14 bg-zinc-100">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover group-hover/thumb:scale-105 transition" referrerPolicy="no-referrer" />
                      </div>
                      {tag && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-bold px-1 py-0.5 truncate text-center">
                          {tag}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center">
                        <Eye className="w-3.5 h-3.5 text-white" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* AI Damage / Material Scope Badge if available */}
              {project.damageScanAnalysis && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1 bg-blue-600 text-white rounded-lg shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-blue-950 text-[11px]">AI Damage Diagnosis:</span>
                        <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                          project.damageScanAnalysis.damageSeverity === "Severe Structural" || project.damageScanAnalysis.damageSeverity === "Emergency Hazard"
                            ? "bg-rose-100 text-rose-800"
                            : project.damageScanAnalysis.damageSeverity === "Moderate Repair"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {project.damageScanAnalysis.damageSeverity}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-900/80 truncate font-medium">
                        {project.damageScanAnalysis.summary}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowScopeModal(true)}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition shadow-3xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>View AI Scope</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Toast Notification */}
          {shareSuccessToast && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center animate-in fade-in">
              ✓ {shareSuccessToast}
            </div>
          )}
        </div>
      </div>

      {/* 3. Streamlined Bidding & Action Bar */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-zinc-150 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Action: Expand Details Accordion & Share via QR Code */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Hide Details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Details & Management</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowQrCode(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-amber-400 px-3 py-2 rounded-xl transition shadow-3xs cursor-pointer"
              title="Generate a unique URL and QR Code for contractors to quickly bid on this job"
              id={`footer-share-qr-btn-${project.id}`}
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600" />
              <span>Share via QR Code</span>
            </button>
          </div>

          {/* Right Actions: Quick Bid / Chat / Agree */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Ask Owner Chat Button */}
            {currentUser?.role === "contractor" && (
              <button
                type="button"
                onClick={() => onStartChat && onStartChat(project.customerId, project.customerFirstName, "customer")}
                className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold px-3 py-2 rounded-xl text-xs transition shadow-3xs flex items-center gap-1.5 cursor-pointer"
                title="Send a message to the job owner"
              >
                <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden sm:inline">Ask Owner</span>
              </button>
            )}

            {/* Quick Bid Button for Contractors */}
            {currentUser?.role === "contractor" && (project.status === "open" || project.status === "bid_placed") && (
              <button
                type="button"
                onClick={() => setShowQuickBidModal(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-black px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                id={`quick-bid-btn-${project.id}`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Place Bid</span>
              </button>
            )}

            {/* Simulate Contractor Bid (Owner Testing) */}
            {isOwner && (project.status === "open" || project.status === "bid_placed") && onSimulateContractorBid && (
              <button
                type="button"
                onClick={() => onSimulateContractorBid(project.id)}
                className="bg-zinc-900 hover:bg-zinc-800 text-amber-300 font-bold px-3 py-2 rounded-xl text-xs transition shadow-3xs flex items-center gap-1 cursor-pointer"
                title="Simulate a contractor placing a bid"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Bid Alert</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Expanded Listing Details & Deep Management Accordion */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-zinc-150 space-y-4 animate-in fade-in duration-200">
            {/* Private Contact Card if Accepted */}
            {canSeePrivateDetails ? (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Unlocked Customer Information</span>
                  </span>
                  <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    $0 Contact Fee
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-zinc-500 font-medium block text-[10px]">Client Name:</span>
                    <strong>{project.customerFirstName} {project.customerLastName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium block text-[10px]">Phone Number:</span>
                    <a href={`tel:${project.customerPhone}`} className="text-emerald-700 font-bold hover:underline">
                      📞 {project.customerPhone || "512-555-0199"}
                    </a>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium block text-[10px]">Email Address:</span>
                    <a href={`mailto:${project.customerEmail}`} className="text-emerald-700 font-bold hover:underline">
                      ✉️ {project.customerEmail || "client@verified.com"}
                    </a>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium block text-[10px]">Job Site Address:</span>
                    <span>📍 {project.address || `${project.city}, ${project.state} ${project.zipCode}`}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Customer private phone & address unlock automatically once a bid is accepted.</span>
                </span>
                <span className="font-bold text-emerald-700 shrink-0">$0 Lead Fee</span>
              </div>
            )}

            {/* Mini Map Location View */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Job Location & Travel Distance
              </span>
              <ProjectMiniMap
                userCityName={baseCity}
                projectCityName={project.city}
                compact={true}
                onViewOnMap={() => onViewOnMap && onViewOnMap(project.id)}
              />
            </div>

            {/* Bids List & Negotiation */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                  Submitted Contractor Bids ({bids.length})
                </h4>
                {bids.length > 1 && isOwner && (
                  <button
                    type="button"
                    onClick={handleOpenShareModal}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800"
                  >
                    Open Share Studio
                  </button>
                )}
              </div>

              {bids.length === 0 ? (
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-center text-xs text-zinc-500">
                  No bids submitted yet. Be the first contractor to place a proposal!
                </div>
              ) : (
                <div className="space-y-2">
                  {bids.map((bid) => {
                    const isBidder = currentUser && currentUser.id === bid.contractorId;
                    return (
                      <div
                        key={bid.id}
                        className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2 shadow-3xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-extrabold text-xs text-zinc-900">{bid.contractorName}</span>
                            <span className="text-[11px] text-zinc-400 ml-2">
                              {new Date(bid.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-sm font-black text-emerald-700">
                            ${bid.amount.toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-2.5 rounded-lg border border-zinc-150">
                          "{bid.message}"
                        </p>

                        {/* Actions on Bids */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {isOwner && project.status === "open" && (
                            <>
                              <button
                                type="button"
                                onClick={() => onStartChat && onStartChat(bid.contractorId, bid.contractorName, "contractor")}
                                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold px-3 py-1.5 rounded-lg text-[11px] transition"
                              >
                                💬 Chat
                              </button>
                              <button
                                type="button"
                                onClick={() => onAcceptBid && onAcceptBid(bid.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-[11px] transition flex items-center gap-1"
                              >
                                <span>Accept Bid</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Photo Uploader for Project Owner */}
            {isOwner && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700">Add More Reference Photos</span>
                  <label className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Images</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* Pro Trade Tools Bar (Invoicing, Milestones, Transformations, Permits) */}
            <div className="p-3.5 bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-900 text-white rounded-2xl space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Pro Contractor & Homeowner Toolbelt</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">100% Free Tools</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/15 p-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer"
                  title="Generate professional PDF invoice or bid estimate"
                >
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="leading-tight">
                    <span className="font-bold block text-[11px]">Estimate / Invoice</span>
                    <span className="text-[9px] text-zinc-400">PDF Generator</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/15 p-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer"
                  title="Staged payout milestones in escrow vault"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="leading-tight">
                    <span className="font-bold block text-[11px]">Milestone Escrow</span>
                    <span className="text-[9px] text-zinc-400">Staged Payouts</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBeforeAfterModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/15 p-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer"
                  title="Interactive Before & After slider gallery"
                >
                  <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="leading-tight">
                    <span className="font-bold block text-[11px]">Before & After</span>
                    <span className="text-[9px] text-zinc-400">Sliders Gallery</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPermitCalcModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/15 p-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer"
                  title="Calculate materials and check municipal building permits"
                >
                  <Hammer className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="leading-tight">
                    <span className="font-bold block text-[11px]">Material & Permits</span>
                    <span className="text-[9px] text-zinc-400">Regional Guide</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Quick Bid Modal */}
      {showQuickBidModal && (
        <QuickBidModal
          project={project}
          currentUser={currentUser}
          existingBids={bids}
          onClose={() => setShowQuickBidModal(false)}
          onSubmitBid={(amount, message) => {
            if (onPlaceBid) {
              onPlaceBid(amount, message);
            }
          }}
        />
      )}

      {/* 6. Photo Lightbox Modal */}
      {selectedImageForLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedImageForLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedImageForLightbox(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2 text-sm font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-5 h-5" /> Close Preview
            </button>
            <img
              src={selectedImageForLightbox}
              alt="Expanded view"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* 7. Social Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-zinc-150 flex items-center justify-between bg-zinc-950 text-white">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">Share Project Listing</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <ProjectShareImageGenerator project={project} computedDistance={computedDistance} />
            </div>
          </div>
        </div>
      )}

      {/* 8. Mobile QR Code Modal */}
      {showQrCode && (
        <div
          className="fixed inset-0 bg-zinc-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowQrCode(false)}
        >
          <div
            className="bg-white max-w-md w-full rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            id={`qr-modal-${project.id}`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-white">
                    Share via QR Code
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Unique project link for mobile scanning & contractor quick bidding
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrCode(false)}
                className="p-1.5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Target Link Mode Selector */}
              <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
                <button
                  type="button"
                  onClick={() => setQrMode("instant_bid")}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition text-center cursor-pointer flex items-center justify-center gap-1 ${
                    qrMode === "instant_bid"
                      ? "bg-amber-500 text-zinc-950 shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Contractor Quick-Bid Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrMode("direct_view")}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition text-center cursor-pointer flex items-center justify-center gap-1 ${
                    qrMode === "direct_view"
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Job Card View</span>
                </button>
              </div>

              {/* Project Brief Info */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3 space-y-1 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full inline-block mb-0.5">
                  {project.type === "business" ? "Commercial Opportunity" : "Residential Opportunity"}
                </span>
                <h4 className="font-display font-extrabold text-zinc-900 text-sm sm:text-base leading-tight line-clamp-1">
                  {project.title}
                </h4>
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <span>📍 {project.city}, {project.state}</span>
                  <span>•</span>
                  <span className="font-extrabold text-emerald-700">${project.budget.toLocaleString()}</span>
                  {isZeroBid && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">⭐ 0 Bids</span>
                    </>
                  )}
                </div>
              </div>

              {/* High-Resolution QR Code Canvas Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner">
                <div className="bg-white p-3.5 rounded-2xl shadow-xl flex items-center justify-center">
                  <QRCodeSVG
                    id={`qr-svg-${project.id}`}
                    value={directProjectUrl}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{qrMode === "instant_bid" ? "Scan to open & immediately submit proposal" : "Scan to open this job on mobile"}</span>
                </div>
              </div>

              {/* Direct Link & Action Controls */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
                  <input
                    type="text"
                    readOnly
                    value={directProjectUrl}
                    className="bg-transparent text-xs text-zinc-600 px-2.5 flex-1 truncate outline-none font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyQrUrl}
                    className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 transition flex items-center gap-1 cursor-pointer shrink-0 shadow-3xs"
                  >
                    {qrCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadQrCode}
                    disabled={downloadingQr}
                    className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>{downloadingQr ? "Generating..." : "Download PNG"}</span>
                  </button>

                  <a
                    href={directProjectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Open in Tab</span>
                  </a>
                </div>

                {/* Print Job Sheet Button */}
                <button
                  type="button"
                  onClick={handlePrintJobSheet}
                  className="w-full py-2 px-3 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Print Printable Jobsite QR Flyer</span>
                </button>
              </div>

              {/* Informational Guidance */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-950 space-y-1">
                <span className="font-extrabold block">💡 Instant Contractor Bidding</span>
                <p className="text-amber-900/80 leading-relaxed">
                  Contractors scanning or clicking this unique URL land straight on this job opportunity. When using the Quick-Bid mode, the proposal form opens instantly so they can bid in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. AI Damage Diagnostic & Material Scope Sheet Modal */}
      {showScopeModal && project.damageScanAnalysis && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-zinc-900 leading-tight">
                    AI Visual Scope & Material Breakdown
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Calculated from homeowner uploaded inspection photos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScopeModal(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnosis Summary Card */}
            <div className="bg-gradient-to-br from-zinc-50 to-blue-50/40 border border-zinc-200 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-zinc-500">Identified Trade Scope</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {project.damageScanAnalysis.recommendedTrade}
                </span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                {project.damageScanAnalysis.summary}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Labor Hours</span>
                  <span className="text-sm font-extrabold text-zinc-900">{project.damageScanAnalysis.estimatedLaborHours}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Severity</span>
                  <span className="text-sm font-extrabold text-rose-700">{project.damageScanAnalysis.damageSeverity}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Cost Range</span>
                  <span className="text-sm font-extrabold text-emerald-700">{project.damageScanAnalysis.estCostRange}</span>
                </div>
              </div>
            </div>

            {/* Issues Detected */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Detected Conditions</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.damageScanAnalysis.detectedIssues.map((issue, idx) => (
                  <span key={idx} className="bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold px-2.5 py-1 rounded-xl">
                    ⚠️ {issue}
                  </span>
                ))}
              </div>
            </div>

            {/* Required Materials with Instant Partner Store Links */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Recommended Replacement Materials</h4>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Direct Partner Sourcing
                </span>
              </div>
              <div className="space-y-2">
                {project.damageScanAnalysis.suggestedMaterials.map((mat, idx) => {
                  const matName = typeof mat === "string" ? mat : mat.name;
                  const matQty = typeof mat === "string" ? "1 unit" : (mat.quantity || "1 unit");
                  const matPrice = typeof mat === "string" ? "Wholesale Price" : (mat.estimatedPrice || "In Stock");
                  const storeUrl = typeof mat === "string" ? "https://homedepot.com" : (mat.affiliateUrl || "https://homedepot.com");
                  const storeName = typeof mat === "string" ? "Home Depot" : (mat.store || "Home Depot");

                  return (
                    <div key={idx} className="bg-white border border-zinc-200 hover:border-amber-300 rounded-xl p-3 flex items-center justify-between gap-3 transition">
                      <div>
                        <div className="text-xs font-extrabold text-zinc-900">{matName}</div>
                        <div className="text-[11px] text-zinc-500">Qty: {matQty} • Est: {matPrice}</div>
                      </div>
                      <a
                        href={storeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-3xs shrink-0"
                      >
                        <span>Buy at {storeName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-150 flex justify-end">
              <button
                type="button"
                onClick={() => setShowScopeModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Scope Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Invoice & Estimate Generator Modal */}
      {showInvoiceModal && (
        <InvoiceEstimateGeneratorModal
          onClose={() => setShowInvoiceModal(false)}
          project={project}
          contractor={currentUser?.role === "contractor" ? currentUser : null}
          currentUser={currentUser}
        />
      )}

      {/* 9. Milestone Escrow Manager Modal */}
      {showMilestoneModal && (
        <MilestoneEscrowManagerModal
          onClose={() => setShowMilestoneModal(false)}
          project={project}
          currentUserRole={currentUser?.role}
          onUpdateMilestones={(updatedMs) => {
            project.milestones = updatedMs;
          }}
        />
      )}

      {/* 10. Before & After Showcase Modal */}
      {showBeforeAfterModal && (
        <BeforeAfterShowcaseModal
          onClose={() => setShowBeforeAfterModal(false)}
          contractorName={currentUser?.company || currentUser?.fullName}
          currentUser={currentUser}
        />
      )}

      {/* 11. Material & Permit Calculator Modal */}
      {showPermitCalcModal && (
        <MaterialAndPermitEstimatorModal
          onClose={() => setShowPermitCalcModal(false)}
          initialCity={project.city}
        />
      )}
    </div>
  );
}

export default React.memo(ProjectCardComponent);
