import { createContext, useContext, useEffect, useMemo } from "react";

import { useSchoolSettings } from "@/hooks/useSchoolSettings";

const DEFAULT_PRIMARY = "#1D4ED8";
const DEFAULT_SECONDARY = "#FFFFFF";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeHex = (value, fallback) => {
    if (!value) return fallback;

    const raw = String(value).trim().replace(/^#/, "");
    const hex = raw.length === 3
        ? raw.split("").map(char => `${char}${char}`).join("")
        : raw;

    return /^[0-9a-fA-F]{6}$/.test(hex)
        ? `#${hex.toUpperCase()}`
        : fallback;
};

const hexToRgb = (hex) => {
    const normalized = normalizeHex(hex, DEFAULT_PRIMARY).slice(1);

    return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
    };
};

const rgbToHex = ({ r, g, b }) => {
    const channel = value =>
        Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");

    return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
};

const mix = (first, second, amount) => {
    const a = hexToRgb(first);
    const b = hexToRgb(second);

    return rgbToHex({
        r: a.r + (b.r - a.r) * amount,
        g: a.g + (b.g - a.g) * amount,
        b: a.b + (b.b - a.b) * amount,
    });
};

const getLuminance = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const channels = [r, g, b].map(value => {
        const normalized = value / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
};

const getForeground = (hex) =>
    getLuminance(hex) > 0.52 ? "#0F172A" : "#FFFFFF";

const getContrastForeground = (hex) => {
    const luminance = getLuminance(hex);
    return luminance > 0.72 ? "#0F172A" : "#FFFFFF";
};

const buildTheme = (settings) => {
    const primary = normalizeHex(settings?.primary_color, DEFAULT_PRIMARY);
    const secondary = normalizeHex(settings?.secondary_color, DEFAULT_SECONDARY);
    const primaryForeground = getContrastForeground(primary);
    const secondaryForeground = getForeground(secondary);

    return {
        primary,
        secondary,
        primaryForeground,
        secondaryForeground,
        primaryDark: mix(primary, "#000000", 0.16),
        primaryLight: mix(primary, "#FFFFFF", 0.90),
        primarySoft: mix(primary, "#FFFFFF", 0.94),
        secondarySoft: mix(secondary, "#FFFFFF", 0.88),
        ring: mix(primary, "#FFFFFF", 0.35),
    };
};

const applyTheme = (theme) => {
    const root = document.documentElement;

    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primary-foreground", theme.primaryForeground);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--secondary-foreground", theme.secondaryForeground);
    root.style.setProperty("--school-primary", theme.primary);
    root.style.setProperty("--school-primary-dark", theme.primaryDark);
    root.style.setProperty("--school-primary-light", theme.primaryLight);
    root.style.setProperty("--school-primary-soft", theme.primarySoft);
    root.style.setProperty("--school-secondary", theme.secondary);
    root.style.setProperty("--school-secondary-soft", theme.secondarySoft);
    root.style.setProperty("--ring", theme.ring);
    root.style.setProperty("--accent", theme.primarySoft);
    root.style.setProperty("--accent-foreground", theme.primaryDark);

    return () => {
        [
            "--primary",
            "--primary-foreground",
            "--secondary",
            "--secondary-foreground",
            "--school-primary",
            "--school-primary-dark",
            "--school-primary-light",
            "--school-primary-soft",
            "--school-secondary",
            "--school-secondary-soft",
            "--ring",
            "--accent",
            "--accent-foreground",
        ].forEach(property => root.style.removeProperty(property));
    };
};

const SchoolThemeContext = createContext({
    theme: buildTheme(),
    settings: null,
    isLoading: false,
});

export function SchoolThemeProvider({ children }) {
    const { data: settings, isLoading } = useSchoolSettings();

    const theme = useMemo(
        () => buildTheme(settings),
        [settings]
    );

    useEffect(() => applyTheme(theme), [theme]);

    const value = useMemo(() => ({
        theme,
        settings,
        isLoading,
    }), [theme, settings, isLoading]);

    return (
        <SchoolThemeContext.Provider value={value}>
            {children}
        </SchoolThemeContext.Provider>
    );
}

export function useSchoolTheme() {
    return useContext(SchoolThemeContext);
}
