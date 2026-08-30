import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, Smartphone, Globe } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear app state keys to recover from any corrupted state
      const keysToClear = [
        "hsws_currentUser",
        "hsws_projects",
        "hsws_bids",
        "hsws_contractors",
        "hsws_emailLogs",
        "hsws_private_messages",
        "hsws_allCities",
        "hsws_seniorMode",
        "hsws_dismiss_universal_banner",
      ];
      keysToClear.forEach((key) => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch {}
      });
    } catch {}
    this.setState({ hasError: false, error: undefined });
    window.location.href = window.location.origin + window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Globe className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                Hot Spot Workshop
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Reconnecting application and restoring clean state.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-zinc-950/90 border border-red-500/30 rounded-2xl p-3 text-left space-y-1 max-h-32 overflow-y-auto">
                <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Diagnostic Notice</span>
                <p className="text-[11px] font-mono text-red-300 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>Instant Auto-Recovery Protocol</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Click below to automatically restore fresh application data and reload the workspace.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restore Fresh App & Launch</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                Reload Webpage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
