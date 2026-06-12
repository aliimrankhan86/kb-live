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
      style={{ minHeight: 44 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--borderSubtle)] px-3 py-1 text-xs font-medium text-[var(--textMuted)] transition-all duration-200 hover:border-[var(--borderStrong)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--focusRing)] focus-visible:outline-offset-2"
    >
      {isLight
        ? <Moon size={14} aria-hidden="true" />
        : <Sun size={14} aria-hidden="true" />
      }
      <span>{isLight ? 'Dark' : 'Light'}</span>
    </button>
  );
}
