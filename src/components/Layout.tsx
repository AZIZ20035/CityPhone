import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Settings as SettingsIcon, LogOut, Smartphone, PieChart } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const router = useRouter();

    const navItems = [
        { name: "إضافة فاتورة", href: "/", icon: Smartphone },
        { name: "لوحة التحكم", href: "/control", icon: LayoutDashboard },
        { name: "الإحصائيات", href: "/stats", icon: PieChart },
        { name: "الإعدادات", href: "/settings", icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-base transition-colors duration-300">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-900 text-white shadow-lg shadow-primary-900/20 transition-transform group-hover:scale-105">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-black text-text-main tracking-tight">سيتي فون</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = router.pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative px-4 py-2 text-sm font-bold transition-colors ${isActive ? "text-primary-600" : "text-text-muted hover:text-text-main"
                                            }`}
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            <item.icon className={`h-4 w-4 ${isActive ? "text-primary-600" : "text-text-subtle"}`} />
                                            {item.name}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-active"
                                                className="absolute inset-0 rounded-lg bg-primary-600/5 ring-1 ring-inset ring-primary-600/10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <div className="h-6 w-px bg-border mx-1" />

                        <button
                            onClick={() => signOut()}
                            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-text-muted transition-all hover:bg-danger-bg hover:text-danger-text active:scale-95 lg:h-9 lg:w-9 lg:w-auto lg:px-3 lg:gap-2"
                            title="تسجيل الخروج"
                        >
                            <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                            <span className="hidden lg:inline text-sm font-black">خروج</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={router.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
