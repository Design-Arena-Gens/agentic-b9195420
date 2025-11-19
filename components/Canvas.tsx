'use client'

import { useBuilderStore, Element, ElementType, Breakpoint } from '@/store/builderStore'
import { useDrop } from 'react-dnd'
import { useState, useRef } from 'react'

const generateId = () => Math.random().toString(36).substr(2, 9)

const defaultStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    minHeight: '100px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 20px',
    backgroundColor: '#ffffff',
    minHeight: '200px',
  },
  text: {
    fontSize: '16px',
    color: '#000000',
    lineHeight: '1.5',
  },
  heading: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#000000',
    marginBottom: '10px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    width: 'fit-content',
  },
  image: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    borderRadius: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#1f2937',
    color: '#ffffff',
  },
  carousel: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    backgroundColor: '#e5e7eb',
    borderRadius: '8px',
    minHeight: '200px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    marginTop: 'auto',
  },
}

const defaultContent = {
  text: 'Edit this text',
  heading: 'Heading Text',
  button: 'Click Me',
  navbar: 'Navigation',
  footer: '© 2024 Your Website',
}

interface RenderElementProps {
  element: Element
  isSelected: boolean
  onSelect: () => void
}

function RenderElement({ element, isSelected, onSelect }: RenderElementProps) {
  const { addElement } = useBuilderStore()

  const [{ isOver }, drop] = useDrop<{ type: ElementType }, void, { isOver: boolean }>(() => ({
    accept: 'component',
    drop: (item: { type: ElementType }, monitor) => {
      if (monitor.didDrop()) return

      const newElement: Element = {
        id: `el-${generateId()}`,
        type: item.type,
        content: defaultContent[item.type as keyof typeof defaultContent] || '',
        styles: defaultStyles[item.type] || {},
        children: [],
        attributes: {
          ariaLabel: `${item.type} element`,
          role: item.type === 'button' ? 'button' : undefined,
        },
      }

      addElement(newElement, element.id)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }))

  const Tag = (() => {
    switch (element.type) {
      case 'heading':
        return 'h1'
      case 'button':
        return 'button'
      case 'image':
        return 'img'
      case 'form':
        return 'form'
      case 'input':
        return 'input'
      case 'navbar':
        return 'nav'
      case 'section':
        return 'section'
      case 'footer':
        return 'footer'
      default:
        return 'div'
    }
  })()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  const elementProps: any = {
    onClick: handleClick,
    style: {
      ...element.styles,
      outline: isSelected ? '2px solid #3b82f6' : isOver ? '2px dashed #3b82f6' : 'none',
      position: 'relative',
      transition: 'outline 0.15s',
    },
    className: "hover:outline hover:outline-2 hover:outline-blue-400/50",
    'aria-label': element.attributes?.ariaLabel,
    role: element.attributes?.role,
  }

  if (element.type === 'image') {
    elementProps.src = element.attributes?.src || 'https://via.placeholder.com/400x300'
    elementProps.alt = element.attributes?.alt || 'Image'
  }

  if (element.type === 'input') {
    elementProps.type = element.attributes?.type || 'text'
    elementProps.placeholder = element.attributes?.placeholder || 'Enter text'
  }

  return (
    <Tag ref={drop as any} {...elementProps}>
      {element.type === 'image' ? null : element.content}
      {element.children?.map((child) => (
        <RenderElement
          key={child.id}
          element={child}
          isSelected={false}
          onSelect={() => {}}
        />
      ))}
    </Tag>
  )
}

export default function Canvas() {
  const { pages, currentPageId, selectedElementId, selectElement, addElement, currentBreakpoint } =
    useBuilderStore()

  const currentPage = pages.find((p) => p.id === currentPageId)

  const [{ isOver }, drop] = useDrop<{ type: ElementType }, void, { isOver: boolean }>(() => ({
    accept: 'component',
    drop: (item: { type: ElementType }, monitor) => {
      if (monitor.didDrop()) return

      const newElement: Element = {
        id: `el-${generateId()}`,
        type: item.type,
        content: defaultContent[item.type as keyof typeof defaultContent] || '',
        styles: defaultStyles[item.type] || {},
        children: [],
        attributes: {
          ariaLabel: `${item.type} element`,
          role: item.type === 'button' ? 'button' : undefined,
        },
      }

      addElement(newElement)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }))

  const getCanvasWidth = () => {
    switch (currentBreakpoint) {
      case 'mobile':
        return '375px'
      case 'tablet':
        return '768px'
      default:
        return '100%'
    }
  }

  return (
    <main
      className="flex-1 bg-[var(--bg-primary)] overflow-auto scrollbar-thin flex justify-center items-start p-8"
      role="main"
      aria-label="Website canvas"
    >
      <div
        ref={drop as any}
        className="bg-white shadow-lg transition-all duration-300"
        style={{
          width: getCanvasWidth(),
          minHeight: '600px',
          outline: isOver ? '2px dashed #3b82f6' : 'none',
        }}
        onClick={() => selectElement(null)}
      >
        {currentPage?.elements.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-gray-400 text-center">
            <div>
              <p className="text-lg font-medium mb-2">Start Building</p>
              <p className="text-sm">Drag components from the sidebar to begin</p>
            </div>
          </div>
        ) : (
          currentPage?.elements.map((element) => (
            <RenderElement
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              onSelect={() => selectElement(element.id)}
            />
          ))
        )}
      </div>
    </main>
  )
}
