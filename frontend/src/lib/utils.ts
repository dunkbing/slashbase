import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

declare var window: any;

export const openInBrowser = (url: string) => {
  window.runtime.BrowserOpenURL(url);
};
