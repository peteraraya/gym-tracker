"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import { ActiveWorkoutBanner } from "@/components/features/workout/ActiveWorkoutBanner";
import { Button } from "@/components/ui/Button";
import {
  Home,
  LayoutDashboard,
  ClipboardList,
  Target,
  TrendingUp,
  Calendar,
  Trophy,
  Lightbulb,
  Calculator,
  User,
  LogOut,
  Menu,
  ChevronDown,
  Dumbbell,
  BookOpen,
  Sparkles,
  Settings,
  BarChart3,
} from "@/components/icons/lucide";
import { useWorkout } from "@/context/WorkoutContext";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const { user, signOut } = useAuth();
  const { activeWorkout } = useWorkout();
  const workoutHref = activeWorkout?.routineId
    ? `/workout/${activeWorkout.routineId}`
    : "/routines";
  const workoutLabel = activeWorkout ? t("activeWorkout") : t("train");

  const isActive = (path: string) => {
    if (!pathname) return false;
    // Root must match exactly
    if (path === "/") return pathname === "/";
    // Match exact path or any nested subpath (e.g. /routines -> /routines/create)
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  // No mostrar navbar en la página de auth
  if (pathname === "/auth") {
    return null;
  }

  return (
    <>
      <ActiveWorkoutBanner />
      <nav className="sticky top-0 z-40 hidden border-b border-zinc-200 bg-white/90 shadow-sm backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/90 lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Desktop Navigation */}
            <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
              <div className="flex min-w-0 items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/50">
                <NavLink
                  href="/routines"
                  icon={ClipboardList}
                  label={t("routines")}
                  isActive={isActive("/routines")}
                  color="blue"
                  data-tour="routines"
                />
                <Link
                  href={workoutHref}
                  aria-label={workoutLabel}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
                >
                  <Dumbbell className="h-4 w-4" />
                  <span>{workoutLabel}</span>
                </Link>
                <DropdownNav
                  label={t("more")}
                  icon={Menu}
                  parentActive={
                    isActive("/") ||
                    isActive("/exercises") ||
                    isActive("/planning") ||
                    isActive("/equipment") ||
                    isActive("/recommended") ||
                    isActive("/glossary") ||
                    isActive("/calculators") ||
                    isActive("/settings") ||
                    isActive("/profile")
                  }
                  items={[
                    { href: "/", label: t("home"), icon: Home },
                    { href: "/exercises", label: t("exercises"), icon: Lightbulb, dataTour: "exercises" },
                    { href: "/planning", label: t("planning"), icon: BarChart3 },
                    { href: "/equipment", label: t("equipment"), icon: Dumbbell },
                    { href: "/recommended", label: t("recommended"), icon: Target, dataTour: "recommended" },
                    { href: "/glossary", label: t("glossary"), icon: BookOpen, dataTour: "glossary" },
                    { href: "/calculators", label: t("calculators"), icon: Calculator, dataTour: "calculators" },
                    { href: "/settings", label: t("settings"), icon: Settings },
                    ...(user ? [{ href: "/profile", label: t("profile"), icon: User, dataTour: "profile" }] : []),
                  ]}
                />
              </div>
              <div>
                <DropdownNav
                  label={t("dashboard")}
                  icon={LayoutDashboard}
                  parentActive={
                    isActive("/dashboard") ||
                    isActive("/progress") ||
                    isActive("/achievements") ||
                    isActive("/sessions") ||
                    isActive("/ai-assistant")
                  }
                  items={[
                    {
                      href: "/dashboard",
                      label: t("dashboard"),
                      icon: LayoutDashboard,
                      dataTour: undefined,
                    },
                    {
                      href: "/progress",
                      label: t("progress"),
                      icon: TrendingUp,
                      dataTour: "progress",
                    },
                    {
                      href: "/achievements",
                      label: t("achievements"),
                      icon: Trophy,
                      dataTour: "achievements",
                    },
                    {
                      href: "/sessions",
                      label: t("sessions"),
                      icon: Calendar,
                      dataTour: "sessions",
                    },
                    {
                      href: "/ai-assistant",
                      label: t("aiAssistant"),
                      icon: Sparkles,
                      dataTour: "ai-assistant",
                    },
                  ]}
                />
              </div>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  aria-label={t("logout")}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

// Componente de enlace para desktop
interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  color: string;
  "data-tour"?: string;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  icon: Icon,
  label,
  isActive,
  color,
  "data-tour": dataTour,
}) => {
  const colorClasses = {
    blue: "from-blue-600 to-blue-500 shadow-blue-500/30",
    cyan: "from-cyan-600 to-cyan-500 shadow-cyan-500/30",
    purple: "from-purple-600 to-purple-500 shadow-purple-500/30",
    emerald: "from-emerald-600 to-emerald-500 shadow-emerald-500/30",
    indigo: "from-indigo-600 to-indigo-500 shadow-indigo-500/30",
    amber: "from-amber-600 to-amber-500 shadow-amber-500/30",
    teal: "from-teal-600 to-teal-500 shadow-teal-500/30",
  };

  return (
    <Link
      href={href}
      data-tour={dataTour}
      className={`px-3 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
        isActive
          ? `bg-linear-to-r ${colorClasses[color as keyof typeof colorClasses]} text-zinc-950 shadow-lg`
          : "text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/50"
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </span>
    </Link>
  );
};

// Dropdown para agrupar submenus en desktop
interface DropdownItem {
  href: string;
  label: string;
  icon: React.ElementType;
  dataTour?: string | undefined;
}

interface DropdownNavProps {
  label: string;
  icon: React.ElementType;
  items: DropdownItem[];
  parentActive: boolean;
}

const DropdownNav: React.FC<DropdownNavProps> = ({
  label,
  icon: Icon,
  items,
  parentActive,
}) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [selectedLabel, setSelectedLabel] = useState(label);

  React.useEffect(() => {
    if (!pathname) return;
    const match = items.find(
      (it) => it.href === pathname || pathname.startsWith(`${it.href}/`),
    );
    if (match) setSelectedLabel(match.label);
    else setSelectedLabel(label);
  }, [pathname, items, label]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`px-3 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
          {
            true: "bg-linear-to-r from-cyan-600 to-cyan-500 text-zinc-950 shadow-lg",
          }[String(parentActive)] ||
          "text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/50"
        }`}
        aria-expanded={open}
      >
        <Icon className="w-4 h-4" />
        <span>{selectedLabel}</span>
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 max-h-[70vh] w-52 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg z-50 dark:border-zinc-800 dark:bg-zinc-900">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              data-tour={it.dataTour}
              onClick={() => {
                setSelectedLabel(it.label);
                setOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300`}
            >
              <it.icon className="w-4 h-4" />
              <span>{it.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
