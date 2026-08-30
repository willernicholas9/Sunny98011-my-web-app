/**
 * Universal Browser & Mobile Device Compatibility Polyfills & Safety Guards
 * Ensures Hot Spot Workshop works seamlessly on ANY device, ANY browser, and ANY iOS/Android version with 1-click access.
 */

// 1. globalThis polyfill
if (typeof globalThis === "undefined") {
  (window as any).globalThis = window;
}

// 2. crypto.randomUUID polyfill for Safari < 15.4 / iOS < 15.4 / older browsers
if (typeof window !== "undefined") {
  if (!window.crypto) {
    (window as any).crypto = {};
  }
  if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = function () {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }) as `${string}-${string}-${string}-${string}-${string}`;
    };
  }
}

// 3. Array.prototype.at polyfill for Safari < 15.4 / iOS < 15.4
if (!Array.prototype.at) {
  Array.prototype.at = function (n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}

// 4. String.prototype.replaceAll polyfill for Safari < 13.1 / iOS < 13.4
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (str: any, newSubstr: any) {
    if (Object.prototype.toString.call(str).toLowerCase() === "[object regexp]") {
      return this.replace(str, newSubstr);
    }
    return this.replace(new RegExp(str, "g"), newSubstr);
  };
}

// 5. Object.hasOwn polyfill for Safari < 15.4 / iOS < 15.4
if (!(Object as any).hasOwn) {
  (Object as any).hasOwn = function (obj: any, prop: string | number | symbol) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}

// 6. Safe LocalStorage memory fallback for Safari Private Browsing mode
// In older iOS Safari Private Mode, localStorage.setItem throws QuotaExceededError
export class SafeStorage {
  private static memoryFallback: Record<string, string> = {};

  public static getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Fallback to memory
    }
    return this.memoryFallback[key] || null;
  }

  public static setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Memory fallback for Safari private mode
    }
    this.memoryFallback[key] = value;
  }

  public static removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
    delete this.memoryFallback[key];
  }
}

// 7. Mobile Viewport Height unit fix for iOS Safari dynamic toolbar
if (typeof window !== "undefined") {
  const updateVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };
  updateVh();
  window.addEventListener("resize", updateVh, { passive: true });
  window.addEventListener("orientationchange", updateVh, { passive: true });
}

export default SafeStorage;
