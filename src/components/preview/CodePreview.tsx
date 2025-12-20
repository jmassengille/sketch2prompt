import { Highlight, themes } from 'prism-react-renderer'
import { useState, useEffect } from 'react'

interface CodePreviewProps {
  code: string
  language: 'markdown' | 'yaml' | 'json'
  maxHeight?: string
  showLineNumbers?: boolean
}

export function CodePreview({
  code,
  language,
  maxHeight = '60vh',
  showLineNumbers = true,
}: CodePreviewProps) {
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
    return () => { observer.disconnect() }
  }, [])

  // Select theme based on dark mode
  const theme = isDark ? themes.vsDark : themes.github

  return (
    <Highlight theme={theme} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
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
          {tokens.map((line, i) => (
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
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
