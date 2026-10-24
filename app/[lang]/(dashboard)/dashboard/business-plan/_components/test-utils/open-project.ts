import { getExample, localizeExample } from "@/lib/examples"
import type { ProjectModules } from "@/lib/project"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"

const tabs: TestTab[] = []

/** Tests only: stops every store a test opened. Call it from `afterEach`. */
export function stopTabs() {
  while (tabs.length) tabs.pop()!.store.stop()
}

/**
 * Tests only: a started store with a project open. Without `example` the project is empty with
 * the given modules (default: Business Plan only); with one it is a copy of that example (both
 * modules on, all texts filled).
 */
export async function openProject({ example, modules = { businessPlan: true } }: { example?: string; modules?: Partial<ProjectModules> } = {}) {
  const tab = testTab()
  tabs.push(tab)
  await tab.store.start()
  if (example) await tab.store.addCopy(localizeExample(getExample(example)!, "en"))
  else await tab.store.create({ modules })
  return tab
}
