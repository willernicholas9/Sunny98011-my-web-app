import React, { useState, useRef } from "react";
import { Project, CityData } from "../types";
import { Upload, X, Info, Hammer, MapPin, DollarSign, Image as ImageIcon } from "lucide-react";
import { CITIES } from "../data/cities";

interface ProjectFormProps {
  onAddProject: (projectData: Omit<Project, "id" | "customerId" | "customerFirstName" | "customerLastName" | "customerPhone" | "customerAddress" | "customerEmail" | "createdAt" | "status" | "agreedByCustomer" | "agreedByContractor" | "serviceFeeCharge">) => void;
  onClose: () => void;
}

// Preset decorative icons/illustrations so that mock listings look beautiful
const IMAGE_PRESETS = [
  { name: "Lawn & Garden", url: "https://images.unsplash.com/photo-1558905611-1402263dae20?w=600&auto=format&fit=crop&q=80" },
  { name: "Gutters & Roofs", url: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=600&auto=format&fit=crop&q=80" },
  { name: "TV hanging / Electric", url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=80" },
  { name: "Windows / Glazing", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80" },
];

export default function ProjectForm({ onAddProject, onClose }: ProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [type, setType] = useState<"home" | "business">("home");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("Austin");
  const [state, setState] = useState("TX");
  
  // Pictures control
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address and city synchronization helper
  const handleZipChange = (zip: string) => {
    setZipCode(zip);
    const foundCity = CITIES.find(c => c.zipCode === zip);
    if (foundCity) {
      setCity(foundCity.name);
      setState(foundCity.state);
    }
  };

  const handleCitySelect = (cityName: string) => {
    const foundCity = CITIES.find(c => c.name === cityName);
    if (foundCity) {
      setCity(foundCity.name);
      setState(foundCity.state);
      setZipCode(foundCity.zipCode);
    }
  };

  // Convert uploaded image file to object URL/base64 representation
  const handleFiles = (files: FileList) => {
    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const fileUrl = URL.createObjectURL(file);
        newImages.push(fileUrl);
      }
    }
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const selectPresetImage = (url: string) => {
    if (uploadedImages.includes(url)) {
      setUploadedImages((prev) => prev.filter((item) => item !== url));
    } else {
      setUploadedImages((prev) => [...prev, url]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      alert("Please specify a valid budget greater than zero.");
      return;
    }

    const finalImages = uploadedImages.length > 0 
      ? uploadedImages 
      : ["https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=600&auto=format&fit=crop&q=80"];

    onAddProject({
      title,
      description,
      budget: budgetNum,
      type,
      address,
      city,
      state,
      zipCode,
      images: finalImages,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto" role="dialog" aria-modal="true" id="project-form-modal">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-zinc-200">
        <div className="sticky top-0 bg-white border-b border-zinc-150 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
              <Hammer className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-zinc-900">Post a New Project Request</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Header fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Garden cleanout & weed barrier installation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition"
                id="form-project-title"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Target Budget ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-zinc-500 font-semibold text-sm">$</span>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition font-semibold"
                  id="form-project-budget"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Property Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("home")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition ${
                    type === "home"
                      ? "border-amber-600 bg-amber-50/50 text-amber-900"
                      : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                  }`}
                  id="form-type-home"
                >
                  🏡 Home Property
                </button>
                <button
                  type="button"
                  onClick={() => setType("business")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition ${
                    type === "business"
                      ? "border-cyan-600 bg-cyan-50/50 text-cyan-900"
                      : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                  }`}
                  id="form-type-business"
                >
                  🏢 Business Property
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Project Specific Location</label>
              <select
                value={city}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition"
                id="form-project-city"
              >
                {CITIES.map((c) => (
                  <option key={c.zipCode} value={c.name}>
                    {c.name}, {c.state} ({c.zipCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Street Address (Hidden from Public)</label>
              <input
                type="text"
                placeholder="e.g. 512 Whispering Pines Dr."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition"
                id="form-project-address"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Zip Code</label>
              <input
                type="text"
                placeholder="78664"
                value={zipCode}
                onChange={(e) => handleZipChange(e.target.value)}
                required
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition"
                id="form-project-zip"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Detailed Project Specification & Tasks</label>
            <textarea
              placeholder="Describe exactly what needs to be done. E.g. 'Looking for assistance with clearing leaves from gutters, bagging lawn debris, spreading mulch. Bring your own rake and heavy-duty bags...'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition leading-relaxed"
              id="form-project-desc"
            />
          </div>

          {/* Area to Post Pictures: Drag/Drop and Manual select file inputs */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Area to Post Pics / Upload Files</label>
            
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                dragActive
                  ? "border-amber-600 bg-amber-50/30"
                  : "border-zinc-300 hover:border-amber-500 bg-zinc-50/30 hover:bg-zinc-50/70"
              }`}
              id="drag-drop-zone"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileInputChange}
                multiple
                accept="image/*"
                className="hidden"
                id="form-file-input"
              />
              <Upload className="w-8 h-8 text-zinc-400 mb-2" />
              <p className="text-xs font-bold text-zinc-700">Drag & drop your files here, or <span className="text-amber-600 underline">browse locally</span></p>
              <p className="text-[10px] text-zinc-400 mt-1">Supports PNG, JPG, JPEG (Max 3 files, 15MB each)</p>
            </div>

            {/* Photo preset suggestions for rapid use */}
            <div>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1.5">Or choose from visual presets:</p>
              <div className="flex flex-wrap gap-2">
                {IMAGE_PRESETS.map((p) => {
                  const isSelected = uploadedImages.includes(p.url);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => selectPresetImage(p.url)}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition ${
                        isSelected
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Images List */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                    <img src={img} alt="Job upload preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 text-white opacity-90 transition"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Fee notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-900">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div className="space-y-1">
              <span className="font-bold">Hot Spot Work Shop Customer Agreement:</span>
              <p className="leading-relaxed">
                Posting is free. When both you and a contractor accept a project, a service charge applies based on project price:
              </p>
              <ul className="list-disc list-inside mt-0.5 font-medium space-y-0.5">
                <li>Under $25,000: <strong className="font-extrabold">$5.00 service fee</strong>.</li>
                <li>$25,001 and above: <strong className="font-extrabold">$20.00 service fee</strong>.</li>
                <li><em>Absolutely no fee is billed until the job is accepted and agreed upon by both you and the contractor.</em></li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-650 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
              id="form-submit-btn"
            >
              Request Project Launch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
