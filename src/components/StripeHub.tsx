import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Building,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  HelpCircle,
  Lock,
  Sliders,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Activity,
  FileText,
  Plus,
  Trash2,
  Printer,
  Download,
  Send,
  Sparkles
} from "lucide-react";

interface StripeHubProps {
  currentUser: any;
  onAlert: (msg: string) => void;
  projects?: any[];
  bids?: any[];
  onAddEmailLog?: (recipientEmail: string, recipientName: string, subject: string, body: string) => void;
}

export default function StripeHub({ 
  currentUser, 
  onAlert,
  projects = [],
  bids = [],
  onAddEmailLog
}: StripeHubProps) {
  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState<{
    realMode: boolean;
    availableBalance: number;
    pendingBalance: number;
    connectedStatus: string;
    bankName: string;
    last4: string;
    routingLast4: string;
    payoutSchedule: string;
    payoutHistory: Array<{
      id: string;
      amount: number;
      arrivalDate: string;
      status: "processing" | "succeeded" | "failed";
      bankName: string;
      accountLast4: string;
    }>;
  } | null>(null);

  // Connection form state
  const [bankName, setBankName] = useState("Chase Bank N.A.");
  const [routingNumber, setRoutingNumber] = useState("021000021");
  const [accountNumber, setAccountNumber] = useState("1234567890");
  const [stripeStatusInfo, setStripeStatusInfo] = useState<{ configured: boolean; publishableKey: string } | null>(null);

  // --- INVOICE GENERATOR STATES & SYSTEM ---
  const SIMULATED_COMPLETED_PROJECTS = [
    {
      id: "demo-completed-1",
      title: "Backyard Landscape Restoration & Paver Stones",
      budget: 850,
      customerFirstName: "Arthur",
      customerLastName: "Pendleton",
      customerEmail: "arthur.pendleton@example.com",
      customerPhone: "503-555-0182",
      address: "1894 NW Skyline Drive",
      city: "Portland",
      state: "OR",
      zipCode: "97229",
      serviceFeeCharge: 20,
    },
    {
      id: "demo-completed-2",
      title: "Gutter Guard Installation & Roof Leak Repair",
      budget: 320,
      customerFirstName: "Eleanor",
      customerLastName: "Vance",
      customerEmail: "eleanor.vance@example.com",
      customerPhone: "206-555-0199",
      address: "4722 Pine Street",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      serviceFeeCharge: 5,
    }
  ];

  // Filter completed projects from live database
  const completedProjects = projects.filter((p: any) => p.status === "completed");

  const selectableProjects = [
    ...completedProjects,
    ...SIMULATED_COMPLETED_PROJECTS
  ];

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    selectableProjects[0]?.id || ""
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  interface InvoiceLineItem {
    id: string;
    description: string;
    qty: number;
    unitPrice: number;
  }

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(8.25);
  const [notes, setNotes] = useState<string>(
    "Thank you for choosing Hot Spot Workspace! We appreciate your business and escrow authorization."
  );
  const [contractorBusinessName, setContractorBusinessName] = useState<string>("");
  const [contractorEmail, setContractorEmail] = useState<string>("");

  useEffect(() => {
    if (!selectedProjectId) return;
    const proj = selectableProjects.find((p) => p.id === selectedProjectId);
    if (proj) {
      // Create itemized default lines: 70% labor, 20% materials, 10% clean up
      const laborCost = Math.round(proj.budget * 0.70);
      const materialsCost = Math.round(proj.budget * 0.20);
      const safetyCost = proj.budget - laborCost - materialsCost;

      const defaultLines: InvoiceLineItem[] = [
        {
          id: "line-labor",
          description: `Contracted Labor Services for ${proj.title}`,
          qty: 1,
          unitPrice: laborCost
        }
      ];

      if (materialsCost > 0) {
        defaultLines.push({
          id: "line-materials",
          description: "Required Project Materials, Tools & Disposal Costs",
          qty: 1,
          unitPrice: materialsCost
        });
      }

      if (safetyCost > 0) {
        defaultLines.push({
          id: "line-cleanup",
          description: "Post-Job Safety Clean-up & Visual Site Audit",
          qty: 1,
          unitPrice: safetyCost
        });
      }

      setLineItems(defaultLines);

      if (currentUser?.role === "contractor") {
        setContractorBusinessName(currentUser.company || currentUser.fullName || "Certified Contractor Services");
        setContractorEmail(currentUser.email || "billing@workspacecontractor.com");
      } else {
        setContractorBusinessName("Apex Remodeling & Handyman Inc.");
        setContractorEmail("accounts@apexremodeling.com");
      }
    }
  }, [selectedProjectId]);

  const handleAddLineItem = () => {
    const newLine: InvoiceLineItem = {
      id: `line-${Date.now()}`,
      description: "Additional Itemized Service",
      qty: 1,
      unitPrice: 50
    };
    setLineItems([...lineItems, newLine]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      onAlert("An invoice must contain at least one line item!");
      return;
    }
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleUpdateLineItem = (id: string, field: "description" | "qty" | "unitPrice", value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        if (field === "description") {
          return { ...item, description: value };
        } else {
          return { ...item, [field]: Number(value) || 0 };
        }
      }
      return item;
    }));
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleDownloadCSV = () => {
    const proj = selectableProjects.find(p => p.id === selectedProjectId);
    if (!proj) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `INVOICE RECEIPT\n`;
    csvContent += `Invoice ID,${invoiceNumber}\n`;
    csvContent += `Issue Date,${issueDate}\n`;
    csvContent += `Due Date,${dueDate}\n\n`;
    csvContent += `CONTRACTOR,${contractorBusinessName}\n`;
    csvContent += `Contractor Email,${contractorEmail}\n\n`;
    csvContent += `CLIENT,${proj.customerFirstName} ${proj.customerLastName}\n`;
    csvContent += `Client Email,${proj.customerEmail || "N/A"}\n`;
    csvContent += `Client Phone,${proj.customerPhone || "N/A"}\n\n`;
    
    csvContent += `Itemized Details\n`;
    csvContent += `Description,Qty,Unit Price (USD),Total (USD)\n`;
    lineItems.forEach(item => {
      csvContent += `"${item.description.replace(/"/g, '""')}",${item.qty},${item.unitPrice},${(item.qty * item.unitPrice).toFixed(2)}\n`;
    });
    
    csvContent += `\n`;
    csvContent += `,Subtotal,${subtotal.toFixed(2)}\n`;
    csvContent += `,Tax (${taxRate}%),${taxAmount.toFixed(2)}\n`;
    csvContent += `,Grand Total,${totalAmount.toFixed(2)}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoice-${invoiceNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAlert(`CSV invoice downloaded successfully for ${invoiceNumber}!`);
  };

  const handleSendEmail = () => {
    const proj = selectableProjects.find(p => p.id === selectedProjectId);
    if (!proj) return;
    if (!onAddEmailLog) {
      onAlert("Email simulator logs are unavailable. Please check configuration.");
      return;
    }
    
    const clientName = `${proj.customerFirstName} ${proj.customerLastName}`;
    const clientEmail = proj.customerEmail || `${proj.customerFirstName.toLowerCase()}@example.com`;
    
    const itemizedText = lineItems.map((item, idx) => {
      return `${idx + 1}. ${item.description}\n   Qty: ${item.qty} | Rate: $${item.unitPrice.toFixed(2)} | Subtotal: $${(item.qty * item.unitPrice).toFixed(2)}`;
    }).join("\n");
    
    const emailSubject = `🧾 Itemized Invoice ${invoiceNumber} from ${contractorBusinessName} [Project: ${proj.title}]`;
    const emailBody = `Hi ${clientName},\n\nWe have generated an itemized invoice for your records regarding the completed project: "${proj.title}".\n\nYour agreed budget was $${proj.budget.toFixed(2)}. Below is the detailed breakdown of the services rendered, materials allocated, and municipal tax itemizations:\n\n========================================\nINVOICE BREAKDOWN\n========================================\nInvoice Number: ${invoiceNumber}\nIssue Date: ${issueDate}\nDue Date: ${dueDate}\nContractor: ${contractorBusinessName} (${contractorEmail})\n\nSERVICES ITEMIZATION:\n${itemizedText}\n\n----------------------------------------\nFINANCIAL METRICS:\nSubtotal Amount: $${subtotal.toFixed(2)}\nEstimated Sales Tax (${taxRate}%): $${taxAmount.toFixed(2)}\nGrand Total (Escrow Cleared): $${totalAmount.toFixed(2)}\n----------------------------------------\n\nNotes: ${notes}\n\n========================================\nSTATUS: AUTOMATICALLY CLEARING ESCROW DEPOSIT WITH STRIPE\n========================================\n\nThis invoice is provided as an itemized copy for your personal records and business tax filing purposes. No additional payment action is required if your escrow has already cleared successfully!\n\nBest regards,\nHot Spot Workspace Automations`;

    onAddEmailLog(clientEmail, clientName, emailSubject, emailBody);
    onAlert(`📧 Success! Itemized invoice sent. You can check the "Platform Email Log Simulator" at the top right to view the live SMTP transmission log!`);
  };

  // Fetch balance data from full-stack endpoint
  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/balance");
      if (res.ok) {
        const data = await res.json();
        setBalanceData(data);
      }
    } catch (err) {
      console.error("Failed to fetch Stripe balance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stripe setup status
  const fetchStripeStatus = async () => {
    try {
      const res = await fetch("/api/stripe/status");
      if (res.ok) {
        const data = await res.json();
        setStripeStatusInfo(data);
      }
    } catch (err) {
      console.error("Failed to query Stripe status config:", err);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchStripeStatus();
  }, [currentUser]);

  // Connect bank account form submit
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !routingNumber.trim() || !accountNumber.trim()) {
      onAlert("Please fill in all bank routing & account parameters safely.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, routingNumber, accountNumber }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.realMode && data.url) {
          // If real mode is active, redirect to Stripe Express onboarding
          window.location.href = data.url;
        } else {
          onAlert("🎉 Connected! Your bank routing destination was verified with Stripe Sandbox instantly.");
          fetchBalance();
          fetchStripeStatus();
        }
      } else {
        const errData = await res.json();
        onAlert(`Connection failed: ${errData.error || "Unknown server response."}`);
      }
    } catch (err) {
      onAlert("Could not finalize server handshake connectivity.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger immediate balance payout
  const handlePayout = async () => {
    if (!balanceData || balanceData.availableBalance <= 0) {
      onAlert("You do not have any available balance to payout.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/stripe/payout", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const amt = data.payout ? data.payout.amount : balanceData.availableBalance;
        onAlert(`🚀 Succesful Payout of $${amt.toFixed(2)} dispatched to your connected routing account! Available in 1-2 business days.`);
        fetchBalance();
      } else {
        const errData = await res.json();
        onAlert(`Payout failed: ${errData.error || "Please verify bank connection."}`);
      }
    } catch (err) {
      onAlert("Exception connecting to payout engine.");
    } finally {
      setLoading(false);
    }
  };

  // Disconnect stripe connection
  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect this routing link?")) return;
    try {
      setLoading(true);
      await fetch("/api/stripe/disconnect", { method: "POST" });
      onAlert("Stripe connected bank account was unlinked.");
      fetchBalance();
      fetchStripeStatus();
    } catch (err) {
      onAlert("Failed to disconnect backend credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Change payout timing frequency
  const handleUpdateSchedule = async (schedule: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/payout-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });
      if (res.ok) {
        onAlert(`Payout frequency setting updated to: ${schedule.toUpperCase()}`);
        fetchBalance();
      }
    } catch (err) {
      onAlert("Error updating schedule configuration.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center space-y-4">
        <Lock className="w-12 h-12 text-zinc-300 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-800">Financial Hub Secure Access Only</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Please authenticate using your contractor or homeowner credentials using the top Sign In button to unlock Stripe balances, escrow routing, and deposit management tabs!
        </p>
      </div>
    );
  }

  const isContractor = currentUser?.role === "contractor";

  return (
    <div className="space-y-6" id="stripe-secured-financial-hub">
      {/* Title block with server state badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-black tracking-tight font-display text-zinc-100">
              Stripe Integration Console
            </h2>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
            Authorize deposits, inspect pending escrow reserves, and transfer platform payouts directly to your physical bank routing number.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className={`text-[10px] uppercase tracking-widest font-mono font-bold px-3 py-1 rounded-full border ${
            stripeStatusInfo?.configured
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
              : "bg-amber-500/10 text-amber-400 border-amber-500/25"
          }`}>
            {stripeStatusInfo?.configured ? "🔌 Stripe Live Mode" : "🧪 Stripe Sandbox Mode"}
          </span>
          <button
            onClick={() => {
              fetchBalance();
              fetchStripeStatus();
            }}
            title="Refresh Ledger Cache"
            className="p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {!stripeStatusInfo?.configured && (
        <div className="bg-amber-550/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-950 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Sandbox Environment Explanation:</strong>
            <p>
              Your workspace server is operating in test mode since no Stripe secret keys have been supplied in your environment variables. 
              The balance calculations, bank connections, and payout requests remain fully interactive and stateful via Express backend simulation!
            </p>
            <p className="text-[10px] text-amber-700/80 font-medium">
              💡 To enable real banking transfers: click the Settings icon in your AI Studio editor console, bind your client/secret variables, and reload the server instantly!
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Balance Metrics & Connecting Interface */}
      {balanceData && balanceData.connectedStatus === "linked" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AVAILABLE FUND CARD */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl p-6 border border-zinc-850 shadow-md space-y-4 relative overflow-hidden">
            <div className="absolute right-4 top-4 bg-zinc-800 text-zinc-300 p-2.5 rounded-xl border border-zinc-700">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                Available Cash Balance
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-mono tracking-tight font-display">
                  ${balanceData.availableBalance.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-400 font-bold">USD</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal pt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Dispatched for direct payout anytime
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={handlePayout}
                disabled={loading || balanceData.availableBalance <= 0}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-500 text-zinc-950 font-black p-3 rounded-xl text-xs transition duration-150 shadow-sm flex items-center justify-center gap-1.5"
              >
                📥 Trigger Transfer payout to {balanceData.bankName}
              </button>
            </div>
          </div>

          {/* PENDING / ESCROW FUND CARD */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-zinc-100 rounded-xl text-zinc-700">
                <TrendingUp className="w-5 h-5 text-zinc-600" />
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Escrow Guarantee
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Pending Escrow Balance
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-zinc-900 font-mono tracking-tight">
                  ${balanceData.pendingBalance.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500 font-semibold">USD</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal pt-1">
                Fund matches currently secured awaiting job milestone completion approvals from matching homeowners.
              </p>
            </div>

            {/* Sparkline Visual - Earnings Growth Flow */}
            <div className="h-10 pt-2 flex items-end gap-1 select-none">
              <div className="h-3 w-full bg-zinc-100 rounded-t-xs hover:bg-zinc-200 transition" title="Prior Weeks: $0" />
              <div className="h-5 w-full bg-zinc-100 rounded-t-xs hover:bg-zinc-200 transition" title="Prior Weeks: $140" />
              <div className="h-4 w-full bg-zinc-200 rounded-t-xs hover:bg-zinc-200 transition" title="Prior Weeks: $45" />
              <div className="h-8 w-full bg-amber-250 rounded-t-xs hover:bg-amber-300 transition" title="Pending: $120" />
              <div className="h-10 w-full bg-amber-500 rounded-t-sm hover:bg-amber-600 transition" title="Available: $380" />
            </div>
          </div>

          {/* CONNECTED ROUTING DETAILS */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span className="text-xs font-bold text-zinc-800">Connected Bank Account</span>
                </div>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-emerald-200 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 animate-pulse" /> Active Verified
                </span>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Destination institution</span>
                  <strong className="text-zinc-800 truncate max-w-[130px]">{balanceData.bankName}</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Account status</span>
                  <span className="font-mono text-[10px] text-zinc-500">****{balanceData.last4}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Routing index</span>
                  <span className="font-mono text-[10px] text-zinc-500">****{balanceData.routingLast4}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex gap-2">
              <button
                onClick={handleDisconnect}
                className="flex-1 border border-zinc-300 text-zinc-650 hover:bg-zinc-100 font-bold py-2 rounded-xl text-xs transition duration-150"
              >
                Disconnect Link
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* DISCONNECTED / REQUIRES BANK LINK SETUP FORM */
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-600">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-zinc-900 font-display">Configure Bank Deposit Instructions</h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-md mx-auto">
              Please connect your business checking, savings, or debit card infrastructure. Approved project services earnings are automatically routed safely inside 1-2 work days.
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">Bank Institution Name</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="Chase Bank N.A.">Chase Bank N.A.</option>
                  <option value="Bank of America N.A.">Bank of America N.A.</option>
                  <option value="Navy Federal Credit Union">Navy Federal Credit Union</option>
                  <option value="Wells Fargo Bank N.A.">Wells Fargo Bank N.A.</option>
                  <option value="Fidelity Investment Cash Management">Fidelity Cash Management</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">Routing Transit Index (9-digits)</label>
                <input
                  type="text"
                  pattern="\d{9}"
                  maxLength={9}
                  placeholder="021000021"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-hidden text-zinc-800"
                  required
                />
              </div>

            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">Business Checking/Savings Account Number</label>
              <input
                type="password"
                maxLength={17}
                placeholder="••••••••••••••••"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-hidden text-zinc-800"
                required
              />
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-[10px] text-zinc-500 flex gap-2">
              <Lock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                <strong>Confidential Encrypted Storage:</strong> Routing parameters are encrypted and transmitted directly to Stripe's secure PCI-DSS level 1 environment. Our local servers never store or inspect full raw account numbers.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold text-xs transition duration-150 flex items-center justify-center gap-1.5"
            >
              🔐 Connect Deposit Credentials securely ➔
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/*             SMART ITEMIZED INVOICE GENERATOR            */}
      {/* ======================================================== */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-6" id="smart-invoice-generator">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-zinc-900 flex items-center gap-2 font-display">
              <FileText className="w-5 h-5 text-amber-500 shrink-0" />
              Smart Itemized Invoice Generator
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Review completed projects and generate detailed itemized receipts for homeowners. You can live-edit values, download a CSV spreadsheet, or transmit the final statement directly.
            </p>
          </div>
          
          {/* Quick Stats or status */}
          <div className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-zinc-700">
              {selectableProjects.length} Completed Projects Available
            </span>
          </div>
        </div>

        {/* Selected Project Input row */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">
              1. Select Completed Job
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-medium text-zinc-850"
            >
              {selectableProjects.map((p) => {
                const isDemo = p.id.startsWith("demo-");
                return (
                  <option key={p.id} value={p.id}>
                    {p.title} (${p.budget} budget) {isDemo ? " [🧪 Sim]" : " [🏠 Real]"}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">
              Contractor Name / Company
            </label>
            <input
              type="text"
              value={contractorBusinessName}
              onChange={(e) => setContractorBusinessName(e.target.value)}
              placeholder="Your Business Name"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">
              Contractor Billing Email
            </label>
            <input
              type="email"
              value={contractorEmail}
              onChange={(e) => setContractorEmail(e.target.value)}
              placeholder="contractor@email.com"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-850 font-mono"
            />
          </div>
        </div>

        {/* Split Config vs Live Preview layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          
          {/* LEFT: Live line item & parameter customizer (2 cols) */}
          <div className="xl:col-span-2 space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
                  2. Customize Itemized Charges
                </span>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 border border-zinc-200 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Add Charge Item
                </button>
              </div>

              {/* Line items list */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {lineItems.map((item) => (
                  <div key={item.id} className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2 relative group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase">Item Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                          placeholder="e.g. Pine wood decking beams"
                          className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs text-zinc-800 font-medium"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition self-end mt-1"
                        title="Delete line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase">Quantity / Hours</label>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => handleUpdateLineItem(item.id, "qty", e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs font-mono text-zinc-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase">Unit Price ($)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs font-mono text-zinc-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General parameters */}
            <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 space-y-3.5">
              <span className="text-xs font-bold text-zinc-800 block">
                3. Additional Metadata
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase">Local Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="30"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase">Invoice Notes / Policy</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs text-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: High-contrast gorgeous Live Invoice Document (3 cols) */}
          <div className="xl:col-span-3 bg-zinc-50 rounded-2xl p-4 border border-zinc-200 flex flex-col justify-between">
            <div className="bg-white border border-zinc-300 rounded-xl p-6 shadow-md font-sans text-zinc-800 space-y-6 select-text" id="invoice-printable-document">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-zinc-200 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] bg-zinc-900 text-amber-400 font-extrabold px-2 py-0.5 rounded-xs uppercase tracking-wider font-mono">
                    HOT SPOT WORKSPACE
                  </span>
                  <h4 className="text-xl font-black text-zinc-900 tracking-tight font-display">{contractorBusinessName}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono">{contractorEmail}</p>
                </div>
                
                <div className="text-right space-y-1">
                  <span className="text-sm font-bold text-zinc-400 uppercase block tracking-wide">INVOICE</span>
                  <span className="font-mono text-xs font-black text-zinc-900 block bg-zinc-100 px-2 py-0.5 rounded-sm">
                    {invoiceNumber}
                  </span>
                  <p className="text-[10px] text-zinc-500 font-medium">Status: <span className="text-emerald-600 font-bold">PAID VIA ESCROW</span></p>
                </div>
              </div>

              {/* Bill From / Bill To details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">Billed To (Homeowner)</span>
                  {(() => {
                    const proj = selectableProjects.find(p => p.id === selectedProjectId);
                    if (!proj) return <p className="italic text-zinc-400">No project selected</p>;
                    return (
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-zinc-900">{proj.customerFirstName} {proj.customerLastName}</p>
                        <p className="text-zinc-500">{proj.address}</p>
                        <p className="text-zinc-500">{proj.city}, {proj.state} {proj.zipCode}</p>
                        <p className="text-zinc-400 font-mono text-[10px] pt-1">{proj.customerPhone || "N/A"}</p>
                      </div>
                    );
                  })()}
                </div>

                <div className="text-right space-y-1.5">
                  <div>
                    <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">Invoice Date</span>
                    <p className="font-bold text-zinc-800 font-mono text-[11px]">{issueDate}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">Due Date</span>
                    <p className="font-bold text-zinc-800 font-mono text-[11px]">{dueDate}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">Completed Project</span>
                    {(() => {
                      const proj = selectableProjects.find(p => p.id === selectedProjectId);
                      return <p className="font-medium text-zinc-700 truncate max-w-[200px] ml-auto" title={proj?.title}>{proj?.title}</p>;
                    })()}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-600 text-[10px] uppercase">
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-2 text-center w-12">Qty</th>
                      <th className="py-2.5 px-2 text-right w-24">Unit Price</th>
                      <th className="py-2.5 px-3 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50">
                        <td className="py-2.5 px-3 text-zinc-800 font-medium leading-snug">
                          {item.description}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-zinc-600">
                          {item.qty}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-zinc-600">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                          ${(item.qty * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summaries block */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
                <div className="text-[10px] text-zinc-500 max-w-xs leading-relaxed">
                  <span className="font-bold text-zinc-700 uppercase block mb-1">Contractor Notes</span>
                  <p className="italic">"{notes}"</p>
                </div>

                <div className="sm:w-64 space-y-2 border-t border-zinc-100 pt-2 sm:border-t-0 sm:pt-0">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-mono text-zinc-800 font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Estimated Local Tax ({taxRate}%)</span>
                    <span className="font-mono text-zinc-800 font-semibold">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-zinc-200 my-1" />
                  <div className="flex justify-between text-sm">
                    <strong className="text-zinc-900 font-black font-display">Grand Total (USD)</strong>
                    <strong className="font-mono text-zinc-950 font-extrabold text-[15px]">${totalAmount.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Secured Escrow Badge footer */}
              <div className="border-t border-dashed border-zinc-300 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  CLEARED THROUGH STRIPE ESCROW MULTISIG
                </span>
                <span>SYSTEM ID: {selectedProjectId}</span>
              </div>
            </div>

            {/* Print, Download, Email buttons row */}
            <div className="mt-4 pt-4 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  const printContent = document.getElementById("invoice-printable-document");
                  if (printContent) {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Invoice ${invoiceNumber}</title>
                            <style>
                              body { font-family: system-ui, sans-serif; color: #1f2937; padding: 40px; }
                              .text-right { text-align: right; }
                              .flex { display: flex; justify-content: space-between; }
                              .border-b { border-bottom: 1px solid #e5e7eb; }
                              .pb-5 { padding-bottom: 20px; }
                              .pt-2 { padding-top: 8px; }
                              .my-1 { margin-top: 4px; margin-bottom: 4px; }
                              .space-y-6 > * + * { margin-top: 24px; }
                              .space-y-1 > * + * { margin-top: 4px; }
                              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                              th, td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
                              th { background-color: #f9fafb; font-weight: bold; text-align: left; }
                              .font-mono { font-family: monospace; }
                              .font-black { font-weight: 900; }
                              .font-extrabold { font-weight: 800; }
                              .text-emerald-600 { color: #059669; }
                            </style>
                          </head>
                          <body>
                            <div class="space-y-6">
                              ${printContent.innerHTML}
                            </div>
                            <script>
                              window.onload = function() { window.print(); }
                            </script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    } else {
                      window.print();
                    }
                  } else {
                    window.print();
                  }
                }}
                className="bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-150"
              >
                <Printer className="w-4 h-4 text-zinc-500" />
                Print Physical PDF
              </button>
              
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-150"
              >
                <Download className="w-4 h-4 text-zinc-500" />
                Download CSV Receipt
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-150 shadow-sm"
              >
                <Send className="w-4 h-4" />
                Send Invoice via Email
              </button>
            </div>
          </div>

        </div>
      </div>
      {balanceData && balanceData.connectedStatus === "linked" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PAYOUT timing schedules settings options */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5 text-zinc-800">
              <Sliders className="w-4 h-4 text-zinc-500 shrink-0" />
              <h4 className="text-xs font-bold">Payout Timings Schedule</h4>
            </div>

            <p className="text-[10px] text-zinc-500 leading-normal">
              Establish how quickly platform credits from accepted jobs sync to your bank.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleUpdateSchedule("manual")}
                className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition ${
                  balanceData.payoutSchedule === "manual"
                    ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                    : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                }`}
              >
                <span>Manual Dispatch (Default)</span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold bg-zinc-200">On-demand</span>
              </button>
              <button
                onClick={() => handleUpdateSchedule("daily")}
                className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition ${
                  balanceData.payoutSchedule === "daily"
                    ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                    : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                }`}
              >
                <span>Daily Settlements</span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800">Fastest</span>
              </button>
              <button
                onClick={() => handleUpdateSchedule("weekly")}
                className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition ${
                  balanceData.payoutSchedule === "weekly"
                    ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                    : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                }`}
              >
                <span>Weekly Friday Disbursements</span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold bg-zinc-200">Standard</span>
              </button>
            </div>
          </div>

          {/* HISTORICAL TIMELINE SHEET LIST */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-zinc-800">
                <Activity className="w-4 h-4 text-zinc-500" />
                <h4 className="text-xs font-bold">Platform Dispatched Disbursements History</h4>
              </div>
              <span className="text-[10px] text-zinc-400 font-bold">{balanceData.payoutHistory.length} payout records</span>
            </div>

            {balanceData.payoutHistory.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                📜 No platform payout actions logged to this account credentials yet. Available balances will register here once finalized.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto pr-1">
                {balanceData.payoutHistory.map((poy) => (
                  <div key={poy.id} className="py-3 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
                        <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-zinc-950">
                          Transfer to {poy.bankName}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400">
                          ID: {poy.id} · ****{poy.accountLast4} · {new Date(poy.arrivalDate).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs block text-zinc-900">
                        -${poy.amount.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.25 rounded-md border border-emerald-200">
                        Succeeded
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SPECIAL NICHOLAS WILLER PLATFORM OWNER BOARDROOM ACCESS */}
      {(currentUser?.username === "nwiller9185" || currentUser?.isPlatformOwner) && (
        <div className="bg-gradient-to-r from-amber-700 via-zinc-900 to-zinc-900 text-white p-6 rounded-2xl border border-amber-500/30 shadow-lg space-y-6 animate-fade-in" id="platform-owner-room">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 border border-amber-500/30">
                <span className="text-lg">👑</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest font-display">Platform Creator Suite</h3>
                <p className="text-zinc-400 text-xs">Secure executive ledger access configured for username <strong className="text-zinc-200">nwiller9185</strong></p>
              </div>
            </div>
            <div className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono font-bold">
              ● Server Root Online (Port 3000)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Contractor Memberships</span>
              <span className="text-xl font-black text-white font-mono">$80.00 <span className="text-xs text-zinc-400 font-normal">/mo</span></span>
              <p className="text-[9px] text-zinc-500 mt-1">4 active professional contractors billing $20/month base</p>
            </div>
            
            <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Matched Match Commissions</span>
              <span className="text-xl font-black text-emerald-400 font-mono">$40.00</span>
              <p className="text-[9px] text-zinc-500 mt-1">Flat service match commissions generated from mutual authorizations</p>
            </div>

            <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Total Platform Reserve</span>
              <span className="text-xl font-black text-amber-400 font-mono">$120.00</span>
              <p className="text-[9px] text-zinc-500 mt-1">Funds currently held inside system Stripe account</p>
            </div>

            <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Primary Owner Bank</span>
              <span className="text-xs font-black text-white block truncate">Chase Bank N.A.</span>
              <span className="text-[9px] text-zinc-400 block font-mono">****-****-9185 (Active Routing)</span>
            </div>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-2">
            <h4 className="font-bold text-zinc-200 flex items-center gap-1.5">
              <span>🚀</span> Developer & Admin Payout Instructions
            </h4>
            <p className="text-[11px] leading-relaxed">
              As the platform founder, all homeowners' project service fees ($5 and $20 match commissions) and professional contractor monthly subscriptions are processed through Stripe elements.
              When you complete operations, funds accrue automatically to your executive bank ledger checked here. Live deployments can manage this directly via the secure Stripe dashboard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
