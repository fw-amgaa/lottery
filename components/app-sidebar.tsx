"use client";

import * as React from "react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  BookOpen02Icon,
  ComputerTerminalIcon,
  CropIcon,
  LayoutBottomIcon,
  PlusSignCircleIcon,
  RoboticIcon,
  Settings05Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "./ui/button";

// This is sample data.
const data = {
  user: {
    name: "admin",
    email: "bbolorchuluun065@gmail.com",
    avatar: "/logo.jpg",
  },
  teams: [
    {
      name: "Aztai Mongol",
      logo: <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />,
      plan: "Admin",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: <HugeiconsIcon icon={ComputerTerminalIcon} strokeWidth={2} />,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: <HugeiconsIcon icon={RoboticIcon} strokeWidth={2} />,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: <HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} />,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Lottery items",
      url: "/dashboard/lottery-items",
      icon: <HugeiconsIcon icon={CropIcon} strokeWidth={2} />,
    },
    // {
    //   name: "Sales & Marketing",
    //   url: "#",
    //   icon: <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />,
    // },
    // {
    //   name: "Travel",
    //   url: "#",
    //   icon: <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}

        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
