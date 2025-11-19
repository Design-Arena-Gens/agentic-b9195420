'use client'

import { useEffect } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import Toolbar from './Toolbar'
import Sidebar from './Sidebar'
import Canvas from './Canvas'
import PropertiesPanel from './PropertiesPanel'

export default function Builder() {
  const { isDarkMode } = useBuilderStore()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  )
}
