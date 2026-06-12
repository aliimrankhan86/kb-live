'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      data-testid="desktop-theme-toggle"
      style={{ minWidth: 44, minHeight: 44 }}
      className="inline-flex items-center justify-center rounded-[var(--radiusMd)] border border-transparent text-[var(--text)] transition-all duration-200 hover:border-[var(--borderSubtle)] hover:bg-[rgba(255,255,255,0.05)] focus-visible:outline-2 focus-visible:outline-[var(--focusRing)] focus-visible:outline-offset-2"
    >
      {isLight
        ? <Moon size={18} aria-hidden="true" />
        : <Sun size={18} aria-hidden="true" />
      }
    </button>
  );
}
