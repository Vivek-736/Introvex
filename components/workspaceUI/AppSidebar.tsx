import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import React from 'react'

const AppSidebar = () => {
    return (
    <Sidebar>
        <SidebarHeader />
        <SidebarContent>
            <SidebarGroup />
            <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
    </Sidebar>
  )
}

export default AppSidebar
