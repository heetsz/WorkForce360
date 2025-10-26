"use client"

import * as React from "react"
import {
  BookOpen,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  UserCog,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { useState, useEffect } from "react"
import axios from "axios"

export function AppSidebar(props) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL
    const fetchProtectedData = async () => {
      try {
        const response = await axios.get(`${base_url}/me`, {
          withCredentials: true,
        })
        setProfile(response.data)
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }

    fetchProtectedData()
  }, [])

  if (!profile) return null

  const data = {
    user: {
      name: profile.name,
      email: profile.email,
      avatar: `https://avatar.iran.liara.run/username?username=${profile.name}&background=0A74DA&color=FFFFFF&length=2`,
    },
    teams: [
      {
        name: "WorkForce360",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
    ],
    navMain: [
      {
        title: "Employees",
        url: "/dashboard",
        icon: Users,
        isActive: true,
        items: [
          { title: "View Employees", url: "/dashboard/view-employees" },
          { title: "Employees Attendance", url: "/dashboard/employees-attendance" },
          { title: "Performance", url: "/dashboard/performance" },
        ],
      },
      {
        title: "Teams",
        url: " /dashboard",
        icon: UserCog,
        items: [
          { title: "Research & Development", url: " /dashboard" },
          { title: "Sales & Marketing", url: " /dashboard" },
          { title: "Customer Support", url: " /dashboard" },
        ],
      },
      // {
      //   title: "Documentation",
      //   url: " /dashboard",
      //   icon: BookOpen,
      //   items: [
      //     { title: "Introduction", url: " /dashboard" },
      //     { title: "Get Started", url: " /dashboard" },
      //     { title: "Tutorials", url: " /dashboard" },
      //     { title: "Changelog", url: " /dashboard" },
      //   ],
      // },
      // {
      //   title: "Settings",
      //   url: " /dashboard",
      //   icon: Settings2,
      //   items: [
      //     { title: "General", url: " /dashboard" },
      //     { title: "Team", url: " /dashboard" },
      //     { title: "Billing", url: " /dashboard" },
      //     { title: "Limits", url: " /dashboard" },
      //   ],
      // },
    ],
    projects: [
      { name: "Design Engineering", url: " /dashboard", icon: Frame },
      { name: "High Frequency Trading", url: " /dashboard", icon: PieChart },
      { name: "Cloud Platform & Infrastructure", url: " /dashboard", icon: Map },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
