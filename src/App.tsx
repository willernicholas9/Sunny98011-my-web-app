import React, { useState, useEffect } from "react";
import { UserRole, Project, Bid, ContractorUser, CustomerUser, EmailLog, CityData, TRADE_OPTIONS, PrivateChatMessage } from "./types";
import { CITIES, getDistance } from "./data/cities";
import { INITIAL_PROJECTS, INITIAL_CONTRACTORS, INITIAL_CUSTOMERS, INITIAL_BIDS } from "./data/mockData";
import Navbar from "./components/Navbar";
import ProjectCard from "./components/ProjectCard";
import ContractorProfileCard from "./components/ContractorProfileCard";
import ProjectForm from "./components/ProjectForm";
import AuthModal from "./components/AuthModal";
import EmailSimulator from "./components/EmailSimulator";
import DashboardStats from "./components/DashboardStats";
import PrivateChat from "./components/PrivateChat";
import StripeHub from "./components/StripeHub";
import { MapPin, Search, Mail, HelpCircle, HardHat, Sparkles, Plus, AlertCircle, RefreshCw, CheckCircle2, DollarSign, ArrowRight, ShieldCheck, Star, MessageSquare } from "lucide-react";

export default function App() {
  // --- Persistent State Initialization ---
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const saved = localStorage.getItem("hsws_currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("hsws_projects");
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [bids, setBids] = useState<Bid[]>(() => {
    const saved = localStorage.getItem("hsws_bids");
    return saved ? JSON.parse(saved) : INITIAL_BIDS;
  });

  const [contractors, setContractors] = useState<ContractorUser[]>(() => {
    const saved = localStorage.getItem("hsws_contractors");
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTORS;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem("hsws_emailLogs");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Filtering & Visual Controls ---
  const [activeTab, setActiveTab] = useState<"projects" | "contractors" | "my_dashboard" | "stripe_hub">("projects");
  const [currentCityName, setCurrentCityName] = useState("Austin");
  const [radiusLimit, setRadiusLimit] = useState(70); // Miles slider
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTradeFilter, setSelectedTradeFilter] = useState("");
  const [availableOnlyFilter, setAvailableOnlyFilter] = useState(false);

  // Modals Controller
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEmailTracker, setShowEmailTracker] = useState(false);

  // Private Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatRecipientId, setActiveChatRecipientId] = useState<string | null>(null);
  const [privateMessages, setPrivateMessages] = useState<PrivateChatMessage[]>(() => {
    const saved = localStorage.getItem("hsws_private_messages");
    if (saved) return JSON.parse(saved);

    // Seed beautiful initial mock messages to make the UI immediately high-fidelity!
    const now = new Date();
    const seed1Time = new Date(now.getTime() - 3600000 * 3).toISOString(); // 3 hours ago
    const seed2Time = new Date(now.getTime() - 3600000 * 2.8).toISOString(); // 2 hours 48 mins ago

    return [
      {
        id: "msg-seed-1",
        senderId: "cust-1",
        senderName: "John Doe",
        senderRole: "customer",
        recipientId: "contractor-1",
        recipientName: "Michael Smith",
        recipientRole: "contractor",
        text: "Hi Michael, I saw your landscaping bid for our Round Rock project. Are you available to start this coming weekend?",
        createdAt: seed1Time
      },
      {
        id: "msg-seed-2",
        senderId: "contractor-1",
        senderName: "Michael Smith",
        senderRole: "contractor",
        recipientId: "cust-1",
        recipientName: "John Doe",
        recipientRole: "customer",
        text: "Hi John! Yes, absolutely. We can haul the black mulch and install the gutter guards this Saturday morning.",
        createdAt: seed2Time
      }
    ];
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("hsws_currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("hsws_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("hsws_bids", JSON.stringify(bids));
  }, [bids]);

  useEffect(() => {
    localStorage.setItem("hsws_contractors", JSON.stringify(contractors));
  }, [contractors]);

  useEffect(() => {
    localStorage.setItem("hsws_emailLogs", JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem("hsws_private_messages", JSON.stringify(privateMessages));
  }, [privateMessages]);

  // Find coordinate points for selected city filter
  const activeCityData = CITIES.find((c) => c.name === currentCityName) || CITIES[0];

  // Helper: Reset application back to initial state
  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all forum listings and users back to seed defaults?")) {
      localStorage.clear();
      setProjects(INITIAL_PROJECTS);
      setContractors(INITIAL_CONTRACTORS);
      setBids(INITIAL_BIDS);
      setEmailLogs([]);
      setCurrentUser(null);
      setPrivateMessages([]);
      alert("Platform databases flushed back to defaults!");
    }
  };

  // --- Add New Project & Dynamic SMTP Email Alert Relay ---
  const handleAddProject = (projectData: Omit<Project, "id" | "customerId" | "customerFirstName" | "customerLastName" | "customerPhone" | "customerAddress" | "customerEmail" | "createdAt" | "status" | "agreedByCustomer" | "agreedByContractor" | "serviceFeeCharge">) => {
    if (!currentUser || currentUser.role !== "customer") {
      alert("Only Registered home or business owners can post project vacancies.");
      return;
    }

    const serviceFeeCharge = projectData.budget <= 25000 ? 5 : 20;

    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      customerId: currentUser.id,
      customerFirstName: currentUser.fullName.split(" ")[0],
      customerLastName: currentUser.fullName.split(" ").slice(1).join(" "),
      customerPhone: currentUser.phone,
      customerAddress: currentUser.address,
      customerEmail: currentUser.email,
      createdAt: new Date().toISOString(),
      status: "open",
      agreedByCustomer: false,
      agreedByContractor: false,
      serviceFeeCharge,
    };

    setProjects((prev) => [newProject, ...prev]);

    // TRIGGER EMAIL NOTIFICATION LAUNCH FOR RADIUS
    // "(new job post: send email to contractors who signup for this option)"
    const newProjectCity = CITIES.find((c) => c.name === newProject.city) || CITIES[0];
    const generatedLogs: EmailLog[] = [];

    contractors.forEach((contractor) => {
      // Rule 1: Must be signed up for email notification alerts
      if (contractor.emailNotificationsEnabled) {
        const contractorCity = CITIES.find((c) => c.name === contractor.city) || CITIES[0];
        
        // Calculate dynamic miles distance
        const miles = getDistance(
          newProjectCity.lat,
          newProjectCity.lng,
          contractorCity.lat,
          contractorCity.lng
        );

        // Rule 2: Must reside within the 70-mile radius boundaries
        if (miles <= 70) {
          const matchedTrades = contractor.trades.filter(t => 
            newProject.title.toLowerCase().includes(t.toLowerCase()) || 
            newProject.description.toLowerCase().includes(t.toLowerCase())
          );

          generatedLogs.push({
            id: `email-${Math.random().toString(36).substr(2, 9)}`,
            recipientEmail: contractor.email,
            recipientName: contractor.fullName,
            subject: `[RADIUS ALERT] New ${newProject.type === "business" ? "Business" : "Home"} job near ${newProject.city} (${miles} mi away!)`,
            body: `Hi ${contractor.fullName},\n\nWe picked up a new job post posted by ${newProject.customerFirstName} in your active matching radius (${miles} miles away from ${contractor.city}).\n\n🎯 JOB DETAILS:\nTitle: ${newProject.title}\nOffered Budget: $${newProject.budget.toLocaleString()}\nLocation: ${newProject.city}, ${newProject.state} (${newProject.zipCode})\n\nDescription: "${newProject.description}"\n\nTrades matching: ${matchedTrades.length > 0 ? matchedTrades.join(", ") : "General Maintenance"}\n\nThis customer is ready to hire. Log in to your Hot Spot Work Shop console now to place your bid of help!\n\nBest regards,\nHot Spot Workspace SMTP Relays`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    if (generatedLogs.length > 0) {
      setEmailLogs((prev) => [...generatedLogs, ...prev]);
      // Show toaster alert notification
      alert(`Project successfully posted! Coordinates triggered SMTP email logs to ${generatedLogs.length} matching contractors within a 70-mile radius.`);
    } else {
      alert("Project successfully posted! No contractors met the 70-mile radius trigger credentials for email bulletins.");
    }
  };

  // --- Place Bid on Projects ---
  const handlePlaceBid = (projectId: string, amount: number, message: string) => {
    if (!currentUser || currentUser.role !== "contractor") {
      alert("Logging in as professional active contractor required to enter bids.");
      return;
    }

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      projectId,
      contractorId: currentUser.id,
      contractorName: currentUser.fullName,
      contractorCompany: currentUser.company,
      amount,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setBids((prev) => [...prev, newBid]);
    
    // Update parent project status
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId ? { ...proj, status: "bid_placed" } : proj
      )
    );
  };

  // --- Select Bidder (Customer accepts Contractor's offer) ---
  const handleAcceptBid = (projectId: string, bidId: string) => {
    const selectedBid = bids.find((b) => b.id === bidId);
    if (!selectedBid) return;

    setBids((prev) =>
      prev.map((b) =>
        b.projectId === projectId
          ? { ...b, status: b.id === bidId ? "accepted" : "declined" }
          : b
      )
    );

    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              status: "accepted",
              acceptedContractorId: selectedBid.contractorId,
              budget: selectedBid.amount, // adjust budget to the accepted bid price
            }
          : proj
      )
    );

    alert("Contractor selected! The project status is now set to Active. You can coordinate mutual agreement details in your dashboard to unlock full contact credentials.");
  };

  // --- Agree to Project Finalized ---
  // "not billed until job is accepted and both agree upon the project. Paid by the customer."
  const handleAgreeToProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const isCustomerOwner = currentUser && currentUser.id === proj.customerId;
          const isContractorMatch = currentUser && currentUser.id === proj.acceptedContractorId;

          const updatedCustomerAgreed = isCustomerOwner ? true : proj.agreedByCustomer;
          const updatedContractorAgreed = isContractorMatch ? true : proj.agreedByContractor;

          // If BOTH have now agreed: trigger payment simulation
          let alertMsg = "Your agreement status has been logged.";
          let actualFee = proj.budget <= 25000 ? 5.00 : 20.00;
          let promoApplied = false;

          if (updatedCustomerAgreed && updatedContractorAgreed) {
            // Check if the current homeowner/customer has the active launch promo active
            if (
              currentUser &&
              currentUser.role === "customer" &&
              currentUser.id === proj.customerId &&
              currentUser.sharedWithFriend &&
              !currentUser.firstJobFeeWaived
            ) {
              actualFee = 0.00;
              promoApplied = true;

              // Mark as waived/used on active user state to prevent double-use
              setCurrentUser((prev: any) => {
                if (!prev) return prev;
                return { ...prev, firstJobFeeWaived: true };
              });
            }

            if (promoApplied) {
              alertMsg = `🎉 BOTH Parties have agreed! Contract is officially signed!\n\n🎁 LAUNCH SPECIAL ACTIVE!\nBecause you shared with a friend, your first project app fee is completely waived! 100% FREE ($0.00 billed instead of $${(proj.budget <= 25000 ? 5.00 : 20.00).toFixed(2)}).\n\nClient/Contractor contact cards are now unlocked!`;
            } else {
              alertMsg = `🎉 BOTH Parties have agreed! Contract is officially signed!\n\n🔒 Customer Wallet Billed: $${actualFee.toFixed(2)} Platform Service Fee. No further action needed until job completion! Client/Contractor contact cards are now unlocked.`;
            }

            // Record pending escrow funds in Stripe Ledger instantly!
            fetch("/api/stripe/mock-add-funds", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: proj.budget, isPending: true })
            }).catch(e => console.error("Escrow ledger sync error:", e));
          }

          alert(alertMsg);

          return {
            ...proj,
            agreedByCustomer: updatedCustomerAgreed,
            agreedByContractor: updatedContractorAgreed,
            serviceFeeCharge: actualFee,
          };
        }
        return proj;
      })
    );
  };

  const handleCompleteProject = (projectId: string) => {
    const targetProject = projects.find((p) => p.id === projectId);

    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId ? { ...proj, status: "completed" } : proj
      )
    );

    if (targetProject) {
      // Relocate funds from pending escrow to available wallet
      fetch("/api/stripe/mock-add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: -targetProject.budget, isPending: true })
      }).then(() => {
        return fetch("/api/stripe/mock-add-funds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: targetProject.budget, isPending: false })
        });
      }).catch(e => console.error("Escrow release sync error:", e));
    }

    alert("Wonderful! Job declared complete. The contractor score statistics have been elevated and Stripe escrow reserves have been cleared to your Available Balance!");
  };

  // --- Add Review for Contractor ---
  const handleAddReview = (contractorId: string, rating: number, comment: string) => {
    const freshReview = {
      id: `rev-${Date.now()}`,
      reviewerName: currentUser ? currentUser.fullName : "Verified Customer",
      rating,
      comment,
      date: new Date().toISOString().split("T")[0],
    };

    setContractors((prev) =>
      prev.map((con) =>
        con.id === contractorId
          ? { ...con, reviews: [freshReview, ...con.reviews] }
          : con
      )
    );

    alert("Thank you! Review left successfully on the professional's profile.");
  };

  // --- Toggle Contractor Availability Status ---
  const handleToggleContractorAvailability = (contractorId: string) => {
    setContractors((prev) =>
      prev.map((c) =>
        c.id === contractorId ? { ...c, availableNow: !c.availableNow } : c
      )
    );
    setCurrentUser((prev: any) => {
      if (prev && prev.id === contractorId) {
        return { ...prev, availableNow: !prev.availableNow };
      }
      return prev;
    });
  };

  // --- Trigger Launch Special Promo: Share with a Friend ---
  const handleShareWithFriend = () => {
    if (!currentUser) return;

    setCurrentUser((prev: any) => {
      if (!prev) return prev;
      const updated = { ...prev, sharedWithFriend: true };

      // Also persist back to localStorage so the app remembers this option!
      localStorage.setItem("hsws_currentUser", JSON.stringify(updated));
      return updated;
    });

    let alertMsg = "";
    if (currentUser.role === "customer") {
      alertMsg = "🎁 Referral Shared Successfully!\n\nYour Launch Special Promo has been activated. Your first matched project's application fee is 100% FREE ($0.00 billed)! Check out your updated dashboard stats ticker to verify.";
    } else {
      alertMsg = "🎁 Referral Shared Successfully!\n\nYour Launch Special Promo has been activated. Your first month's premium membership subscription of unlimited leads is now 100% FREE! Active status pricing is updated instantly.";
    }
    alert(alertMsg);
  };

  // --- Send Private message and trigger smart automated answers ---
  const handleSendPrivateMessage = (
    recipientId: string,
    recipientName: string,
    recipientRole: "customer" | "contractor",
    text: string
  ) => {
    if (!currentUser) return;

    const newMessage: PrivateChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      recipientId,
      recipientName,
      recipientRole,
      text,
      createdAt: new Date().toISOString(),
    };

    setPrivateMessages((prev) => [...prev, newMessage]);

    // Simulated Auto Responder answers after a slight timeout delay (1.5 seconds)
    setTimeout(() => {
      let replyText = "Thank you for reaching out! I'm reviewing the details and will get back to you shortly.";
      const lowStr = text.toLowerCase();

      if (recipientRole === "contractor") {
        if (lowStr.includes("price") || lowStr.includes("cost") || lowStr.includes("budget") || lowStr.includes("how much") || lowStr.includes("how-much")) {
          replyText = "My estimate offers are all-inclusive and include clean-up and tools. Let me review the requirements, and I'll send an update!";
        } else if (lowStr.includes("when") || lowStr.includes("start") || lowStr.includes("saturday") || lowStr.includes("sunday") || lowStr.includes("weekend")) {
          replyText = "I have a flexible opening this weekend or early next week. Let me write a note in my calendar. I am available and insured!";
        } else if (lowStr.includes("materials") || lowStr.includes("mulch") || lowStr.includes("glass") || lowStr.includes("tv")) {
          replyText = "I carry standard trade materials, heavy-duty anchors, specialized levels, and cleanup gear. I can provide options on-site.";
        } else {
          replyText = `Sounds great, ${currentUser.fullName.split(" ")[0]}! I've been doing specialized trades work around this state for over 6 years. Let me know if you would like me to finalize this slot!`;
        }
      } else {
        // Customer auto-reply
        if (lowStr.includes("completed") || lowStr.includes("done") || lowStr.includes("finished")) {
          replyText = "Excellent! Please mark the project as complete on your dashboard and I will release the feedback reviews. Highly appreciate your help!";
        } else if (lowStr.includes("offer") || lowStr.includes("bid") || lowStr.includes("price")) {
          replyText = "Thanks for the estimate. I am reviewing other bids in the 70-mile radius as well and will finalize my decision soon.";
        } else {
          replyText = "That works for my schedule. Let's stay in touch to guarantee we coordinate details safely!";
        }
      }

      const simulatedReply: PrivateChatMessage = {
        id: `msg-auto-${Date.now()}`,
        senderId: recipientId,
        senderName: recipientName,
        senderRole: recipientRole,
        recipientId: currentUser.id,
        recipientName: currentUser.fullName,
        recipientRole: currentUser.role,
        text: replyText,
        createdAt: new Date().toISOString(),
      };

      setPrivateMessages((prev) => [...prev, simulatedReply]);
    }, 1500);
  };

  // --- Initiate Chat Trigger ---
  const handleStartChat = (recipientId: string, recipientName: string, recipientRole: "customer" | "contractor") => {
    setActiveChatRecipientId(recipientId);
    setIsChatOpen(true);
  };

  // --- Filter Logic calculations ---
  // The forum can be seen by any user who is in the city and 70 mile radius.
  const filteredProjects = projects.filter((project) => {
    // 1. Calculate distance between the viewer's activeCity and the project's city
    const projectCityData = CITIES.find((c) => c.name === project.city) || CITIES[0];
    const distanceMiles = getDistance(
      activeCityData.lat,
      activeCityData.lng,
      projectCityData.lat,
      projectCityData.lng
    );

    // Filter Rule: must reside within radius limit
    const isWithinRadius = distanceMiles <= radiusLimit;

    // 2. Search query matches title/description
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());

    return isWithinRadius && matchesSearch;
  });

  // Filter Contractors
  const filteredContractors = contractors
    .filter((con) => {
      const matchesSearch = con.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrade = selectedTradeFilter === "" || con.trades.includes(selectedTradeFilter);
      const matchesAvailable = !availableOnlyFilter || con.availableNow;
      return matchesSearch && matchesTrade && matchesAvailable;
    })
    .sort((a, b) => {
      const aVal = a.availableNow ? 1 : 0;
      const bVal = b.availableNow ? 1 : 0;
      return bVal - aVal;
    });

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans select-none" id="applet-main-container">
      
      {/* Platform Navigation */}
      <Navbar
        currentUser={currentUser}
        onTriggerLogin={() => setShowAuthModal(true)}
        onLogout={() => {
          setCurrentUser(null);
          alert("Logged out successfully.");
        }}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          // Set tabs search resets
          setSearchTerm("");
        }}
        onToggleEmailLog={() => setShowEmailTracker(true)}
        emailCount={emailLogs.length}
      />

      {/* Quick Interactive Role Switcher for seamless sandbox trials */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-xs font-semibold text-amber-900 flex flex-wrap gap-x-4 gap-y-2 items-center justify-between">
        <span className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Need to test roles? Toggle here instantly:</span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const custMock = INITIAL_CUSTOMERS[0];
              setCurrentUser(custMock);
              alert("Switched role context details to John Doe (Homeowner). Free to post projects and accept bids!");
            }}
            className="bg-white hover:bg-zinc-100 border border-amber-300 text-zinc-800 font-bold px-3 py-1 rounded-lg text-[11px] transition shadow-xs"
          >
            Switch to Customer: John D.
          </button>
          <button
            onClick={() => {
              const conMock = INITIAL_CONTRACTORS[0];
              setCurrentUser(conMock);
              alert("Switched role context details to Michael Smith (Contractor). Free to bid and accept jobs!");
            }}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition shadow-xs"
          >
            Switch to Contractor: Mike S.
          </button>
          <button
            onClick={handleResetData}
            title="Wipes custom changes and starts over"
            className="bg-zinc-500 hover:bg-zinc-650 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition shadow-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset Seeds
          </button>
        </div>
      </div>

      {/* Main Forum View Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Banner Section */}
        <section className="bg-radial from-amber-600 to-amber-700 text-white p-8 rounded-3xl shadow-sm text-center md:text-left relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border border-amber-700">
          <div className="absolute right-0 bottom-0 top-0 left-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.06)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="space-y-3 relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-amber-500/30 text-amber-100 text-[10px] uppercase font-bold tracking-widest rounded-full border border-white/10">
              ⚡ Local Professional Handyman Forum
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white">
              Connect Home & Business Owners with Specialized Trades
            </h1>
            <p className="text-zinc-100 text-xs md:text-sm leading-relaxed font-medium">
              Post projects of any dimensions—from spreading black mulch, window glazing, gutter guards installation to TV mounting. Set your target price and query matching experts.
            </p>
          </div>

          <div className="shrink-0 relative z-10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (!currentUser) {
                  setShowAuthModal(true);
                  return;
                }
                if (currentUser.role !== "customer") {
                  alert("Please log in as a Customer (home/business owner) to post projects.");
                  return;
                }
                setShowProjectModal(true);
              }}
              className="px-6 py-3.5 bg-zinc-950 hover:bg-zinc-850 text-white font-display font-black text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
              id="platform-main-action-btn"
            >
              <Plus className="w-5 h-5 text-amber-500" /> Post New Project Vacancy
            </button>
          </div>
        </section>

        {/* Global Location & Radius Controller Bar */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Base Viewer City Location Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Your Current Active City Center
            </label>
            <select
              value={currentCityName}
              onChange={(e) => {
                setCurrentCityName(e.target.value);
                alert(`Viewer location center adjusted to ${e.target.value}. Computing distances for nearby listings...`);
              }}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c.zipCode} value={c.name}>
                  📍 {c.name}, {c.state} ({c.zipCode})
                </option>
              ))}
            </select>
          </div>

          {/* Haversine Miles Radius Slider */}
          <div className="space-y-1.5 md:col-span-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <span>Active Radius Boundaries</span>
              <span className="text-amber-700 lowercase font-mono lowercase tracking-normal text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {radiusLimit} miles
              </span>
            </div>
            
            <div className="flex items-center gap-3 py-1">
              <span className="text-[10px] text-zinc-400 font-bold">1 mi</span>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={radiusLimit}
                onChange={(e) => setRadiusLimit(Number(e.target.value))}
                className="flex-1 accent-amber-600 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                id="distance-radius-slider"
              />
              <span className="text-[10px] text-zinc-400 font-bold">120 mi</span>
            </div>
          </div>

          {/* Keyword Search Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Keyword Forum Filter
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder={activeTab === "contractor-1" ? "Search contractors by keyword..." : "Search matching lawn, gutters, TVs, glazing..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-amber-550 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

        </div>

        {/* Tab content router */}
        <section className="space-y-6">
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-zinc-100/50 p-2 rounded-xl">
                <h2 className="font-display font-extrabold text-lg text-zinc-900 px-2">
                  Active Projects Forum Board
                </h2>
                <span className="text-xs text-zinc-500 font-medium font-semibold px-2">
                  Showing {filteredProjects.length} matching jobs within {radiusLimit} miles
                </span>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
                  <span className="text-4xl">🔎</span>
                  <h3 className="font-display font-medium text-zinc-800 text-lg">No nearby listings match your selection</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Either extend your mileage search radius past **{radiusLimit} miles** or try adjusting your current city base location. Alternatively, post a new project to kickstart the community!
                  </p>
                  <button
                    onClick={() => setRadiusLimit(120)}
                    className="mt-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl px-4 py-2 transition"
                  >
                    Set Max Radius (120 Miles)
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredProjects.map((project) => {
                    const projectCityData = CITIES.find((c) => c.name === project.city) || CITIES[0];
                    const dist = getDistance(
                      activeCityData.lat,
                      activeCityData.lng,
                      projectCityData.lat,
                      projectCityData.lng
                    );

                    return (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        bids={bids.filter((b) => b.projectId === project.id)}
                        currentUser={currentUser}
                        currentCityName={currentCityName}
                        distanceToProject={dist}
                        onPlaceBid={(amount, msg) => handlePlaceBid(project.id, amount, msg)}
                        onAgreeToProject={() => handleAgreeToProject(project.id)}
                        onAcceptBid={(bidId) => handleAcceptBid(project.id, bidId)}
                        onCompleteProject={() => handleCompleteProject(project.id)}
                        onStartChat={handleStartChat}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "contractors" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-zinc-100/50 p-3 rounded-xl border border-zinc-200/50">
                <h2 className="font-display font-extrabold text-lg text-zinc-900 px-2 shrink-0">
                  Registered Specialized Contractors
                </h2>
                <div className="flex flex-wrap gap-2.5 items-center w-full sm:w-auto">
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-zinc-500 font-semibold shrink-0">Specialty trade:</span>
                    <select
                      value={selectedTradeFilter}
                      onChange={(e) => setSelectedTradeFilter(e.target.value)}
                      className="bg-white border border-zinc-200 text-xs px-2.5 py-1.5 rounded-lg font-semibold focus:outline-hidden"
                    >
                      <option value="">All Trade Specialties</option>
                      {TRADE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Available Now Filter Toggle */}
                  <label className="inline-flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 select-none shrink-0" id="filter-available-now-wrapper">
                    <input
                      type="checkbox"
                      checked={availableOnlyFilter}
                      onChange={(e) => setAvailableOnlyFilter(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-550 border-zinc-300 accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs text-zinc-700 font-bold flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      Only Available Now
                    </span>
                  </label>
                </div>
              </div>

              {filteredContractors.length === 0 ? (
                <p className="text-xs text-zinc-400 italic text-center">No contractors match the current select specialty filters.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContractors.map((con) => (
                    <ContractorProfileCard
                      key={con.id}
                      contractor={con}
                      currentUser={currentUser}
                      onAddReview={handleAddReview}
                      onToggleAvailability={handleToggleContractorAvailability}
                      onStartChat={handleStartChat}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "my_dashboard" && (
            <div className="space-y-8">
              {!currentUser ? (
                <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
                  <HardHat className="w-12 h-12 mx-auto text-amber-500" />
                  <h3 className="font-display font-bold text-lg text-zinc-900">Sign Up / Authenticate Console</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    You must sign in or register to manage your listings. Contractors can place bids and review transactions; customer homeowners can place free project requests.
                  </p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold p-3 px-6 rounded-xl text-xs transition shadow-sm"
                  >
                    Log In or Sign Up Now
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                    <h2 className="text-xl font-bold font-display text-zinc-900 mb-1">
                      Welcome Back, {currentUser.fullName}!
                    </h2>
                    <p className="text-zinc-505 text-xs">
                      Logged in as a <span className="font-bold text-amber-700 uppercase tracking-wider">{currentUser.role === "customer" ? "Homeowner Customer" : "Professional Contractor"}</span>
                    </p>
                    <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-zinc-100">
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-zinc-650">
                        <p>📧 Email: <span className="text-zinc-900">{currentUser.email}</span></p>
                        <p>📞 Phone: <span className="text-zinc-900">{currentUser.phone}</span></p>
                        <p>📍 Location: <span className="text-zinc-900">{currentUser.address}, {currentUser.city}, {currentUser.zipCode}</span></p>
                      </div>
                      
                      <button
                        onClick={() => setActiveTab("stripe_hub")}
                        className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition duration-150 self-start md:self-center shrink-0"
                        id="dashboard-open-stripe-btn"
                      >
                        💳 Stripe Banking Center
                      </button>
                    </div>

                    {currentUser.role === "contractor" && (
                      <div className="mt-5 pt-4 border-t border-zinc-150 flex items-center justify-between gap-4 flex-wrap bg-emerald-50/25 p-4 rounded-xl border border-emerald-100/70" id="contractor-dashboard-availability-banner">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                            Availability Indicator: 
                            {currentUser.availableNow ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-250">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                Available Now
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-100 text-zinc-500 font-medium px-2.5 py-0.5 rounded-full border border-zinc-250">
                                Busy / Offline
                              </span>
                            )}
                          </span>
                          <p className="text-[10px] text-zinc-500">
                            Homeowners will see your active status indicator and your profile will rank at the very top of results.
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleContractorAvailability(currentUser.id)}
                          className={`text-xs font-bold px-4 py-2 rounded-xl border transition shadow-xs ${
                            currentUser.availableNow
                              ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-300"
                              : "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                          }`}
                        >
                          {currentUser.availableNow ? "Mark as Busy / Offline" : "Go 'Available Now'"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PLATFORM LAUNCH SPECIAL REFERRAL WIDGET */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5" id="referral-launch-promo-card">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 opacity-5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="space-y-1.5 flex-1 p-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm">🎁</span>
                        <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest font-mono">Platform Launch Special Referral</h3>
                        <span className="bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Active Special</span>
                      </div>
                      
                      <h4 className="text-sm font-black text-zinc-900 font-display">
                        {currentUser.role === "customer" 
                          ? "Share with a friend & your first job agreement fee is 100% FREE!" 
                          : "Share with a friend & your first month subscription is 100% FREE!"
                        }
                      </h4>
                      <p className="text-xs text-zinc-650 max-w-2xl leading-normal">
                        {currentUser.role === "customer"
                          ? "Spread the word! When you copy and share your unique invite code with neighborly home and business owners, we'll waive our 5.0% or $20 platform service fee on your next mutual contract agreement!"
                          : "Help grow the trade network! Invite fellow trade specialists. Once Shared, your professional premium monthly subscription ($20 value) instantly drops to $0.00 for the entire month."
                        }
                      </p>

                      {currentUser.sharedWithFriend && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-full py-1 px-3 border border-emerald-200 mt-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                          <span>Promo Status: Active & Applied! ({currentUser.role === 'customer' ? 'First Project Agreement Fee is FREE!' : 'First Month Subscription is $0.00!'})</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 space-y-2 w-full md:w-auto self-end md:self-center">
                      <button
                        onClick={handleShareWithFriend}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm w-full md:w-auto"
                        id="share-invite-btn"
                      >
                        <span>🔗</span> {currentUser.sharedWithFriend ? "Invite Another Friend" : "Share with a Friend"}
                      </button>
                      <p className="text-[10px] text-zinc-400 text-center md:text-right font-medium">Invite Link: <span className="font-mono bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">{currentUser.username || 'user'}?promo=free</span></p>
                    </div>
                  </div>

                  {/* Summary Stats Widget */}
                  <DashboardStats currentUser={currentUser} projects={projects} bids={bids} />

                  {currentUser.role === "customer" && (
                    <div className="space-y-6">
                      <div className="bg-zinc-150 p-2.5 rounded-xl">
                        <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider px-2">Your Published Vacancies</h3>
                      </div>
                      
                      {projects.filter((p) => p.customerId === currentUser.id).length === 0 ? (
                        <p className="text-xs text-zinc-400 italic">You have not launched any job requests yet. Click "Post New Project" in the banner to launch a request!</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {projects
                            .filter((p) => p.customerId === currentUser.id)
                            .map((project) => (
                              <ProjectCard
                                key={project.id}
                                project={project}
                                bids={bids.filter((b) => b.projectId === project.id)}
                                currentUser={currentUser}
                                onAgreeToProject={() => handleAgreeToProject(project.id)}
                                onAcceptBid={(bidId) => handleAcceptBid(project.id, bidId)}
                                onCompleteProject={() => handleCompleteProject(project.id)}
                                onStartChat={handleStartChat}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentUser.role === "contractor" && (
                    <div className="space-y-6">
                      <div className="bg-zinc-150 p-2.5 rounded-xl">
                        <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider px-2">Your Matched Active Work Jobs</h3>
                      </div>

                      {projects.filter((p) => p.acceptedContractorId === currentUser.id).length === 0 ? (
                        <p className="text-xs text-zinc-400 italic">You do not have any accepted matching jobs currently. Head to the main "Active Projects Forum Board" and place custom bids on open requests!</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {projects
                            .filter((p) => p.acceptedContractorId === currentUser.id)
                            .map((project) => (
                              <ProjectCard
                                key={project.id}
                                project={project}
                                bids={bids.filter((b) => b.projectId === project.id)}
                                currentUser={currentUser}
                                onAgreeToProject={() => handleAgreeToProject(project.id)}
                                onCompleteProject={() => handleCompleteProject(project.id)}
                                onStartChat={handleStartChat}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "stripe_hub" && (
            <StripeHub
              currentUser={currentUser}
              onAlert={(msg) => alert(msg)}
            />
          )}
        </section>
      </main>

      {/* Dynamic Private Chat Overlay Console */}
      <button
        type="button"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-72 bg-zinc-900 border border-zinc-700 hover:border-zinc-650 rounded-full p-4 shadow-2xl transition duration-200 select-none flex items-center gap-2 font-semibold text-white z-40 active:scale-95"
        id="chat-trigger-float-btn"
      >
        <MessageSquare className="w-5 h-5 text-amber-500 shrink-0" />
        <span className="text-xs font-bold text-white tracking-tight">Private Chat ({privateMessages.length})</span>
        {privateMessages.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
        )}
      </button>

      <PrivateChat
        currentUser={currentUser}
        contractors={contractors}
        customers={INITIAL_CUSTOMERS}
        messages={privateMessages}
        onSendMessage={handleSendPrivateMessage}
        activeRecipientId={activeChatRecipientId}
        setActiveRecipientId={setActiveChatRecipientId}
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
      />

      {/* Persistent Floating SMTP Email logs simulator bubble */}
      <button
        onClick={() => setShowEmailTracker(!showEmailTracker)}
        className="fixed bottom-6 right-6 bg-slate-900 hover:bg-slate-800 text-amber-500 hover:text-amber-400 border border-slate-700 rounded-full p-4 shadow-2xl transition duration-200 select-none flex items-center gap-2 font-mono z-40 active:scale-95"
        id="email-trigger-float-btn"
      >
        <Mail className="w-5 h-5 text-amber-500 shrink-0" />
        <span className="text-xs font-bold text-white tracking-tight">Tech Relay logs ({emailLogs.length})</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-ping" />
      </button>

      {/* --- Overlay Modals routers --- */}
      {showProjectModal && (
        <ProjectForm
          onAddProject={handleAddProject}
          onClose={() => setShowProjectModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(configuredUser) => {
            setCurrentUser(configuredUser);
            // If contractor is new, append and seed to active contractors list (unless already exists)
            if (configuredUser.role === "contractor") {
              setContractors((prev) => {
                if (prev.some(c => c.username === configuredUser.username)) return prev;
                return [configuredUser, ...prev];
              });
            }
            setShowAuthModal(false);
            alert(`Succeeded! Logged in as ${configuredUser.fullName}`);
          }}
        />
      )}

      {showEmailTracker && (
        <EmailSimulator
          logs={emailLogs}
          onClearLogs={() => {
            setEmailLogs([]);
            alert("Email simulator buffers wiped green.");
          }}
          onClose={() => setShowEmailTracker(false)}
        />
      )}
    </div>
  );
}
