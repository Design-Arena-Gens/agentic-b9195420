'use client'

import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Undo,
  Redo,
  Moon,
  Sun,
  Globe,
  Settings,
  Save,
  FileText,
  Plus,
} from 'lucide-react'
import { useBuilderStore, Breakpoint } from '@/store/builderStore'
import { useState } from 'react'

export default function Toolbar() {
  const {
    currentBreakpoint,
    setBreakpoint,
    isDarkMode,
    toggleDarkMode,
    undo,
    redo,
    pages,
    currentPageId,
    addPage,
    setCurrentPage,
  } = useBuilderStore()

  const [showPageMenu, setShowPageMenu] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [newPageName, setNewPageName] = useState('')

  const breakpointIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  }

  const currentPage = pages.find((p) => p.id === currentPageId)

  const handleAddPage = () => {
    if (newPageName.trim()) {
      addPage(newPageName)
      setNewPageName('')
      setShowPageMenu(false)
    }
  }

  const handleExport = () => {
    const exportData = {
      pages: pages.map((page) => ({
        ...page,
        exportedAt: new Date().toISOString(),
      })),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'website-export.json'
    a.click()
  }

  return (
    <header
      className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between px-4 z-50"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[var(--accent-color)]" aria-hidden="true" />
          <h1 className="text-lg font-bold">NoCode Builder</h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowPageMenu(!showPageMenu)}
            className="px-3 py-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] flex items-center gap-2 text-sm transition-colors"
            aria-label="Page management"
            aria-expanded={showPageMenu}
            aria-haspopup="true"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>{currentPage?.name || 'Select Page'}</span>
          </button>

          {showPageMenu && (
            <div
              className="absolute top-full left-0 mt-1 w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded shadow-lg z-50"
              role="menu"
            >
              <div className="p-2 border-b border-[var(--border-color)]">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
                    placeholder="New page name"
                    className="flex-1 px-2 py-1 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                    aria-label="New page name"
                  />
                  <button
                    onClick={handleAddPage}
                    className="px-2 py-1 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
                    aria-label="Add page"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      setCurrentPage(page.id)
                      setShowPageMenu(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-tertiary)] transition-colors ${
                      page.id === currentPageId ? 'bg-[var(--bg-tertiary)]' : ''
                    }`}
                    role="menuitem"
                  >
                    {page.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded p-1">
          {(['desktop', 'tablet', 'mobile'] as Breakpoint[]).map((bp) => {
            const Icon = breakpointIcons[bp]
            return (
              <button
                key={bp}
                onClick={() => setBreakpoint(bp)}
                className={`p-2 rounded transition-colors ${
                  currentBreakpoint === bp
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'hover:bg-[var(--bg-secondary)]'
                }`}
                aria-label={`Switch to ${bp} view`}
                aria-pressed={currentBreakpoint === bp}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </button>
            )
          })}
        </div>

        <div className="w-px h-6 bg-[var(--border-color)]" aria-hidden="true" />

        <button
          onClick={undo}
          className="p-2 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Undo"
        >
          <Undo className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={redo}
          className="p-2 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Redo"
        >
          <Redo className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="w-px h-6 bg-[var(--border-color)]" aria-hidden="true" />

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="p-2 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Preview mode"
          aria-pressed={showPreview}
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        <div className="w-px h-6 bg-[var(--border-color)]" aria-hidden="true" />

        <button
          onClick={handleExport}
          className="p-2 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Save project"
        >
          <Save className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          className="px-4 py-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors font-medium"
          aria-label="Publish website"
        >
          Publish
        </button>
      </div>
    </header>
  )
}
