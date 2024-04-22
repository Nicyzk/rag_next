import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge classes with tailwind-merge with clsx full feature */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function collapasMenu() { 
  const menu = document.getElementById("menu");  
  menu?.classList.add("menu__collapse");

  const layout = document.getElementById("layout");
  layout?.classList.add("side-collapse");
}

export function expandMenu() {
  const menu = document.getElementById("menu");
  menu?.classList.remove("menu__collapse");

  const layout = document.getElementById("layout");
  layout?.classList.remove("side-collapse");
}
