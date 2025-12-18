import { FrontendNode } from './FrontendNode'
import { BackendNode } from './BackendNode'
import { StorageNode } from './StorageNode'
import { AuthNode } from './AuthNode'
import { ExternalNode } from './ExternalNode'
import { BackgroundNode } from './BackgroundNode'

export const nodeTypes = {
  frontend: FrontendNode,
  backend: BackendNode,
  storage: StorageNode,
  auth: AuthNode,
  external: ExternalNode,
  background: BackgroundNode,
} as const

export {
  FrontendNode,
  BackendNode,
  StorageNode,
  AuthNode,
  ExternalNode,
  BackgroundNode,
}
