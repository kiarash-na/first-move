import { createProjectStore, type ProjectStore } from "./create-project-store"
import { browserDeps } from "./deps"

let instance: ProjectStore | null = null

/**
 * The app's one project store. Creating it touches no browser API; storage is read only by
 * `start()`, which `useStartProjectStore` calls in an effect. On the server it is never started,
 * so its state stays `INITIAL_STATE`.
 */
export function getProjectStore(): ProjectStore {
  instance ??= createProjectStore(browserDeps())
  return instance
}
