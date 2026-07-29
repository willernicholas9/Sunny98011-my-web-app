import React, { useState } from "react";
import { Project, Bid, UserRole } from "../types";
import { MapPin, Phone, Mail, FileText, CheckCircle, Lock, Shield, ArrowRight, DollarSign, Image, Share2, Copy, Check, Twitter, Facebook, Linkedin, X, Upload, Trash2, Plus, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import ProjectMiniMap from "./ProjectMiniMap";
import { CITIES, getDistance } from "../data/cities";

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSharePlatform, setActiveSharePlatform] = useState<"twitter" | "facebook" | "linkedin">("twitter");
  
  const [counterAmount, setCounterAmount] = useState<string>("");
  const [counterMessage, setCounterMessage] = useState<string>("");
  const [activeCounterBidId, setActiveCounterBidId] = useState<string | null>(null);

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

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden" id={`project-${project.id}`}>
      {/* Visual Header Grid for Images */}
      {project.images && project.images.length > 0 && (
        <div className="relative h-48 bg-zinc-100 flex items-center justify-center overflow-hidden border-b border-zinc-100">
          <img
            src={project.images[activeImageIdx]}
            alt={project.title}
            className="w-full h-full object-cover transition-all duration-300 transform hover:scale-102"
            referrerPolicy="no-referrer"
          />
          {project.images.length > 1 && (
            <div className="absolute bottom-2 right-2 flex gap-1.5 bg-black/60 px-2 py-1 rounded-full text-white text-[10px] font-medium">
              {project.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIdx ? "bg-amber-500 scale-110" : "bg-white/60"}`}
                  title={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}
          {/* Badge for business / home project */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full select-none backdrop-blur-md text-white ${
              project.type === "business" ? "bg-cyan-600/90 shadow-sm" : "bg-emerald-600/90 shadow-sm"
            }`}>
              {project.type === "business" ? "Business Post" : "Home Post"}
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full select-none shadow-sm ${
              project.status === "open" ? "bg-zinc-100/90 text-zinc-800" :
              project.status === "bid_placed" ? "bg-amber-100/90 text-amber-900 border border-amber-200" :
              project.status === "accepted" ? "bg-blue-100/90 text-blue-900 border border-blue-200" :
              "bg-green-100/90 text-green-900"
            }`}>
              {project.status === "open" ? "Open for Bids" :
               project.status === "bid_placed" ? "Bids Placed" :
               project.status === "accepted" ? "Active Job & Agreed" : "Project Completed 🎉"}
            </span>
          </div>
        </div>
      )}

      {/* Primary Card Contents */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-zinc-900 leading-snug tracking-tight flex-1">
                {project.title}
              </h3>
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 rounded-xl transition duration-200 cursor-pointer shrink-0 text-xs font-bold"
                title="Share Project Listing"
                id={`share-project-btn-${project.id}`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {project.city}, {project.state} ({project.zipCode})
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-zinc-100 text-[11px] font-medium text-amber-700">
                ⚡ {computedDistance} miles from {baseCity}
              </span>
              <button
                type="button"
                onClick={() => onViewOnMap && onViewOnMap(project.id)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/80 px-2 py-0.5 rounded-md transition border border-amber-200/40 cursor-pointer"
                title="View this vacancy on the interactive Google Map directory"
              >
                📍 View on Map
              </button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-display font-semibold text-zinc-900 flex items-center justify-end">
              <span className="text-xs text-zinc-400 font-sans font-medium mr-1">Estimated Budget:</span>
              <span className="text-emerald-700 font-extrabold">${project.budget.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-medium">
              +{project.budget <= 25000 ? "$5.00" : "$20.00"} Service Fee on accept (billed to Customer)
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch mb-6">
          <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 flex-1">
            {project.description}
          </p>
          <ProjectMiniMap
            userCityName={baseCity}
            projectCityName={project.city}
          />
        </div>

        {/* Dynamic Project Reference Image Gallery Block */}
        <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/30 space-y-4 mb-6" id={`reference-images-panel-${project.id}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-150 pb-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <Image className="w-4 h-4 text-amber-500" />
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
                Customer funds are verified and held in temporary escrow. You will run transactions completely secure. Both parties must mutually agree to begin the contract.
              </p>
            </div>
            <div className="pt-2">
              {!canSeePrivateDetails && currentUser?.role === "contractor" && (
                <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-2 py-1 font-semibold border border-amber-100 flex items-center gap-1">
                  <Shield className="w-3 h-3 shrink-0" /> Contact info instantly unlocks when both parties agree!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bids List Section */}
        <div className="mt-4 border-t border-zinc-100 pt-5 space-y-4">
          <h4 className="text-sm font-bold text-zinc-800 flex items-center gap-1.5">
            <span>Bids Panel</span>
            <span className="bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5 rounded-full font-semibold">{bids.length}</span>
          </h4>

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
          <div className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in" id={`share-modal-overlay-${project.id}`}>
            <div className="bg-white max-w-md w-full rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Share2 className="w-4 h-4 text-amber-600" />
                  <span className="font-display font-extrabold text-sm tracking-tight text-zinc-800">
                    Share Project Listing
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="p-1 px-1.5 hover:bg-zinc-150 text-zinc-400 hover:text-zinc-700 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                
                {/* Platform Selection Tabs */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveSharePlatform("twitter")}
                    className={`nav-tab flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
                      activeSharePlatform === "twitter"
                        ? "bg-white text-zinc-900 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <Twitter className="w-3.5 h-3.5 text-zinc-900" />
                    <span>X / Twitter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSharePlatform("facebook")}
                    className={`nav-tab flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
                      activeSharePlatform === "facebook"
                        ? "bg-white text-zinc-900 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-850"
                    }`}
                  >
                    <Facebook className="w-3.5 h-3.5 text-blue-600" />
                    <span>Facebook</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSharePlatform("linkedin")}
                    className={`nav-tab flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
                      activeSharePlatform === "linkedin"
                        ? "bg-white text-zinc-900 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-850"
                    }`}
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-700" />
                    <span>LinkedIn</span>
                  </button>
                </div>

                {/* Social Preview Title */}
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Live Social Media Preview
                </div>

                {/* Mock Social Media Preview Display Cards */}
                <div className="border border-zinc-150 rounded-xl overflow-hidden bg-zinc-50 p-4 min-h-[220px]">
                  
                  {/* Twitter Mock Card */}
                  {activeSharePlatform === "twitter" && (
                    <div className="space-y-3 text-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                          HS
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-none text-zinc-900">Hot Spot Workshop</div>
                          <span className="text-[10px] text-zinc-500">@HotSpotWorkshop · Just now</span>
                        </div>
                      </div>
                      <p className="text-[12px] leading-relaxed text-zinc-800">
                        🔨 Need local tradesmen? New project listed in <span className="text-zinc-950 font-bold">#{project.city.replace(/\s+/g, "")}</span>: "{project.title}". Budget: <span className="text-emerald-700 font-bold">${project.budget.toLocaleString()}</span>. Pitch & submit a proposal! 🚀
                      </p>
                      
                      {/* Twitter Card attachment */}
                      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-xs">
                        {project.images && project.images.length > 0 ? (
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-36 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-36 bg-zinc-100 flex items-center justify-center text-zinc-400">
                            <Image className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        <div className="p-3 space-y-1 border-t border-zinc-150">
                          <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider font-mono">hotspotworkshop.com</div>
                          <div className="text-xs font-bold text-zinc-900 line-clamp-1">{project.title}</div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1">{project.description}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Facebook Mock Card */}
                  {activeSharePlatform === "facebook" && (
                    <div className="space-y-3 text-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          F
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-none text-zinc-900">Hot Spot Workshop</div>
                          <span className="text-[10px] text-zinc-500">Just now · 🌐 Public</span>
                        </div>
                      </div>
                      <p className="text-[12px] leading-normal text-zinc-800">
                        Check out our latest matched project opportunity listed today in <span className="font-bold text-zinc-905">{project.city}</span>! Homeowners and local companies are looking for reliable trade specialists. Budget is set at <span className="text-emerald-700 font-bold">${project.budget.toLocaleString()}</span>. Bidding is 105% free with protected service escrow.
                      </p>
                      
                      {/* Facebook share layout */}
                      <div className="border border-zinc-200 overflow-hidden bg-white shadow-xs">
                        {project.images && project.images.length > 0 ? (
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-40 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-40 bg-zinc-100 flex items-center justify-center text-zinc-400">
                            <Image className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        <div className="p-3 bg-zinc-50 border-t border-zinc-150 flex items-center justify-between">
                          <div className="space-y-0.5 flex-1 pr-2">
                            <div className="text-[10px] text-zinc-400 font-medium uppercase font-mono">HOTSPOTWORKSHOP.COM</div>
                            <div className="text-xs font-bold text-zinc-900 line-clamp-1">{project.title}</div>
                            <div className="text-[10px] text-zinc-500 line-clamp-1">Secure trade matching & trusted payouts</div>
                          </div>
                          <button type="button" className="bg-zinc-200 hover:bg-zinc-250 text-zinc-800 font-bold px-3 py-1.5 rounded-lg text-[11px] shrink-0 transition">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Mock Card */}
                  {activeSharePlatform === "linkedin" && (
                    <div className="space-y-3 text-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs font-serif">
                          in
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-none text-zinc-900">Hot Spot Workshop</div>
                          <span className="text-[9px] text-zinc-500 block">Professional Construction & Trade Services Matching</span>
                          <span className="text-[9px] text-zinc-500">Just now · 🌐</span>
                        </div>
                      </div>
                      <p className="text-[12px] leading-relaxed text-zinc-800">
                        We have registered a high-priority assignment vacancy for accredited local contractors in the <span className="font-semibold text-zinc-950">{project.city}</span> region. Escrow guarantees contract security.
                      </p>
                      <p className="text-[11px] text-blue-700 font-medium">
                        #AccreditedContractors #LocalTrades #CivilProjects
                      </p>
                      
                      {/* LinkedIn Card style */}
                      <div className="border border-zinc-200 rounded overflow-hidden bg-white shadow-xs">
                        {project.images && project.images.length > 0 ? (
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-36 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-36 bg-zinc-100 flex items-center justify-center text-zinc-400">
                            <Image className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        <div className="p-3 border-t border-zinc-150">
                          <div className="text-[10px] text-zinc-400 font-medium font-mono">hotspotworkshop.com</div>
                          <div className="text-xs font-bold text-zinc-900 line-clamp-1">{project.title}</div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1">Register bid proposal under the platform rules. Flat low fee.</div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Copiable share link sector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    Copiable Direct Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://hotspotworkshop.com/project/${project.id}`}
                      className="flex-1 bg-zinc-50 border border-zinc-250 hover:border-zinc-350 py-2 px-3 rounded-xl text-xs font-mono text-zinc-700 focus:outline-hidden"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      type="button"
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
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 shrink-0 ${
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

              </div>
              
              {/* Modal Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="bg-white border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 text-zinc-700 font-semibold px-4 py-2 rounded-xl text-xs transition"
                >
                  Close Preview
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal overlay for larger image viewing */}
      {selectedImageForLightbox && (
        <div
          className="fixed inset-0 bg-zinc-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedImageForLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-transparent flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImageForLightbox(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-transform hover:scale-105 z-55 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImageForLightbox}
              alt="Reference Full screen"
              className="max-h-[85vh] object-contain rounded-2xl border border-zinc-800 shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
