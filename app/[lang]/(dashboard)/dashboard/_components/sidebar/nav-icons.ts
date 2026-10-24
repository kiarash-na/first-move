import {
  Building2Icon,
  ClipboardCheckIcon,
  FlameIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  LightbulbIcon,
  MapIcon,
  RocketIcon,
  Settings2Icon,
  SlidersHorizontalIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react"

/** The "All projects" link. */
export const START_ICON: LucideIcon = LayoutGridIcon

/**
 * One icon per nav item id (`navSections`, copy key under `shell.nav.items`). The expanded sidebar
 * shows step numbers where an item has one; the collapsed rail shows these icons (D-59).
 */
export const NAV_ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboardIcon,
  assumptions: SlidersHorizontalIcon,
  "quickCheck.area": MapIcon,
  "quickCheck.buildings": Building2Icon,
  "quickCheck.sources": FlameIcon,
  "quickCheck.options": Settings2Icon,
  "quickCheck.results": GaugeIcon,
  "businessPlan.opportunity": LightbulbIcon,
  "businessPlan.business-logic": WorkflowIcon,
  "businessPlan.reality-check": ClipboardCheckIcon,
  "businessPlan.implementation": RocketIcon,
}
