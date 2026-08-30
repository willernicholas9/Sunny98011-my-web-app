import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import SafeStorage from "./utils/browserCompat";
import { UserRole, Project, Bid, ContractorUser, CustomerUser, EmailLog, CityData, TRADE_OPTIONS, PrivateChatMessage, BeforeAfterPair } from "./types";
import { CITIES, getDistance } from "./data/cities";
import { INITIAL_PROJECTS, INITIAL_CONTRACTORS, INITIAL_CUSTOMERS, INITIAL_BIDS, OWNER_USER } from "./data/mockData";
import Navbar, { TabType } from "./components/Navbar";
import ProjectCard from "./components/ProjectCard";
import ContractorProfileCard from "./components/ContractorProfileCard";
import ProjectForm from "./components/ProjectForm";
import MaterialPartnerRebateHub from "./components/MaterialPartnerRebateHub";
import AuthModal from "./components/AuthModal";
import EmailSimulator from "./components/EmailSimulator";
import DashboardStats from "./components/DashboardStats";
import PrivateChat from "./components/PrivateChat";
import StripeHub from "./components/StripeHub";
import GoogleMapsDirectory from "./components/GoogleMapsDirectory";
import OutreachCampaignsHub from "./components/OutreachCampaignsHub";
import AutonomousAdInstallerAgent from "./components/AutonomousAdInstallerAgent";
import OwnerSuite from "./components/OwnerSuite";
import InstantQuoteCalculator from "./components/InstantQuoteCalculator";
import ProjectCalendarView from "./components/ProjectCalendarView";
import MonetizationHub from "./components/MonetizationHub";
import { monetizationService } from "./services/monetizationService";
import AppStoreDownloadModal from "./components/AppStoreDownloadModal";
import { SpiralFrenzyGame } from "./components/game/SpiralFrenzyGame";
import PersistenceCheckToast from "./components/PersistenceCheckToast";
import { persistenceCheck } from "./services/persistenceCheck";
import RealtimeSyncBar from "./components/RealtimeSyncBar";
import { realtimeSync } from "./services/realtimeSync";
import LiveMarketplaceTicker from "./components/LiveMarketplaceTicker";
import InstantRepairPricingWidget from "./components/InstantRepairPricingWidget";
import ContractorProModal from "./components/ContractorProModal";
import BidOpportunityRadar from "./components/project-board/BidOpportunityRadar";
import ProjectOpportunityTable from "./components/project-board/ProjectOpportunityTable";
import EmergencyDispatchModal from "./components/EmergencyDispatchModal";
import BeforeAfterShowcaseModal from "./components/BeforeAfterShowcaseModal";
import InvoiceEstimateGeneratorModal from "./components/InvoiceEstimateGeneratorModal";
import MaterialAndPermitEstimatorModal from "./components/MaterialAndPermitEstimatorModal";
import SubcontractorCrewBoardModal from "./components/SubcontractorCrewBoardModal";
import ActiveTradesInsights from "./components/ActiveTradesInsights";
import MobileBottomNav from "./components/MobileBottomNav";
import HomeFocusSectionSelector, { HomeFocusMode } from "./components/HomeFocusSectionSelector";
import QuickJobPostTemplateBar from "./components/QuickJobPostTemplateBar";
import MonetizationQuickCheckoutModal, { MonetizationProductKind } from "./components/MonetizationQuickCheckoutModal";
import { MapPin, Search, Mail, HelpCircle, HardHat, Hammer, Sparkles, Plus, AlertCircle, RefreshCw, CheckCircle2, DollarSign, ArrowRight, ShieldCheck, Star, MessageSquare, Compass, Crown, LayoutGrid, List, Calculator, Calendar as CalendarIcon, Apple, Smartphone, Download, Zap, Flame, Shield, TrendingUp, Clock, Phone } from "lucide-react";

const EMPTY_BIDS: Bid[] = [];

export default function App() {
  // --- Persistent State Initialization ---
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem("hsws_currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activePushNotification, setActivePushNotification] = useState<{
    id: string;
    title: string;
    body: string;
  } | null>(null);

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem("hsws_projects");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Array.from(new Map(parsed.map((p: any) => [p.id, p])).values());
        }
      }
      return INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [bids, setBids] = useState<Bid[]>(() => {
    try {
      const saved = localStorage.getItem("hsws_bids");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Array.from(new Map(parsed.map((b: any) => [b.id, b])).values());
        }
      }
      return INITIAL_BIDS;
    } catch {
      return INITIAL_BIDS;
    }
  });

  const [contractors, setContractors] = useState<ContractorUser[]>(() => {
    try {
      const saved = localStorage.getItem("hsws_contractors");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Array.from(new Map(parsed.map((c: any) => [c.id, c])).values());
        }
      }
      return INITIAL_CONTRACTORS;
    } catch {
      return INITIAL_CONTRACTORS;
    }
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    try {
      const saved = localStorage.getItem("hsws_emailLogs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- Filtering & Visual Controls ---
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [seniorMode, setSeniorMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("hsws_seniorMode");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [allCities, setAllCities] = useState<CityData[]>(() => {
    try {
      const saved = localStorage.getItem("hsws_allCities");
      return saved ? JSON.parse(saved) : CITIES;
    } catch {
      return CITIES;
    }
  });
  const [currentCityName, setCurrentCityName] = useState("Austin");
  const [citySearchInput, setCitySearchInput] = useState("");
  const [radiusLimit, setRadiusLimit] = useState(70); // Miles slider
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTradeFilter, setSelectedTradeFilter] = useState("");
  const [availableOnlyFilter, setAvailableOnlyFilter] = useState(false);
  const [jobsLayoutMode, setJobsLayoutMode] = useState<"grid" | "list" | "table" | "calendar">("grid");
  const [quickFilterMode, setQuickFilterMode] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("least_bids");
  const [showEstimatorWidget, setShowEstimatorWidget] = useState(false);
  const [homeFocusMode, setHomeFocusMode] = useState<HomeFocusMode>("feed");
  const [monetizationModalState, setMonetizationModalState] = useState<{
    isOpen: boolean;
    kind: MonetizationProductKind;
    targetProject?: Project | null;
  }>({
    isOpen: false,
    kind: "contractor_pro",
    targetProject: null,
  });
  const [quickToastMessage, setQuickToastMessage] = useState<string | null>(null);

  // Modals Controller
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [initialProjectFormData, setInitialProjectFormData] = useState<any>(null);
  const [showContractorProModal, setShowContractorProModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEmailTracker, setShowEmailTracker] = useState(false);
  const [showMapsDirectory, setShowMapsDirectory] = useState(false);
  const [selectedMapProjectId, setSelectedMapProjectId] = useState<string | null>(null);
  const [showQuoteCalculatorModal, setShowQuoteCalculatorModal] = useState(false);
  const [showAppStoreModal, setShowAppStoreModal] = useState(false);
  const [showEmergencyDispatchModal, setShowEmergencyDispatchModal] = useState(false);
  const [showGlobalBeforeAfterModal, setShowGlobalBeforeAfterModal] = useState(false);
  const [showGlobalInvoiceModal, setShowGlobalInvoiceModal] = useState(false);
  const [showGlobalPermitModal, setShowGlobalPermitModal] = useState(false);
  const [showGlobalCrewBoardModal, setShowGlobalCrewBoardModal] = useState(false);
  const [dismissedAppStoreBanner, setDismissedAppStoreBanner] = useState(() => {
    try {
      return SafeStorage.getItem("hsws_dismiss_universal_banner") === "true";
    } catch {
      return false;
    }
  });

  // Private Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatRecipientId, setActiveChatRecipientId] = useState<string | null>(null);
  const [privateMessages, setPrivateMessages] = useState<PrivateChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("hsws_private_messages");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse private messages", e);
    }

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
    try {
      localStorage.setItem("hsws_currentUser", JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("hsws_projects", JSON.stringify(projects));
    } catch {}
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem("hsws_bids", JSON.stringify(bids));
    } catch {}
  }, [bids]);

  useEffect(() => {
    try {
      localStorage.setItem("hsws_contractors", JSON.stringify(contractors));
    } catch {}
  }, [contractors]);

  useEffect(() => {
    try {
      localStorage.setItem("hsws_emailLogs", JSON.stringify(emailLogs));
    } catch {}
  }, [emailLogs]);

  useEffect(() => {
    try {
      localStorage.setItem("hsws_private_messages", JSON.stringify(privateMessages));
    } catch {}
  }, [privateMessages]);

  useEffect(() => {
    try {
      localStorage.setItem("hsws_allCities", JSON.stringify(allCities));
    } catch {}
  }, [allCities]);

  useEffect(() => {
    try {
      localStorage.setItem("hsws_seniorMode", JSON.stringify(seniorMode));
    } catch {}
  }, [seniorMode]);

  // Push notifications automatic dismissal timer
  useEffect(() => {
    if (activePushNotification) {
      const timer = setTimeout(() => {
        setActivePushNotification(null);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [activePushNotification]);

  // Register Persistence-Check automated background sync handler
  useEffect(() => {
    persistenceCheck.registerSyncHandler(async (update) => {
      // Reconcile and commit update locally & to mock backend
      console.log(`[Persistence-Check] Reconciling queued update "${update.title}" (${update.type})`);
      // Simulate network round-trip validation
      await new Promise((resolve) => setTimeout(resolve, 350));
      return true;
    });
  }, []);

  // Universal Real-Time Synchronizer connecting Website & Mobile App
  useEffect(() => {
    realtimeSync.connect();

    const unsubscribe = realtimeSync.subscribe((syncEvent) => {
      if (syncEvent.type === "INIT" && (syncEvent as any).data) {
        const serverData = (syncEvent as any).data;
        if (serverData.projects && serverData.projects.length > 0) {
          setProjects(serverData.projects);
        }
        if (serverData.bids && serverData.bids.length > 0) {
          setBids(serverData.bids);
        }
        if (serverData.contractors && serverData.contractors.length > 0) {
          setContractors(serverData.contractors);
        }
        if (serverData.chatMessages && serverData.chatMessages.length > 0) {
          setPrivateMessages(serverData.chatMessages);
        }
        if (serverData.emailLogs && serverData.emailLogs.length > 0) {
          setEmailLogs(serverData.emailLogs);
        }
      } else if (syncEvent.type === "UPDATE") {
        if (syncEvent.entity === "projects") {
          if (Array.isArray(syncEvent.payload)) {
            setProjects(syncEvent.payload);
          } else if (syncEvent.action === "upsert") {
            setProjects((prev) => {
              const idx = prev.findIndex((p) => p.id === syncEvent.payload.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...syncEvent.payload };
                return next;
              }
              return [syncEvent.payload, ...prev];
            });
          } else if (syncEvent.action === "delete") {
            setProjects((prev) => prev.filter((p) => p.id !== syncEvent.payload.id));
          }
        } else if (syncEvent.entity === "bids") {
          if (Array.isArray(syncEvent.payload)) {
            setBids(syncEvent.payload);
          } else if (syncEvent.action === "upsert") {
            setBids((prev) => {
              const idx = prev.findIndex((b) => b.id === syncEvent.payload.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...syncEvent.payload };
                return next;
              }
              return [...prev, syncEvent.payload];
            });
          } else if (syncEvent.action === "delete") {
            setBids((prev) => prev.filter((b) => b.id !== syncEvent.payload.id));
          }
        } else if (syncEvent.entity === "chatMessages") {
          if (Array.isArray(syncEvent.payload)) {
            setPrivateMessages(syncEvent.payload);
          } else if (syncEvent.action === "upsert") {
            setPrivateMessages((prev) => [...prev, syncEvent.payload]);
          }
        } else if (syncEvent.entity === "contractors") {
          if (Array.isArray(syncEvent.payload)) {
            setContractors(syncEvent.payload);
          } else if (syncEvent.action === "upsert") {
            setContractors((prev) => {
              const idx = prev.findIndex((c) => c.id === syncEvent.payload.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...syncEvent.payload };
                return next;
              }
              return [...prev, syncEvent.payload];
            });
          }
        } else if (syncEvent.entity === "emailLogs") {
          if (Array.isArray(syncEvent.payload)) {
            setEmailLogs(syncEvent.payload);
          } else if (syncEvent.action === "upsert") {
            setEmailLogs((prev) => [syncEvent.payload, ...prev]);
          }
        }
      } else if (syncEvent.type === "PING_TEST" || syncEvent.type === "BROADCAST") {
        playNotificationSound();
        setActivePushNotification({
          id: `broadcast-${Date.now()}`,
          title: (syncEvent.payload as any)?.title || "⚡ Real-Time Live Sync Alert",
          body: (syncEvent.payload as any)?.message || (syncEvent.payload as any)?.description || "Website and Mobile App synced successfully in real time!",
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Deep-Link & QR Code scan auto-focus handler & Universal URL parameter routing
  const hasHandledDeepLinkRef = useRef(false);
  useEffect(() => {
    if (hasHandledDeepLinkRef.current) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab") as TabType | null;
      const actionParam = urlParams.get("action");
      const projectIdFromUrl = urlParams.get("project");
      const installParam = urlParams.get("install");
      const hash = window.location.hash;
      const targetId = projectIdFromUrl || (hash && hash.startsWith("#project-card-") ? hash.replace("#project-card-", "") : null);

      if (tabParam && ["projects", "contractors", "rebates", "my_dashboard", "stripe_hub", "outreach", "ai_agent", "owner_suite", "monetize", "spiral_game"].includes(tabParam)) {
        setActiveTab(tabParam);
      }

      if (actionParam === "new_project" || actionParam === "post_job") {
        setShowProjectModal(true);
      }

      if (installParam === "true" || installParam === "app") {
        setShowAppStoreModal(true);
      }

      if (targetId) {
        hasHandledDeepLinkRef.current = true;
        // Ensure projects tab and feed focus are selected
        setActiveTab("projects");
        setHomeFocusMode("feed");
        // Expand radius if needed so the item isn't hidden
        setRadiusLimit(120);
        setQuickFilterMode("all");
        setSelectedTradeFilter("");
        setSearchTerm("");

        // Scroll to card after render
        setTimeout(() => {
          const el = document.getElementById(`project-card-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("ring-4", "ring-amber-500", "ring-offset-2");
            setTimeout(() => {
              el.classList.remove("ring-4", "ring-amber-500", "ring-offset-2");
            }, 3000);
          }

          if (actionParam === "bid" || actionParam === "quick_bid" || urlParams.get("bid") === "true") {
            setTimeout(() => {
              const bidBtn = document.getElementById(`quick-bid-btn-${targetId}`);
              if (bidBtn) {
                (bidBtn as HTMLButtonElement).click();
              }
            }, 300);
          }
        }, 600);
      }
    } catch (e) {
      console.warn("Universal URL parameter auto-routing error", e);
    }
  }, []);


  // Web Audio chime generator (runs completely local & offline with shared context)
  const sharedAudioCtxRef = useRef<AudioContext | null>(null);

  const playNotificationSound = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!sharedAudioCtxRef.current || sharedAudioCtxRef.current.state === "closed") {
        sharedAudioCtxRef.current = new AudioCtxClass();
      }

      const audioCtx = sharedAudioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }

      const now = audioCtx.currentTime;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = "sine";
      // E6 to G6 high chime sound
      oscillator.frequency.setValueAtTime(1318.51, now); // E6
      oscillator.frequency.setValueAtTime(1567.98, now + 0.1); // G6
      
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      oscillator.start(now);
      oscillator.stop(now + 0.35);
    } catch (e) {
      console.warn("Web Audio API notification was blocked or unsupported.", e);
    }
  };

  const triggerNotificationForProject = (proj: Project, bidAmount: number, contractorName: string, bypassUserCheck: boolean = false) => {
    const isOwnerLogged = currentUser && currentUser.role === "customer" && currentUser.id === proj.customerId;
    const notificationEnabled = currentUser?.pushNotificationsEnabled !== false;
    
    if (bypassUserCheck || (isOwnerLogged && notificationEnabled)) {
      const title = "🔔 Hot Spot Workspace Alert";
      const body = `New bid of $${bidAmount.toLocaleString()} submitted by ${contractorName} on your listing: "${proj.title}"`;
      
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(title, { body });
        } catch (err) {
          console.error("HTML5 Notification API failed:", err);
        }
      }
      
      setActivePushNotification({
        id: `push-${Date.now()}`,
        title,
        body,
      });
      
      playNotificationSound();
    }
  };

  // Find coordinate points for selected city filter
  const activeCityData = useMemo(() => {
    return allCities.find((c) => c.name.toLowerCase() === currentCityName.toLowerCase()) || allCities[0];
  }, [allCities, currentCityName]);

  // Helper: Submit custom city state searches dynamically
  const handleCustomCitySubmit = () => {
    const query = citySearchInput.trim();
    if (!query) return;

    // Check if user specified a state separated by a comma (e.g. Austin, TX)
    const parts = query.split(",");
    const cityNameInput = parts[0].trim();
    const stateNameInput = parts[1] ? parts[1].trim().toUpperCase() : "TX";

    // Search case-insensitively in our active cities list
    const found = allCities.find(
      (c) => c.name.toLowerCase() === cityNameInput.toLowerCase()
    );

    if (found) {
      setCurrentCityName(found.name);
      setCitySearchInput("");
      alert(`Viewer location center adjusted to ${found.name}, ${found.state}!`);
    } else {
      // Create a dynamic custom city and add it to our state list
      const newCity: CityData = {
        name: cityNameInput.charAt(0).toUpperCase() + cityNameInput.slice(1),
        state: stateNameInput,
        zipCode: Math.floor(10000 + Math.random() * 90000).toString(),
        // Compute mock coordinates slightly offset from Austin's core
        lat: 30.2672 + (Math.random() - 0.5) * 1.5,
        lng: -97.7431 + (Math.random() - 0.5) * 1.5,
      };

      setAllCities((prev) => [...prev, newCity]);
      setCurrentCityName(newCity.name);
      setCitySearchInput("");
      alert(`✨ Succeeded! Dynamic location "${newCity.name}, ${newCity.state}" was created and added to the map index. Distances updated.`);
    }
  };

  // Helper: Reset application back to initial state
  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all forum listings and users back to seed defaults?")) {
      localStorage.clear();
      setProjects(INITIAL_PROJECTS);
      setContractors(INITIAL_CONTRACTORS);
      setBids(INITIAL_BIDS);
      setAllCities(CITIES);
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
    realtimeSync.publishUpdate("projects", newProject, "upsert", `New Project: "${newProject.title}" in ${newProject.city}`);

    // Queue update if offline
    if (!persistenceCheck.isOnline()) {
      persistenceCheck.queueUpdate(
        "create_project",
        `New Project Post: ${newProject.title}`,
        newProject,
        `Budget: $${newProject.budget.toLocaleString()} • ${newProject.city}, ${newProject.state}`
      );
    }

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
    realtimeSync.publishUpdate("bids", newBid, "upsert", `Bid of $${amount.toLocaleString()} placed on project`);
    
    // Update parent project status
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          triggerNotificationForProject(proj, amount, currentUser.fullName);
          const updatedProj = { ...proj, status: "bid_placed" as const };
          realtimeSync.publishUpdate("projects", updatedProj, "upsert", `Project status updated to bid placed`);
          return updatedProj;
        }
        return proj;
      })
    );

    // Queue update if offline
    if (!persistenceCheck.isOnline()) {
      persistenceCheck.queueUpdate(
        "place_bid",
        `Bid Placed: $${amount.toLocaleString()}`,
        newBid,
        `Contractor: ${currentUser.fullName} • Project: ${projectId}`
      );
    }
  };

  // --- Simulation: Contractor places automated bid on a project (to test notifications) ---
  const handleSimulateContractorBid = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    const candidateContractors = contractors.length > 0 ? contractors : INITIAL_CONTRACTORS;
    const randomContractor = candidateContractors[Math.floor(Math.random() * candidateContractors.length)];
    
    const randomBidId = `bid-sim-${Date.now()}`;
    const competitiveAmount = Math.max(50, Math.round(proj.budget * (0.85 + Math.random() * 0.2)));
    
    const mockMessages = [
      "I am highly specialized in this work. Can start tomorrow morning with professional equipment!",
      "I have full general liability insurance on file. Ready to complete the project efficiently.",
      "Placed a competitive estimate based on the specifications. Message me if you have any questions!",
      "My team can handle this garden refurbishment in under 4 hours. Fully licensed and certified."
    ];
    const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];

    const simBid: Bid = {
      id: randomBidId,
      projectId,
      contractorId: randomContractor.id,
      contractorName: randomContractor.fullName,
      contractorCompany: randomContractor.company || "Specialist Trades LLC",
      amount: competitiveAmount,
      message: randomMessage,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setBids((prev) => {
      const next = [...prev, simBid];
      realtimeSync.publishUpdate("bids", simBid, "upsert", `Simulated bid $${competitiveAmount} placed in ${proj.city}`);
      return next;
    });

    setProjects((prev) => {
      const next = prev.map((p) =>
        p.id === projectId ? { ...p, status: "bid_placed" as const } : p
      );
      realtimeSync.publishUpdate("projects", next, "batch", `Project ${projectId} updated with new bid`);
      return next;
    });

    triggerNotificationForProject(proj, competitiveAmount, randomContractor.fullName);
  };

  // --- Select Bidder (Customer accepts Contractor's offer) ---
  const handleAcceptBid = (projectId: string, bidId: string) => {
    const selectedBid = bids.find((b) => b.id === bidId);
    if (!selectedBid) return;

    const updatedBids = bids.map((b) =>
      b.projectId === projectId
        ? { ...b, status: b.id === bidId ? ("accepted" as const) : ("declined" as const) }
        : b
    );
    setBids(updatedBids);
    realtimeSync.publishUpdate("bids", updatedBids, "batch", `Bid ${bidId} accepted by customer`);

    const updatedProjects = projects.map((proj) =>
      proj.id === projectId
        ? {
            ...proj,
            status: "accepted" as const,
            acceptedContractorId: selectedBid.contractorId,
            budget: selectedBid.amount, // adjust budget to the accepted bid price
          }
        : proj
    );
    setProjects(updatedProjects);
    realtimeSync.publishUpdate("projects", updatedProjects, "batch", `Contractor ${selectedBid.contractorName} hired for project`);

    // Dynamic Email dispatch log for Contractor
    const targetProject = projects.find((p) => p.id === projectId);
    const contractorObj = contractors.find((c) => c.id === selectedBid.contractorId);

    if (contractorObj && targetProject) {
      setEmailLogs((prev) => [
        {
          id: `email-accept-${Math.random().toString(36).substring(2, 9)}`,
          recipientEmail: contractorObj.email,
          recipientName: contractorObj.fullName,
          subject: `🎉 BID ACCEPTED! You were hired for "${targetProject.title}"!`,
          body: `Hi ${contractorObj.fullName},\n\nGreat news! ${targetProject.customerFirstName} has accepted your bid of $${selectedBid.amount.toLocaleString()} for the project "${targetProject.title}".\n\n🎯 JOB DETAILS:\nLocation: ${targetProject.city}, ${targetProject.state} (${targetProject.zipCode})\nAgreed Price: $${selectedBid.amount.toLocaleString()}\n\nLog in to your Hot Spot Work Shop dashboard now to unlock contact credentials and coordinate start dates!\n\nBest regards,\nHot Spot Workspace SMTP Relays`,
          timestamp: new Date().toISOString(),
          category: "bid_negotiation",
          senderName: "Hot Spot Bids Engine",
          senderEmail: "bids@hotspotworkshop.com",
          status: "dispatched"
        },
        ...prev,
      ]);
    }

    if (!persistenceCheck.isOnline()) {
      persistenceCheck.queueUpdate(
        "accept_bid",
        `Hired Contractor: ${selectedBid.contractorName}`,
        { projectId, bidId, contractorId: selectedBid.contractorId, amount: selectedBid.amount },
        `Project: ${targetProject?.title || projectId} • Agreed: $${selectedBid.amount.toLocaleString()}`
      );
    }

    alert("Contractor selected! The project status is now set to Active. SMTP email alert logged for contractor.");
  };

  // --- Customer sends a Counter-Offer to Contractor ---
  const handleCounterBid = (bidId: string, amount: number, message: string) => {
    if (!currentUser || currentUser.role !== "customer") {
      alert("Only project owners can send counter-offers.");
      return;
    }

    const targetBid = bids.find((b) => b.id === bidId);
    if (!targetBid) return;

    const previousStep = {
      id: `step-${Date.now()}-prev`,
      senderRole: "contractor" as const,
      amount: targetBid.amount,
      message: targetBid.message,
      createdAt: targetBid.createdAt,
    };

    const newStep = {
      id: `step-${Date.now()}`,
      senderRole: "customer" as const,
      amount,
      message,
      createdAt: new Date().toISOString(),
    };

    setBids((prev) =>
      prev.map((b) => {
        if (b.id === bidId) {
          const currentHistory = b.history || [previousStep];
          return {
            ...b,
            amount,
            message,
            status: "counter_by_customer" as const,
            history: [...currentHistory, newStep],
          };
        }
        return b;
      })
    );

    if (!persistenceCheck.isOnline()) {
      persistenceCheck.queueUpdate(
        "counter_bid",
        `Counter-Offer Sent: $${amount.toLocaleString()}`,
        { bidId, amount, message, projectId: targetBid.projectId },
        `Customer counter proposal: $${amount.toLocaleString()}`
      );
    }

    // Dynamic Email simulator log for Contractor
    const targetProject = projects.find((p) => p.id === targetBid.projectId);
    const contractorObj = contractors.find((c) => c.id === targetBid.contractorId);

    if (contractorObj && targetProject) {
      setEmailLogs((prev) => [
        {
          id: `email-${Math.random().toString(36).substr(2, 9)}`,
          recipientEmail: contractorObj.email,
          recipientName: contractorObj.fullName,
          subject: `[NEGOTIATION] Counter-offer received from ${currentUser.fullName}!`,
          body: `Hi ${contractorObj.fullName},\n\n${currentUser.fullName} has responded with a counter-offer for your bid on the project "${targetProject.title}".\n\n💰 Proposing New Price: $${amount.toLocaleString()}\n💬 Message: "${message}"\n\nYou can accept this price, counter again, or decline the negotiation inside the app dashboard.\n\nBest regards,\nHot Spot Workspace SMTP Relays`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    alert(`Counter-offer of $${amount} sent to Contractor! SMTP notification log triggered.`);
  };

  // --- Contractor accepts Customer's Counter-Offer ---
  const handleContractorAcceptCounter = (bidId: string) => {
    if (!currentUser || currentUser.role !== "contractor") {
      alert("Only contractor bidders can accept counters.");
      return;
    }

    const targetBid = bids.find((b) => b.id === bidId);
    if (!targetBid) return;

    // Set bid status to accepted
    setBids((prev) =>
      prev.map((b) => {
        if (b.id === bidId) {
          return { ...b, status: "accepted" as const };
        }
        if (b.projectId === targetBid.projectId && b.id !== bidId) {
          return { ...b, status: "declined" as const };
        }
        return b;
      })
    );

    // Update parent project
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === targetBid.projectId
          ? {
              ...proj,
              status: "accepted" as const,
              acceptedContractorId: currentUser.id,
              budget: targetBid.amount, // adjust budget to the negotiated price
            }
          : proj
      )
    );

    // Find project owner to notify via email log
    const targetProject = projects.find((p) => p.id === targetBid.projectId);
    if (targetProject) {
      setEmailLogs((prev) => [
        {
          id: `email-${Math.random().toString(36).substr(2, 9)}`,
          recipientEmail: targetProject.customerEmail,
          recipientName: targetProject.customerFirstName,
          subject: `[AGREEMENT] Contractor ${currentUser.fullName} accepted your counter-offer!`,
          body: `Hi ${targetProject.customerFirstName},\n\nAccredited contractor ${currentUser.fullName} has accepted your counter-offer of $${targetBid.amount.toLocaleString()} for "${targetProject.title}"!\n\nThe project is now active! Please head over to your dashboard to complete final escrow agreement authorizations.\n\nBest regards,\nHot Spot Workspace SMTP Relays`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    alert("You accepted the customer's counter-offer! The project is now active. Coordinate details on your dashboard.");
  };

  // --- Contractor declines Customer's Counter-Offer ---
  const handleContractorDeclineCounter = (bidId: string) => {
    if (!currentUser || currentUser.role !== "contractor") {
      alert("Only contractor bidders can decline counters.");
      return;
    }

    const targetBid = bids.find((b) => b.id === bidId);
    if (!targetBid) return;

    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: "declined" as const } : b))
    );

    const targetProject = projects.find((p) => p.id === targetBid.projectId);
    if (targetProject) {
      setEmailLogs((prev) => [
        {
          id: `email-${Math.random().toString(36).substr(2, 9)}`,
          recipientEmail: targetProject.customerEmail,
          recipientName: targetProject.customerFirstName,
          subject: `[NEGOTIATION] Contractor declined your counter-offer`,
          body: `Hi ${targetProject.customerFirstName},\n\nContractor ${currentUser.fullName} has declined your counter-offer for "${targetProject.title}".\n\nYou can chat with them directly or review other active bids in the forum.\n\nBest regards,\nHot Spot Workspace SMTP Relays`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    alert("Counter-offer declined.");
  };

  // --- Contractor sends Counter-Offer BACK to Customer ---
  const handleContractorCounter = (bidId: string, amount: number, message: string) => {
    if (!currentUser || currentUser.role !== "contractor") {
      alert("Only contractor bidders can submit counter-offers.");
      return;
    }

    const targetBid = bids.find((b) => b.id === bidId);
    if (!targetBid) return;

    const newStep = {
      id: `step-${Date.now()}`,
      senderRole: "contractor" as const,
      amount,
      message,
      createdAt: new Date().toISOString(),
    };

    setBids((prev) =>
      prev.map((b) => {
        if (b.id === bidId) {
          const currentHistory = b.history || [];
          return {
            ...b,
            amount,
            message,
            status: "counter_by_contractor" as const,
            history: [...currentHistory, newStep],
          };
        }
        return b;
      })
    );

    const targetProject = projects.find((p) => p.id === targetBid.projectId);
    if (targetProject) {
      setEmailLogs((prev) => [
        {
          id: `email-${Math.random().toString(36).substr(2, 9)}`,
          recipientEmail: targetProject.customerEmail,
          recipientName: targetProject.customerFirstName,
          subject: `[NEGOTIATION] New counter-offer from contractor ${currentUser.fullName}`,
          body: `Hi ${targetProject.customerFirstName},\n\nContractor ${currentUser.fullName} has submitted a counter-offer back to you for "${targetProject.title}".\n\n💰 New Price Proposed: $${amount.toLocaleString()}\n💬 Pitch: "${message}"\n\nPlease check your dashboard to review negotiation details.\n\nBest regards,\nHot Spot Workspace SMTP Relays`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    alert(`Counter-offer of $${amount} sent to Customer! SMTP email bulletin logged.`);
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

            if (!persistenceCheck.isOnline()) {
              persistenceCheck.queueUpdate(
                "agree_project",
                `Signed Project Contract: ${proj.title}`,
                { projectId, agreedByCustomer: updatedCustomerAgreed, agreedByContractor: updatedContractorAgreed },
                `Escrow: $${proj.budget.toLocaleString()} • Status: Active`
              );
            }
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
      // Record 3% automated platform escrow commission into monetization ledger
      const contractor = contractors.find(c => c.id === targetProject.acceptedContractorId);
      const contractorName = contractor?.company || contractor?.fullName || "Verified Contractor";
      monetizationService.recordEscrowCommission(targetProject, contractorName, 3);

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

    if (!persistenceCheck.isOnline()) {
      persistenceCheck.queueUpdate(
        "complete_project",
        `Completed Project: ${targetProject?.title || projectId}`,
        { projectId },
        `Funds released: $${targetProject ? targetProject.budget.toLocaleString() : "0"}`
      );
    }

    alert("Wonderful! Job declared complete. The contractor score statistics have been elevated and Stripe escrow reserves have been cleared to your Available Balance!");
  };

  const handleUpdateProjectImages = (projectId: string, images: string[]) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === projectId ? { ...proj, images } : proj))
    );

    if (!persistenceCheck.isOnline()) {
      persistenceCheck.queueUpdate(
        "project_image_update",
        `Updated Project Photos`,
        { projectId, imagesCount: images.length },
        `Project: ${projectId} (${images.length} photos)`
      );
    }
  };

  const handleUpdateProjectCompletionDate = (
    projectId: string,
    targetCompletionDate: string,
    estimatedDaysToComplete: number,
    complexityLevel: "Low" | "Medium" | "High" | "Major Renovation"
  ) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              targetCompletionDate,
              estimatedDaysToComplete,
              complexityLevel,
            }
          : proj
      )
    );
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

    if (!persistenceCheck.isOnline()) {
      persistenceCheck.queueUpdate(
        "review_submission",
        `New Review for Contractor (${rating}★)`,
        freshReview,
        `Rating: ${rating}★ • Contractor: ${contractorId}`
      );
    }

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

  // --- Update Contractor Portfolio & Before/After Showcase ---
  const handleUpdateContractorPortfolio = (contractorId: string, beforeAfterPairs: BeforeAfterPair[], portfolioPhotos: string[]) => {
    setContractors((prev) => {
      const next = prev.map((c) =>
        c.id === contractorId
          ? {
              ...c,
              beforeAfterPairs,
              portfolioPhotos,
              completedProjectsCount: Math.max(c.completedProjectsCount || 0, beforeAfterPairs.length),
            }
          : c
      );
      try {
        localStorage.setItem("hsws_contractors", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save contractors portfolio", e);
      }
      realtimeSync.publishUpdate("contractors", next, "batch", `Contractor ${contractorId} updated verified portfolio`);
      return next;
    });

    if (currentUser && currentUser.id === contractorId) {
      setCurrentUser((prev: any) => {
        const updated = {
          ...prev,
          beforeAfterPairs,
          portfolioPhotos,
          completedProjectsCount: Math.max(prev.completedProjectsCount || 0, beforeAfterPairs.length),
        };
        try {
          localStorage.setItem("hsws_currentUser", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    if (!persistenceCheck.isOnline()) {
      persistenceCheck.queueUpdate(
        "contractor_portfolio_update",
        `Updated Showcase Portfolio`,
        { contractorId, pairsCount: beforeAfterPairs.length, photosCount: portfolioPhotos.length },
        `Verified Before/After Cases: ${beforeAfterPairs.length} • Photos: ${portfolioPhotos.length}`
      );
    }
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

    setPrivateMessages((prev) => {
      const next = [...prev, newMessage];
      realtimeSync.publishUpdate("chatMessages", newMessage, "upsert", `Chat message from ${currentUser.fullName}`);
      return next;
    });

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

  // --- Fast Lookup Indexes for Performance & Zero-Lag Filtering ---
  const cityMap = useMemo(() => {
    const map = new Map<string, CityData>();
    for (const c of allCities) {
      map.set(c.name.toLowerCase(), c);
    }
    return map;
  }, [allCities]);

  // Indexed Bids Map for instant O(1) project bid lookups & stable array references
  const bidsByProjectId = useMemo(() => {
    const map = new Map<string, Bid[]>();
    for (const b of bids) {
      const list = map.get(b.projectId);
      if (list) {
        list.push(b);
      } else {
        map.set(b.projectId, [b]);
      }
    }
    return map;
  }, [bids]);

  // Distance cache to avoid recalculating trigonometry across all projects repeatedly
  const projectDistanceMap = useMemo(() => {
    const map = new Map<string, number>();
    const defaultCity = allCities[0] || { lat: 30.2672, lng: -97.7431 };
    for (const project of projects) {
      const pCity = cityMap.get(project.city.toLowerCase()) || defaultCity;
      const dist = getDistance(activeCityData.lat, activeCityData.lng, pCity.lat, pCity.lng);
      map.set(project.id, dist);
    }
    return map;
  }, [projects, cityMap, activeCityData, allCities]);

  // --- Filter Logic calculations ---
  // The forum can be seen by any user who is in the city and 70 mile radius.
  const filteredProjects = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const tradeLower = selectedTradeFilter.toLowerCase();

    const filtered = projects.filter((project) => {
      // 1. Distance check from cached map
      const distanceMiles = projectDistanceMap.get(project.id) ?? 999;
      if (distanceMiles > radiusLimit) return false;

      // 2. Search query matches title/description/city
      if (searchLower) {
        const matchesSearch =
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.city.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // 3. Trade Category Filter
      if (tradeLower) {
        const matchesTrade =
          project.title.toLowerCase().includes(tradeLower) ||
          project.description.toLowerCase().includes(tradeLower);
        if (!matchesTrade) return false;
      }

      // 4. Quick Filter Modes for ultra-fast browsing & engagement
      const projectBids = bidsByProjectId.get(project.id) || EMPTY_BIDS;
      if (quickFilterMode === "zero_bids") {
        return projectBids.length === 0 && (project.status === "open" || project.status === "bid_placed");
      } else if (quickFilterMode === "urgent") {
        return Boolean(project.isEmergency || project.isBoosted);
      } else if (quickFilterMode === "high_budget") {
        return (project.budget || 0) >= 1000;
      } else if (quickFilterMode === "bidding") {
        return projectBids.length > 0 && (project.status === "bid_placed" || project.status === "open");
      } else if (quickFilterMode === "escrow_ready") {
        return project.status === "accepted" || Boolean(project.agreedByCustomer);
      }

      return true;
    });

    // Sort order
    return filtered.sort((a, b) => {
      if (sortBy === "least_bids") {
        const aBids = (bidsByProjectId.get(a.id) || EMPTY_BIDS).length;
        const bBids = (bidsByProjectId.get(b.id) || EMPTY_BIDS).length;
        if (aBids !== bBids) return aBids - bBids;
        return (b.budget || 0) - (a.budget || 0);
      }
      if (sortBy === "highest_budget") {
        return (b.budget || 0) - (a.budget || 0);
      }
      if (sortBy === "closest") {
        const aDist = projectDistanceMap.get(a.id) ?? 0;
        const bDist = projectDistanceMap.get(b.id) ?? 0;
        return aDist - bDist;
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [projects, bidsByProjectId, projectDistanceMap, radiusLimit, searchTerm, selectedTradeFilter, quickFilterMode, sortBy]);

  // Filter Contractors
  const filteredContractors = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const uniqueContractors = Array.from(
      new Map<string, ContractorUser>(contractors.map((c) => [c.id, c])).values()
    );
    return uniqueContractors
      .filter((con) => {
        const matchesSearch = !searchLower || con.fullName.toLowerCase().includes(searchLower);
        const matchesTrade = selectedTradeFilter === "" || con.trades.includes(selectedTradeFilter);
        const matchesAvailable = !availableOnlyFilter || con.availableNow;
        return matchesSearch && matchesTrade && matchesAvailable;
      })
      .sort((a, b) => {
        const aVal = a.availableNow ? 1 : 0;
        const bVal = b.availableNow ? 1 : 0;
        return bVal - aVal;
      });
  }, [contractors, searchTerm, selectedTradeFilter, availableOnlyFilter]);

  return (
    <div className={`min-h-screen bg-zinc-50 flex flex-col font-sans select-none ${seniorMode ? "senior-mode" : ""}`} id="applet-main-container">
      
      {/* Real-Time Live Synchronizer Bar */}
      <RealtimeSyncBar
        currentCityName={activeCityData.name}
        onPostProjectClick={() => setShowProjectModal(true)}
        onPlaceBidSimulation={() => {
          if (projects.length > 0) {
            handleSimulateContractorBid(projects[0].id);
          }
        }}
      />

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
        onOpenAppStoreModal={() => setShowAppStoreModal(true)}
      />

      {/* Universal 1-Click Web Access & Mobile Ready Banner */}
      {!dismissedAppStoreBanner && (
        <div 
          className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white border-b border-zinc-800 px-4 py-2.5 shadow-sm"
          id="universal-access-smart-banner"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 p-1">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-white text-xs">⚡ Universal 1-Click Access Active</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black px-1.5 py-0.2 rounded font-mono">
                    Works on All Devices (No Download Needed)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 hidden sm:block">
                  Instantly access all verified trade directories, damage scanners, and escrow bids in your browser.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAppStoreModal(true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold px-3 py-1 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                id="banner-mobile-options-btn"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Mobile & App Info</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDismissedAppStoreBanner(true);
                  try {
                    SafeStorage.setItem("hsws_dismiss_universal_banner", "true");
                  } catch {}
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition text-xs font-bold cursor-pointer"
                title="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Marketplace Activity Ticker with Real-Time FOMO & Social Proof */}
      <LiveMarketplaceTicker
        projects={projects}
        bids={bids}
        contractors={contractors}
        onSelectProject={(projectId) => {
          setActiveTab("projects");
          setTimeout(() => {
            const el = document.getElementById(`project-card-${projectId}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.classList.add("ring-4", "ring-amber-500", "duration-500");
              setTimeout(() => el.classList.remove("ring-4", "ring-amber-500"), 3000);
            }
          }, 300);
        }}
        onOpenMonetization={() => {
          if (currentUser?.role === "contractor") {
            setShowContractorProModal(true);
          } else {
            setActiveTab("monetize");
          }
        }}
      />

      {/* Quick Interactive Role Switcher for seamless sandbox trials - RESTRICTED TO OWNER DASHBOARD TAB ONLY */}
      {activeTab === "owner_suite" && (
        <div className="bg-[#0c2340] border-b border-blue-900 py-2.5 px-4 text-xs font-semibold text-white flex flex-wrap gap-x-4 gap-y-2 items-center justify-between shadow-md">
          <span className="flex items-center gap-1.5 shrink-0 text-white font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-white">Owner Role Sandbox Controls:</span>
          </span>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => {
                const custMock = INITIAL_CUSTOMERS[0];
                setCurrentUser(custMock);
                alert("Switched role context details to John Doe (Homeowner). Free to post projects and accept bids!");
              }}
              className="bg-blue-800 hover:bg-blue-700 border border-blue-600 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs cursor-pointer"
            >
              Switch to Customer: John D.
            </button>
            <button
              onClick={() => {
                const conMock = INITIAL_CONTRACTORS.find(c => c.id === "contractor-1") || INITIAL_CONTRACTORS[1];
                setCurrentUser(conMock);
                alert("Switched role context details to Michael Smith (Contractor). Free to bid and accept jobs!");
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs cursor-pointer"
            >
              Switch to Contractor: Mike S.
            </button>
            <button
              onClick={() => {
                setCurrentUser(OWNER_USER);
                setActiveTab("owner_suite");
                alert("👑 Switched context to Platform Founder & Owner. Full executive owner controls, system revenue ledger, and admin suite unlocked!");
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer border border-amber-400"
            >
              <Crown className="w-3.5 h-3.5 text-white inline" />
              <span className="text-white">Switch to Platform Owner (Owner Suite)</span>
            </button>
            <button
              onClick={handleResetData}
              title="Wipes custom changes and starts over"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] transition shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-white" /> <span className="text-white">Reset Seeds</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Forum View Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-32 sm:pb-16 space-y-5 sm:space-y-8">
        
        {/* Banner Section */}
        <section className="bg-gradient-to-br from-[#0c2340] via-[#1d2a44] to-[#0a192f] text-white p-8 rounded-3xl shadow-md text-center md:text-left relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border border-zinc-800">
          <div className="absolute right-0 bottom-0 top-0 left-0 bg-[radial-gradient(circle_at_70%_20%,rgba(225,29,72,0.1)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="space-y-3 relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 text-white text-[11px] sm:text-xs uppercase font-black tracking-wider rounded-full border border-red-400 shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              <span>🇺🇸 USA Tradesmen Network & Hotspot</span>
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white">
              Connect Home & Business Owners with Specialized Trades
            </h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              Post projects of any dimensions—from spreading black mulch, window glazing, gutter guards installation to TV mounting. Set your target price and query matching experts.
            </p>
          </div>

          <div className="shrink-0 relative z-10 flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              onClick={() => setShowQuoteCalculatorModal(true)}
              className="px-4 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs rounded-2xl transition shadow-lg flex items-center justify-center gap-2 border border-amber-300 cursor-pointer"
              id="open-quote-calculator-btn"
            >
              <Calculator className="w-4 h-4 text-slate-950" />
              <span>AI Price Estimator</span>
            </button>

            <button
              onClick={() => {
                setJobsLayoutMode("calendar");
                document.getElementById("project-calendar-view-container")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-display font-black text-xs rounded-2xl transition shadow-lg flex items-center justify-center gap-2 border border-purple-400 cursor-pointer"
              id="open-calendar-hero-btn"
              title="Open Project Completion Calendar with AI Estimates"
            >
              <CalendarIcon className="w-4 h-4 text-purple-200" />
              <span>AI Project Calendar</span>
            </button>

            <button
              onClick={() => {
                setSelectedMapProjectId(null);
                setShowMapsDirectory(true);
              }}
              className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-display font-black text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2 border border-blue-400 cursor-pointer"
              id="open-maps-directory-hero-btn"
              title="Open Google Maps Directory - View interactive project markers with dynamic hover tooltips showing titles & budgets"
            >
              <Compass className="w-5 h-5 text-amber-300 animate-pulse" /> <span className="text-white">View Google Maps Directory</span>
            </button>

            <button
              onClick={() => setShowAppStoreModal(true)}
              className="px-4 py-3.5 bg-zinc-950 hover:bg-zinc-900 text-white font-display font-black text-xs rounded-2xl transition shadow-lg flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
              id="hero-appstore-btn"
              title="Download on Apple App Store & iOS"
            >
              <Apple className="w-4 h-4 text-white" />
              <span>iOS App Store</span>
            </button>

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
              className="px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white font-display font-black text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              id="platform-main-action-btn"
            >
              <Plus className="w-5 h-5 text-white" /> <span className="text-white">Post New Project Vacancy</span>
            </button>
          </div>
        </section>

        {/* Global Location & Radius Controller Bar (for Marketplace & Contractor directory) */}
        {(activeTab === "projects" || activeTab === "contractors") && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Base Viewer City Location Selector */}
            <div className="space-y-1.5" id="viewer-active-city-container">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> Active Base Center
                </label>
                <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-full" title="Platform preferred operating region: Central Time Zone">
                  ⭐ Preferred: Central Zone (CT)
                </span>
              </div>
              <select
                value={currentCityName}
                onChange={(e) => {
                  setCurrentCityName(e.target.value);
                  alert(`Viewer location center adjusted to ${e.target.value}. Computing distances for nearby listings...`);
                }}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                {allCities.map((c) => {
                  const isCentral = ["TX", "IL", "MO", "MN", "TN", "OK", "KS", "WI"].includes(c.state);
                  return (
                    <option key={`${c.zipCode}-${c.name}`} value={c.name}>
                      📍 {c.name}, {c.state} ({c.zipCode}) {isCentral ? "— Central Time (CT)" : ""}
                    </option>
                  );
                })}
              </select>

              {/* Custom blank search bar for any city & state input */}
              <div className="flex gap-1.5 mt-2 pt-2 border-t border-zinc-150">
                <input
                  type="text"
                  placeholder="Enter city, state (e.g., Dallas, TX)..."
                  value={citySearchInput}
                  onChange={(e) => setCitySearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCustomCitySubmit();
                    }
                  }}
                  className="flex-1 bg-zinc-50 border border-zinc-200 hover:border-zinc-350 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden text-zinc-800"
                  id="custom-city-blank-search-bar"
                />
                <button
                  type="button"
                  onClick={handleCustomCitySubmit}
                  className="bg-zinc-950 hover:bg-zinc-850 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
                >
                  Go
                </button>
              </div>
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
                  placeholder={activeTab === "contractors" ? "Search contractors by keyword..." : "Search matching lawn, gutters, TVs, glazing..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-amber-550 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

          </div>
        )}

        {/* Tab content router */}
        <section className="space-y-6">
          {activeTab === "spiral_game" && <SpiralFrenzyGame />}

          {activeTab === "projects" && (
            <div className="space-y-5">

              {/* Fast 15-Second Job Template Launcher */}
              <QuickJobPostTemplateBar
                onSelectTemplate={(template) => {
                  setInitialProjectFormData({
                    title: template.title,
                    description: template.description,
                    budget: template.budget,
                  });
                  if (!currentUser) {
                    setShowAuthModal(true);
                  } else {
                    setShowProjectModal(true);
                  }
                }}
                onOpenCustomPost={() => {
                  if (!currentUser) {
                    setShowAuthModal(true);
                  } else {
                    setShowProjectModal(true);
                  }
                }}
                onOpenRushDispatch={() => {
                  setMonetizationModalState({
                    isOpen: true,
                    kind: "rush_dispatch",
                    targetProject: null,
                  });
                }}
              />

              {/* Focus Section Switcher to De-congest Home Screen */}
              <HomeFocusSectionSelector
                currentMode={homeFocusMode}
                onChangeMode={setHomeFocusMode}
                filteredJobsCount={filteredProjects.length}
                activeCityName={currentCityName}
                onOpenQuickQuote={() => setShowQuoteCalculatorModal(true)}
                onOpenEmergencyModal={() => setShowEmergencyDispatchModal(true)}
                onOpenContractorProModal={() => {
                  setMonetizationModalState({
                    isOpen: true,
                    kind: "contractor_pro",
                    targetProject: null,
                  });
                }}
              />

              {/* FOCUS MODE: TOOLS & UTILITIES */}
              {(homeFocusMode === "tools" || homeFocusMode === "all") && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Pro Trade Tools & Emergency Dispatch Quick Command Strip */}
                  <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3" id="pro-trade-command-strip">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                        <h3 className="font-display font-black text-xs sm:text-sm text-zinc-900 uppercase tracking-wider">
                          Hot Spot Pro Tradesmen & Homeowner Toolkit
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                        5 Built-In Contractor & Client Utilities
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {/* Tool 1: 24/7 Emergency Dispatch */}
                      <button
                        type="button"
                        onClick={() => setShowEmergencyDispatchModal(true)}
                        className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-left transition shadow-3xs cursor-pointer group flex flex-col justify-between"
                        id="command-strip-emergency-dispatch-btn"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">🚨</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-200/60 px-1.5 py-0.5 rounded-md">
                            24/7 Active
                          </span>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-display font-black text-xs text-rose-950 group-hover:text-rose-700 transition">
                            Emergency Dispatch
                          </h4>
                          <p className="text-[10px] text-rose-700/80 leading-tight mt-0.5 font-medium">
                            Burst pipes, roof leaks & power outages
                          </p>
                        </div>
                      </button>

                      {/* Tool 2: Before & After Showcase */}
                      <button
                        type="button"
                        onClick={() => setShowGlobalBeforeAfterModal(true)}
                        className="p-3 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 hover:border-cyan-300 text-left transition shadow-3xs cursor-pointer group flex flex-col justify-between"
                        id="command-strip-before-after-btn"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">📸</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-200/60 px-1.5 py-0.5 rounded-md">
                            Interactive
                          </span>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-display font-black text-xs text-cyan-950 group-hover:text-cyan-700 transition">
                            Before & After Gallery
                          </h4>
                          <p className="text-[10px] text-cyan-800/80 leading-tight mt-0.5 font-medium">
                            Compare verified transformations with sliders
                          </p>
                        </div>
                      </button>

                      {/* Tool 3: Invoicing & Estimates */}
                      <button
                        type="button"
                        onClick={() => setShowGlobalInvoiceModal(true)}
                        className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 text-left transition shadow-3xs cursor-pointer group flex flex-col justify-between"
                        id="command-strip-invoice-generator-btn"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">📋</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded-md">
                            PDF Ready
                          </span>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-display font-black text-xs text-amber-950 group-hover:text-amber-700 transition">
                            Invoice & Estimate PDF
                          </h4>
                          <p className="text-[10px] text-amber-800/80 leading-tight mt-0.5 font-medium">
                            Branded itemized bids with digital sign-off
                          </p>
                        </div>
                      </button>

                      {/* Tool 4: Material & Permit Calculator */}
                      <button
                        type="button"
                        onClick={() => setShowGlobalPermitModal(true)}
                        className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 text-left transition shadow-3xs cursor-pointer group flex flex-col justify-between"
                        id="command-strip-material-permit-btn"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">🧮</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-1.5 py-0.5 rounded-md">
                            City Guide
                          </span>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-display font-black text-xs text-emerald-950 group-hover:text-emerald-700 transition">
                            Material & Permits
                          </h4>
                          <p className="text-[10px] text-emerald-800/80 leading-tight mt-0.5 font-medium">
                            Municipal codes & wholesale cost calculator
                          </p>
                        </div>
                      </button>

                      {/* Tool 5: Subcontractor Crew Board */}
                      <button
                        type="button"
                        onClick={() => setShowGlobalCrewBoardModal(true)}
                        className="p-3 rounded-2xl bg-slate-900 hover:bg-zinc-800 border border-zinc-700 text-white text-left transition shadow-3xs cursor-pointer group flex flex-col justify-between"
                        id="command-strip-crew-board-btn"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">👷</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-1.5 py-0.5 rounded-md">
                            B2B Trades
                          </span>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-display font-black text-xs text-white group-hover:text-amber-400 transition">
                            Sub Crew Board
                          </h4>
                          <p className="text-[10px] text-zinc-300 leading-tight mt-0.5 font-medium">
                            Hire specialized crews & trade day-labor
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Instant Home Repair Cost Estimator Widget */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600" /> Fast Quote & 1-Click Estimator Engine
                      </span>
                    </div>
                    <InstantRepairPricingWidget
                      onAutoCreateJob={(preset) => {
                        setInitialProjectFormData(preset);
                        if (!currentUser) {
                          setShowAuthModal(true);
                        } else {
                          setShowProjectModal(true);
                        }
                      }}
                      onOpenAppStoreModal={() => setShowAppStoreModal(true)}
                    />
                  </div>
                </div>
              )}

              {/* FOCUS MODE: TRENDS & DEMAND (ACTIVE TRADES INSIGHTS) */}
              {(homeFocusMode === "trends" || homeFocusMode === "all") && (
                <div className="animate-in fade-in duration-200">
                  <ActiveTradesInsights
                    projects={projects}
                    bids={bids}
                    contractors={contractors}
                    activeCityName={currentCityName}
                    activeCityData={activeCityData}
                    radiusLimit={radiusLimit}
                    currentUser={currentUser}
                    onSelectTradeFilter={(trade) => {
                      setSelectedTradeFilter(trade);
                      setHomeFocusMode("feed");
                      const radarEl = document.getElementById("bid-opportunity-radar-root");
                      if (radarEl) {
                        radarEl.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    onPostProjectInTrade={(trade) => {
                      setInitialProjectFormData({
                        title: `${trade} Needed`,
                        description: `Looking for experienced, licensed ${trade} specialist in ${currentCityName}. Please review job requirements and submit itemized bid proposal.`,
                        budget: 450,
                      });
                      if (!currentUser) {
                        setShowAuthModal(true);
                      } else {
                        setShowProjectModal(true);
                      }
                    }}
                    onOpenContractorProModal={() => {
                      setMonetizationModalState({
                        isOpen: true,
                        kind: "contractor_pro",
                        targetProject: null,
                      });
                    }}
                  />
                </div>
              )}

              {/* FOCUS MODE: PRO EARNINGS & MONETIZATION ACCELERATOR */}
              {(homeFocusMode === "pro_earnings" || homeFocusMode === "all") && (
                <div className="space-y-4 bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-5 text-white shadow-xl animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-amber-500 text-slate-950">
                          <Crown className="w-4 h-4" />
                        </span>
                        <h3 className="font-display font-black text-base text-white">
                          Contractor & Homeowner Revenue Accelerator
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        High-speed lead monetization, 0% commission unlocks, and urgent repair broadcasts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("monetize")}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
                    >
                      Open Full Earnings Suite →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Card 1: Contractor Pro */}
                    <div className="bg-zinc-800/80 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                            PRO TIER
                          </span>
                          <span className="text-base font-black font-mono text-amber-400">$29/mo</span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-white mt-2">
                          Contractor Pro Tier
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-tight mt-1">
                          15-min early notifications, verified gold badge & #1 city ranking.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMonetizationModalState({
                            isOpen: true,
                            kind: "contractor_pro",
                            targetProject: null,
                          });
                        }}
                        className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-xs"
                      >
                        Activate Pro Pass
                      </button>
                    </div>

                    {/* Card 2: Direct Lead Unlock */}
                    <div className="bg-zinc-800/80 border border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500 text-white">
                            INSTANT CALL
                          </span>
                          <span className="text-base font-black font-mono text-blue-400">$15.00</span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-white mt-2">
                          Direct Lead Unlock
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-tight mt-1">
                          Reveal unmasked homeowner phone & email immediately to close fast.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMonetizationModalState({
                            isOpen: true,
                            kind: "lead_unlock",
                            targetProject: filteredProjects[0] || null,
                          });
                        }}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition cursor-pointer shadow-xs"
                      >
                        Unlock Direct Lead ($15)
                      </button>
                    </div>

                    {/* Card 3: 15-Min Rush Dispatch */}
                    <div className="bg-zinc-800/80 border border-rose-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white">
                            EMERGENCY
                          </span>
                          <span className="text-base font-black font-mono text-rose-400">$25.00</span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-white mt-2">
                          15-Min Rush Siren
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-tight mt-1">
                          SMS blast 20+ nearby licensed pros for guaranteed urgent repair response.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMonetizationModalState({
                            isOpen: true,
                            kind: "rush_dispatch",
                            targetProject: null,
                          });
                        }}
                        className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition cursor-pointer shadow-xs"
                      >
                        Launch Urgent Rush ($25)
                      </button>
                    </div>

                    {/* Card 4: Featured Project Boost */}
                    <div className="bg-zinc-800/80 border border-amber-400/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                            3X VIEWS
                          </span>
                          <span className="text-base font-black font-mono text-amber-300">$9.99</span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-white mt-2">
                          Featured 3x Boost
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-tight mt-1">
                          Pin job to #1 top position with gold border for maximum contractor bids.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMonetizationModalState({
                            isOpen: true,
                            kind: "project_boost",
                            targetProject: filteredProjects[0] || null,
                          });
                        }}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-xs"
                      >
                        Boost Top Listing ($9.99)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FOCUS MODE: LIVE FEED (PRIMARY JOBS FORUM) */}
              {(homeFocusMode === "feed" || homeFocusMode === "all") && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Contractor Pro Booster Bar (Monetization Driver) */}
                  <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 border border-amber-500/40 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3.5">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.2 rounded-full">
                            PRO CONTRACTOR NETWORK
                          </span>
                          <span className="text-xs font-black text-amber-300">
                            Get 15-Minute Early Job Alerts & #1 Verified Search Placement
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Pro Contractors win an average of $3,400+ more monthly projects with zero contact unlock fees.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      <button
                        onClick={() => {
                          setMonetizationModalState({
                            isOpen: true,
                            kind: "contractor_pro",
                            targetProject: null,
                          });
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        id="projects-top-pro-upgrade-btn"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Go Pro ($29/mo)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bid Opportunity Radar & Layout Switcher */}
                  <BidOpportunityRadar
                    projects={projects}
                    bids={bids}
                    filteredCount={filteredProjects.length}
                    quickFilterMode={quickFilterMode}
                    onChangeQuickFilter={setQuickFilterMode}
                    selectedTradeFilter={selectedTradeFilter}
                    onChangeTradeFilter={setSelectedTradeFilter}
                    sortBy={sortBy}
                    onChangeSortBy={setSortBy}
                    searchTerm={searchTerm}
                    onChangeSearchTerm={setSearchTerm}
                    layoutMode={jobsLayoutMode}
                    onChangeLayoutMode={setJobsLayoutMode}
                    availableTrades={TRADE_OPTIONS}
                  />

                  {/* View Router (Calendar / Table / Grid / Empty) */}
                  {jobsLayoutMode === "calendar" ? (
                    <ProjectCalendarView
                      projects={filteredProjects}
                      bids={bids}
                      currentUser={currentUser}
                      onSelectProject={(projectId) => {
                        setSelectedMapProjectId(projectId);
                      }}
                      onUpdateProjectCompletionDate={handleUpdateProjectCompletionDate}
                    />
                  ) : jobsLayoutMode === "table" ? (
                    <ProjectOpportunityTable
                      projects={filteredProjects}
                      bids={bids}
                      currentUser={currentUser}
                      currentCityName={currentCityName}
                      onPlaceBid={(projectId, amount, msg) => handlePlaceBid(projectId, amount, msg)}
                      onViewOnMap={(projectId) => {
                        setSelectedMapProjectId(projectId);
                        setShowMapsDirectory(true);
                      }}
                      onStartChat={handleStartChat}
                    />
                  ) : filteredProjects.length === 0 ? (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
                      <span className="text-4xl">🔎</span>
                      <h3 className="font-display font-bold text-zinc-900 text-lg">No job opportunities match this filter</h3>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        Try expanding your radius past {radiusLimit} miles, switching your trade category, or clearing active filters to see all available local jobs.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            setQuickFilterMode("all");
                            setSelectedTradeFilter("");
                            setSearchTerm("");
                            setRadiusLimit(120);
                          }}
                          className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl px-4 py-2.5 transition cursor-pointer"
                        >
                          Reset All Filters & Maximize Radius (120 mi)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={jobsLayoutMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                      {filteredProjects.map((project) => {
                        const dist = projectDistanceMap.get(project.id) ?? 0;
                        const projectBids = bidsByProjectId.get(project.id) || EMPTY_BIDS;

                        return (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            bids={projectBids}
                            currentUser={currentUser}
                            currentCityName={currentCityName}
                            distanceToProject={dist}
                            onPlaceBid={(amount, msg) => handlePlaceBid(project.id, amount, msg)}
                            onAgreeToProject={() => handleAgreeToProject(project.id)}
                            onAcceptBid={(bidId) => handleAcceptBid(project.id, bidId)}
                            onCompleteProject={() => handleCompleteProject(project.id)}
                            onStartChat={handleStartChat}
                            onCounterBid={handleCounterBid}
                            onContractorAcceptCounter={handleContractorAcceptCounter}
                            onContractorDeclineCounter={handleContractorDeclineCounter}
                            onContractorCounter={handleContractorCounter}
                            onViewOnMap={(projectId) => { setSelectedMapProjectId(projectId); setShowMapsDirectory(true); }}
                            onSimulateContractorBid={handleSimulateContractorBid}
                            onUpdateProjectImages={handleUpdateProjectImages}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* FOCUS MODE: MAP VIEW */}
              {homeFocusMode === "map" && (
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4 text-center animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Compass className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-zinc-900">
                      Interactive Central Map Directory
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                      Explore all active local vacancies and licensed contractor headquarters across {currentCityName} within {radiusLimit} miles.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMapProjectId(null);
                      setShowMapsDirectory(true);
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs rounded-2xl transition shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Compass className="w-4 h-4 text-amber-300" />
                    <span>Launch Fullscreen Google Maps Directory</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "contractors" && (
            <div className="space-y-6">
              {/* Pro Upgrade & Verified Contractor CTA */}
              <div className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-4 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">Are you a Licensed Trade Professional?</span>
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Pro Tier
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Join the Top 1% of Contractors. Receive instant SMS lead dispatch, #1 profile ranking, and verified gold badges.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowContractorProModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
                  id="contractors-tab-upgrade-pro-btn"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Boost Profile ($29/mo)</span>
                </button>
              </div>

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
                  {filteredContractors.map((con, idx) => (
                    <ContractorProfileCard
                      key={`${con.id}-${idx}`}
                      contractor={con}
                      currentUser={currentUser}
                      onAddReview={handleAddReview}
                      onToggleAvailability={handleToggleContractorAvailability}
                      onStartChat={handleStartChat}
                      onUpdatePortfolio={handleUpdateContractorPortfolio}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "rebates" && (
            <div className="space-y-6">
              <MaterialPartnerRebateHub
                currentUser={currentUser}
                currentCityName={currentCityName}
                onSelectMaterialOffer={(offer) => {
                  alert(`✨ Offer Activated: ${offer.title} at ${offer.merchant}! Direct discount & rebate application ready.`);
                }}
              />
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
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <h2 className="text-xl font-bold font-display text-zinc-900">
                        Welcome Back, {currentUser.fullName}!
                      </h2>
                      {(currentUser.sharedWithFriend || currentUser.id === "cust-1" || currentUser.id === "cont-1") && (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-3xs border border-amber-400/30" title="Top Connector Badge: Earned by referring friends and expanding our trade network!">
                          🌟 Top Connector
                        </span>
                      )}
                    </div>
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

                    {currentUser.role === "customer" && (
                      <div className="mt-5 pt-4 border-t border-zinc-150 flex items-center justify-between gap-4 flex-wrap bg-amber-50/20 p-4 rounded-xl border border-amber-100/75" id="customer-dashboard-notifications-banner">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                            🔔 Real-Time Push Alerts: 
                            {currentUser.pushNotificationsEnabled !== false ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-250">
                                Active & Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-zinc-100 text-zinc-500 font-medium px-2.5 py-0.5 rounded-full border border-zinc-250">
                                Muted / Disabled
                              </span>
                            )}
                          </span>
                          <p className="text-[10px] text-zinc-500">
                            Receive real-time floating push banners and high-fidelity chimes when contractors place new bids on your active workspace requests.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const isCurrentlyEnabled = currentUser.pushNotificationsEnabled !== false;
                            const updated = { ...currentUser, pushNotificationsEnabled: !isCurrentlyEnabled };
                            setCurrentUser(updated);
                            
                            if (!isCurrentlyEnabled && "Notification" in window) {
                              Notification.requestPermission().then((perm) => {
                                if (perm === "granted") {
                                  alert("🔔 Browser-level notifications enabled! You will now receive alerts.");
                                } else {
                                  alert("🔔 Notifications enabled! (In-app sliding push-banners will show, browser native is blocked.)");
                                }
                              });
                            } else {
                              alert(`Real-time push alerts turned ${!isCurrentlyEnabled ? "ON" : "OFF"}.`);
                            }
                          }}
                          className={`text-xs font-bold px-4 py-2 rounded-xl border transition shadow-xs cursor-pointer ${
                            currentUser.pushNotificationsEnabled !== false
                              ? "bg-zinc-100 text-zinc-750 hover:bg-zinc-200 border-zinc-300"
                              : "bg-amber-600 text-white hover:bg-amber-700 border-amber-600"
                          }`}
                        >
                          {currentUser.pushNotificationsEnabled !== false ? "Mute Push Alerts" : "Enable Push Alerts"}
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

                  {/* Top Connector Leaderboard Widget */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4" id="top-connector-leaderboard">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-150 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏆</span>
                        <div>
                          <h3 className="font-display font-bold text-sm text-zinc-900 uppercase tracking-wider">Top Connectors Leaderboard</h3>
                          <p className="text-[11px] text-zinc-500">Top 5 community members who referred the most friends to the platform</p>
                        </div>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-center">
                        🌟 Badge Reward Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {[
                        { rank: 1, name: "Marcus Vance", role: "Contractor", referrals: 18, isCurrentUser: false },
                        { rank: 2, name: "Elena Rostova", role: "Homeowner", referrals: 14, isCurrentUser: false },
                        { rank: 3, name: currentUser.fullName, role: currentUser.role === "customer" ? "Homeowner" : "Contractor", referrals: currentUser.sharedWithFriend ? 12 : 9, isCurrentUser: true },
                        { rank: 4, name: "Dave 'The Wrench' Miller", role: "Contractor", referrals: 8, isCurrentUser: false },
                        { rank: 5, name: "Sarah Jenkins", role: "Homeowner", referrals: 6, isCurrentUser: false },
                      ].sort((a, b) => b.referrals - a.referrals).map((user, idx) => (
                        <div key={user.name} className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition ${user.isCurrentUser ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/50" : "bg-zinc-50/50 border-zinc-200 hover:border-zinc-300"}`}>
                          <div className="flex items-start justify-between gap-1">
                            <span className={`text-xs font-black px-2 py-0.5 rounded-md ${idx === 0 ? "bg-amber-500 text-white shadow-3xs" : idx === 1 ? "bg-zinc-300 text-zinc-800" : idx === 2 ? "bg-amber-700/80 text-white" : "bg-zinc-200 text-zinc-700"}`}>
                              #{idx + 1}
                            </span>
                            <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-3xs" title="Top Connector Badge">
                              🌟 Top Connector
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900 truncate flex items-center gap-1">
                              {user.name}
                              {user.isCurrentUser && <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.5 rounded font-bold">YOU</span>}
                            </p>
                            <p className="text-[10px] text-zinc-500">{user.role}</p>
                          </div>
                          <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-bold text-zinc-700">
                            <span>Referrals:</span>
                            <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md font-mono">{user.referrals}</span>
                          </div>
                        </div>
                      ))}
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
                                bids={bidsByProjectId.get(project.id) || EMPTY_BIDS}
                                currentUser={currentUser}
                                onAgreeToProject={() => handleAgreeToProject(project.id)}
                                onAcceptBid={(bidId) => handleAcceptBid(project.id, bidId)}
                                onCompleteProject={() => handleCompleteProject(project.id)}
                                onStartChat={handleStartChat}
                                onCounterBid={handleCounterBid}
                                onContractorAcceptCounter={handleContractorAcceptCounter}
                                onContractorDeclineCounter={handleContractorDeclineCounter}
                                onContractorCounter={handleCounterBid}
                                onViewOnMap={(projectId) => { setSelectedMapProjectId(projectId); setShowMapsDirectory(true); }}
                                onSimulateContractorBid={handleSimulateContractorBid}
                                onUpdateProjectImages={handleUpdateProjectImages}
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
                                bids={bidsByProjectId.get(project.id) || EMPTY_BIDS}
                                currentUser={currentUser}
                                onAgreeToProject={() => handleAgreeToProject(project.id)}
                                onCompleteProject={() => handleCompleteProject(project.id)}
                                onStartChat={handleStartChat}
                                onCounterBid={handleCounterBid}
                                onContractorAcceptCounter={handleContractorAcceptCounter}
                                onContractorDeclineCounter={handleContractorDeclineCounter}
                                onContractorCounter={handleContractorCounter}
                                onViewOnMap={(projectId) => { setSelectedMapProjectId(projectId); setShowMapsDirectory(true); }}
                                onUpdateProjectImages={handleUpdateProjectImages}
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
              projects={projects}
              bids={bids}
              onAddEmailLog={(email, name, subject, body) => {
                setEmailLogs((prev) => [
                  {
                    id: `email-${Math.random().toString(36).substring(2, 11)}`,
                    recipientEmail: email,
                    recipientName: name,
                    subject,
                    body,
                    timestamp: new Date().toISOString(),
                  },
                  ...prev,
                ]);
              }}
            />
          )}

          {activeTab === "outreach" && (currentUser?.role === "owner" || currentUser?.isPlatformOwner || currentUser?.username === "nwiller9185") && (
            <OutreachCampaignsHub
              currentUser={currentUser}
              onAlert={(msg) => alert(msg)}
              seniorMode={seniorMode}
              setSeniorMode={setSeniorMode}
              onNavigateToAiAgent={() => setActiveTab("ai_agent")}
              onSendEmailCampaign={(subject, body) => {
                const newLog: EmailLog = {
                  id: `email-campaign-${Math.random().toString(36).substring(2, 9)}`,
                  recipientName: "Community Outreach Campaign List",
                  recipientEmail: "community.outreach@hotspotworkshop.com",
                  subject,
                  body,
                  timestamp: new Date().toISOString(),
                  category: "outreach",
                  senderName: "Outreach & Marketing",
                  senderEmail: "outreach@hotspotworkshop.com",
                  status: "dispatched"
                };
                setEmailLogs((prev) => [newLog, ...prev]);
                alert("✨ Campaign email logged to SMTP Email Simulator!");
              }}
            />
          )}

          {activeTab === "ai_agent" && (currentUser?.role === "owner" || currentUser?.isPlatformOwner || currentUser?.username === "nwiller9185") && (
            <AutonomousAdInstallerAgent
              appUrl={window.location.origin}
              onNavigateToProjects={() => setActiveTab("projects")}
              onNavigateToContractors={() => setActiveTab("contractors")}
            />
          )}

          {activeTab === "owner_suite" && (
            <OwnerSuite
              currentUser={currentUser}
              projects={projects}
              bids={bids}
              contractorsList={contractors}
              customersList={INITIAL_CUSTOMERS}
              seniorMode={seniorMode}
              setSeniorMode={setSeniorMode}
              onTriggerEmailLog={(log) => {
                setEmailLogs((prev) => [
                  {
                    id: `log-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    recipient: log.recipient,
                    subject: log.subject,
                    body: log.body,
                  },
                  ...prev,
                ]);
                setActivePushNotification({
                  id: `push-${Date.now()}`,
                  title: `System Email Sent: ${log.subject}`,
                  body: `Recipient: ${log.recipient}`,
                });
              }}
              onUpdateProjectStatus={(projectId, newStatus) => {
                setProjects((prev) =>
                  prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
                );
              }}
            />
          )}

          {activeTab === "monetize" && (
            <MonetizationHub
              currentUser={currentUser}
              projects={projects}
              contractors={contractors}
              onAlert={(msg) => alert(msg)}
              onUpdateProject={(updatedProject) => {
                setProjects((prev) => {
                  const next = prev.map((p) => (p.id === updatedProject.id ? updatedProject : p));
                  try {
                    localStorage.setItem("hsws_projects", JSON.stringify(next));
                  } catch (e) {
                    console.error(e);
                  }
                  return next;
                });
              }}
              onUpdateContractor={(updatedContractor) => {
                setContractors((prev) => {
                  const next = prev.map((c) => (c.id === updatedContractor.id ? updatedContractor : c));
                  try {
                    localStorage.setItem("hsws_contractors", JSON.stringify(next));
                  } catch (e) {
                    console.error(e);
                  }
                  return next;
                });
                if (currentUser && currentUser.id === updatedContractor.id) {
                  setCurrentUser(updatedContractor);
                  try {
                    localStorage.setItem("hsws_currentUser", JSON.stringify(updatedContractor));
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
              onTriggerEmailLog={(email, name, subject, body) => {
                setEmailLogs((prev) => [
                  {
                    id: `email-${Date.now()}`,
                    recipientEmail: email,
                    recipientName: name,
                    subject,
                    body,
                    timestamp: new Date().toISOString(),
                    category: "outreach",
                    status: "dispatched"
                  },
                  ...prev,
                ]);
              }}
            />
          )}
        </section>
      </main>

      {/* Platform Footer with App Store and Mobile Links */}
      <footer className="bg-zinc-950 text-white border-t border-zinc-800 py-10 px-4 sm:px-6 lg:px-8 mt-12" id="platform-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-base text-white block">
                Hot Spot Workshop
              </span>
              <span className="text-xs text-zinc-400">
                America's Peer-to-Peer Home Improvement & Trade Exchange
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Apple App Store Download Badge Button */}
            <button
              type="button"
              onClick={() => setShowAppStoreModal(true)}
              className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-white px-4 py-2.5 rounded-2xl flex items-center gap-3 transition cursor-pointer shadow-sm active:scale-95"
              id="footer-appstore-badge-btn"
            >
              <Apple className="w-6 h-6 text-white shrink-0" />
              <div className="text-left">
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest block font-bold">Download on the</span>
                <span className="text-xs font-black tracking-tight text-white block leading-none">Apple App Store</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowQuoteCalculatorModal(true)}
              className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-zinc-200 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition cursor-pointer"
            >
              AI Price Estimator
            </button>
          </div>

          <div className="text-center md:text-right text-xs text-zinc-500">
            <p>&copy; 2026 Hot Spot Workshop Inc. All rights reserved.</p>
            <p className="text-[11px] text-zinc-500">⚡ 1-Click Universal Web App &bull; All iOS & Android Devices &bull; Escrow Protection</p>
          </div>
        </div>
      </footer>

      {/* Dynamic Private Chat Overlay Console */}
      <button
        type="button"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-20 sm:bottom-6 left-3 sm:left-auto sm:right-72 bg-[#0c2340] border-2 border-blue-400 hover:bg-[#112d50] rounded-full px-3.5 py-2.5 sm:p-4 shadow-2xl transition duration-200 select-none flex items-center gap-2 font-bold text-white z-40 active:scale-95 cursor-pointer ring-2 ring-blue-500/30"
        id="chat-trigger-float-btn"
        title="Open Private Contractor & Homeowner Messages"
      >
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />
        <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight whitespace-nowrap">
          Chat ({privateMessages.length})
        </span>
        {privateMessages.length > 0 && (
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-pulse border border-white" />
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
        className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 bg-red-600 hover:bg-red-700 text-white border-2 border-white shadow-2xl rounded-full px-3.5 py-2.5 sm:p-4 transition duration-200 select-none flex items-center gap-2 font-mono z-40 active:scale-95 cursor-pointer ring-2 ring-red-500/50"
        id="email-trigger-float-btn"
        title="Open Tech Relay and Email Notification Logs"
        aria-label="Open Tech Relay and Email Notification Logs"
      >
        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
        <span className="text-[11px] sm:text-xs font-black text-white tracking-tight whitespace-nowrap">
          Tech Relay logs ({emailLogs.length})
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 animate-ping" />
      </button>

      {/* --- Overlay Modals routers --- */}
      {showProjectModal && (
        <ProjectForm
          onAddProject={handleAddProject}
          onClose={() => {
            setShowProjectModal(false);
            setInitialProjectFormData(null);
          }}
          currentUser={currentUser}
          initialData={initialProjectFormData}
        />
      )}

      {/* Contractor Pro Membership Upgrade Modal */}
      <ContractorProModal
        isOpen={showContractorProModal}
        onClose={() => setShowContractorProModal(false)}
        contractor={currentUser?.role === "contractor" ? currentUser : (contractors[0] || null)}
        onUpgradeSuccess={(updatedContractor) => {
          if (currentUser?.role === "contractor") {
            setCurrentUser(updatedContractor);
          }
          setContractors((prev) =>
            prev.map((c) => (c.id === updatedContractor.id ? updatedContractor : c))
          );
        }}
        onOpenStripeHub={() => {
          setShowContractorProModal(false);
          setActiveTab("monetize");
        }}
      />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(configuredUser) => {
            setCurrentUser(configuredUser);
            // If contractor is new, append and seed to active contractors list (unless already exists)
            if (configuredUser.role === "contractor") {
              setContractors((prev) => {
                if (prev.some(c => c.username === configuredUser.username || c.id === configuredUser.id)) return prev;
                const next = [configuredUser, ...prev];
                realtimeSync.publishUpdate("contractors", configuredUser, "upsert", `New Pro Contractor Registered: ${configuredUser.fullName} (${configuredUser.city}, ${configuredUser.state})`);
                return next;
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
            alert("Email simulator buffers wiped clean.");
          }}
          onAddLog={(newLog) => setEmailLogs((prev) => [newLog, ...prev])}
          onDeleteLog={(logId) => setEmailLogs((prev) => prev.filter((l) => l.id !== logId))}
          onClose={() => setShowEmailTracker(false)}
        />
      )}

      {showMapsDirectory && (
        <GoogleMapsDirectory
          projects={projects}
          bids={bids}
          allCities={allCities}
          onClose={() => {
            setShowMapsDirectory(false);
            setSelectedMapProjectId(null);
          }}
          onSelectProject={(projectId) => {
            // Auto switch tab to projects to see the board
            setActiveTab("projects");
            
            // Scroll to the project card on the homepage
            setTimeout(() => {
              const element = document.getElementById(`project-card-${projectId}`);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("ring-4", "ring-amber-500", "transition-all", "duration-1000");
                setTimeout(() => {
                  element.classList.remove("ring-4", "ring-amber-500");
                }, 3000);
              }
            }, 350);
          }}
        />
      )}

      {/* Standalone AI Price & Quote Calculator Modal */}
      {showQuoteCalculatorModal && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowQuoteCalculatorModal(false)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <InstantQuoteCalculator
              onApplyEstimateToForm={(trade, budget, title, desc) => {
                setShowQuoteCalculatorModal(false);
                if (!currentUser) {
                  setShowAuthModal(true);
                } else {
                  setShowProjectModal(true);
                }
              }}
              onClose={() => setShowQuoteCalculatorModal(false)}
            />
          </div>
        </div>
      )}

      {/* Sliding-down Real-time Web Push notification banner */}
      {activePushNotification && (
        <div
          className="fixed top-6 right-6 left-6 md:left-auto md:w-96 bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300 flex items-start gap-3.5 select-none"
          id="push-alert-notification-banner"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 border border-amber-500/30">
            <span className="text-lg">🔔</span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black font-display text-amber-500 tracking-wide uppercase">Real-Time Push Alert</h4>
              <button
                onClick={() => setActivePushNotification(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h5 className="text-xs font-bold text-white font-display leading-tight">{activePushNotification.title}</h5>
            <p className="text-[11px] text-zinc-300 leading-normal">{activePushNotification.body}</p>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[9px] text-zinc-500 font-semibold font-mono">Push Protocol: Active</span>
              <button
                onClick={() => {
                  setActiveTab("my_dashboard");
                  setActivePushNotification(null);
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
              >
                Open Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple App Store Download & iOS Installation Hub Modal */}
      <AppStoreDownloadModal
        isOpen={showAppStoreModal}
        onClose={() => setShowAppStoreModal(false)}
        onAlert={(msg) => alert(msg)}
      />

      {/* 24/7 Rapid Emergency Dispatch Modal */}
      {showEmergencyDispatchModal && (
        <EmergencyDispatchModal
          onClose={() => setShowEmergencyDispatchModal(false)}
          currentUser={currentUser}
          onDispatchSuccess={(emergencyProject) => {
            setProjects((prev) => [emergencyProject, ...prev]);
            realtimeSync.publishUpdate("projects", emergencyProject, "upsert", `🚨 Emergency Dispatch Broadcast: ${emergencyProject.title}`);
            setActiveTab("projects");
            setQuickFilterMode("urgent");
          }}
        />
      )}

      {/* Before & After Transformations Showcase Gallery Modal */}
      {showGlobalBeforeAfterModal && (
        <BeforeAfterShowcaseModal
          onClose={() => setShowGlobalBeforeAfterModal(false)}
          contractorName={currentUser?.company || currentUser?.fullName}
          currentUser={currentUser}
        />
      )}

      {/* Standalone Job Invoice & Estimate Generator Modal */}
      {showGlobalInvoiceModal && (
        <InvoiceEstimateGeneratorModal
          onClose={() => setShowGlobalInvoiceModal(false)}
          project={projects[0] || null}
          contractor={currentUser?.role === "contractor" ? currentUser : null}
          currentUser={currentUser}
        />
      )}

      {/* Regional Material Cost & Municipal Permit Estimator Modal */}
      {showGlobalPermitModal && (
        <MaterialAndPermitEstimatorModal
          onClose={() => setShowGlobalPermitModal(false)}
          initialCity={currentCityName}
        />
      )}

      {/* Subcontractor Crew & Day-Labor B2B Board Modal */}
      {showGlobalCrewBoardModal && (
        <SubcontractorCrewBoardModal
          onClose={() => setShowGlobalCrewBoardModal(false)}
          currentUser={currentUser}
          onOpenChat={handleStartChat}
        />
      )}

      {/* Central High-Converting Monetization Quick Checkout Modal */}
      <MonetizationQuickCheckoutModal
        isOpen={monetizationModalState.isOpen}
        productKind={monetizationModalState.kind}
        targetProject={monetizationModalState.targetProject}
        currentUser={currentUser}
        onClose={() => setMonetizationModalState({ isOpen: false, kind: "contractor_pro", targetProject: null })}
        onSuccessPurchase={(message) => {
          setQuickToastMessage(message);
          setTimeout(() => setQuickToastMessage(null), 4000);
        }}
      />

      {/* Floating Quick Action Toast Banner */}
      {quickToastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm sm:max-w-md text-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>{quickToastMessage}</span>
          <button
            type="button"
            onClick={() => setQuickToastMessage(null)}
            className="ml-auto text-zinc-400 hover:text-white text-xs pl-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Modern Mobile Bottom Navigation Bar for Smart Viewport Adaptability */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenPostProjectModal={() => {
          if (!currentUser) {
            setShowAuthModal(true);
          } else {
            setShowProjectModal(true);
          }
        }}
        onOpenContractorProModal={() => {
          setMonetizationModalState({
            isOpen: true,
            kind: "contractor_pro",
            targetProject: null,
          });
        }}
        currentUser={currentUser}
        unreadCount={emailLogs.length}
      />

      {/* Offline Persistence Check and Automatic Sync Toaster */}
      <PersistenceCheckToast />
    </div>
  );
}
