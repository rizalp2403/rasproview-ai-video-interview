"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconVideo,
  IconUserCircle,
  IconBrain,
  IconSettingsAutomation,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Interviews",
      url: "/dashboard/interviews",
      icon: IconVideo,
    },
    {
      title: "Candidates",
      url: "/dashboard/candidates",
      icon: IconUserCircle,
    },
    {
      title: "AI Analysis",
      url: "/dashboard/analysis",
      icon: IconBrain,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
  ],
  navClouds: [
    {
      title: "Interviews",
      icon: IconVideo,
      isActive: true,
      url: "/dashboard/interviews",
      items: [
        {
          title: "All Interviews",
          url: "/dashboard/interviews",
        },
        {
          title: "Create Interview",
          url: "/dashboard/interviews/create",
        },
        {
          title: "Templates",
          url: "/dashboard/interviews/templates",
        },
      ],
    },
    {
      title: "Submissions",
      icon: IconFileDescription,
      url: "/dashboard/submissions",
      items: [
        {
          title: "Recent",
          url: "/dashboard/submissions",
        },
        {
          title: "Reviewed",
          url: "/dashboard/submissions?status=reviewed",
        },
        {
          title: "Pending",
          url: "/dashboard/submissions?status=pending",
        },
      ],
    },
    {
      title: "AI Screening",
      icon: IconFileAi,
      url: "/dashboard/ai-screening",
      items: [
        {
          title: "Analysis Queue",
          url: "/dashboard/analysis/queue",
        },
        {
          title: "Results",
          url: "/dashboard/analysis/results",
        },
        {
          title: "Settings",
          url: "/dashboard/analysis/settings",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Automation",
      url: "/dashboard/automation",
      icon: IconSettingsAutomation,
    },
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Candidate Database",
      url: "/dashboard/candidates",
      icon: IconUserCircle,
    },
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
    {
      name: "API Docs",
      url: "/dashboard/docs",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  
  const userData = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email,
    avatar: session.user.image || "/codeguide-logo.png",
  } : {
    name: "Guest",
    email: "guest@example.com", 
    avatar: "/codeguide-logo.png",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <Image src="/rasproview-logo.png" alt="RasproView AI" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-semibold font-parkinsans">RasproView AI</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavDocuments items={staticData.documents} />
        <NavSecondary items={staticData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
