import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>("system");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (newTheme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
            localStorage.removeItem("theme");
        } else {
            root.classList.add(newTheme);
            localStorage.setItem("theme", newTheme);
        }
        setTheme(newTheme);
    };

    const toggleTheme = () => {
        if (theme === "light") applyTheme("dark");
        else if (theme === "dark") applyTheme("system");
        else applyTheme("light");
    };

    if (!mounted) {
        return (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated border border-border">
                <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
            </div>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface transition-all hover:bg-surface-elevated hover:border-border-strong active:scale-95 lg:h-9 lg:w-9"
            title="تغيير المظهر"
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === "light" && (
                    <motion.div
                        key="light"
                        initial={{ y: 20, opacity: 0, rotate: 45 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: -45 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun className="h-[18px] w-[18px] text-amber-500" />
                    </motion.div>
                )}
                {theme === "dark" && (
                    <motion.div
                        key="dark"
                        initial={{ y: 20, opacity: 0, rotate: 45 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: -45 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon className="h-[18px] w-[18px] text-blue-400" />
                    </motion.div>
                )}
                {theme === "system" && (
                    <motion.div
                        key="system"
                        initial={{ y: 20, opacity: 0, rotate: 45 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: -45 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Monitor className="h-[18px] w-[18px] text-text-muted" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle indicator for system mode */}
            {theme === "system" && (
                <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-primary-600" />
            )}
        </button>
    );
}
