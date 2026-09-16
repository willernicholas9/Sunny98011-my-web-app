import React, { useState } from "react";
import { UserRole } from "../types";
import { X, User, Lock, Mail, Phone, CreditCard, KeyRound, CheckSquare, Eye, EyeOff, ShieldCheck, FileText, CheckCircle, Save, Check } from "lucide-react";
import { CITIES } from "../data/cities";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>("customer");

  // Registration states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Austin");
  const [state, setState] = useState("TX");
  const [zipCode, setZipCode] = useState("78701");
  const [zipSaved, setZipSaved] = useState(false);

  const handleSaveZip = () => {
    if (!zipCode.trim()) return;
    const foundCity = CITIES.find((c) => c.zipCode === zipCode.trim());
    if (foundCity) {
      setCity(foundCity.name);
      setState(foundCity.state);
    }
    try {
      localStorage.setItem("hsws_saved_zip", zipCode.trim());
    } catch {}
    setZipSaved(true);
    setTimeout(() => setZipSaved(false), 3000);
  };
  
  // Credit Card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Contractor-specific states
  const [company, setCompany] = useState("");
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [insuranceUrl, setInsuranceUrl] = useState("");
  const [insuranceName, setInsuranceName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [availableNow, setAvailableNow] = useState(true);

  // General controls
  const [passwordVisible, setPasswordVisible] = useState(false);

  const TRADE_OPTIONS = [
    "Landscaping",
    "Gutter Cleaning",
    "Garden Work",
    "Window Replacement",
    "TV Hanging",
    "Painting",
    "General Handyman Projects",
    "Plumbing Repair",
    "Electrical Maintenance",
  ];

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

  const toggleTrade = (trade: string) => {
    if (selectedTrades.includes(trade)) {
      setSelectedTrades(selectedTrades.filter((t) => t !== trade));
    } else {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  const handleCardNumberChange = (val: string) => {
    // Basic spacing formatting for cards
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const handleCardCvvChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 3);
    setCardCvv(cleaned);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please fill in username and password.");
      return;
    }

    if (isRegister) {
      if (!fullName || !email || !phone || !address || !cardNumber || !cardExpiry || !cardCvv) {
        alert("Please complete all registration & credit card details.");
        return;
      }

      // Generate a mock user profile
      const rawUser: any = {
        id: `user-${Date.now()}`,
        username,
        fullName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        creditCard: {
          number: cardNumber,
          expiry: cardExpiry,
          cvv: cardCvv,
        },
        role,
        createdAt: new Date().toISOString(),
      };

      if (role === "contractor") {
        rawUser.company = company || undefined;
        // Face Avatar generator (using simple diverse Unsplash images based on random seeds)
        const randSeed = Math.floor(Math.random() * 100);
        rawUser.avatarUrl = `https://images.unsplash.com/photo-${1500000000000 + randSeed * 10000}?w=150&auto=format&fit=crop&q=80`;
        rawUser.trades = selectedTrades.length > 0 ? selectedTrades : ["General Handyman Projects"];
        rawUser.insuranceUrl = insuranceUrl || undefined;
        rawUser.insuranceName = insuranceName || undefined;
        rawUser.subscriptionActive = true; // Subscribed for $20/month
        rawUser.emailNotificationsEnabled = emailNotifications;
        rawUser.availableNow = availableNow;
        rawUser.reviews = [];
      }

      onSuccess(rawUser);
    } else {
      // Mock Login
      // Check preset lists, or simulate login success
      const loggedInUser = username.toLowerCase() === "nwiller9185" ? {
        id: "owner-1",
        username: "nwiller9185",
        fullName: "Nicholas Willer",
        email: "willernicholas9@gmail.com",
        phone: "512-555-9185",
        address: "7185 Owner Drive",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        creditCard: { number: "4111222233334444", expiry: "12/29", cvv: "918" },
        role,
        isPlatformOwner: true,
        createdAt: new Date().toISOString(),
        ...(role === "contractor" && {
          company: "Willer Construction Industries",
          avatarUrl: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
          trades: ["Landscaping", "Garden Work", "Gutter Cleaning", "General Handyman Projects"],
          insuranceUrl: "liability-willer-2026.pdf",
          insuranceName: "State Farm - Premium Coverage #91852",
          subscriptionActive: true,
          emailNotificationsEnabled: true,
          reviews: [
            { id: "rev-r1", reviewerName: "Alice Woods", rating: 5, comment: "Exceptional speed and service quality!", date: "2026-06-02" }
          ],
        }),
      } : {
        id: role === "customer" ? "cust-1" : "contractor-1",
        username,
        fullName: role === "customer" ? "John Doe" : "Michael Smith",
        email: role === "customer" ? "john.doe@gmail.com" : "mike.smith@workshop.com",
        phone: role === "customer" ? "512-555-2244" : "512-555-0192",
        address: role === "customer" ? "123 Oak Lane" : "704 Congress Ave.",
        city: role === "customer" ? "Round Rock" : "Austin",
        state: "TX",
        zipCode: role === "customer" ? "78664" : "78701",
        creditCard: { number: "4111222233334444", expiry: "11/27", cvv: "001" },
        role,
        createdAt: new Date().toISOString(),
        ...(role === "contractor" && {
          company: "Smith's Quality Landscaping & Co.",
          avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
          trades: ["Landscaping", "Garden Work", "Gutter Cleaning"],
          insuranceUrl: "insurance-smith-2026.pdf",
          insuranceName: "Liberty Mutual - Liability #88123-A",
          subscriptionActive: true,
          emailNotificationsEnabled: true,
          reviews: [],
        }),
      };
      
      onSuccess(loggedInUser);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto" role="dialog" aria-modal="true" id="auth-modal">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-zinc-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-150 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-700" />
            <h3 className="font-display font-extrabold text-lg text-zinc-900">
              {isRegister ? "Create Your Platform Account" : "Access Workshop Forum"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          {/* Target Role Selector block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Account Type</label>
              <button
                type="button"
                onClick={() => {
                  const currentOwnerPass = localStorage.getItem("hsws_owner_password") || "ownerpass123";
                  setUsername("nwiller9185");
                  setPassword(currentOwnerPass);
                  setRole("owner" as UserRole);
                }}
                className="text-[11px] font-extrabold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                👑 Auto-Fill Platform Owner Login
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                  role === "customer"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
                id="select-role-customer"
              >
                👤 Homeowner
              </button>
              <button
                type="button"
                onClick={() => setRole("contractor")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                  role === "contractor"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
                id="select-role-contractor"
              >
                👨‍🔧 Contractor
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("owner" as UserRole);
                  setUsername("nwiller9185");
                }}
                className={`flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-lg transition ${
                  role === "owner"
                    ? "bg-amber-500 text-zinc-950 font-black shadow-xs"
                    : "text-amber-800 hover:text-amber-950"
                }`}
                id="select-role-owner"
              >
                👑 Owner Suite
              </button>
            </div>
            
            <p className="text-[11px] text-zinc-500 leading-normal">
              {role === "customer" 
                ? "Post home/business jobs for local contractors to see. Zero fees to register, browse, or post. $5.00/$20.00 project fee paid upon contract agreement."
                : role === "contractor"
                ? "Bid on active projects, contact local homeowners, and secure daily jobs. Membership is $20.00/month for unlimited active leads."
                : "👑 Platform Creator & Owner Executive Access. Unlocks system revenue ledger, escrow overrides, user verification, and broadcast relays."}
            </p>
          </div>

          {/* Account Credentials block */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-1">1. Credentials Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-650 mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. janesmith33"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                    id="auth-input-username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-655 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-9 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                    id="auth-input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 focus:outline-hidden"
                  >
                    {passwordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Profile Fields */}
          {isRegister && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-1">2. Complete Public Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-650 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                    id="auth-input-fullname"
                  />
                  <p className="text-[9px] text-zinc-400 mt-1">Customers: Last names remain hidden until agree is set.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-650 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="jane.smith@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                      id="auth-input-email"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-650 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="tel"
                      placeholder="512-555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                      id="auth-input-phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-650 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 104 Congress Ave Sub-A"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                    id="auth-input-address"
                  />
                  <p className="text-[9px] text-zinc-400 mt-1">Hidden from public forum view.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-650 mb-1">Active Region (City)</label>
                  <select
                    value={city}
                    onChange={(e) => handleCitySelect(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                    id="auth-select-city"
                  >
                    {CITIES.map((c) => (
                      <option key={c.zipCode} value={c.name}>
                        {c.name}, {c.state} ({c.zipCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-650 mb-1 flex items-center justify-between">
                    <span>Zip Code</span>
                    {zipSaved && (
                      <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                        <Check className="w-3 h-3" /> Zip Saved
                      </span>
                    )}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="78701"
                      value={zipCode}
                      onChange={(e) => {
                        handleZipChange(e.target.value);
                        if (zipSaved) setZipSaved(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveZip();
                        }
                      }}
                      required
                      className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                      id="auth-input-zip"
                    />
                    <button
                      type="button"
                      onClick={handleSaveZip}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-3xs shrink-0 ${
                        zipSaved
                          ? "bg-emerald-600 text-white border border-emerald-700"
                          : "bg-amber-600 hover:bg-amber-700 text-white border border-amber-700"
                      }`}
                      id="save-auth-zip-btn"
                      data-testid="save-auth-zip-btn"
                      title="Save Zip Code"
                    >
                      {zipSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" /> Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Contractor Specific Specialty Signups */}
              {role === "contractor" && (
                <div className="space-y-4 pt-3 border-t border-zinc-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-650 mb-1">Company Name <span className="text-[9px] text-zinc-400">(Optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Welding & Construction"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                        id="auth-input-company"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-650 mb-1">Insurance Company/ID <span className="text-[9px] text-zinc-400">(Optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Geico Liability #8812-X"
                        value={insuranceName}
                        onChange={(e) => {
                          setInsuranceName(e.target.value);
                          setInsuranceUrl("prov-liability-doc.pdf");
                        }}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                        id="auth-input-insurance"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Trade Specialties (Choose items you work on)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TRADE_OPTIONS.map((trade) => {
                        const isChecked = selectedTrades.includes(trade);
                        return (
                          <button
                            key={trade}
                            type="button"
                            onClick={() => toggleTrade(trade)}
                            className={`px-2 py-1.5 rounded-xl border text-[11px] font-medium text-left flex items-center justify-between transition ${
                              isChecked
                                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                : "bg-zinc-50 text-zinc-650 border-zinc-200 hover:bg-zinc-100"
                            }`}
                          >
                            <span className="truncate">{trade}</span>
                            {isChecked && <CheckCircle className="w-3.5 h-3.5 shrink-0 ml-1 fill-white text-amber-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Email Notifications checkbox */}
                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 flex items-start gap-2 text-xs">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="mt-0.5"
                    />
                    <label htmlFor="emailNotifications" className="font-semibold text-zinc-700">
                      Sign up for Email Alerts?
                      <span className="block text-[10px] text-zinc-400 font-normal">Receive immediate email logs whenever a new job request is posted within your 70-mile active radius.</span>
                    </label>
                  </div>

                  {/* Available Now toggle */}
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-start gap-2 text-xs">
                    <input
                      type="checkbox"
                      id="registerAvailableNow"
                      checked={availableNow}
                      onChange={(e) => setAvailableNow(e.target.checked)}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <label htmlFor="registerAvailableNow" className="font-semibold text-emerald-800">
                      Show me as 'Available Now' immediately
                      <span className="block text-[10px] text-zinc-500 font-normal">Prioritizes your profile in homeowner search results and displays a pulsing active locator marker.</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Credit Card Details + Golden Stylized Card Simulation panel */}
              <div className="space-y-4 pt-4 border-t border-zinc-150">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex justify-between items-center">
                  <span>3. Wallet Credit Card Details</span>
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Secure Escrow Gateway</span>
                </h4>

                {/* Simulated 3D Golden Credit Card */}
                <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white p-6 shadow-md overflow-hidden font-mono select-none">
                  <div className="absolute right-0 bottom-0 top-0 left-0 bg-white/5 opacity-10 pointer-events-none transform -skew-x-12" />
                  
                  {!isCardFlipped ? (
                    /* Front side of Card */
                    <div className="h-full flex flex-col justify-between relative z-10 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[12px] font-bold tracking-widest text-amber-100 uppercase font-sans">HOT SPOT SECURE</div>
                          <div className="w-9 h-7 bg-amber-300/40 border border-amber-200/50 rounded-lg mt-1" />
                        </div>
                        <div className="text-right">
                          <CreditCard className="w-8 h-8 text-amber-100 opacity-80" />
                          <span className="text-[8px] block font-sans text-amber-100 mt-1 uppercase">Gold Access</span>
                        </div>
                      </div>

                      <div className="text-base sm:text-lg font-bold tracking-widest text-white py-1">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </div>

                      <div className="flex justify-between items-end text-[10px]">
                        <div>
                          <span className="text-[8px] text-amber-200 block uppercase font-sans">Cardholder</span>
                          <span className="font-bold truncate max-w-[150px] inline-block">{fullName || "YOUR FULL NAME"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-amber-200 block uppercase font-sans">Expires</span>
                          <span className="font-bold">{cardExpiry || "MM/YY"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Back side of Card */
                    <div className="h-full flex flex-col justify-between relative z-10 py-1 transition-all">
                      <div className="w-full h-8 bg-zinc-800 -mx-6 mt-1" />
                      <div className="my-3 flex justify-between items-center">
                        <div className="flex-1 bg-zinc-200/40 h-8 rounded-lg border border-amber-300 pr-2 flex items-center justify-end text-black/80 font-bold italic text-sm">
                          {cardCvv || "•••"}
                        </div>
                        <span className="text-[9px] text-amber-150 uppercase font-sans font-bold ml-2 shrink-0">Security CVV</span>
                      </div>
                      <div className="text-[8px] text-amber-200 leading-snug font-sans">
                        Authorizing card confirms our billing policy. Non-billed until job agreed. Contractors are billed $20 monthly subscription.
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-650 mb-1">Credit Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      onFocus={() => setIsCardFlipped(false)}
                      required
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden font-semibold font-mono"
                      id="card-number-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-650 mb-1">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => handleCardExpiryChange(e.target.value)}
                        onFocus={() => setIsCardFlipped(false)}
                        required
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-center focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden font-bold font-mono"
                        id="card-expiry-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-650 mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => handleCardCvvChange(e.target.value)}
                        onFocus={() => setIsCardFlipped(true)}
                        onBlur={() => setIsCardFlipped(false)}
                        required
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-center focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden font-bold font-mono"
                        id="card-cvv-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Agreement Warning */}
          <div className="bg-zinc-50 border border-zinc-150 p-3.5 rounded-xl text-center text-[10px] text-zinc-400">
            {role === "customer" 
              ? "Customers are charged a platform match fee ONLY when they agree and sign a project contract with a contractor: $5.00 for jobs under $25k, $20.00 for jobs $25,001+."
              : "Contractors are charged a $20.00/month subscription upon registration. This unlocks bidding, messaging, and project completion features."
            }
          </div>

          {/* Submit Action and Toggle */}
          <div className="flex flex-col gap-4 pt-4 border-t border-zinc-150">
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
              id="auth-submit-btn"
            >
              {isRegister ? `Confirm & Pay / Register as ${role === "customer" ? "Homeowner" : "Contractor"}` : `Sign In as ${role === "customer" ? "Homeowner" : "Contractor"}`}
            </button>
            
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-zinc-500 hover:text-zinc-800 text-center transition"
            >
              {isRegister ? "Already registered? Sign in instead" : "Need a workspace account? Register new profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
