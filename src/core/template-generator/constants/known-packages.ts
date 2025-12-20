/**
 * Known Package Versions
 *
 * Maps tech stack LABELS (from onboarding dropdowns) to verified package information.
 * Used to populate baseline_deps in component YAML specs.
 *
 * IMPORTANT: Keys must EXACTLY match the `label` field in STACK_OPTIONS and CAPABILITY_CONFIGS
 * from src/core/onboarding/onboarding-defaults.ts
 *
 * These versions are verified as of 2025-12-19.
 * Downstream agents should verify latest versions before installing.
 *
 * Registry URL patterns for verification:
 * - npm: https://www.npmjs.com/package/{name}
 * - pypi: https://pypi.org/project/{name}/
 */

export type PackageRegistry = 'npm' | 'pypi' | 'nuget' | 'maven' | 'cargo' | 'go'

export interface KnownPackage {
  name: string
  version: string
  purpose: string
  docs: string
  registry: PackageRegistry
  isCompanion?: boolean // Required runtime companion (e.g., uvicorn for fastapi)
}

/**
 * Maps tech stack LABELS to their known packages.
 * Keys MUST match the exact `label` values from onboarding-defaults.ts
 */
export const KNOWN_PACKAGES: Record<string, KnownPackage[]> = {
  // ============================================================================
  // LANGUAGES
  // ============================================================================
  TypeScript: [
    {
      name: 'typescript',
      version: '^5.9.0',
      purpose: 'TypeScript compiler',
      docs: 'https://www.typescriptlang.org/docs',
      registry: 'npm',
    },
  ],
  JavaScript: [
    {
      name: 'node',
      version: '>=22.0.0',
      purpose: 'Node.js runtime (LTS)',
      docs: 'https://nodejs.org/docs/latest-v22.x/api/',
      registry: 'npm',
    },
  ],
  Python: [
    {
      name: 'python',
      version: '>=3.12',
      purpose: 'Python runtime',
      docs: 'https://docs.python.org/3/',
      registry: 'pypi',
    },
  ],
  Java: [
    {
      name: 'java',
      version: '>=21',
      purpose: 'Java runtime (LTS)',
      docs: 'https://docs.oracle.com/en/java/',
      registry: 'maven',
    },
  ],
  'C# / .NET': [
    {
      name: 'dotnet',
      version: '>=10.0',
      purpose: '.NET runtime',
      docs: 'https://learn.microsoft.com/dotnet',
      registry: 'nuget',
    },
  ],
  Go: [
    {
      name: 'go',
      version: '>=1.23',
      purpose: 'Go runtime',
      docs: 'https://go.dev/doc/',
      registry: 'go',
    },
  ],
  Rust: [
    {
      name: 'rust',
      version: '>=1.83',
      purpose: 'Rust toolchain',
      docs: 'https://doc.rust-lang.org/',
      registry: 'cargo',
    },
  ],

  // ============================================================================
  // FRONTEND FRAMEWORKS
  // ============================================================================
  'Next.js': [
    {
      name: 'next',
      version: '^16.1.0',
      purpose: 'React framework for production',
      docs: 'https://nextjs.org/docs',
      registry: 'npm',
    },
    {
      name: 'react',
      version: '^19.2.3',
      purpose: 'React library',
      docs: 'https://react.dev',
      registry: 'npm',
      isCompanion: true,
    },
  ],
  'React (Vite)': [
    {
      name: 'react',
      version: '^19.2.3',
      purpose: 'React library',
      docs: 'https://react.dev',
      registry: 'npm',
    },
    {
      name: 'vite',
      version: '^7.3.0',
      purpose: 'Build tool',
      docs: 'https://vitejs.dev',
      registry: 'npm',
      isCompanion: true,
    },
  ],
  'Vue 3': [
    {
      name: 'vue',
      version: '^3.5.0',
      purpose: 'Vue.js framework',
      docs: 'https://vuejs.org',
      registry: 'npm',
    },
  ],
  Angular: [
    {
      name: '@angular/core',
      version: '^21.0.6',
      purpose: 'Angular framework',
      docs: 'https://angular.dev',
      registry: 'npm',
    },
  ],
  SvelteKit: [
    {
      name: '@sveltejs/kit',
      version: '^2.49.2',
      purpose: 'SvelteKit framework',
      docs: 'https://kit.svelte.dev',
      registry: 'npm',
    },
    {
      name: 'svelte',
      version: '^5.46.0',
      purpose: 'Svelte compiler',
      docs: 'https://svelte.dev',
      registry: 'npm',
      isCompanion: true,
    },
  ],

  // ============================================================================
  // BACKEND FRAMEWORKS
  // ============================================================================
  Express: [
    {
      name: 'express',
      version: '^5.2.1',
      purpose: 'Node.js web framework',
      docs: 'https://expressjs.com',
      registry: 'npm',
    },
  ],
  FastAPI: [
    {
      name: 'fastapi',
      version: '>=0.125.0',
      purpose: 'Python web framework',
      docs: 'https://fastapi.tiangolo.com',
      registry: 'pypi',
    },
    {
      name: 'uvicorn',
      version: '>=0.38.0',
      purpose: 'ASGI server (required runtime)',
      docs: 'https://www.uvicorn.org',
      registry: 'pypi',
      isCompanion: true,
    },
  ],
  'Spring Boot': [
    {
      name: 'org.springframework.boot:spring-boot-starter-webmvc',
      version: '4.0.1',
      purpose: 'Spring Boot web starter',
      docs: 'https://spring.io/projects/spring-boot',
      registry: 'maven',
    },
  ],
  'ASP.NET Core': [
    {
      name: 'Microsoft.AspNetCore.App.Ref',
      version: '10.0.1',
      purpose: 'ASP.NET Core runtime',
      docs: 'https://learn.microsoft.com/aspnet/core',
      registry: 'nuget',
    },
  ],
  Django: [
    {
      name: 'django',
      version: '>=6.0',
      purpose: 'Python web framework',
      docs: 'https://docs.djangoproject.com',
      registry: 'pypi',
    },
  ],
  Gin: [
    {
      name: 'github.com/gin-gonic/gin',
      version: 'v1.11.0',
      purpose: 'Go HTTP framework',
      docs: 'https://gin-gonic.com',
      registry: 'go',
    },
  ],
  Hono: [
    {
      name: 'hono',
      version: '^4.11.1',
      purpose: 'Lightweight web framework',
      docs: 'https://hono.dev',
      registry: 'npm',
    },
  ],
  'Actix Web': [
    {
      name: 'actix-web',
      version: '>=4.11.0',
      purpose: 'High-performance Rust web framework',
      docs: 'https://actix.rs/docs',
      registry: 'cargo',
    },
    {
      name: 'tokio',
      version: '>=1.48.0',
      purpose: 'Async runtime for Rust',
      docs: 'https://tokio.rs',
      registry: 'cargo',
      isCompanion: true,
    },
  ],

  // ============================================================================
  // DESKTOP FRAMEWORKS
  // ============================================================================
  Electron: [
    {
      name: 'electron',
      version: '^39.2.7',
      purpose: 'Desktop app framework',
      docs: 'https://electronjs.org',
      registry: 'npm',
    },
  ],
  Tauri: [
    {
      name: '@tauri-apps/api',
      version: '^2.9.1',
      purpose: 'Tauri frontend bindings',
      docs: 'https://tauri.app',
      registry: 'npm',
    },
  ],

  // ============================================================================
  // DATABASES
  // ============================================================================
  PostgreSQL: [
    {
      name: 'pg',
      version: '^8.16.3',
      purpose: 'PostgreSQL client for Node.js',
      docs: 'https://node-postgres.com',
      registry: 'npm',
    },
  ],
  'PostgreSQL-python': [
    {
      name: 'psycopg2-binary',
      version: '>=2.9.11',
      purpose: 'PostgreSQL adapter for Python',
      docs: 'https://www.psycopg.org',
      registry: 'pypi',
    },
  ],
  MySQL: [
    {
      name: 'mysql2',
      version: '^3.16.0',
      purpose: 'MySQL client for Node.js',
      docs: 'https://sidorares.github.io/node-mysql2',
      registry: 'npm',
    },
  ],
  'MySQL-python': [
    {
      name: 'pymysql',
      version: '>=1.1.0',
      purpose: 'MySQL client for Python',
      docs: 'https://pymysql.readthedocs.io',
      registry: 'pypi',
    },
  ],
  Supabase: [
    {
      name: '@supabase/supabase-js',
      version: '^2.89.0',
      purpose: 'Supabase client',
      docs: 'https://supabase.com/docs',
      registry: 'npm',
    },
  ],
  'Supabase-python': [
    {
      name: 'supabase',
      version: '>=2.27.0',
      purpose: 'Supabase client for Python',
      docs: 'https://supabase.com/docs/reference/python',
      registry: 'pypi',
    },
  ],
  SQLite: [
    {
      name: 'better-sqlite3',
      version: '^11.7.0',
      purpose: 'SQLite for Node.js',
      docs: 'https://github.com/WiseLibs/better-sqlite3',
      registry: 'npm',
    },
  ],
  'SQLite-python': [
    {
      name: 'sqlite3',
      version: 'stdlib',
      purpose: 'SQLite (Python stdlib)',
      docs: 'https://docs.python.org/3/library/sqlite3.html',
      registry: 'pypi',
    },
  ],
  MongoDB: [
    {
      name: 'mongodb',
      version: '^7.0.0',
      purpose: 'MongoDB driver for Node.js',
      docs: 'https://mongodb.github.io/node-mongodb-native/',
      registry: 'npm',
    },
  ],
  'MongoDB-python': [
    {
      name: 'pymongo',
      version: '>=4.15.5',
      purpose: 'MongoDB driver for Python',
      docs: 'https://pymongo.readthedocs.io',
      registry: 'pypi',
    },
  ],

  // ============================================================================
  // AI PROVIDERS
  // ============================================================================
  OpenAI: [
    {
      name: 'openai',
      version: '^4.77.0',
      purpose: 'OpenAI API client',
      docs: 'https://platform.openai.com/docs',
      registry: 'npm',
    },
  ],
  'OpenAI-python': [
    {
      name: 'openai',
      version: '>=1.58.0',
      purpose: 'OpenAI API client',
      docs: 'https://platform.openai.com/docs',
      registry: 'pypi',
    },
  ],
  Anthropic: [
    {
      name: '@anthropic-ai/sdk',
      version: '^0.71.2',
      purpose: 'Anthropic API client',
      docs: 'https://docs.anthropic.com',
      registry: 'npm',
    },
  ],
  'Anthropic-python': [
    {
      name: 'anthropic',
      version: '>=0.75.0',
      purpose: 'Anthropic API client',
      docs: 'https://docs.anthropic.com',
      registry: 'pypi',
    },
  ],
  'Google AI (Gemini)': [
    {
      name: '@google/genai',
      version: '^1.34.0',
      purpose: 'Google Generative AI client',
      docs: 'https://ai.google.dev',
      registry: 'npm',
    },
  ],
  'Google AI (Gemini)-python': [
    {
      name: 'google-generativeai',
      version: '>=0.8.6',
      purpose: 'Google Generative AI client (deprecated - migrate to google-genai)',
      docs: 'https://ai.google.dev',
      registry: 'pypi',
    },
  ],
  'Ollama (Local)': [
    {
      name: 'ollama',
      version: '>=0.6.0',
      purpose: 'Ollama local LLM client',
      docs: 'https://github.com/ollama/ollama-python',
      registry: 'pypi',
    },
  ],

  // ============================================================================
  // AUTH PROVIDERS (Capability tech alternatives)
  // ============================================================================
  'Supabase Auth': [
    {
      name: '@supabase/supabase-js',
      version: '^2.89.0',
      purpose: 'Supabase client with auth',
      docs: 'https://supabase.com/docs/reference/javascript/auth-api',
      registry: 'npm',
    },
  ],
  Clerk: [
    {
      name: '@clerk/nextjs',
      version: '^6.36.4',
      purpose: 'Clerk auth for Next.js',
      docs: 'https://clerk.com/docs',
      registry: 'npm',
    },
  ],
  Auth0: [
    {
      name: '@auth0/nextjs-auth0',
      version: '^4.13.3',
      purpose: 'Auth0 SDK for Next.js',
      docs: 'https://auth0.com/docs',
      registry: 'npm',
    },
  ],
  NextAuth: [
    {
      name: 'next-auth',
      version: '^4.24.13',
      purpose: 'Auth for Next.js',
      docs: 'https://next-auth.js.org',
      registry: 'npm',
    },
  ],

  // ============================================================================
  // FILE STORAGE (Capability tech alternatives)
  // ============================================================================
  'Supabase Storage': [
    {
      name: '@supabase/supabase-js',
      version: '^2.89.0',
      purpose: 'Supabase client with storage',
      docs: 'https://supabase.com/docs/reference/javascript/storage-api',
      registry: 'npm',
    },
  ],
  'AWS S3': [
    {
      name: '@aws-sdk/client-s3',
      version: '^3.730.0',
      purpose: 'AWS S3 client',
      docs: 'https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/',
      registry: 'npm',
    },
  ],
  'Cloudflare R2': [
    {
      name: '@aws-sdk/client-s3',
      version: '^3.730.0',
      purpose: 'S3-compatible client for R2',
      docs: 'https://developers.cloudflare.com/r2/',
      registry: 'npm',
    },
  ],

  // ============================================================================
  // VECTOR STORES (Capability tech alternatives)
  // ============================================================================
  pgvector: [
    {
      name: 'pgvector',
      version: '>=0.4.2',
      purpose: 'PostgreSQL vector extension',
      docs: 'https://github.com/pgvector/pgvector-python',
      registry: 'pypi',
    },
  ],
  Pinecone: [
    {
      name: 'pinecone',
      version: '^6.0.0',
      purpose: 'Pinecone vector database client',
      docs: 'https://docs.pinecone.io',
      registry: 'pypi',
    },
  ],
  'Pinecone-npm': [
    {
      name: '@pinecone-database/pinecone',
      version: '^6.1.1',
      purpose: 'Pinecone vector database client for Node.js',
      docs: 'https://docs.pinecone.io',
      registry: 'npm',
    },
  ],
  Weaviate: [
    {
      name: 'weaviate-client',
      version: '^4.19.0',
      purpose: 'Weaviate vector database client',
      docs: 'https://weaviate.io/developers/weaviate',
      registry: 'pypi',
    },
  ],
  Qdrant: [
    {
      name: 'qdrant-client',
      version: '^1.16.2',
      purpose: 'Qdrant vector database client',
      docs: 'https://qdrant.tech/documentation',
      registry: 'pypi',
    },
  ],
  'Qdrant-npm': [
    {
      name: '@qdrant/js-client-rest',
      version: '^1.16.2',
      purpose: 'Qdrant vector database client for Node.js',
      docs: 'https://qdrant.tech/documentation',
      registry: 'npm',
    },
  ],

  // ============================================================================
  // BACKGROUND JOBS (Capability tech alternatives)
  // ============================================================================
  Inngest: [
    {
      name: 'inngest',
      version: '^3.48.0',
      purpose: 'Background jobs and workflows',
      docs: 'https://www.inngest.com/docs',
      registry: 'npm',
    },
  ],
  BullMQ: [
    {
      name: 'bullmq',
      version: '^5.66.1',
      purpose: 'Redis-backed job queue',
      docs: 'https://docs.bullmq.io',
      registry: 'npm',
    },
  ],
  'Trigger.dev': [
    {
      name: '@trigger.dev/sdk',
      version: '^4.0.4',
      purpose: 'Background jobs platform',
      docs: 'https://trigger.dev/docs',
      registry: 'npm',
    },
  ],

  // ============================================================================
  // EXTERNAL APIs (Capability tech alternatives)
  // ============================================================================
  'REST APIs': [
    {
      name: 'axios',
      version: '^1.7.0',
      purpose: 'HTTP client',
      docs: 'https://axios-http.com',
      registry: 'npm',
    },
  ],
  'REST APIs-python': [
    {
      name: 'httpx',
      version: '>=0.28.0',
      purpose: 'HTTP client for Python',
      docs: 'https://www.python-httpx.org',
      registry: 'pypi',
    },
  ],
  GraphQL: [
    {
      name: '@apollo/client',
      version: '^3.12.0',
      purpose: 'GraphQL client',
      docs: 'https://www.apollographql.com/docs/react/',
      registry: 'npm',
    },
  ],
  Webhooks: [
    {
      name: 'svix',
      version: '^1.58.0',
      purpose: 'Webhook infrastructure',
      docs: 'https://docs.svix.com',
      registry: 'npm',
    },
  ],

  // ============================================================================
  // ORM / UTILITIES (Common companions)
  // ============================================================================
  prisma: [
    {
      name: 'prisma',
      version: '^7.2.0',
      purpose: 'TypeScript ORM',
      docs: 'https://www.prisma.io/docs',
      registry: 'npm',
    },
  ],
  drizzle: [
    {
      name: 'drizzle-orm',
      version: '^0.45.0',
      purpose: 'TypeScript ORM',
      docs: 'https://orm.drizzle.team',
      registry: 'npm',
    },
  ],
  sqlalchemy: [
    {
      name: 'sqlalchemy',
      version: '>=2.0.45',
      purpose: 'Python ORM',
      docs: 'https://docs.sqlalchemy.org',
      registry: 'pypi',
    },
  ],
  pydantic: [
    {
      name: 'pydantic',
      version: '>=2.12.0',
      purpose: 'Data validation',
      docs: 'https://docs.pydantic.dev',
      registry: 'pypi',
    },
  ],
}

// ============================================================================
// PYTHON LANGUAGE INDICATORS
// ============================================================================

const PYTHON_INDICATORS = [
  'Python',
  'FastAPI',
  'Django',
  'Flask',
  'Starlette',
]

const PYTHON_DATABASES = ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Supabase']
const PYTHON_AI_PROVIDERS = ['OpenAI', 'Anthropic', 'Google AI (Gemini)', 'Ollama (Local)']

/**
 * Detect primary language from tech stack for registry selection
 */
export function detectLanguage(techStack: string[]): 'python' | 'typescript' | 'javascript' | 'java' | 'csharp' | 'go' | 'rust' | undefined {
  if (!techStack || techStack.length === 0) return undefined

  // Check for explicit language selection
  if (techStack.includes('Python')) return 'python'
  if (techStack.includes('TypeScript')) return 'typescript'
  if (techStack.includes('JavaScript')) return 'javascript'
  if (techStack.includes('Java')) return 'java'
  if (techStack.includes('C# / .NET')) return 'csharp'
  if (techStack.includes('Go')) return 'go'
  if (techStack.includes('Rust')) return 'rust'

  // Infer from framework
  if (techStack.some((t) => PYTHON_INDICATORS.includes(t))) return 'python'

  // Default to undefined if can't detect
  return undefined
}

/**
 * Get packages for a tech stack item
 * @param techLabel - Tech LABEL from onboarding (e.g., "FastAPI", "PostgreSQL")
 * @param language - Optional language hint for registry selection
 */
export function getPackagesForTech(
  techLabel: string,
  language?: 'python' | 'typescript' | 'javascript' | 'java' | 'csharp' | 'go' | 'rust'
): KnownPackage[] {
  // Try language-specific variant FIRST for databases and AI providers
  if (language === 'python') {
    // Check if this is a tech that has Python-specific packages
    if (PYTHON_DATABASES.includes(techLabel) || PYTHON_AI_PROVIDERS.includes(techLabel)) {
      const pythonVariant = KNOWN_PACKAGES[`${techLabel}-python`]
      if (pythonVariant) {
        return pythonVariant
      }
    }
  }

  // Direct lookup by label
  const direct = KNOWN_PACKAGES[techLabel]
  if (direct) {
    return direct
  }

  // No match
  return []
}

/**
 * Get registry verification URL for a package
 */
export function getRegistryUrl(pkg: KnownPackage): string {
  switch (pkg.registry) {
    case 'npm':
      return `https://www.npmjs.com/package/${pkg.name}`
    case 'pypi':
      return `https://pypi.org/project/${pkg.name}/`
    case 'nuget':
      return `https://www.nuget.org/packages/${pkg.name}`
    case 'maven':
      return `https://search.maven.org/artifact/${pkg.name.replace(':', '/')}`
    case 'go':
      return `https://pkg.go.dev/${pkg.name}`
    case 'cargo':
      return `https://crates.io/crates/${pkg.name}`
    default:
      return pkg.docs
  }
}
