import React, { useState, useRef } from "react";
import { X, Printer, Download, Plus, Trash2, CheckCircle, FileText, DollarSign, Building2, User, Calendar, ShieldCheck, Copy } from "lucide-react";
import { Project, ContractorUser, InvoiceLineItem, JobInvoiceEstimate } from "../types";

interface InvoiceEstimateGeneratorModalProps {
  onClose: () => void;
  project?: Project | null;
  contractor?: ContractorUser | null;
  currentUser?: any;
}

export default function InvoiceEstimateGeneratorModal({
  onClose,
  project,
  contractor,
  currentUser,
}: InvoiceEstimateGeneratorModalProps) {
  const [docType, setDocType] = useState<"estimate" | "invoice">("estimate");
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => `INV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [issueDate, setIssueDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  // Contractor info
  const [contractorCompany, setContractorCompany] = useState(
    contractor?.company || currentUser?.company || "Hot Spot Certified Craftsmen LLC"
  );
  const [contractorName, setContractorName] = useState(
    contractor?.fullName || currentUser?.fullName || "Lead Master Contractor"
  );
  const [contractorPhone, setContractorPhone] = useState(
    contractor?.phone || currentUser?.phone || "512-555-0199"
  );
  const [contractorEmail, setContractorEmail] = useState(
    contractor?.email || currentUser?.email || "contractor@hotspotworkshop.com"
  );
  const [contractorLicense, setContractorLicense] = useState("MI-LIC-#4892015-A");
  const [contractorInsurance, setContractorInsurance] = useState("State Farm Liability Policy #91852");

  // Client info
  const [customerName, setCustomerName] = useState(
    project ? `${project.customerFirstName} ${project.customerLastName || ""}`.trim() : "Homeowner Client"
  );
  const [customerEmail, setCustomerEmail] = useState(project?.customerEmail || "homeowner@gmail.com");
  const [customerPhone, setCustomerPhone] = useState(project?.customerPhone || "512-555-0144");
  const [projectTitle, setProjectTitle] = useState(project?.title || "Custom Home Renovation & Repair");
  const [projectAddress, setProjectAddress] = useState(
    project ? `${project.address || "1244 Craft St."}, ${project.city}, ${project.state} ${project.zipCode}` : "1244 Craft St., Austin, TX 78701"
  );

  // Line items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(() => {
    if (project && project.budget) {
      const laborCost = Math.round(project.budget * 0.65);
      const materialCost = Math.round(project.budget * 0.35);
      return [
        {
          id: "item-1",
          description: `Primary Skilled Trade Labor & Installation (${project.title})`,
          category: "labor",
          quantity: 1,
          unitPrice: laborCost,
          total: laborCost,
        },
        {
          id: "item-2",
          description: "High-grade commercial building materials & hardware",
          category: "materials",
          quantity: 1,
          unitPrice: materialCost,
          total: materialCost,
        },
      ];
    }
    return [
      {
        id: "item-1",
        description: "Skilled Trade Labor & Site Preparation",
        category: "labor",
        quantity: 12,
        unitPrice: 75,
        total: 900,
      },
      {
        id: "item-2",
        description: "Primary Building Materials & Heavy Hardware",
        category: "materials",
        quantity: 1,
        unitPrice: 450,
        total: 450,
      },
      {
        id: "item-3",
        description: "Municipal Building Permit Filing & Inspection Fee",
        category: "permits",
        quantity: 1,
        unitPrice: 120,
        total: 120,
      },
    ];
  });

  const [taxRate, setTaxRate] = useState<number>(6.0); // 6% default
  const [depositCredit, setDepositCredit] = useState<number>(() => (project ? Math.round(project.budget * 0.3) : 300));
  const [notesAndTerms, setNotesAndTerms] = useState(
    "All work backed by Hot Spot Workshop 100% Escrow Guarantee. 30-day warranty on craftsmanship. Final payment released upon completion inspection."
  );
  const [signatureName, setSignatureName] = useState(contractorName);
  const [copiedToast, setCopiedToast] = useState(false);

  // Calculations
  const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
  const taxAmount = (subtotal * (taxRate / 100));
  const totalAmount = subtotal + taxAmount;
  const balanceDue = Math.max(0, totalAmount - (docType === "invoice" ? depositCredit : 0));

  const handleAddLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      description: "Additional Trade Scope / Materials",
      category: "labor",
      quantity: 1,
      unitPrice: 100,
      total: 100,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          const qty = Number(field === "quantity" ? value : updated.quantity) || 0;
          const price = Number(field === "unitPrice" ? value : updated.unitPrice) || 0;
          updated.total = Math.round(qty * price * 100) / 100;
        }
        return updated;
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    const summary = `
========================================
HOT SPOT WORKSHOP - ${docType.toUpperCase()} #${invoiceNumber}
========================================
Contractor: ${contractorCompany} (${contractorName})
Phone: ${contractorPhone} | Email: ${contractorEmail}
License: ${contractorLicense}

Client: ${customerName}
Project: ${projectTitle}
Location: ${projectAddress}
Issued: ${issueDate} | Due: ${dueDate}

LINE ITEMS:
${lineItems.map((item) => `- ${item.description} (x${item.quantity} @ $${item.unitPrice}) = $${item.total.toFixed(2)}`).join("\n")}

Subtotal: $${subtotal.toFixed(2)}
Tax (${taxRate}%): $${taxAmount.toFixed(2)}
Total: $${totalAmount.toFixed(2)}
${docType === "invoice" ? `Escrow Deposit Applied: -$${depositCredit.toFixed(2)}\nBalance Due: $${balanceDue.toFixed(2)}` : ""}

Terms: ${notesAndTerms}
Authorized By: ${signatureName} (Verified Contractor)
========================================
`.trim();

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div
        className="bg-white max-w-4xl w-full rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none animate-in zoom-in-95 duration-150"
        id="invoice-generator-modal"
      >
        {/* Header Ribbon (Hidden during print) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm sm:text-base text-white">
                  Jobsite {docType === "estimate" ? "Estimate & Proposal" : "Invoice & Payment Slip"}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  PDF & Print Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Generate, customize, and print official contractor paperwork with escrow guarantee
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              id="print-invoice-btn"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy Text</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy Toast Alert */}
        {copiedToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Invoice summary copied to clipboard! Ready to paste into SMS or email.</span>
            </div>
            <button onClick={() => setCopiedToast(false)} className="text-white font-bold">✕</button>
          </div>
        )}

        {/* Modal Controls Bar (Doc Type Toggle & Meta) */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex bg-zinc-200 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setDocType("estimate")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                docType === "estimate"
                  ? "bg-amber-500 text-slate-950 font-extrabold shadow-xs"
                  : "text-zinc-700 hover:text-zinc-900"
              }`}
            >
              📋 Job Estimate / Bid
            </button>
            <button
              type="button"
              onClick={() => setDocType("invoice")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                docType === "invoice"
                  ? "bg-amber-500 text-slate-950 font-extrabold shadow-xs"
                  : "text-zinc-700 hover:text-zinc-900"
              }`}
            >
              💵 Final Job Invoice
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg">
              <span className="text-zinc-400 font-bold">Doc #:</span>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-24 font-mono font-bold text-zinc-900 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg">
              <span className="text-zinc-400 font-bold">Issue Date:</span>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="font-bold text-zinc-800 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg">
              <span className="text-zinc-400 font-bold">Due Date:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="font-bold text-zinc-800 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Printable Official Paperwork Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-white print:p-0 print:overflow-visible">
          {/* Top Brand & Title Bar */}
          <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-zinc-900">
                  {contractorCompany}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Licensed General Contractor & Specialty Trade Pro
              </p>
              <div className="text-xs text-zinc-600 space-y-0.5 mt-2">
                <p><strong>Contractor:</strong> {contractorName}</p>
                <p><strong>Phone:</strong> {contractorPhone} &bull; <strong>Email:</strong> {contractorEmail}</p>
                <p className="text-[11px] text-zinc-500">
                  <strong>License:</strong> {contractorLicense} &bull; <strong>Insurance:</strong> {contractorInsurance}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block bg-zinc-950 text-white font-black text-sm sm:text-base px-3.5 py-1 rounded-lg tracking-wider uppercase font-mono">
                {docType.toUpperCase()}
              </span>
              <p className="text-xs font-mono font-bold text-zinc-800 mt-2">
                #{invoiceNumber}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Date: {issueDate}
              </p>
              <p className="text-[11px] text-zinc-500">
                Due: {dueDate}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Escrow Protected</span>
              </div>
            </div>
          </div>

          {/* Bill To & Project Info Two Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase font-black text-zinc-400 tracking-wider block">
                CLIENT / PROPERTY OWNER
              </span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Client Full Name"
                className="font-bold text-zinc-900 w-full bg-transparent focus:bg-white rounded px-1 -mx-1"
              />
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone Number"
                className="text-zinc-600 w-full bg-transparent focus:bg-white rounded px-1 -mx-1"
              />
              <input
                type="text"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email Address"
                className="text-zinc-600 w-full bg-transparent focus:bg-white rounded px-1 -mx-1"
              />
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase font-black text-zinc-400 tracking-wider block">
                JOB SITE / PROJECT SCOPE
              </span>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Project Title"
                className="font-bold text-zinc-900 w-full bg-transparent focus:bg-white rounded px-1 -mx-1"
              />
              <input
                type="text"
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                placeholder="Jobsite Address"
                className="text-zinc-600 w-full bg-transparent focus:bg-white rounded px-1 -mx-1"
              />
              <p className="text-[11px] text-amber-700 font-semibold pt-1">
                Platform Verification: Verified Hot Spot Trade Order
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-black text-xs sm:text-sm text-zinc-900 uppercase tracking-wider">
                Scope of Work & Materials Breakdown
              </h4>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 print:hidden cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white font-bold">
                    <th className="p-2.5 sm:p-3">Description & Trade Details</th>
                    <th className="p-2.5 sm:p-3 w-20 text-center">Category</th>
                    <th className="p-2.5 sm:p-3 w-16 text-center">Qty / Hrs</th>
                    <th className="p-2.5 sm:p-3 w-24 text-right">Unit Rate</th>
                    <th className="p-2.5 sm:p-3 w-24 text-right">Total</th>
                    <th className="p-2 w-8 text-center print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium">
                  {lineItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-zinc-50/70"}>
                      <td className="p-2.5 sm:p-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                          className="w-full bg-transparent focus:bg-white rounded px-1.5 py-0.5 font-semibold text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        />
                      </td>
                      <td className="p-2.5 sm:p-3 text-center">
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateLineItem(item.id, "category", e.target.value)}
                          className="bg-transparent text-[11px] font-bold text-zinc-600 rounded focus:outline-hidden"
                        >
                          <option value="labor">Labor</option>
                          <option value="materials">Material</option>
                          <option value="permits">Permit</option>
                          <option value="equipment">Rental</option>
                          <option value="other">Other</option>
                        </select>
                      </td>
                      <td className="p-2.5 sm:p-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(item.id, "quantity", Number(e.target.value))}
                          className="w-14 text-center bg-transparent focus:bg-white rounded px-1 py-0.5 font-bold text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        />
                      </td>
                      <td className="p-2.5 sm:p-3 text-right">
                        <div className="flex items-center justify-end">
                          <span>$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", Number(e.target.value))}
                            className="w-16 text-right bg-transparent focus:bg-white rounded px-1 py-0.5 font-bold text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </td>
                      <td className="p-2.5 sm:p-3 text-right font-bold text-zinc-900 font-mono">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="p-2 text-center print:hidden">
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="text-zinc-400 hover:text-rose-600 transition"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals & Deposit Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            {/* Notes & Terms Box */}
            <div className="flex-1 space-y-2">
              <span className="font-mono text-[10px] uppercase font-black text-zinc-400 tracking-wider block">
                TERMS, GUARANTEE & PAYMENT INSTRUCTIONS
              </span>
              <textarea
                rows={4}
                value={notesAndTerms}
                onChange={(e) => setNotesAndTerms(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-700 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 leading-relaxed"
              />
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Protected by Hot Spot Workshop Escrow Vault. No payment released without homeowner approval.</span>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="w-full sm:w-72 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-600 font-medium">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-zinc-900">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-600 font-medium">
                <div className="flex items-center gap-1">
                  <span>Sales Tax</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-10 text-center bg-white border border-zinc-200 rounded px-1 py-0.2 text-[11px] font-bold text-zinc-800"
                  />
                  <span>%</span>
                </div>
                <span className="font-mono font-bold text-zinc-900">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-zinc-900 font-bold pt-1 border-t border-zinc-200">
                <span>Total Project Value</span>
                <span className="font-mono text-sm">${totalAmount.toFixed(2)}</span>
              </div>

              {docType === "invoice" && (
                <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                  <span>Escrow Deposit Applied</span>
                  <div className="flex items-center">
                    <span>-$</span>
                    <input
                      type="number"
                      value={depositCredit}
                      onChange={(e) => setDepositCredit(Number(e.target.value))}
                      className="w-16 text-right bg-white border border-emerald-300 rounded px-1 font-mono text-emerald-800"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-zinc-950 font-black text-sm pt-2 border-t-2 border-zinc-900 bg-amber-500/10 -mx-4 -mb-4 p-3 rounded-b-2xl">
                <span>{docType === "invoice" ? "Balance Due" : "Estimated Investment"}</span>
                <span className="font-mono text-base sm:text-lg text-zinc-900 font-black">
                  ${balanceDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Digital Signature & Authorization Block */}
          <div className="border-t border-zinc-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                CONTRACTOR AUTHORIZATION
              </span>
              <div className="border-b-2 border-zinc-400 pb-1 pt-4">
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="font-serif italic text-base text-zinc-900 font-bold w-full bg-transparent focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-zinc-500">Authorized Master Tradesman Signature &bull; {issueDate}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                PROPERTY OWNER ACCEPTANCE
              </span>
              <div className="border-b-2 border-zinc-400 pb-1 pt-4">
                <p className="font-serif italic text-base text-zinc-400">
                  [Sign on Mobile Screen or Print to Execute]
                </p>
              </div>
              <p className="text-[10px] text-zinc-500">Client Approval &bull; Milestone Release Agreement</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-4 border-t border-zinc-150 text-[10px] text-zinc-400 font-mono">
            Generated via Hot Spot Workshop Platform &bull; Certified Escrow & Trade Directory Network &bull; Page 1 of 1
          </div>
        </div>
      </div>
    </div>
  );
}
