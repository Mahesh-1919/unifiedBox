"use client";

const SESSION_KEY = "unified-inbox-session";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedSession {
  user: any;
  timestamp: number;
}

export const sessionCache = {
  get(): any | null {
    if (typeof window === "undefined") return null;
    
    try {
      const cached = localStorage.getItem(SESSION_KEY);
      if (!cached) return null;
      
      const { user, timestamp }: CachedSession = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      
      return user;
    } catch {
      return null;
    }
  },
  
  set(user: any): void {
    if (typeof window === "undefined") return;
    
    const cached: CachedSession = {
      user,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(cached));
  },
  
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
  },
  
  isValid(): boolean {
    return this.get() !== null;
  },
};