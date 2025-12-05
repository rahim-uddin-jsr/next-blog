'use client';

import { ThemeProvider } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';

export default function ClientThemeWrapper({ children }) {
    return (
        <ThemeProvider>
            <ThemeToggle />
            {children}
        </ThemeProvider>
    );
}
