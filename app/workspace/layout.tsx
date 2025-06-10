import React from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from '@/components/workspaceUI/AppSidebar'

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <SidebarProvider>
                <AppSidebar />
                <SidebarTrigger />
                {children}
            </SidebarProvider>
        </div>
    )
}

export default WorkspaceLayout
