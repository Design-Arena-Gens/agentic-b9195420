'use client'

import { useState } from 'react'
import { useBuilderStore, Element, ElementType } from '@/store/builderStore'
import {
  Box,
  Type,
  Heading1,
  MousePointer2,
  Image,
  FormInput,
  Menu,
  LayoutGrid,
  Square,
  FileCode,
  Layers,
  ChevronDown,
  ChevronRight,
  Trash2,
  Copy,
} from 'lucide-react'
import { useDrag } from 'react-dnd'

interface ComponentItemProps {
  type: ElementType
  icon: React.ReactNode
  label: string
}

function ComponentItem({ type, icon, label }: ComponentItemProps) {
  const [{ isDragging }, drag] = useDrag<{ type: ElementType }, void, { isDragging: boolean }>(() => ({
    type: 'component',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag as any}
      className={`flex items-center gap-2 p-2 rounded cursor-move hover:bg-[var(--bg-tertiary)] transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Drag to add ${label}`}
    >
      <div className="text-[var(--text-secondary)]" aria-hidden="true">
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  )
}

interface LayerItemProps {
  element: Element
  depth: number
}

function LayerItem({ element, depth }: LayerItemProps) {
  const { selectedElementId, selectElement, deleteElement, duplicateElement } = useBuilderStore()
  const [isExpanded, setIsExpanded] = useState(true)

  const hasChildren = element.children && element.children.length > 0

  const getIcon = (type: ElementType) => {
    const icons: Record<ElementType, React.ReactNode> = {
      container: <Box className="w-4 h-4" />,
      section: <LayoutGrid className="w-4 h-4" />,
      text: <Type className="w-4 h-4" />,
      heading: <Heading1 className="w-4 h-4" />,
      button: <MousePointer2 className="w-4 h-4" />,
      image: <Image className="w-4 h-4" />,
      form: <FormInput className="w-4 h-4" />,
      input: <FormInput className="w-4 h-4" />,
      navbar: <Menu className="w-4 h-4" />,
      carousel: <LayoutGrid className="w-4 h-4" />,
      footer: <Square className="w-4 h-4" />,
    }
    return icons[type] || <Box className="w-4 h-4" />
  }

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <div
        className={`flex items-center gap-1 p-1.5 rounded cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors group ${
          selectedElementId === element.id ? 'bg-[var(--bg-tertiary)]' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => selectElement(element.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-0.5 hover:bg-[var(--border-color)] rounded"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <div className="text-[var(--text-secondary)]" aria-hidden="true">
          {getIcon(element.type)}
        </div>
        <span className="text-sm flex-1">{element.type}</span>
        <div className="hidden group-hover:flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              duplicateElement(element.id)
            }}
            className="p-1 hover:bg-[var(--border-color)] rounded"
            aria-label="Duplicate element"
          >
            <Copy className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteElement(element.id)
            }}
            className="p-1 hover:bg-red-500 hover:text-white rounded"
            aria-label="Delete element"
          >
            <Trash2 className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div role="group">
          {element.children!.map((child) => (
            <LayerItem key={child.id} element={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<'components' | 'layers'>('components')
  const { pages, currentPageId } = useBuilderStore()

  const currentPage = pages.find((p) => p.id === currentPageId)

  const components: ComponentItemProps[] = [
    { type: 'container', icon: <Box className="w-4 h-4" />, label: 'Container' },
    { type: 'section', icon: <LayoutGrid className="w-4 h-4" />, label: 'Section' },
    { type: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
    { type: 'heading', icon: <Heading1 className="w-4 h-4" />, label: 'Heading' },
    { type: 'button', icon: <MousePointer2 className="w-4 h-4" />, label: 'Button' },
    { type: 'image', icon: <Image className="w-4 h-4" />, label: 'Image' },
    { type: 'navbar', icon: <Menu className="w-4 h-4" />, label: 'Navbar' },
    { type: 'form', icon: <FormInput className="w-4 h-4" />, label: 'Form' },
    { type: 'input', icon: <FormInput className="w-4 h-4" />, label: 'Input' },
    { type: 'carousel', icon: <LayoutGrid className="w-4 h-4" />, label: 'Carousel' },
    { type: 'footer', icon: <Square className="w-4 h-4" />, label: 'Footer' },
  ]

  return (
    <aside
      className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col"
      role="complementary"
      aria-label="Components and layers panel"
    >
      <div className="flex border-b border-[var(--border-color)]" role="tablist">
        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'components'
              ? 'bg-[var(--bg-primary)] text-[var(--accent-color)]'
              : 'hover:bg-[var(--bg-tertiary)]'
          }`}
          role="tab"
          aria-selected={activeTab === 'components'}
          aria-controls="components-panel"
        >
          <div className="flex items-center justify-center gap-2">
            <FileCode className="w-4 h-4" aria-hidden="true" />
            Components
          </div>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'layers'
              ? 'bg-[var(--bg-primary)] text-[var(--accent-color)]'
              : 'hover:bg-[var(--bg-tertiary)]'
          }`}
          role="tab"
          aria-selected={activeTab === 'layers'}
          aria-controls="layers-panel"
        >
          <div className="flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" aria-hidden="true" />
            Layers
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'components' && (
          <div id="components-panel" role="tabpanel" className="p-4 space-y-1">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase">
              Basic Elements
            </h3>
            {components.slice(0, 6).map((component) => (
              <ComponentItem key={component.type} {...component} />
            ))}
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] mt-4 mb-2 uppercase">
              Complex Components
            </h3>
            {components.slice(6).map((component) => (
              <ComponentItem key={component.type} {...component} />
            ))}
          </div>
        )}

        {activeTab === 'layers' && (
          <div id="layers-panel" role="tabpanel" className="p-2">
            <div role="tree" aria-label="Element hierarchy">
              {currentPage?.elements.length === 0 ? (
                <div className="text-center text-sm text-[var(--text-secondary)] py-8">
                  No elements yet.
                  <br />
                  Drag components to canvas.
                </div>
              ) : (
                currentPage?.elements.map((element) => (
                  <LayerItem key={element.id} element={element} depth={0} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
