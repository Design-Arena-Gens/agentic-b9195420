import { create } from 'zustand'
import { produce } from 'immer'

export type ElementType =
  | 'container'
  | 'text'
  | 'heading'
  | 'button'
  | 'image'
  | 'form'
  | 'input'
  | 'navbar'
  | 'carousel'
  | 'section'
  | 'footer'

export interface ElementStyles {
  // Layout
  display?: string
  flexDirection?: string
  justifyContent?: string
  alignItems?: string
  gap?: string
  padding?: string
  margin?: string
  width?: string
  height?: string
  maxWidth?: string
  minHeight?: string

  // Typography
  fontSize?: string
  fontWeight?: string
  lineHeight?: string
  textAlign?: string
  color?: string
  fontFamily?: string
  letterSpacing?: string

  // Background
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string

  // Border
  border?: string
  borderRadius?: string
  borderWidth?: string
  borderColor?: string
  borderStyle?: string

  // Effects
  boxShadow?: string
  opacity?: string
  transform?: string
  transition?: string

  // Responsive
  [key: `@${string}`]: Partial<ElementStyles>
}

export interface Element {
  id: string
  type: ElementType
  content?: string
  styles: ElementStyles
  children?: Element[]
  attributes?: {
    href?: string
    src?: string
    alt?: string
    placeholder?: string
    type?: string
    name?: string
    ariaLabel?: string
    role?: string
  }
  customCSS?: string
  customJS?: string
}

export interface Page {
  id: string
  name: string
  path: string
  elements: Element[]
  seo: {
    title: string
    description: string
    keywords: string
  }
}

export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

interface BuilderState {
  pages: Page[]
  currentPageId: string
  selectedElementId: string | null
  isDarkMode: boolean
  currentBreakpoint: Breakpoint
  history: Page[][]
  historyIndex: number

  // Actions
  addPage: (name: string) => void
  deletePage: (id: string) => void
  setCurrentPage: (id: string) => void
  addElement: (element: Element, parentId?: string) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  deleteElement: (id: string) => void
  moveElement: (id: string, targetParentId: string, index: number) => void
  selectElement: (id: string | null) => void
  toggleDarkMode: () => void
  setBreakpoint: (breakpoint: Breakpoint) => void
  undo: () => void
  redo: () => void
  updatePageSEO: (id: string, seo: Partial<Page['seo']>) => void
  duplicateElement: (id: string) => void
}

const createDefaultPage = (name: string, id: string): Page => ({
  id,
  name,
  path: `/${name.toLowerCase().replace(/\s+/g, '-')}`,
  elements: [],
  seo: {
    title: name,
    description: '',
    keywords: '',
  },
})

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useBuilderStore = create<BuilderState>((set, get) => ({
  pages: [createDefaultPage('Home', 'page-1')],
  currentPageId: 'page-1',
  selectedElementId: null,
  isDarkMode: true,
  currentBreakpoint: 'desktop',
  history: [],
  historyIndex: -1,

  addPage: (name) => {
    set(
      produce((state: BuilderState) => {
        const newPage = createDefaultPage(name, `page-${generateId()}`)
        state.pages.push(newPage)
        state.currentPageId = newPage.id
      })
    )
  },

  deletePage: (id) => {
    set(
      produce((state: BuilderState) => {
        if (state.pages.length > 1) {
          const index = state.pages.findIndex((p) => p.id === id)
          if (index !== -1) {
            state.pages.splice(index, 1)
            if (state.currentPageId === id) {
              state.currentPageId = state.pages[0].id
            }
          }
        }
      })
    )
  },

  setCurrentPage: (id) => {
    set({ currentPageId: id, selectedElementId: null })
  },

  addElement: (element, parentId) => {
    set(
      produce((state: BuilderState) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (!page) return

        const findAndAddToParent = (elements: Element[]): boolean => {
          for (const el of elements) {
            if (el.id === parentId) {
              if (!el.children) el.children = []
              el.children.push(element)
              return true
            }
            if (el.children && findAndAddToParent(el.children)) {
              return true
            }
          }
          return false
        }

        if (parentId) {
          findAndAddToParent(page.elements)
        } else {
          page.elements.push(element)
        }

        state.selectedElementId = element.id
      })
    )
  },

  updateElement: (id, updates) => {
    set(
      produce((state: BuilderState) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (!page) return

        const findAndUpdate = (elements: Element[]): boolean => {
          for (const el of elements) {
            if (el.id === id) {
              Object.assign(el, updates)
              if (updates.styles) {
                el.styles = { ...el.styles, ...updates.styles }
              }
              return true
            }
            if (el.children && findAndUpdate(el.children)) {
              return true
            }
          }
          return false
        }

        findAndUpdate(page.elements)
      })
    )
  },

  deleteElement: (id) => {
    set(
      produce((state: BuilderState) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (!page) return

        const findAndDelete = (elements: Element[]): boolean => {
          for (let i = 0; i < elements.length; i++) {
            if (elements[i].id === id) {
              elements.splice(i, 1)
              state.selectedElementId = null
              return true
            }
            if (elements[i].children && findAndDelete(elements[i].children!)) {
              return true
            }
          }
          return false
        }

        findAndDelete(page.elements)
      })
    )
  },

  moveElement: (id, targetParentId, index) => {
    set(
      produce((state: BuilderState) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (!page) return

        let elementToMove: Element | null = null

        const findAndRemove = (elements: Element[]): boolean => {
          for (let i = 0; i < elements.length; i++) {
            if (elements[i].id === id) {
              elementToMove = elements[i]
              elements.splice(i, 1)
              return true
            }
            if (elements[i].children && findAndRemove(elements[i].children!)) {
              return true
            }
          }
          return false
        }

        findAndRemove(page.elements)

        if (!elementToMove) return

        const findAndInsert = (elements: Element[]): boolean => {
          for (const el of elements) {
            if (el.id === targetParentId) {
              if (!el.children) el.children = []
              el.children.splice(index, 0, elementToMove!)
              return true
            }
            if (el.children && findAndInsert(el.children!)) {
              return true
            }
          }
          return false
        }

        if (targetParentId === 'root') {
          page.elements.splice(index, 0, elementToMove)
        } else {
          findAndInsert(page.elements)
        }
      })
    )
  },

  selectElement: (id) => {
    set({ selectedElementId: id })
  },

  toggleDarkMode: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }))
  },

  setBreakpoint: (breakpoint) => {
    set({ currentBreakpoint: breakpoint })
  },

  undo: () => {
    const { history, historyIndex, pages } = get()
    if (historyIndex > 0) {
      set({ pages: history[historyIndex - 1], historyIndex: historyIndex - 1 })
    }
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      set({ pages: history[historyIndex + 1], historyIndex: historyIndex + 1 })
    }
  },

  updatePageSEO: (id, seo) => {
    set(
      produce((state: BuilderState) => {
        const page = state.pages.find((p) => p.id === id)
        if (page) {
          page.seo = { ...page.seo, ...seo }
        }
      })
    )
  },

  duplicateElement: (id) => {
    set(
      produce((state: BuilderState) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (!page) return

        const deepClone = (el: Element): Element => ({
          ...el,
          id: `el-${generateId()}`,
          children: el.children?.map(deepClone),
        })

        const findAndDuplicate = (elements: Element[], parent?: Element[]): boolean => {
          for (let i = 0; i < elements.length; i++) {
            if (elements[i].id === id) {
              const cloned = deepClone(elements[i])
              elements.splice(i + 1, 0, cloned)
              return true
            }
            if (elements[i].children && findAndDuplicate(elements[i].children!, elements)) {
              return true
            }
          }
          return false
        }

        findAndDuplicate(page.elements)
      })
    )
  },
}))
