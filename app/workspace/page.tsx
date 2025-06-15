import React from 'react'
import Chat from '@/components/Chat'

const WorkspacePage = () => {
    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
                <h1 className="text-3xl md:text-4xl font-bold text-center px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-600 shadow-md">
                    Effortless Research with Difras
                </h1>
                <Chat />
            </div>
        </div>
    )
}

export default WorkspacePage
