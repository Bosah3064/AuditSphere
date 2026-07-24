import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  FileCheck2,
  CheckSquare,
  BarChart3,
  Bot,
  Settings,
  ShieldAlert,
  Users,
  Building2,
  FileText,
  FileBarChart,
  Table,
  Activity,
  Inbox,
  Target
} from "lucide-react"

export const navigationConfig = {
  mainNav: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ]
    },
    {
      title: "Engagement Management",
      items: [
        {
          title: "Clients",
          href: "/clients",
          icon: Users,
        },
        {
          title: "Trial Balance",
          href: "/trial-balance",
          icon: FileCheck2,
        },
        {
          title: "Materiality & Sampling",
          href: "/materiality",
          icon: Target,
        },
        {
          title: "PBC Requests",
          href: "/pbc-requests",
          icon: Inbox,
        },
      ]
    },
    {
      title: "Audit Management",
      items: [
        {
          title: "Audits",
          href: "/audits",
          icon: ClipboardList,
        },
        {
          title: "Findings",
          href: "/findings",
          icon: AlertTriangle,
        },
        {
          title: "Workpapers",
          href: "/workpapers",
          icon: FileText,
        }
      ]
    },
    {
      title: "Risk & Compliance",
      items: [
        {
          title: "Risks",
          href: "/risks",
          icon: ShieldAlert,
        },
        {
          title: "Controls",
          href: "/controls",
          icon: CheckSquare,
        },
        {
          title: "Risk Control Matrix",
          href: "/rcm",
          icon: Table,
        }
      ]
    },
    {
      title: "System Integrations",
      items: [
        {
          title: "Integrations Hub",
          href: "/integrations",
          icon: Building2,
        }
      ]
    },
    {
      title: "Reporting",
      items: [
        {
          title: "Reports",
          href: "/reports",
          icon: FileBarChart,
        }
      ]
    },
    {
      title: "AI & Analytics",
      items: [
        {
          title: "AI Assistant",
          href: "/ai-assistant",
          icon: Bot,
        },
        {
          title: "Analytics",
          href: "/analytics",
          icon: BarChart3,
        },
        {
          title: "Continuous Monitoring",
          href: "/monitoring",
          icon: Activity,
        }
      ]
    },
    {
      title: "Administration",
      items: [
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
        }
      ]
    }
  ],
  settingsNav: [
    {
      title: "Profile",
      href: "/settings/profile",
      icon: Users,
    },
    {
      title: "Organization",
      href: "/settings/organization",
      icon: Building2,
    },
    {
      title: "Team",
      href: "/settings/team",
      icon: Users,
    },
    {
      title: "Security",
      href: "/settings/security",
      icon: ShieldAlert,
    }
  ]
}
