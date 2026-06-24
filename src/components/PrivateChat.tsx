import React, { useState, useEffect, useRef, useMemo } from "react";
import { PrivateChatMessage, ContractorUser, CustomerUser } from "../types";
import { MessageSquare, Send, X, HardHat, User, Sparkles, MessageCircle, Info, Search, ShieldCheck } from "lucide-react";

interface PrivateChatProps {
  currentUser: any;
  contractors: ContractorUser[];
  customers: CustomerUser[];
  messages: PrivateChatMessage[];
  onSendMessage: (
    recipientId: string,
    recipientName: string,
    recipientRole: "customer" | "contractor",
    text: string
  ) => void;
  activeRecipientId: string | null;
  setActiveRecipientId: (id: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function PrivateChat({
  currentUser,
  contractors,
  customers,
  messages,
  onSendMessage,
  activeRecipientId,
  setActiveRecipientId,
  isOpen,
  setIsOpen,
}: PrivateChatProps) {
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"threads" | "new_chat">("threads");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages or active recipient change
  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeRecipientId, isOpen]);

  // Combine contractors & customers to select candidates for new chats
  const chatCandidates = useMemo(() => {
    if (!currentUser) return [];
    
    // Contractors can chat with customers
    if (currentUser.role === "contractor") {
      return customers
        .filter((cust) => cust.id !== currentUser.id)
        .map((cust) => ({
          id: cust.id,
          fullName: cust.fullName,
          role: "customer" as const,
          subtext: `Customer in ${cust.city}`,
          avatarUrl: "",
        }));
    }
    
    // Customers can chat with contractors
    return contractors
      .filter((con) => con.id !== currentUser.id)
      .map((con) => ({
        id: con.id,
        fullName: con.fullName,
        role: "contractor" as const,
        subtext: con.company || `Contractor in ${con.city}`,
        avatarUrl: con.avatarUrl,
      }));
  }, [currentUser, contractors, customers]);

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    if (!searchTerm.trim()) return chatCandidates;
    return chatCandidates.filter((cand) =>
      cand.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chatCandidates, searchTerm]);

  // Group messages into distinct users you have chatted with
  const activeThreads = useMemo(() => {
    if (!currentUser) return [];

    const threadMap: Record<
      string,
      {
        recipientId: string;
        recipientName: string;
        recipientRole: "customer" | "contractor";
        lastMessage: PrivateChatMessage;
      }
    > = {};

    messages.forEach((msg) => {
      const isSender = msg.senderId === currentUser.id;
      const isRecipient = msg.recipientId === currentUser.id;

      if (isSender) {
        threadMap[msg.recipientId] = {
          recipientId: msg.recipientId,
          recipientName: msg.recipientName,
          recipientRole: msg.recipientRole,
          lastMessage: msg,
        };
      } else if (isRecipient) {
        threadMap[msg.senderId] = {
          recipientId: msg.senderId,
          recipientName: msg.senderName,
          recipientRole: msg.senderRole,
          lastMessage: msg,
        };
      }
    });

    return Object.values(threadMap).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );
  }, [messages, currentUser]);

  // Find info about the current active chatting participant
  const activeChatPartner = useMemo(() => {
    if (!activeRecipientId) return null;
    
    // Try to find in contractors
    const con = contractors.find((c) => c.id === activeRecipientId);
    if (con) return { ...con, role: "contractor" as const };
    
    // Try to find in customers
    const cust = customers.find((c) => c.id === activeRecipientId);
    if (cust) return { ...cust, role: "customer" as const, company: undefined, avatarUrl: undefined };

    // Fallback: search threads for name
    const foundThread = activeThreads.find((t) => t.recipientId === activeRecipientId);
    if (foundThread) {
      return {
        id: activeRecipientId,
        fullName: foundThread.recipientName,
        role: foundThread.recipientRole,
        company: undefined,
        city: "Local",
        avatarUrl: undefined,
      };
    }

    return null;
  }, [activeRecipientId, contractors, customers, activeThreads]);

  // Filter messages for current active thread
  const activeThreadMessages = useMemo(() => {
    if (!currentUser || !activeRecipientId) return [];
    return messages.filter(
      (msg) =>
        (msg.senderId === currentUser.id && msg.recipientId === activeRecipientId) ||
        (msg.senderId === activeRecipientId && msg.recipientId === currentUser.id)
    );
  }, [messages, currentUser, activeRecipientId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !activeRecipientId || !activeChatPartner) return;

    onSendMessage(
      activeRecipientId,
      activeChatPartner.fullName,
      activeChatPartner.role,
      inputText.trim()
    );
    setInputText("");
  };

  // Helper component for user Avatar
  const Avatar = ({ name, url, role }: { name: string; url?: string; role: string }) => {
    if (url) {
      return (
        <img
          src={url}
          alt={name}
          className="w-8 h-8 rounded-xl object-cover border border-zinc-200"
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border font-bold text-xs ${
        role === "contractor"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-cyan-50 text-cyan-700 border-cyan-200"
      }`}>
        {role === "contractor" ? (
          <HardHat className="w-4 h-4 text-amber-600" />
        ) : (
          <User className="w-4 h-4 text-cyan-600" />
        )}
      </div>
    );
  };

  if (!isOpen) {
    // Hidden state: render floating button with total threads list counting
    return null;
  }

  return (
    <div
      className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden z-40 animate-in slide-in-from-bottom-5 duration-150"
      id="private-messages-global-console"
    >
      {/* Header bar */}
      <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-amber-500" />
          <div>
            <div className="font-display font-black text-sm tracking-tight leading-none text-zinc-100">
              Private Workspace Messenger
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">
              Secure 1-to-1 client-contractor text channel
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          title="Minimize Chat Workspace"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auth Guard banner details */}
      {!currentUser ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <MessageSquare className="w-12 h-12 text-zinc-300" />
          <h3 className="text-sm font-bold text-zinc-800 font-display">Sign In Required to Message</h3>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">
            Authenticate using the top navbar Sign In panel or toggle John Doe or Mike Smith using the sandbox simulator bar to test private communications!
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Active Thread view */}
          {activeRecipientId && activeChatPartner ? (
            <div className="flex-1 flex flex-col min-h-0 bg-zinc-50">
              
              {/* Back to threads header list */}
              <div className="bg-white border-b border-zinc-200/80 p-3 flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveRecipientId(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 font-bold flex items-center gap-1 transition"
                >
                  ← Back
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <Avatar
                    name={activeChatPartner.fullName}
                    url={(activeChatPartner as any).avatarUrl}
                    role={activeChatPartner.role}
                  />
                  <div className="truncate shrink-1 max-w-[170px]">
                    <div className="font-bold text-xs text-zinc-900 leading-none truncate">
                      {activeChatPartner.fullName}
                    </div>
                    <span className="text-[9px] text-zinc-400 font-medium block truncate">
                      {(activeChatPartner as any).company || `${activeChatPartner.role === "contractor" ? "Licensed Contractor" : "Project Customer"} · ${activeChatPartner.city}`}
                    </span>
                  </div>
                </div>
                
                {/* Security verification badge */}
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 border border-emerald-200 rounded-full select-none shrink-0" title="Secured escrow contact channel">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Escrow Safe
                </span>
              </div>

              {/* Message flow lists */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {activeThreadMessages.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <span className="text-xl">🤝</span>
                    <h4 className="text-xs font-bold text-zinc-700">No messages yet with {activeChatPartner.fullName}</h4>
                    <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
                      Send a message to discuss project specifications, scheduling, or contract estimates privately.
                    </p>
                  </div>
                ) : (
                  activeThreadMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    const dateObj = new Date(msg.createdAt);
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
                      >
                        {!isMe && (
                          <div className="shrink-0 mb-1">
                            <Avatar
                              name={msg.senderName}
                              url={msg.senderRole === "contractor" ? (activeChatPartner as any).avatarUrl : undefined}
                              role={msg.senderRole}
                            />
                          </div>
                        )}
                        <div className="max-w-[70%] space-y-0.5">
                          <div
                            className={`p-3 rounded-2xl text-xs leading-normal font-medium ${
                              isMe
                                ? "bg-zinc-900 text-zinc-100 rounded-br-none"
                                : "bg-white text-zinc-805 border border-zinc-200 rounded-bl-none shadow-3xs"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className={`block text-[8px] text-zinc-400 font-mono ${isMe ? "text-right" : "text-left"}`}>
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Chat Input Area */}
              <form
                onSubmit={handleSend}
                className="bg-white border-t border-zinc-200 p-3 flex gap-2 shrink-0 items-center"
              >
                <input
                  type="text"
                  placeholder="Type a secure message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-550 focus:outline-hidden text-zinc-900 focus:bg-white"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-9 h-9 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 text-white rounded-xl transition duration-150 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                </button>
              </form>

            </div>
          ) : (
            /* Threads & Search selection view */
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              
              {/* Menu Tabs switcher */}
              <div className="grid grid-cols-2 border-b border-zinc-150 p-1 bg-zinc-50 font-semibold text-xs shrink-0 text-center">
                <button
                  onClick={() => setActiveTab("threads")}
                  className={`py-2 rounded-lg transition ${
                    activeTab === "threads"
                      ? "bg-white text-zinc-900 shadow-3xs border border-zinc-200/50"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  💬 Current Chats ({activeThreads.length})
                </button>
                <button
                  onClick={() => setActiveTab("new_chat")}
                  className={`py-2 rounded-lg transition ${
                    activeTab === "new_chat"
                      ? "bg-white text-zinc-900 shadow-3xs border border-zinc-200/50"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  🔍 New Chat Outlets
                </button>
              </div>

              {/* List space */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {activeTab === "threads" ? (
                  activeThreads.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 space-y-3">
                      <span className="text-3xl">📭</span>
                      <h4 className="text-xs font-bold text-zinc-650">No Active Conversations</h4>
                      <p className="text-[10px] leading-relaxed max-w-xs mx-auto text-zinc-450">
                        Discuss contracts with available specialists. Start a conversation from the "Contractors Directory" tab, from placed bids, or use the "New Chat Outlets" finder.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100">
                      {activeThreads.map((thread) => {
                        const recCon = contractors.find((c) => c.id === thread.recipientId);
                        const displayAvatar = recCon?.avatarUrl;

                        return (
                          <button
                            key={thread.recipientId}
                            onClick={() => setActiveRecipientId(thread.recipientId)}
                            className="w-full text-left p-3.5 hover:bg-zinc-50 transition flex items-center justify-between gap-3 border-none bg-transparent"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <Avatar
                                name={thread.recipientName}
                                url={displayAvatar}
                                role={thread.recipientRole}
                              />
                              <div className="min-w-0 flex-1">
                                <span className={`text-[10px] font-bold tracking-widest font-mono uppercase px-1.5 py-0.25 rounded ${
                                  thread.recipientRole === "contractor"
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-cyan-100 text-cyan-900"
                                }`}>
                                  {thread.recipientRole}
                                </span>
                                <div className="font-extrabold text-xs text-zinc-900 leading-none truncate mt-1">
                                  {thread.recipientName}
                                </div>
                                <p className="text-[11px] text-zinc-500 leading-tight truncate mt-1">
                                  {thread.lastMessage.senderId === currentUser.id ? "You: " : ""}
                                  {thread.lastMessage.text}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right shrink-0">
                              <span className="text-[8px] font-mono text-zinc-400 font-bold block">
                                {new Date(thread.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : (
                  /* New Chat Finder search space */
                  <div className="p-3.5 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder={`Search ${currentUser.role === 'contractor' ? 'customers' : 'contractors'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-amber-550"
                      />
                    </div>

                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                      Suggested Participants
                    </div>

                    {filteredCandidates.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic text-center py-4">No matching partners found...</p>
                    ) : (
                      <div className="space-y-1 max-h-72 overflow-y-auto">
                        {filteredCandidates.map((cand) => (
                          <button
                            key={cand.id}
                            onClick={() => {
                              setActiveRecipientId(cand.id);
                              setActiveTab("threads");
                              setSearchTerm("");
                            }}
                            className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-50 transition flex items-center gap-2.5 bg-transparent border-none"
                          >
                            <Avatar
                              name={cand.fullName}
                              url={cand.avatarUrl}
                              role={cand.role}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-extrabold text-xs text-zinc-900 truncate leading-none">
                                {cand.fullName}
                              </div>
                              <span className="text-[10px] text-zinc-500 truncate block">
                                {cand.subtext}
                              </span>
                            </div>
                            <span className="text-[8px] font-bold tracking-widest font-mono uppercase bg-zinc-100 text-zinc-650 px-1.5 py-0.5 rounded border border-zinc-250">
                              Chat ➔
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
