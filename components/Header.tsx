"use client";
import { LanguageSelect, ThemeToggle } from "./HeaderControls";

export function HeaderControls() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <LanguageSelect />
      <ThemeToggle />
    </div>
  );
}
