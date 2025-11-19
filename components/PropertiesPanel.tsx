'use client'

import { useBuilderStore } from '@/store/builderStore'
import { useState } from 'react'
import {
  Type,
  Layout,
  Palette,
  Box,
  Sparkles,
  Settings,
  Code,
  Search,
  ChevronDown,
} from 'lucide-react'

export default function PropertiesPanel() {
  const { pages, currentPageId, selectedElementId, updateElement, updatePageSEO } =
    useBuilderStore()
  const [activeSection, setActiveSection] = useState<string>('styles')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['typography', 'layout', 'background', 'border'])
  )

  const currentPage = pages.find((p) => p.id === currentPageId)

  const findElement = (elements: any[], id: string): any => {
    for (const el of elements) {
      if (el.id === id) return el
      if (el.children) {
        const found = findElement(el.children, id)
        if (found) return found
      }
    }
    return null
  }

  const selectedElement = selectedElementId
    ? findElement(currentPage?.elements || [], selectedElementId)
    : null

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(group)) {
      newExpanded.delete(group)
    } else {
      newExpanded.add(group)
    }
    setExpandedGroups(newExpanded)
  }

  const StyleInput = ({
    label,
    property,
    type = 'text',
    options,
  }: {
    label: string
    property: string
    type?: string
    options?: string[]
  }) => {
    const value = selectedElement?.styles?.[property] || ''

    return (
      <div className="mb-3">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          {label}
        </label>
        {options ? (
          <select
            value={value}
            onChange={(e) =>
              updateElement(selectedElementId!, {
                styles: { ...selectedElement.styles, [property]: e.target.value },
              })
            }
            className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          >
            <option value="">Default</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) =>
              updateElement(selectedElementId!, {
                styles: { ...selectedElement.styles, [property]: e.target.value },
              })
            }
            className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            placeholder={type === 'color' ? '#000000' : ''}
          />
        )}
      </div>
    )
  }

  const StyleGroup = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const isExpanded = expandedGroups.has(title.toLowerCase())

    return (
      <div className="border-b border-[var(--border-color)] last:border-b-0">
        <button
          onClick={() => toggleGroup(title.toLowerCase())}
          className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-expanded={isExpanded}
        >
          <span className="text-sm font-semibold">{title}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {isExpanded && <div className="px-3 pb-3">{children}</div>}
      </div>
    )
  }

  return (
    <aside
      className="w-80 border-l border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col"
      role="complementary"
      aria-label="Properties panel"
    >
      <div className="border-b border-[var(--border-color)] p-3">
        <h2 className="text-sm font-semibold">Properties</h2>
      </div>

      {!selectedElement ? (
        activeSection === 'seo' ? (
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase">
              Page SEO Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={currentPage?.seo.title || ''}
                  onChange={(e) => updatePageSEO(currentPageId, { title: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                  placeholder="Page title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Meta Description
                </label>
                <textarea
                  value={currentPage?.seo.description || ''}
                  onChange={(e) => updatePageSEO(currentPageId, { description: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] h-20"
                  placeholder="Description for search engines"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Keywords
                </label>
                <input
                  type="text"
                  value={currentPage?.seo.keywords || ''}
                  onChange={(e) => updatePageSEO(currentPageId, { keywords: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                  placeholder="keyword1, keyword2"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-sm text-[var(--text-secondary)] p-8">
            <div>
              <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
              <p>Select an element to edit its properties</p>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="flex border-b border-[var(--border-color)]" role="tablist">
            <button
              onClick={() => setActiveSection('styles')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeSection === 'styles'
                  ? 'bg-[var(--bg-primary)] text-[var(--accent-color)]'
                  : 'hover:bg-[var(--bg-tertiary)]'
              }`}
              role="tab"
              aria-selected={activeSection === 'styles'}
            >
              <div className="flex items-center justify-center gap-1">
                <Palette className="w-3 h-3" aria-hidden="true" />
                Styles
              </div>
            </button>
            <button
              onClick={() => setActiveSection('attributes')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeSection === 'attributes'
                  ? 'bg-[var(--bg-primary)] text-[var(--accent-color)]'
                  : 'hover:bg-[var(--bg-tertiary)]'
              }`}
              role="tab"
              aria-selected={activeSection === 'attributes'}
            >
              <div className="flex items-center justify-center gap-1">
                <Settings className="w-3 h-3" aria-hidden="true" />
                Attributes
              </div>
            </button>
            <button
              onClick={() => setActiveSection('advanced')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeSection === 'advanced'
                  ? 'bg-[var(--bg-primary)] text-[var(--accent-color)]'
                  : 'hover:bg-[var(--bg-tertiary)]'
              }`}
              role="tab"
              aria-selected={activeSection === 'advanced'}
            >
              <div className="flex items-center justify-center gap-1">
                <Code className="w-3 h-3" aria-hidden="true" />
                Code
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {activeSection === 'styles' && (
              <div>
                <StyleGroup title="Typography">
                  <StyleInput label="Font Size" property="fontSize" />
                  <StyleInput
                    label="Font Weight"
                    property="fontWeight"
                    options={['300', '400', '500', '600', '700', '800']}
                  />
                  <StyleInput
                    label="Text Align"
                    property="textAlign"
                    options={['left', 'center', 'right', 'justify']}
                  />
                  <StyleInput label="Color" property="color" type="color" />
                  <StyleInput label="Line Height" property="lineHeight" />
                  <StyleInput label="Letter Spacing" property="letterSpacing" />
                </StyleGroup>

                <StyleGroup title="Layout">
                  <StyleInput
                    label="Display"
                    property="display"
                    options={['block', 'flex', 'inline-block', 'inline', 'grid', 'none']}
                  />
                  <StyleInput
                    label="Flex Direction"
                    property="flexDirection"
                    options={['row', 'column', 'row-reverse', 'column-reverse']}
                  />
                  <StyleInput
                    label="Justify Content"
                    property="justifyContent"
                    options={[
                      'flex-start',
                      'center',
                      'flex-end',
                      'space-between',
                      'space-around',
                    ]}
                  />
                  <StyleInput
                    label="Align Items"
                    property="alignItems"
                    options={['flex-start', 'center', 'flex-end', 'stretch']}
                  />
                  <StyleInput label="Gap" property="gap" />
                  <StyleInput label="Padding" property="padding" />
                  <StyleInput label="Margin" property="margin" />
                  <StyleInput label="Width" property="width" />
                  <StyleInput label="Height" property="height" />
                  <StyleInput label="Max Width" property="maxWidth" />
                  <StyleInput label="Min Height" property="minHeight" />
                </StyleGroup>

                <StyleGroup title="Background">
                  <StyleInput label="Background Color" property="backgroundColor" type="color" />
                  <StyleInput label="Background Image" property="backgroundImage" />
                  <StyleInput
                    label="Background Size"
                    property="backgroundSize"
                    options={['cover', 'contain', 'auto']}
                  />
                  <StyleInput
                    label="Background Position"
                    property="backgroundPosition"
                    options={['center', 'top', 'bottom', 'left', 'right']}
                  />
                </StyleGroup>

                <StyleGroup title="Border">
                  <StyleInput label="Border" property="border" />
                  <StyleInput label="Border Radius" property="borderRadius" />
                  <StyleInput label="Border Width" property="borderWidth" />
                  <StyleInput label="Border Color" property="borderColor" type="color" />
                  <StyleInput
                    label="Border Style"
                    property="borderStyle"
                    options={['solid', 'dashed', 'dotted', 'double', 'none']}
                  />
                </StyleGroup>

                <StyleGroup title="Effects">
                  <StyleInput label="Box Shadow" property="boxShadow" />
                  <StyleInput label="Opacity" property="opacity" />
                  <StyleInput label="Transform" property="transform" />
                  <StyleInput label="Transition" property="transition" />
                </StyleGroup>
              </div>
            )}

            {activeSection === 'attributes' && (
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Content
                  </label>
                  <textarea
                    value={selectedElement.content || ''}
                    onChange={(e) => updateElement(selectedElementId!, { content: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] h-20"
                  />
                </div>

                {selectedElement.type === 'image' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={selectedElement.attributes?.src || ''}
                        onChange={(e) =>
                          updateElement(selectedElementId!, {
                            attributes: { ...selectedElement.attributes, src: e.target.value },
                          })
                        }
                        className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Alt Text (Accessibility)
                      </label>
                      <input
                        type="text"
                        value={selectedElement.attributes?.alt || ''}
                        onChange={(e) =>
                          updateElement(selectedElementId!, {
                            attributes: { ...selectedElement.attributes, alt: e.target.value },
                          })
                        }
                        className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                      />
                    </div>
                  </>
                )}

                {selectedElement.type === 'button' && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Link URL
                    </label>
                    <input
                      type="text"
                      value={selectedElement.attributes?.href || ''}
                      onChange={(e) =>
                        updateElement(selectedElementId!, {
                          attributes: { ...selectedElement.attributes, href: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                    />
                  </div>
                )}

                {selectedElement.type === 'input' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Input Type
                      </label>
                      <select
                        value={selectedElement.attributes?.type || 'text'}
                        onChange={(e) =>
                          updateElement(selectedElementId!, {
                            attributes: { ...selectedElement.attributes, type: e.target.value },
                          })
                        }
                        className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="password">Password</option>
                        <option value="number">Number</option>
                        <option value="tel">Tel</option>
                        <option value="url">URL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={selectedElement.attributes?.placeholder || ''}
                        onChange={(e) =>
                          updateElement(selectedElementId!, {
                            attributes: {
                              ...selectedElement.attributes,
                              placeholder: e.target.value,
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    ARIA Label (Accessibility)
                  </label>
                  <input
                    type="text"
                    value={selectedElement.attributes?.ariaLabel || ''}
                    onChange={(e) =>
                      updateElement(selectedElementId!, {
                        attributes: { ...selectedElement.attributes, ariaLabel: e.target.value },
                      })
                    }
                    className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                  />
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Custom CSS
                  </label>
                  <textarea
                    value={selectedElement.customCSS || ''}
                    onChange={(e) => updateElement(selectedElementId!, { customCSS: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-mono h-32"
                    placeholder=".my-class { color: red; }"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Custom JavaScript
                  </label>
                  <textarea
                    value={selectedElement.customJS || ''}
                    onChange={(e) => updateElement(selectedElementId!, { customJS: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-mono h-32"
                    placeholder="console.log('Hello')"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedElement && (
        <div className="border-t border-[var(--border-color)] p-3">
          <button
            onClick={() => setActiveSection(activeSection === 'seo' ? 'styles' : 'seo')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded transition-colors text-sm"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {activeSection === 'seo' ? 'Hide SEO Settings' : 'Page SEO Settings'}
          </button>
        </div>
      )}
    </aside>
  )
}
