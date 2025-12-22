import { Highlight, themes } from 'prism-react-renderer'
import { useState, useEffect, useRef } from 'react'

interface CodePreviewProps {
  code: string
  language: 'markdown' | 'yaml' | 'json'
  maxHeight?: string
  showLineNumbers?: boolean
  /** Whether content is being streamed (enables auto-scroll and cursor) */
  isStreaming?: boolean
}

export function CodePreview({
  code,
  language,
  maxHeight = '60vh',
  showLineNumbers = true,
  isStreaming = false,
}: CodePreviewProps) {
  const containerRef = useRef<HTMLPreElement>(null)

  // Reactive dark mode detection via MutationObserver
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'))
        }
      }
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => {
      observer.disconnect()
    }
  }, [])

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [code, isStreaming])

  // Select theme based on dark mode
  const theme = isDark ? themes.vsDark : themes.github

  // Add cursor effect for streaming
  const displayCode = isStreaming ? code + '█' : code

  return (
    <Highlight theme={theme} code={displayCode} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          ref={containerRef}
          className={`${className} custom-scrollbar`}
          style={{
            ...style,
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            margin: 0,
            overflow: 'auto',
            maxHeight,
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          {tokens.map((line, i) => {
            const isLastLine = i === tokens.length - 1
            return (
              <div key={i} {...getLineProps({ line })}>
                {showLineNumbers && (
                  <span
                    className="inline-block text-right mr-4 select-none"
                    style={{
                      width: '2rem',
                      color: 'var(--color-text-muted)',
                      userSelect: 'none',
                    }}
                  >
                    {i + 1}
                  </span>
                )}
                {line.map((token, key) => {
                  // Make the cursor blink on the last line when streaming
                  const isCursor =
                    isStreaming && isLastLine && key === line.length - 1 && token.content === '█'
                  if (isCursor) {
                    return (
                      <span
                        key={key}
                        className="animate-pulse"
                        style={{ color: 'var(--color-wizard-accent)' }}
                      >
                        █
                      </span>
                    )
                  }
                  return <span key={key} {...getTokenProps({ token })} />
                })}
              </div>
            )
          })}
        </pre>
      )}
    </Highlight>
  )
}
