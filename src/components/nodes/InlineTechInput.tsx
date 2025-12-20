import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import type { NodeType } from '../../core/types'
import { getTechSuggestions } from '../../core/tech-suggestions'
import { TechChip } from './TechChip'

interface InlineTechInputProps {
  nodeType: NodeType
  techStack: string[]
  onAdd: (tech: string) => void
  onRemove: (tech: string) => void
  maxVisible?: number
  /** Optional limit on number of tech choices. Shows soft warning when exceeded. */
  techLimit?: number | undefined
}

export function InlineTechInput({
  nodeType,
  techStack,
  onAdd,
  onRemove,
  maxVisible = 4,
  techLimit,
}: InlineTechInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = getTechSuggestions(nodeType, query, techStack)
  const visibleTech = techStack.slice(0, maxVisible)
  const overflowCount = techStack.length - maxVisible

  // Check if over the recommended limit
  const isOverLimit = techLimit !== undefined && techStack.length > techLimit

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle clicks outside to close
  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsEditing(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => { document.removeEventListener('mousedown', handleClickOutside) }
  }, [isEditing])

  const handleAddTech = useCallback(
    (tech: string) => {
      const trimmed = tech.trim()
      if (trimmed && !techStack.includes(trimmed)) {
        onAdd(trimmed)
      }
      setQuery('')
      setSelectedIndex(0)
      inputRef.current?.focus()
    },
    [techStack, onAdd]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Prevent React Flow from handling these keys
      e.stopPropagation()

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break

        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break

        case 'Enter':
        case 'Tab': {
          e.preventDefault()
          const selected = suggestions[selectedIndex]
          if (selected) {
            handleAddTech(selected.name)
          } else if (query.trim()) {
            // Allow custom tech if no suggestion selected
            handleAddTech(query)
          }
          break
        }

        case 'Escape':
          e.preventDefault()
          setIsEditing(false)
          setQuery('')
          break

        case 'Backspace':
          if (query === '' && techStack.length > 0) {
            // Remove last tech when backspace on empty input
            const lastTech = techStack[techStack.length - 1]
            if (lastTech) onRemove(lastTech)
          }
          break
      }
    },
    [suggestions, selectedIndex, query, techStack, handleAddTech, onRemove]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setQuery(e.target.value)
  }

  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={handleContainerClick}
      onMouseDown={(e) => { e.stopPropagation(); }}
    >
      {/* Tech chips + input area */}
      <div className="flex flex-col w-full gap-2">
        {visibleTech.map((tech) => (
          <TechChip
            key={tech}
            tech={tech}
            variant={nodeType}
            onRemove={() => { onRemove(tech); }}
            fullWidth={true}
          />
        ))}

        {overflowCount > 0 && !isEditing && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono pl-1">
            +{overflowCount} more
          </span>
        )}

        {/* Soft warning when over recommended limit */}
        {isOverLimit && (
          <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
              Most projects use just {techLimit} here. Multiple choices can add complexity.
            </span>
          </div>
        )}

        {isEditing ? (
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={(e) => { e.stopPropagation(); }}
              onMouseDown={(e) => { e.stopPropagation(); }}
              placeholder="Type to search..."
              className={`
                w-full bg-transparent border-none outline-none
                font-mono text-[11px] text-slate-700 dark:text-slate-200
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                caret-current py-0.5
              `}
              autoComplete="off"
              spellCheck={false}
            />

            {/* Autocomplete dropdown */}
            {query.length > 0 && suggestions.length > 0 && (
              <div
                className={`
                  absolute left-0 top-full mt-1.5 z-50
                  w-52 max-h-52 overflow-y-auto
                  bg-white dark:bg-slate-900
                  border border-slate-200 dark:border-slate-700
                  rounded-lg shadow-lg
                  py-1.5
                  dropdown-animate custom-scrollbar
                `}
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddTech(suggestion.name)
                    }}
                    onMouseEnter={() => { setSelectedIndex(index); }}
                    className={`
                      w-full px-3 py-2 text-left cursor-pointer
                      flex items-center justify-between gap-2
                      transition-colors duration-100
                      ${
                        index === selectedIndex
                          ? 'bg-slate-100 dark:bg-slate-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <span className="font-mono text-[12px] text-slate-800 dark:text-slate-100">
                      {suggestion.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      {suggestion.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Show "press enter to add custom" hint when no matches */}
            {query.length > 0 && suggestions.length === 0 && (
              <div
                className={`
                  absolute left-0 top-full mt-1.5 z-50
                  w-52 px-3 py-2.5
                  bg-white dark:bg-slate-900
                  border border-slate-200 dark:border-slate-700
                  rounded-lg shadow-lg
                  dropdown-animate
                `}
              >
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">Enter</kbd> to add "<span className="text-slate-700 dark:text-slate-200">{query}</span>"
                </span>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEditing}
            onMouseDown={(e) => { e.stopPropagation(); }}
            className={`
              w-full inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5
              font-mono text-[11px]
              text-slate-500 dark:text-slate-400
              hover:text-slate-700 dark:hover:text-slate-200
              hover:bg-slate-100/80 dark:hover:bg-slate-800/50
              border border-dashed border-slate-300 dark:border-slate-600
              hover:border-slate-400 dark:hover:border-slate-500
              transition-all duration-150
              cursor-pointer
            `}
            aria-label="Add technology"
          >
            <Plus className="h-3 w-3" />
            <span>Add tech</span>
          </button>
        )}
      </div>
    </div>
  )
}
