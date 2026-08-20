import React, { useState, useEffect } from "react";
import { Project, Bid, UserRole } from "../types";
import { MapPin, Phone, Mail, FileText, CheckCircle, Lock, Shield, ArrowRight, DollarSign, Image as ImageIcon, Share2, Copy, Check, Twitter, Facebook, Linkedin, X, Upload, Trash2, Plus, Eye, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileCheck, ShieldCheck, Hammer, CheckCircle2, Clock, Sparkles, Flag, LayoutGrid, QrCode, ExternalLink, MessageSquare, Send, Smartphone, Globe, Home, Download, Palette, Layers } from "lucide-react";
import ProjectMiniMap from "./ProjectMiniMap";
import { CITIES, getDistance } from "../data/cities";
import ProjectShareImageGenerator from "./ProjectShareImageGenerator";
import { applyOpenGraphMetaTags, generateProjectOGImage } from "../services/openGraphGenerator";

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

export default function ProjectCard({
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
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidMessage, setBidMessage] = useState<string>("");
  const [showBidForm, setShowBidForm] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [imageDisplayMode, setImageDisplayMode] = useState<"carousel" | "grid">("carousel");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareStudioTab, setShareStudioTab] = useState<"image_generator" | "social_previews">("image_generator");
  const [copied, setCopied] = useState(false);
  const [copiedPostText, setCopiedPostText] = useState(false);
  const [activeSharePlatform, setActiveSharePlatform] = useState<"twitter" | "facebook" | "linkedin" | "nextdoor" | "whatsapp">("twitter");
  const [showQrCode, setShowQrCode] = useState(false);
  
  const [counterAmount, setCounterAmount] = useState<string>("");
  const [counterMessage, setCounterMessage] = useState<string>("");
  const [activeCounterBidId, setActiveCounterBidId] = useState<string | null>(null);
  const [showBidComparisonModal, setShowBidComparisonModal] = useState(false);

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
      if (project.agreedByCustomer || project.agreedByContractor) return 1;
      return 0;
    }
    return 0;
  });

  useEffect(() => {
    if (project.status === "completed") {
      setProjectStep(3);
    } else if (project.status === "accepted") {
      if (project.agreedByCustomer && project.agreedByContractor) {
        setProjectStep((prev) => Math.max(prev, 2));
      } else if (project.agreedByCustomer || project.agreedByContractor) {
        setProjectStep((prev) => Math.max(prev, 1));
      } else {
        setProjectStep((prev) => Math.max(prev, 0));
      }
    }
  }, [project.status, project.agreedByCustomer, project.agreedByContractor]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImageForLightbox, setSelectedImageForLightbox] = useState<string | null>(null);

  const presetReferenceImages = [
    {
      name: "🔨 Framing & Decking",
      url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "🎨 Wall Painting",
      url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "🌿 Landscaping/Lawn",
      url: "https://images.unsplash.com/photo-1558904541-efa8c1a68f6f?auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "🔧 Plumbing & Tools",
      url: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=500&q=80",
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!onUpdateProjectImages) return;

    const files = Array.from(e.dataTransfer.files) as File[];
    processFiles(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpdateProjectImages) {
      const files = Array.from(e.target.files) as File[];
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      alert("Only standard image formats (PNG, JPG, WEBP) are supported.");
      return;
    }

    let loadedCount = 0;
    const loadedUrls: string[] = [];

    imageFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Skipping ${file.name} because it exceeds the 5MB file size boundary.`);
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
    if (!window.confirm("Are you sure you want to delete this reference image?")) return;
    const currentImages = project.images || [];
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    if (onUpdateProjectImages) {
      onUpdateProjectImages(project.id, updatedImages);
      if (activeImageIdx >= updatedImages.length) {
        setActiveImageIdx(Math.max(0, updatedImages.length - 1));
      }
    }
  };

  const handleAddPresetImage = (url: string) => {
    const currentImages = project.images || [];
    if (currentImages.includes(url)) {
      alert("This preset reference image has already been uploaded.");
      return;
    }
    const updatedImages = [...currentImages, url];
    if (onUpdateProjectImages) {
      onUpdateProjectImages(project.id, updatedImages);
    }
  };

  const customerLastNameInitial = project.customerLastName ? `${project.customerLastName.charAt(0)}.` : "";
  const isOwner = currentUser && currentUser.id === project.customerId;
  const isAcceptedContractor = currentUser && currentUser.id === project.acceptedContractorId;

  // Realized state determines if detailed customer info (Last Name, Phone, Address, Email) is fully visible
  const isFullyAgreedAndAccepted = project.status === "accepted" || project.status === "completed";
  const canSeePrivateDetails = isOwner || (isAcceptedContractor && isFullyAgreedAndAccepted);

  const projectServiceFee = project.budget <= 25000 ? 5 : 20;

  const baseCity = currentCityName || currentUser?.city || "Austin";
  const userCityObj = CITIES.find((c) => c.name.toLowerCase() === baseCity.toLowerCase()) || CITIES[0];
  const projectCityObj = CITIES.find((c) => c.name.toLowerCase() === project.city.toLowerCase()) || CITIES[0];
  const computedDistance = distanceToProject !== undefined && distanceToProject !== null
    ? distanceToProject
    : getDistance(userCityObj.lat, userCityObj.lng, projectCityObj.lat, projectCityObj.lng);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }
    if (onPlaceBid) {
      onPlaceBid(amount, bidMessage);
      setBidAmount("");
      setBidMessage("");
      setShowBidForm(false);
    }
  };

  const [shareSuccessToast, setShareSuccessToast] = useState<string | null>(null);

  // Social media native Web Share API trigger
  const handleNativeShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?project=${project.id}#project-${project.id}`;
    const shareTitle = `Hot Spot Workshop: ${project.title}`;
    const projectCategoryLabel = project.type === "business" ? "Commercial Job" : "Residential Job";
    const shareText = `🛠️ Check out "${project.title}" (${projectCategoryLabel}) in ${project.city}, ${project.state} - Budget: $${project.budget.toLocaleString()} USD.\n${project.description ? project.description.slice(0, 110) + '...' : 'Connect with top verified local contractors with $0 lead fees!'}`;

    // Apply dynamic OpenGraph meta tags
    try {
      applyOpenGraphMetaTags(project);
    } catch {
      // ignore
    }

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareSuccessToast("Shared successfully!");
        setTimeout(() => setShareSuccessToast(null), 2500);
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // User dismissed or cancelled the share dialog
          return;
        }
        console.warn("Web Share API encountered an error, falling back to clipboard copy:", err);
      }
    }

    // Fallback if navigator.share is unsupported or fails: copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setShareSuccessToast("Project link copied to clipboard!");
        setTimeout(() => {
          setCopied(false);
          setShareSuccessToast(null);
        }, 2500);
      } catch (clipErr) {
        console.warn("Clipboard copy failed:", clipErr);
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  // Open share modal and automatically apply dynamic Open-Graph meta tags (title, description, image, price)
  const handleOpenShareModal = async () => {
    setShowShareModal(true);
    try {
      // Hidden canvas generator produces formatted high-res summary card and sets OpenGraph metadata in document.head
      const ogImageDataUrl = await generateProjectOGImage(project, { computedDistance });
      applyOpenGraphMetaTags(project, ogImageDataUrl);
    } catch (err) {
      applyOpenGraphMetaTags(project);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md overflow-hidden flex flex-col justify-between" id={`project-card-${project.id}`}>
      <div>
        {/* Visual Header Image Carousel or Grid for Project Visualization */}
        {project.images && project.images.length > 0 ? (
          <div className="relative border-b border-zinc-200 bg-zinc-950 overflow-hidden group/header" id={`project-image-gallery-${project.id}`}>
            {imageDisplayMode === "carousel" ? (
              /* --- CAROUSEL MODE --- */
              <div className={`relative w-full transition-all duration-300 flex flex-col justify-between ${isExpanded ? "h-60 sm:h-72" : "h-48 sm:h-56"}`}>
                {/* Main Active Image with Click to Lightbox */}
                <div 
                  className="absolute inset-0 cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-900"
                  onClick={() => setSelectedImageForLightbox(project.images![activeImageIdx])}
                  title="Click to view full screen"
                >
                  <img
                    src={project.images[activeImageIdx]}
                    alt={`${project.title} - Photo ${activeImageIdx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 transform group-hover/header:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-950/30 pointer-events-none" />

                  {/* Zoom Hint Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/header:opacity-100 transition-opacity bg-black/25 backdrop-blur-[2px]">
                    <div className="bg-zinc-900/90 text-white border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>Expand Photo #{activeImageIdx + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Top Overlay Badges & View Controls */}
                <div className="relative z-20 p-3 flex items-center justify-between gap-2">
                  <div className="flex gap-1.5 flex-wrap items-center">
                    {project.isEmergency && (
                      <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full select-none backdrop-blur-md bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md border border-rose-300 animate-pulse flex items-center gap-1">
                        <span>⚡ 24/7 EMERGENCY</span>
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full select-none backdrop-blur-md text-white shadow-md ${
                      project.type === "business" ? "bg-cyan-600/90" : "bg-emerald-600/90"
                    }`}>
                      {project.type === "business" ? "Business" : "Home"}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full select-none shadow-md ${
                      project.status === "open" ? "bg-zinc-100/90 text-zinc-800" :
                      project.status === "bid_placed" ? "bg-amber-100/90 text-amber-900 border border-amber-200" :
                      project.status === "accepted" ? "bg-blue-900 text-white border border-blue-700" :
                      "bg-green-100/90 text-green-900"
                    }`}>
                      {project.status === "open" ? "Open" :
                       project.status === "bid_placed" ? "Bids In" :
                       project.status === "accepted" ? "Agreed Job" : "Completed 🎉"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Native Web Share Button on Image Overlay */}
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 hover:border-blue-400 p-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                      title="Share project on Social Media or Messaging apps via Web Share"
                      id={`header-share-btn-${project.id}`}
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-300" />
                    </button>

                    {/* Image Counter Badge */}
                    <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                      📷 {activeImageIdx + 1} / {project.images.length}
                    </span>

                    {/* View Switcher: Switch to Grid */}
                    {project.images.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageDisplayMode("grid");
                        }}
                        className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 hover:border-amber-400 p-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Switch to Grid View"
                      >
                        <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Left & Right Prev/Next Carousel Arrows */}
                {project.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev - 1 + project.images!.length) % project.images!.length);
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/60 hover:bg-amber-500 hover:text-slate-950 backdrop-blur-md text-white rounded-full transition-all duration-200 border border-white/20 shadow-lg cursor-pointer transform hover:scale-110"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev + 1) % project.images!.length);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/60 hover:bg-amber-500 hover:text-slate-950 backdrop-blur-md text-white rounded-full transition-all duration-200 border border-white/20 shadow-lg cursor-pointer transform hover:scale-110"
                      title="Next Image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Bottom Overlay Scrollable Thumbnail Strip */}
                {project.images.length > 1 && (
                  <div className="relative z-20 p-2 flex items-center justify-between gap-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
                      {project.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIdx(idx);
                          }}
                          className={`relative shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            idx === activeImageIdx
                              ? "border-amber-400 scale-105 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/40"
                              : "border-white/30 opacity-60 hover:opacity-100 hover:border-white"
                          }`}
                          title={`Select photo #${idx + 1}`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Thumb ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {idx === activeImageIdx && (
                            <div className="absolute inset-0 bg-amber-400/10 pointer-events-none" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* --- GRID MODE --- */
              <div className="p-3 bg-zinc-950 space-y-2.5">
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-400">Project Photo Grid</span>
                    <span className="text-[10px] text-zinc-400 font-mono">({project.images.length} Photos)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageDisplayMode("carousel")}
                    className="bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Carousel View</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {project.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveImageIdx(idx);
                        setSelectedImageForLightbox(imgUrl);
                      }}
                      className={`group relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        idx === activeImageIdx
                          ? "border-amber-400 ring-2 ring-amber-400/30"
                          : "border-zinc-800 hover:border-zinc-500"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Placeholder Header when no images are attached */
          <div className="relative bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border-b border-zinc-200 p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">No Project Photos</span>
                  {project.isEmergency && (
                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-rose-600 text-white animate-pulse">
                      ⚡ EMERGENCY
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">
                  {isOwner ? "Attach job photos to attract faster, accurate bids!" : "Owner hasn't attached photos yet."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleNativeShare}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Share project via native Web Share API"
                id={`placeholder-share-btn-${project.id}`}
              >
                <Share2 className="w-3.5 h-3.5 text-blue-300" />
              </button>

              <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full select-none shadow-sm ${
                project.type === "business" ? "bg-cyan-600/90 text-white" : "bg-emerald-600/90 text-white"
              }`}>
                {project.type === "business" ? "Business" : "Home"}
              </span>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs transition shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Photos</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Primary Card Contents - Compact Default Mode */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Header Row: Title & Budget */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="font-display text-base sm:text-lg font-extrabold text-zinc-900 leading-snug tracking-tight truncate" title={project.title}>
                {project.title}
              </h3>

              {project.isEmergency && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 my-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                  <span>⚡ Urgent Dispatch ({project.emergencyCategory || "Emergency"}) &bull; Target &lt; 30 Mins</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  {project.city}, {project.state}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.25 rounded-md">
                  ⚡ {computedDistance} miles away
                </span>
                <span className="text-zinc-300">•</span>
                <span className="inline-flex items-center text-[11px] font-bold text-zinc-700 bg-zinc-100 px-1.5 py-0.25 rounded-md">
                  💬 {bids.length} {bids.length === 1 ? "Bid" : "Bids"}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-lg sm:text-xl font-display font-black text-emerald-700">
                ${project.budget.toLocaleString()}
              </div>
              <div className="text-[9px] text-zinc-400 font-medium">
                Est. Budget
              </div>
            </div>
          </div>

          {/* Mini Static Map Location Thumbnail */}
          <ProjectMiniMap
            userCityName={baseCity}
            projectCityName={project.city}
            compact={true}
            onViewOnMap={() => onViewOnMap && onViewOnMap(project.id)}
          />

          {/* Description Preview */}
          <p className={`text-zinc-600 text-xs leading-relaxed ${isExpanded ? "whitespace-pre-line bg-zinc-50/60 p-3 rounded-xl border border-zinc-100" : "line-clamp-2"}`}>
            {project.description}
          </p>

          {/* Visual Progress Timeline for Accepted or Completed Projects */}
          {(project.status === "accepted" || project.status === "completed") && (
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/80 rounded-2xl p-4 text-white shadow-md my-2" id={`progress-timeline-${project.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-800/60 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  <h4 className="font-display font-black text-xs sm:text-sm tracking-tight text-white uppercase">
                    Project Execution Progress
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-900/90 border border-blue-700/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-blue-100">
                  <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>Step {projectStep + 1} of 4: {TIMELINE_STEPS[projectStep].title}</span>
                </div>
              </div>

              {/* Stepper Track */}
              <div className="relative py-1.5 px-1">
                {/* Background Connecting Line */}
                <div className="absolute top-5 left-8 right-8 h-1 bg-blue-900/90 rounded-full z-0 hidden sm:block" />
                {/* Animated Filled Connecting Line */}
                <div 
                  className="absolute top-5 left-8 h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 rounded-full z-0 transition-all duration-500 hidden sm:block" 
                  style={{ width: `${Math.min(100, Math.max(0, projectStep * 30))}%` }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = idx < projectStep || project.status === "completed";
                    const isCurrent = idx === projectStep && project.status !== "completed";

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setProjectStep(idx)}
                        className={`flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer ${
                          isCurrent 
                            ? "bg-blue-800/80 border border-amber-400/60 shadow-sm ring-2 ring-amber-400/30" 
                            : isDone 
                            ? "bg-emerald-950/60 border border-emerald-700/50 hover:bg-emerald-900/50" 
                            : "bg-slate-900/50 border border-blue-900/40 hover:bg-blue-900/30 opacity-70"
                        }`}
                        title={`Step ${idx + 1}: ${step.title} - ${step.subtitle}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isDone 
                            ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-900/50" 
                            : isCurrent 
                            ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/40 ring-4 ring-amber-400/20 animate-pulse" 
                            : "bg-blue-900/90 text-blue-300 border border-blue-700/50"
                        }`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <StepIcon className="w-4 h-4" />}
                        </div>

                        <span className={`mt-1.5 text-[11px] font-bold leading-tight ${
                          isCurrent ? "text-amber-300" : isDone ? "text-emerald-300" : "text-blue-200"
                        }`}>
                          {step.title}
                        </span>
                        <span className="text-[9px] text-blue-200/80 mt-0.5 line-clamp-1 font-medium hidden sm:block">
                          {step.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Step Description and Quick Milestone Controller */}
              <div className="mt-2.5 pt-2.5 border-t border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                <div className="text-blue-100 flex items-center gap-2 text-center sm:text-left">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-ping" />
                  <span className="font-semibold text-[11px] text-blue-100">{TIMELINE_STEPS[projectStep].description}</span>
                </div>

                <div className="flex gap-2 shrink-0">
                  {projectStep < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (projectStep === 2) {
                          if (onCompleteProject) onCompleteProject();
                          setProjectStep(3);
                        } else {
                          setProjectStep((prev) => Math.min(3, prev + 1));
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-1 rounded-xl text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Advance to {TIMELINE_STEPS[Math.min(3, projectStep + 1)].title}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {projectStep === 3 && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> All Milestones Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Compact Quick Action Row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onViewOnMap && onViewOnMap(project.id)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2.5 py-1 rounded-lg transition cursor-pointer"
                title="View on Google Map directory"
              >
                📍 Map
              </button>

              {/* Native Social Media Web Share Button */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-lg transition-all shadow-3xs hover:shadow-2xs active:scale-95 cursor-pointer"
                title="Share project with friends on social media or messaging apps using native Web Share menu"
                id={`social-share-btn-${project.id}`}
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Share</span>
                {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Native Device Share Ready" />
                )}
              </button>

              {/* OpenGraph & Social Studio Trigger */}
              <button
                type="button"
                onClick={handleOpenShareModal}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-lg transition cursor-pointer"
                title="Open Social Card & OpenGraph Studio"
                id={`share-project-btn-${project.id}`}
              >
                <Palette className="w-3 h-3 text-zinc-400" />
                <span className="hidden sm:inline">Studio</span>
              </button>

              {/* Quick feedback toast */}
              {shareSuccessToast && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md animate-fade-in">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{shareSuccessToast}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {currentUser?.role === "contractor" && project.status === "open" && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser.subscriptionActive) {
                      alert("You must have an active $20/month subscription to place bids and accept projects.");
                      return;
                    }
                    setIsExpanded(true);
                    setShowBidForm(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-xs flex items-center gap-1 cursor-pointer"
                  id={`bid-btn-${project.id}`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Place Bid
                </button>
              )}

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage ({bids.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                id={`expand-toggle-btn-${project.id}`}
              >
                <span>{isExpanded ? "Collapse" : "Details"}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
              </button>
            </div>
          </div>

          {/* Expanded Full Details Section */}
          {isExpanded && (
            <div className="pt-3 border-t border-zinc-200/80 space-y-6 animate-in fade-in duration-200">
              {/* MiniMap Preview */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Location Directory Map
                </span>
                <ProjectMiniMap
                  userCityName={baseCity}
                  projectCityName={project.city}
                />
              </div>

              {/* Dynamic Project Reference Image Gallery Block */}
              <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/40 space-y-3" id={`reference-images-panel-${project.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-150 pb-2.5">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>Job Reference Images</span>
                <span className="bg-zinc-100 text-zinc-700 text-[10px] px-1.5 py-0.25 rounded-full font-semibold">
                  {(project.images || []).length}
                </span>
              </h4>
              <p className="text-[11px] text-zinc-500">
                Visual references assist local tradesmen to estimate correctly and secure competitive bids.
              </p>
            </div>
          </div>

          {/* Reference Thumbnails Grid */}
          {(project.images && project.images.length > 0) ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {project.images.map((img, idx) => (
                <div key={idx} className="group relative aspect-video bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 shadow-3xs hover:border-amber-400 transition-all duration-200">
                  <img
                    src={img}
                    alt={`Reference ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedImageForLightbox(img)}
                      className="p-1.5 bg-white text-zinc-800 hover:bg-zinc-100 rounded-lg shadow-sm transition-transform hover:scale-105"
                      title="View full size reference image"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm transition-transform hover:scale-105"
                        title="Delete this reference image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="absolute bottom-1 left-1 px-1 bg-black/60 text-white text-[9px] font-mono rounded-md">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-center text-zinc-400 italic text-xs">
              No reference images have been attached to this project request yet.
            </div>
          )}

          {/* Owner interactive Drag & Drop uploader and presets list */}
          {isOwner && (
            <div className="space-y-4 pt-2">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById(`file-input-${project.id}`)?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-250 flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-amber-500 bg-amber-50/60"
                    : "border-zinc-250 hover:border-amber-400 bg-white hover:bg-zinc-50/20"
                }`}
                title="Select and upload standard workspace photos"
              >
                <input
                  type="file"
                  id={`file-input-${project.id}`}
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-2 bg-amber-50 rounded-full text-amber-500">
                  <Upload className="w-4 h-4 text-amber-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-700">
                    Drag & drop reference images here, or <span className="text-amber-600 hover:underline">click to browse</span>
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Supports PNG, JPG, JPEG, WEBP formats up to 5MB.
                  </p>
                </div>
              </div>

              {/* Preset Injections Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">
                  Quick-Add Reference Design Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {presetReferenceImages.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddPresetImage(preset.url)}
                      className="bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-amber-300 rounded-xl px-3 py-1.5 text-[11px] text-zinc-700 font-semibold transition flex items-center gap-1 cursor-pointer shadow-3xs"
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Role Presentation (Visual Hiding Logic) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 px-4 bg-zinc-50 rounded-xl border border-zinc-100 mb-6">
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>Customer Information</span>
              {canSeePrivateDetails ? (
                <span className="text-[9px] text-green-600 bg-green-50 border border-green-200 px-1 rounded">Unlocked</span>
              ) : (
                <span className="text-[9px] text-zinc-400 bg-zinc-100 border border-zinc-200 px-1 rounded">Partially Private</span>
              )}
            </div>
            <div className="text-sm font-semibold text-zinc-800">
              Posted by: <span className="text-zinc-900">{project.customerFirstName} {canSeePrivateDetails ? project.customerLastName : customerLastNameInitial}</span>
            </div>
            
            {/* Contact Details Shield View */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-600">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                {canSeePrivateDetails ? (
                  <span>{project.customerAddress}, {project.city}, {project.state}</span>
                ) : (
                  <span className="text-zinc-400 italic flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Address Hidden (locked)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                {canSeePrivateDetails ? (
                  <a href={`tel:${project.customerPhone}`} className="text-amber-700 hover:underline">{project.customerPhone}</a>
                ) : (
                  <span className="text-zinc-400 italic flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Phone Number Hidden
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                {canSeePrivateDetails ? (
                  <span className="text-zinc-700">{project.customerEmail}</span>
                ) : (
                  <span className="text-zinc-400 italic flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Email Address Hidden
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-zinc-200 pt-2.5 md:pt-0 md:pl-4 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Platform Security Guarantee</div>
              <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
                Customer funds are verified and held in temporary escrow. Both parties mutually agree to begin the contract.
              </p>
            </div>
            <div className="pt-2">
              {!canSeePrivateDetails && currentUser?.role === "contractor" && (
                <p className="text-[10px] text-emerald-800 bg-emerald-50 rounded px-2.5 py-1.5 font-bold border border-emerald-200 flex items-center gap-1.5 shadow-3xs">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Customer Phone & Email unlock <strong>100% FREE ($0 Fee)</strong> once this project bid is accepted!</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bids List Section */}
        <div className="mt-4 border-t border-zinc-100 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-800 flex items-center gap-1.5">
              <span>Bids Panel</span>
              <span className="bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5 rounded-full font-semibold">{bids.length}</span>
            </h4>

            {bids.length >= 2 && (
              <button
                type="button"
                onClick={() => setShowBidComparisonModal(true)}
                className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                id={`compare-bids-btn-${project.id}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Compare Bids Side-by-Side</span>
              </button>
            )}
          </div>

          {bids.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">No bids placed on this project yet. Be the first to place an offer!</p>
          ) : (
            <div className="space-y-3">
              {bids.map((bid) => {
                const isActiveBid = project.acceptedContractorId === bid.contractorId;
                return (
                  <div key={bid.id} className={`p-4 rounded-xl border text-xs transition-all ${
                    isActiveBid
                      ? "border-amber-500 bg-amber-50/40"
                      : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50"
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-zinc-900">
                        👨‍🔧 {bid.contractorName} {bid.contractorCompany && <span className="text-zinc-500 font-normal">({bid.contractorCompany})</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-0.5 rounded shadow-xs">
                          ${bid.amount.toLocaleString()}
                        </span>
                        {isActiveBid && (
                          <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-zinc-600 leading-relaxed italic bg-white/60 p-2.5 rounded-lg border border-zinc-150">"{bid.message}"</p>

                    {/* COMMUNICATION LOGS & TIMELINE */}
                    {bid.history && bid.history.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-200/60 space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                          🤝 Negotiation & communication history
                        </span>
                        <div className="space-y-2 pl-2 border-l border-zinc-200">
                          {bid.history.map((step, idx) => (
                            <div key={idx} className="relative text-[11px] text-zinc-600">
                              <div className="absolute -left-[13px] top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <div className="font-bold text-zinc-800 flex justify-between items-center">
                                <span className="capitalize text-[10px] tracking-tight bg-zinc-100 text-zinc-700 px-1 py-0.25 rounded-md">
                                  Proposal by {step.senderRole === "customer" ? "Owner" : "Contractor"}
                                </span>
                                <span className="text-[9px] text-zinc-400 font-mono">
                                  {new Date(step.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 items-center mt-0.5">
                                <span className="font-bold text-zinc-900 font-mono bg-white border border-zinc-150 px-1.5 py-0.25 rounded">
                                  ${step.amount.toLocaleString()}
                                </span>
                                <p className="italic text-zinc-500">"{step.message}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic Contractor Status Notifications & Actions */}
                    {currentUser?.role === "contractor" && currentUser.id === bid.contractorId && (
                      <div className="mt-3 pt-3 border-t border-zinc-200/50 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
                          <span className="text-zinc-400 uppercase">Your Bid Status:</span>
                          {bid.status === "pending" && (
                            <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">⌛ Pending Review</span>
                          )}
                          {bid.status === "counter_by_customer" && (
                            <span className="text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200 animate-pulse">⚡ Counter-Offer Received!</span>
                          )}
                          {bid.status === "counter_by_contractor" && (
                            <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">⌛ Counter-Offer Submitted</span>
                          )}
                          {bid.status === "declined" && (
                            <span className="text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-200">✕ Declined</span>
                          )}
                          {bid.status === "accepted" && (
                            <span className="text-green-600 bg-green-50 px-2.5 py-0.5 rounded-md border border-green-200">✓ Accepted!</span>
                          )}
                        </div>

                        {bid.status === "counter_by_customer" && (
                          <div className="flex gap-2 justify-end items-center flex-wrap mt-2">
                            {activeCounterBidId === bid.id ? (
                              <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-3">
                                <h5 className="text-[10px] font-bold text-amber-900 uppercase">Send Counter Proposal</h5>
                                <div className="flex gap-2">
                                  <div className="w-24 shrink-0">
                                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">My Offer ($)</label>
                                    <input
                                      type="number"
                                      value={counterAmount}
                                      onChange={(e) => setCounterAmount(e.target.value)}
                                      placeholder="e.g. 525"
                                      className="w-full bg-white border border-zinc-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-amber-500 font-bold"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Message clarification</label>
                                    <input
                                      type="text"
                                      value={counterMessage}
                                      onChange={(e) => setCounterMessage(e.target.value)}
                                      placeholder="Explain your price details..."
                                      className="w-full bg-white border border-zinc-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-amber-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-1.5 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveCounterBidId(null);
                                      setCounterAmount("");
                                      setCounterMessage("");
                                    }}
                                    className="px-2 py-1 text-zinc-500"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const amt = parseFloat(counterAmount);
                                      if (isNaN(amt) || amt <= 0) {
                                        alert("Please enter a valid amount.");
                                        return;
                                      }
                                      if (!counterMessage.trim()) {
                                        alert("Please include a supportive message.");
                                        return;
                                      }
                                      if (onContractorCounter) {
                                        onContractorCounter(bid.id, amt, counterMessage);
                                        setActiveCounterBidId(null);
                                        setCounterAmount("");
                                        setCounterMessage("");
                                      }
                                    }}
                                    className="bg-amber-600 text-white font-bold px-3 py-1 rounded-lg"
                                  >
                                    Submit Counter
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end w-full">
                                <button
                                  type="button"
                                  onClick={() => onContractorAcceptCounter && onContractorAcceptCounter(bid.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition shadow-xs"
                                >
                                  ✓ Accept Owner's Counter (${bid.amount.toLocaleString()})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCounterAmount(bid.amount.toString());
                                    setActiveCounterBidId(bid.id);
                                  }}
                                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-bold px-3 py-1.5 rounded-lg text-[10px] transition"
                                >
                                  ⚡ Counter Back
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onContractorDeclineCounter && onContractorDeclineCounter(bid.id)}
                                  className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold px-3 py-1.5 rounded-lg text-[10px] transition"
                                >
                                  ✕ Decline
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Owner Actions: Accept Bid / Counter-Offer / Chat */}
                    {isOwner && (
                      <div className="mt-3 flex gap-2 justify-end items-center flex-wrap">
                        {activeCounterBidId === bid.id ? (
                          <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-3">
                            <h5 className="text-[11px] font-bold text-amber-900 uppercase">Send Counter-Offer Proposal</h5>
                            <div className="flex gap-3">
                              <div className="w-28 shrink-0">
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Your Price ($)</label>
                                <input
                                  type="number"
                                  value={counterAmount}
                                  onChange={(e) => setCounterAmount(e.target.value)}
                                  placeholder="e.g. 500"
                                  className="w-full bg-white border border-zinc-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-bold"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Message to Contractor</label>
                                <input
                                  type="text"
                                  value={counterMessage}
                                  onChange={(e) => setCounterMessage(e.target.value)}
                                  placeholder="Provide why you are countering..."
                                  className="w-full bg-white border border-zinc-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCounterBidId(null);
                                  setCounterAmount("");
                                  setCounterMessage("");
                                }}
                                className="px-2 py-1 text-zinc-500 hover:text-zinc-700"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const amt = parseFloat(counterAmount);
                                  if (isNaN(amt) || amt <= 0) {
                                    alert("Please input a valid amount.");
                                    return;
                                  }
                                  if (!counterMessage.trim()) {
                                    alert("Please include a professional message.");
                                    return;
                                  }
                                  if (onCounterBid) {
                                    onCounterBid(bid.id, amt, counterMessage);
                                    setActiveCounterBidId(null);
                                    setCounterAmount("");
                                    setCounterMessage("");
                                  }
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-lg"
                              >
                                Send Proposal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setCounterAmount(bid.amount.toString());
                                setActiveCounterBidId(bid.id);
                              }}
                              className="bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-950 font-bold px-3 py-1.5 rounded-lg text-[10px] transition shadow-3xs flex items-center gap-1 cursor-pointer"
                            >
                              🤝 Send Counter-Offer
                            </button>

                            <button
                              type="button"
                              onClick={() => onStartChat && onStartChat(bid.contractorId, bid.contractorName, "contractor")}
                              className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold px-3 py-1.5 rounded-lg text-[10px] transition shadow-3xs flex items-center gap-1.5 cursor-pointer"
                              title="Message this professional regarding bid specifications"
                            >
                              💬 Chat with Bidder
                            </button>

                            {project.status === "open" && (
                              <button
                                type="button"
                                onClick={() => onAcceptBid && onAcceptBid(bid.id)}
                                className="bg-zinc-950 hover:bg-zinc-850 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                id={`accept-bid-${bid.id}`}
                              >
                                Select Contractor <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Controls / Actions based on Roles & Project State */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="text-xs text-zinc-500">
            {project.status === "open" && <span className="text-zinc-500 font-medium">Seeking competitive bids.</span>}
            {project.status === "bid_placed" && <span className="text-amber-600 font-medium font-semibold">Reviewing submitted bids.</span>}
            {project.status === "accepted" && (
              <span className="text-emerald-700 font-bold block bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                🤝 Project Matched and Active
              </span>
            )}
            {project.status === "completed" && (
              <span className="text-green-700 font-extrabold block bg-green-50 px-3 py-1 rounded-full border border-green-100">
                🏁 Project Completed & Closed
              </span>
            )}
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            {isOwner && (project.status === "open" || project.status === "bid_placed") && onSimulateContractorBid && (
              <button
                type="button"
                onClick={() => onSimulateContractorBid(project.id)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Simulate a contractor submitting a bid on this listing to test push notification alerts"
                id={`simulate-bid-btn-${project.id}`}
              >
                ⚡ Test Receive Bid Alert
              </button>
            )}

            {/* Private Chat Stakeholder Channels */}
            {currentUser?.role === "contractor" && (
              <button
                type="button"
                onClick={() => onStartChat && onStartChat(project.customerId, project.customerFirstName, "customer")}
                className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold px-3 py-2 rounded-xl text-xs transition shadow-3xs flex items-center gap-1.5"
                title="Send a private message to the project owner to ask details"
              >
                💬 Ask Job Owner
              </button>
            )}

            {isOwner && project.acceptedContractorId && (
              <button
                type="button"
                onClick={() => {
                  const matchedBid = bids.find(b => b.contractorId === project.acceptedContractorId);
                  const contractorName = matchedBid?.contractorName || "Contractor Specialist";
                  onStartChat && onStartChat(project.acceptedContractorId!, contractorName, "contractor");
                }}
                className="bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold px-3 py-2 rounded-xl text-xs transition shadow-3xs flex items-center gap-1.5"
                title="Message the hired contractor specialist"
              >
                💬 Chat with Professional
              </button>
            )}

            {/* Contractor Role Actions */}
            {currentUser?.role === "contractor" && project.status === "open" && (
              <>
                {!showBidForm ? (
                  <button
                    onClick={() => {
                      if (!currentUser.subscriptionActive) {
                        alert("You must have an active $20/month subscription to place bids and accept projects.");
                        return;
                      }
                      setShowBidForm(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
                    id={`bid-btn-${project.id}`}
                  >
                    <DollarSign className="w-4 h-4" /> Place Bid & Offer Help
                  </button>
                ) : (
                  <button
                    onClick={() => setShowBidForm(false)}
                    className="text-zinc-500 hover:text-zinc-700 text-xs px-2"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}

            {/* Agreed Project Agreement flows (Both parties must click to finalize) */}
            {project.status === "accepted" && (
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                <div className="text-xs text-zinc-500">
                  <span className="block font-semibold">Agreement Status:</span>
                  <div className="flex gap-3 mt-1 font-medium">
                    <span className={project.agreedByCustomer ? "text-green-600" : "text-amber-600"}>
                      Customer: {project.agreedByCustomer ? "✓ Agreed" : "⌛ Pending Agreement"}
                    </span>
                    <span className={project.agreedByContractor ? "text-green-600" : "text-amber-600"}>
                      Contractor: {project.agreedByContractor ? "✓ Agreed" : "⌛ Pending Agreement"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {isOwner && !project.agreedByCustomer && (
                    <button
                      onClick={onAgreeToProject}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs"
                      id={`customer-agree-btn-${project.id}`}
                    >
                      Authorize Wallet & Agree (${projectServiceFee}.00 Service Fee)
                    </button>
                  )}
                  {isAcceptedContractor && !project.agreedByContractor && (
                    <button
                      onClick={onAgreeToProject}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs"
                      id={`contractor-agree-btn-${project.id}`}
                    >
                      Confirm Contract Details & Agree
                    </button>
                  )}
                  {isFullyAgreedAndAccepted && project.status === "accepted" && isOwner && (
                    <button
                      onClick={onCompleteProject}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                      id={`complete-project-btn-${project.id}`}
                    >
                      Release Payment & Complete Project
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <ChevronUp className="w-4 h-4 text-zinc-500" />
            <span>Collapse Listing Details</span>
          </button>
        </div>
      </div>
    )}
  </div>

        {/* Expanding Inline Bid Form */}
        {showBidForm && (
          <form onSubmit={handleBidSubmit} className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4 duration-300">
            <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Place Your Bid Offer</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Your Price ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-xs">$</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="e.g. 550"
                    required
                    className="w-full bg-white border border-zinc-300 rounded-xl pl-6 pr-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                    id="bid-input-amount"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Professional Cover Message / Pitch</label>
                <input
                  type="text"
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Introduce yourself, company and availability to complete the project..."
                  required
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  id="bid-input-message"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBidForm(false)}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700"
              >
                Close
              </button>
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition"
              >
                Submit Official Bid
              </button>
            </div>
          </form>
        )}

        {/* Share Modal & Mock Social Media Previews */}
        {showShareModal && (
          <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in" id={`share-modal-overlay-${project.id}`}>
            <div className="bg-white max-w-2xl w-full rounded-2xl sm:rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-150 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-blue-950 to-slate-900 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                      <span>Social Share & Link Preview Studio</span>
                    </h3>
                    <p className="text-[11px] text-blue-200/80">
                      Live client-side canvas mock image generator & simulated social card previews
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShowQrCode(false);
                  }}
                  className="p-1.5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl transition cursor-pointer"
                  id={`close-share-modal-${project.id}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                
                {/* Main Studio View Mode Selector */}
                <div className="flex p-1 bg-zinc-100 rounded-xl text-xs font-bold gap-1 border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setShareStudioTab("image_generator")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                      shareStudioTab === "image_generator"
                        ? "bg-slate-900 text-white shadow-sm font-extrabold"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                    id={`tab-image-generator-${project.id}`}
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>📸 HD Canvas Image Generator</span>
                    <span className="bg-amber-400 text-slate-950 text-[9px] px-1.5 py-0.25 rounded font-black uppercase">
                      New
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareStudioTab("social_previews")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                      shareStudioTab === "social_previews"
                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 font-extrabold"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                    id={`tab-social-previews-${project.id}`}
                  >
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>📱 Social Feed & Link Previews</span>
                  </button>
                </div>

                {/* 1. HD CANVAS CARD GENERATOR VIEW */}
                {shareStudioTab === "image_generator" && (
                  <ProjectShareImageGenerator
                    project={project}
                    computedDistance={computedDistance}
                  />
                )}

                {/* 2. SOCIAL MEDIA NETWORK MOCK CARDS VIEW */}
                {shareStudioTab === "social_previews" && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Platform Selection Tabs */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                          Select Network Simulation
                        </label>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          Real-time OpenGraph preview
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setActiveSharePlatform("twitter")}
                          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                            activeSharePlatform === "twitter"
                              ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200"
                              : "text-zinc-500 hover:text-zinc-900"
                          }`}
                        >
                          <Twitter className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                          <span className="truncate">X (Twitter)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSharePlatform("facebook")}
                          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                            activeSharePlatform === "facebook"
                              ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200"
                              : "text-zinc-500 hover:text-zinc-900"
                          }`}
                        >
                          <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">Facebook</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSharePlatform("linkedin")}
                          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                            activeSharePlatform === "linkedin"
                              ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200"
                              : "text-zinc-500 hover:text-zinc-900"
                          }`}
                        >
                          <Linkedin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span className="truncate">LinkedIn</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSharePlatform("nextdoor")}
                          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                            activeSharePlatform === "nextdoor"
                              ? "bg-white text-emerald-800 shadow-xs ring-1 ring-zinc-200"
                              : "text-zinc-500 hover:text-zinc-900"
                          }`}
                        >
                          <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">Nextdoor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSharePlatform("whatsapp")}
                          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                            activeSharePlatform === "whatsapp"
                              ? "bg-white text-emerald-800 shadow-xs ring-1 ring-zinc-200"
                              : "text-zinc-500 hover:text-zinc-900"
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">WhatsApp</span>
                        </button>
                      </div>
                    </div>

                    {/* Mock Social Media Preview Container */}
                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50/80 p-3.5 sm:p-4 relative">
                      
                      {/* Dynamic Post Meta Pill */}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200/80 text-[11px]">
                        <span className="font-bold text-zinc-600 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Dynamic Post Card Metadata</span>
                        </span>
                        <span className="bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-md text-[10px]">
                          Verified Direct Link
                        </span>
                      </div>

                      {/* 1. TWITTER / X MOCK CARD */}
                      {activeSharePlatform === "twitter" && (
                        <div className="space-y-3 animate-in fade-in">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              HS
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-extrabold text-xs text-zinc-900">Hot Spot Workshop</span>
                                <span className="text-[10px] text-cyan-500">☑</span>
                              </div>
                              <span className="text-[10px] text-zinc-500">@HotSpotWorkshop &bull; Just now</span>
                            </div>
                          </div>

                          <p className="text-xs leading-relaxed text-zinc-800">
                            🔨 New trade job opening in <span className="font-bold text-zinc-950">#{project.city.replace(/\s+/g, "")}</span>! "{project.title}". Budget: <span className="font-bold text-emerald-700">${project.budget.toLocaleString()}</span>. 0 lead fees for contractors. Submit a proposal: 👇
                          </p>

                          {/* Rich Link Card Snippet */}
                          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-xs hover:border-zinc-300 transition">
                            <div className="relative h-36 bg-zinc-900 overflow-hidden flex items-center justify-center">
                              {project.images && project.images.length > 0 ? (
                                <img
                                  src={project.images[0]}
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center text-white p-4 text-center">
                                  <Hammer className="w-8 h-8 text-amber-400 mb-1" />
                                  <span className="text-xs font-black tracking-tight">{project.title}</span>
                                  <span className="text-[10px] text-blue-200">hotspotworkshop.com &bull; ${project.budget.toLocaleString()}</span>
                                </div>
                              )}

                              {/* Overlay Floating Tags: Title, Budget, Location */}
                              <div className="absolute top-2 left-2 flex gap-1.5">
                                <span className="bg-emerald-600/95 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded-md shadow-md backdrop-blur-xs flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" /> ${project.budget.toLocaleString()}
                                </span>
                                {project.isEmergency && (
                                  <span className="bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-md">
                                    ⚡ EMERGENCY
                                  </span>
                                )}
                              </div>

                              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-white flex items-center justify-between text-[10px]">
                                <span className="flex items-center gap-1 font-semibold truncate">
                                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>{project.city}, {project.state}</span>
                                </span>
                                <span className="text-amber-300 font-mono shrink-0">⚡ {computedDistance} mi away</span>
                              </div>
                            </div>

                            <div className="p-3 bg-white space-y-1">
                              <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold tracking-wider">
                                HOTSPOTWORKSHOP.COM/PROJECT/{project.id.slice(0, 8)}
                              </span>
                              <h4 className="text-xs font-black text-zinc-900 line-clamp-1">{project.title}</h4>
                              <p className="text-[11px] text-zinc-500 line-clamp-1">
                                {project.description || "Escrow guaranteed contractor matching with $0 lead fees."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. FACEBOOK MOCK CARD */}
                      {activeSharePlatform === "facebook" && (
                        <div className="space-y-3 animate-in fade-in">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                              f
                            </div>
                            <div>
                              <span className="font-extrabold text-xs text-zinc-900 block">Hot Spot Workshop Community</span>
                              <span className="text-[10px] text-zinc-500">Sponsored &bull; 🌐 Public</span>
                            </div>
                          </div>

                          <p className="text-xs leading-relaxed text-zinc-800">
                            Attention tradesmen & general contractors in <span className="font-bold text-zinc-950">{project.city}</span>! A new verified homeowner job has been published: <span className="font-bold">"{project.title}"</span>. Est. Budget: <span className="font-bold text-emerald-700">${project.budget.toLocaleString()}</span>. Bids are 100% free with zero lead generation costs.
                          </p>

                          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-xs">
                            <div className="relative h-40 bg-zinc-900">
                              {project.images && project.images.length > 0 ? (
                                <img
                                  src={project.images[0]}
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-950 to-slate-900 flex flex-col items-center justify-center text-white p-4">
                                  <ShieldCheck className="w-8 h-8 text-emerald-400 mb-1" />
                                  <span className="text-xs font-bold text-center">{project.title}</span>
                                  <span className="text-[10px] text-emerald-300 font-mono">${project.budget.toLocaleString()} Budget &bull; {project.city}, {project.state}</span>
                                </div>
                              )}
                              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                                <MapPin className="w-3 h-3 text-amber-400" /> {project.city}, {project.state}
                              </div>
                            </div>

                            <div className="p-3 bg-zinc-50 border-t border-zinc-150 flex items-center justify-between gap-3">
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="text-[9px] text-zinc-400 font-mono uppercase font-bold">HOTSPOTWORKSHOP.COM</div>
                                <div className="text-xs font-bold text-zinc-900 truncate">{project.title}</div>
                                <div className="text-[10px] text-emerald-700 font-bold">Est. Budget: ${project.budget.toLocaleString()} &bull; 0% Contractor Lead Fees</div>
                              </div>
                              <button
                                type="button"
                                className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold px-3 py-1.5 rounded-lg text-[11px] shrink-0 transition"
                              >
                                Submit Bid
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. LINKEDIN MOCK CARD */}
                      {activeSharePlatform === "linkedin" && (
                        <div className="space-y-3 animate-in fade-in">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-black text-xs font-serif shadow-sm">
                              in
                            </div>
                            <div>
                              <span className="font-extrabold text-xs text-zinc-900 block">Hot Spot Workshop Inc.</span>
                              <span className="text-[9px] text-zinc-500">Commercial & Residential Trade Exchange &bull; 1d</span>
                            </div>
                          </div>

                          <p className="text-xs leading-relaxed text-zinc-800">
                            Open Assignment Dispatch for accredited local contractors in the <span className="font-bold text-zinc-950">{project.city}, {project.state}</span> area: <span className="font-bold">"{project.title}"</span>. Client budget allocation: <span className="font-bold text-emerald-700">${project.budget.toLocaleString()}</span>. Fully backed by platform escrow.
                          </p>

                          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-xs">
                            <div className="p-3 border-b border-zinc-150 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Hammer className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold tracking-tight">{project.title}</span>
                              </div>
                              <span className="text-emerald-400 font-mono font-black text-xs">
                                ${project.budget.toLocaleString()}
                              </span>
                            </div>

                            <div className="p-3 bg-white space-y-1">
                              <div className="text-[10px] text-zinc-400 font-mono">hotspotworkshop.com &bull; {project.city}, {project.state}</div>
                              <div className="text-xs font-bold text-zinc-900">{project.title}</div>
                              <div className="text-[11px] text-zinc-500">
                                Apply and negotiate direct with property owners. No middleman deductions.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. NEXTDOOR MOCK CARD */}
                      {activeSharePlatform === "nextdoor" && (
                        <div className="space-y-3 animate-in fade-in">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-sm">
                              nd
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-extrabold text-xs text-zinc-900">{project.city} Neighborhood Board</span>
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.25 rounded">Local</span>
                              </div>
                              <span className="text-[10px] text-zinc-500">Verified Neighbor &bull; Today</span>
                            </div>
                          </div>

                          <p className="text-xs leading-relaxed text-zinc-800">
                            Hi neighbors! Looking for qualified local specialists for <span className="font-bold text-zinc-950">"{project.title}"</span> in <span className="font-bold text-zinc-950">{project.city}</span>. Estimated project budget: <span className="font-bold text-emerald-700">${project.budget.toLocaleString()}</span>. Click below to view specifications and place a quote!
                          </p>

                          <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3 flex items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-600" /> {project.city}, {project.state} &bull; {computedDistance} mi
                              </span>
                              <span className="text-xs font-black text-zinc-900 block">{project.title}</span>
                              <span className="text-[11px] font-bold text-emerald-700 block">${project.budget.toLocaleString()} Target Budget</span>
                            </div>
                            <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs shrink-0">
                              View Job
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 5. WHATSAPP / SMS MOCK CARD */}
                      {activeSharePlatform === "whatsapp" && (
                        <div className="space-y-3 animate-in fade-in">
                          <div className="flex items-center gap-2 text-zinc-700 text-xs font-bold">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            <span>Direct Messaging / WhatsApp Bubble Preview</span>
                          </div>

                          <div className="bg-emerald-100/70 border border-emerald-200 rounded-2xl rounded-tr-none p-3.5 max-w-[90%] ml-auto space-y-2 text-xs text-zinc-900 shadow-2xs">
                            <p className="leading-relaxed">
                              Hey! Check out this new job posting on Hot Spot Workshop:
                            </p>
                            <div className="bg-white border border-emerald-200/80 rounded-xl p-2.5 space-y-1 shadow-3xs">
                              <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center justify-between">
                                <span>🔨 {project.city}, {project.state}</span>
                                <span className="font-mono text-emerald-800">${project.budget.toLocaleString()}</span>
                              </div>
                              <div className="font-extrabold text-xs text-zinc-900 line-clamp-1">{project.title}</div>
                              <div className="text-[11px] text-zinc-500 line-clamp-2">{project.description}</div>
                              <div className="text-[10px] text-blue-600 underline pt-0.5 truncate font-mono">
                                https://hotspotworkshop.com/project/{project.id}
                              </div>
                            </div>
                            <span className="text-[9px] text-zinc-400 block text-right font-mono">10:42 AM &bull; Delivered ✓✓</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {/* 1-Click External Channel Broadcast Buttons */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      1-Click External Promotion
                    </label>
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60 transition active:scale-95"
                      id={`native-device-share-btn-${project.id}`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Open Native Share Menu</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `https://hotspotworkshop.com/project/${project.id}`;
                        const text = `🔨 Need local tradesmen in ${project.city}? Check out "${project.title}" (Est. Budget: $${project.budget.toLocaleString()}). Submit a bid today with $0 lead fees!`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
                      }}
                      className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
                      id={`share-twitter-btn-${project.id}`}
                    >
                      <Twitter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">X / Twitter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `https://hotspotworkshop.com/project/${project.id}`;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                      }}
                      className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
                      id={`share-facebook-btn-${project.id}`}
                    >
                      <Facebook className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="truncate">Facebook</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `https://hotspotworkshop.com/project/${project.id}`;
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
                      }}
                      className="flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
                      id={`share-linkedin-btn-${project.id}`}
                    >
                      <Linkedin className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="truncate">LinkedIn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `https://hotspotworkshop.com/project/${project.id}`;
                        const text = `🔨 Check out this home improvement project in ${project.city}: "${project.title}" ($${project.budget.toLocaleString()} Budget) ${shareUrl}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                      }}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
                      id={`share-whatsapp-btn-${project.id}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `https://hotspotworkshop.com/project/${project.id}`;
                        const subject = `Job Listing in ${project.city}: ${project.title}`;
                        const body = `Hi,\n\nCheck out this project posting on Hot Spot Workshop:\n\nTitle: ${project.title}\nBudget: $${project.budget.toLocaleString()}\nLocation: ${project.city}, ${project.state}\n\nView details and place a bid: ${shareUrl}`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
                      }}
                      className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
                      id={`share-email-btn-${project.id}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span className="truncate">Email Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQrCode(!showQrCode)}
                      className={`flex items-center justify-center gap-1.5 border font-bold py-2 px-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs ${
                        showQrCode
                          ? "bg-amber-500 border-amber-600 text-slate-950"
                          : "bg-white border-zinc-300 hover:bg-zinc-50 text-zinc-800"
                      }`}
                      id={`toggle-qr-code-btn-${project.id}`}
                    >
                      <QrCode className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span className="truncate">{showQrCode ? "Hide QR" : "Scan QR"}</span>
                    </button>
                  </div>
                </div>

                {/* Instant QR Code Box */}
                {showQrCode && (
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white space-y-3 animate-in zoom-in-95 duration-150 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <QrCode className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                        Scan to View on Mobile Device
                      </span>
                    </div>

                    <div className="flex justify-center p-3 bg-white rounded-xl w-fit mx-auto shadow-lg">
                      {/* Responsive Styled SVG QR Code */}
                      <svg viewBox="0 0 120 120" className="w-32 h-32">
                        {/* Outer QR frame */}
                        <rect width="120" height="120" fill="white" />
                        {/* Position detection markers */}
                        <rect x="10" y="10" width="30" height="30" fill="#0f172a" rx="4" />
                        <rect x="15" y="15" width="20" height="20" fill="white" rx="2" />
                        <rect x="20" y="20" width="10" height="10" fill="#d97706" rx="1" />

                        <rect x="80" y="10" width="30" height="30" fill="#0f172a" rx="4" />
                        <rect x="85" y="15" width="20" height="20" fill="white" rx="2" />
                        <rect x="90" y="20" width="10" height="10" fill="#d97706" rx="1" />

                        <rect x="10" y="80" width="30" height="30" fill="#0f172a" rx="4" />
                        <rect x="15" y="85" width="20" height="20" fill="white" rx="2" />
                        <rect x="20" y="90" width="10" height="10" fill="#d97706" rx="1" />

                        {/* QR Data Matrix grid dots */}
                        <circle cx="50" cy="20" r="3" fill="#0f172a" />
                        <circle cx="65" cy="20" r="3" fill="#0f172a" />
                        <circle cx="50" cy="35" r="3" fill="#0f172a" />
                        <circle cx="65" cy="35" r="3" fill="#0f172a" />

                        <circle cx="20" cy="55" r="3" fill="#0f172a" />
                        <circle cx="35" cy="55" r="3" fill="#0f172a" />
                        <circle cx="50" cy="55" r="4" fill="#d97706" />
                        <circle cx="65" cy="55" r="3" fill="#0f172a" />
                        <circle cx="80" cy="55" r="3" fill="#0f172a" />
                        <circle cx="95" cy="55" r="3" fill="#0f172a" />

                        <circle cx="20" cy="70" r="3" fill="#0f172a" />
                        <circle cx="35" cy="70" r="3" fill="#0f172a" />
                        <circle cx="50" cy="70" r="3" fill="#0f172a" />
                        <circle cx="65" cy="70" r="4" fill="#d97706" />
                        <circle cx="80" cy="70" r="3" fill="#0f172a" />
                        <circle cx="95" cy="70" r="3" fill="#0f172a" />

                        <circle cx="50" cy="85" r="3" fill="#0f172a" />
                        <circle cx="65" cy="85" r="3" fill="#0f172a" />
                        <circle cx="80" cy="85" r="3" fill="#0f172a" />
                        <circle cx="95" cy="85" r="3" fill="#0f172a" />

                        <circle cx="50" cy="100" r="3" fill="#0f172a" />
                        <circle cx="65" cy="100" r="3" fill="#0f172a" />
                        <circle cx="80" cy="100" r="3" fill="#0f172a" />
                        <circle cx="95" cy="100" r="3" fill="#0f172a" />
                      </svg>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-mono">
                      https://hotspotworkshop.com/project/{project.id}
                    </p>
                  </div>
                )}

                {/* Copiable share link & Ready-to-paste caption sector */}
                <div className="space-y-2 pt-1 border-t border-zinc-150">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Direct Project URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://hotspotworkshop.com/project/${project.id}`}
                        className="flex-1 bg-zinc-50 border border-zinc-250 hover:border-zinc-350 py-2 px-3 rounded-xl text-xs font-mono text-zinc-700 focus:outline-hidden"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        id={`share-link-input-${project.id}`}
                      />
                      <button
                        type="button"
                        id={`copy-share-link-btn-${project.id}`}
                        onClick={() => {
                          const linkText = `https://hotspotworkshop.com/project/${project.id}`;
                          try {
                            navigator.clipboard.writeText(linkText);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          } catch (err) {
                            const textArea = document.createElement("textarea");
                            textArea.value = linkText;
                            textArea.style.position = "absolute";
                            textArea.style.left = "-9999px";
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            try {
                              document.execCommand("copy");
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            } catch (e) {
                              console.error("Fallback failed", e);
                            }
                            document.body.removeChild(textArea);
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          copied
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-zinc-100" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Ready-to-paste Caption Copier */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-500">
                      Need pre-formatted caption text with hashtags?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const caption = `🔨 New Project Listing: "${project.title}" in ${project.city}, ${project.state} (Est. Budget: $${project.budget.toLocaleString()}). Bidding is 100% free with $0 lead fees for contractors.\n\nView details: https://hotspotworkshop.com/project/${project.id}\n\n#HotSpotWorkshop #${project.city.replace(/\s+/g, "")}Trades #HomeImprovement #GeneralContractor`;
                        try {
                          navigator.clipboard.writeText(caption);
                          setCopiedPostText(true);
                          setTimeout(() => setCopiedPostText(false), 2000);
                        } catch (err) {
                          console.error("Failed to copy caption", err);
                        }
                      }}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition cursor-pointer flex items-center gap-1"
                      id={`copy-post-caption-btn-${project.id}`}
                    >
                      {copiedPostText ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Caption Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-amber-600" />
                          <span>Copy Formatted Caption</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
              
              {/* Modal Footer */}
              <div className="p-3.5 sm:p-4 bg-zinc-50 border-t border-zinc-150 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-mono truncate hidden sm:inline">
                  hotspotworkshop.com &bull; Project ID #{project.id.slice(0, 8)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShowQrCode(false);
                  }}
                  className="bg-white border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 text-zinc-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-3xs ml-auto"
                >
                  Close Preview
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Bid Comparison Matrix Modal */}
      {showBidComparisonModal && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowBidComparisonModal(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-black text-lg text-white">
                  Side-by-Side Bid Comparison Matrix ({bids.length} Contractor Bids)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBidComparisonModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bids.map((bid, idx) => {
                const diff = project.budget - bid.amount;
                const isBestValue = diff >= 0 && bid.amount === Math.min(...bids.map(b => b.amount));
                const isSelected = project.acceptedContractorId === bid.contractorId;

                return (
                  <div
                    key={bid.id}
                    className={`bg-slate-950 border rounded-2xl p-5 flex flex-col justify-between space-y-4 relative ${
                      isBestValue
                        ? "border-amber-500/80 ring-2 ring-amber-500/30"
                        : isSelected
                        ? "border-emerald-500/80"
                        : "border-slate-800"
                    }`}
                  >
                    {isBestValue && (
                      <div className="absolute -top-3 left-4 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-slate-950" />
                        <span>Lowest Price / Best Value</span>
                      </div>
                    )}

                    <div className="space-y-3 pt-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{bid.contractorName}</h4>
                          {bid.contractorCompany && (
                            <span className="text-[11px] text-slate-400 block">{bid.contractorCompany}</span>
                          )}
                        </div>
                        <span className="bg-slate-800 border border-slate-700 font-mono text-sm font-black text-amber-400 px-2.5 py-1 rounded-lg">
                          ${bid.amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/80 text-slate-300">
                          <span className="text-slate-400">vs Budget (${project.budget}):</span>
                          <span className={`font-mono font-bold ${diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {diff >= 0 ? `Saves $${diff}` : `+$${Math.abs(diff)} over`}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-800/80 text-slate-300">
                          <span className="text-slate-400">Escrow Guarantee:</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Protected
                          </span>
                        </div>

                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 italic">
                          "{bid.message}"
                        </div>
                      </div>
                    </div>

                    {(isOwner || currentUser?.role === "customer" || currentUser?.role === "owner") && project.status === "open" && onAcceptBid && (
                      <button
                        type="button"
                        onClick={() => {
                          onAcceptBid(bid.id);
                          setShowBidComparisonModal(false);
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                      >
                        Accept Bid & Lock Escrow
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal overlay for larger image viewing */}
      {selectedImageForLightbox && (
        <div
          className="fixed inset-0 bg-zinc-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedImageForLightbox(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-transparent flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImageForLightbox(null)}
              className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-transform hover:scale-105 z-55 cursor-pointer border border-white/20"
              title="Close image"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left/Right controls inside Lightbox */}
            {project.images && project.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = project.images!.indexOf(selectedImageForLightbox);
                    const prevIdx = (currentIdx - 1 + project.images!.length) % project.images!.length;
                    setSelectedImageForLightbox(project.images![prevIdx]);
                    setActiveImageIdx(prevIdx);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white rounded-full transition border border-white/20 cursor-pointer z-55 shadow-xl"
                  title="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = project.images!.indexOf(selectedImageForLightbox);
                    const nextIdx = (currentIdx + 1) % project.images!.length;
                    setSelectedImageForLightbox(project.images![nextIdx]);
                    setActiveImageIdx(nextIdx);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white rounded-full transition border border-white/20 cursor-pointer z-55 shadow-xl"
                  title="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <img
              src={selectedImageForLightbox}
              alt="Project Reference Full screen"
              className="max-h-[82vh] object-contain rounded-2xl border border-zinc-800 shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {project.images && project.images.length > 1 && (
              <div className="mt-3 text-white text-xs font-semibold bg-black/70 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 shadow-md">
                Photo {project.images.indexOf(selectedImageForLightbox) + 1} of {project.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
