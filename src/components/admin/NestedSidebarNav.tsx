import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Generic tree node used by NestedSidebarNav.
 *
 * - Nodes with `children` (length > 0) behave as expandable groups (click toggles).
 * - Nodes with `to` and no children behave as navigable leaves (click navigates,
 *   active state highlighted, no chevron shown). Works at ANY level — a Level-2
 *   item with zero children renders as a directly-clickable leaf using the same
 *   visual treatment as Level-3 leaves, just at its own indent depth.
 * - A node with both children and `to` is treated as a group (children take precedence).
 */
export type NestedNavNode = {
  id: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
  to?: string;
  search?: Record<string, string | undefined>;
  children?: NestedNavNode[];
  /** When true, this leaf renders as the active/selected item. */
  active?: boolean;
  /** When true, the group is expanded by default. */
  defaultOpen?: boolean;
};

type Props = {
  nodes: NestedNavNode[];
  onNavigate?: () => void;
  /** Starting indent level (0 = top level). Used internally for recursion. */
  level?: number;
};

const LEVEL_INDENT = ["pl-3", "pl-6", "pl-9", "pl-12"];

export function NestedSidebarNav({ nodes, onNavigate, level = 0 }: Props) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <NestedNode key={node.id} node={node} level={level} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

function NestedNode({
  node,
  level,
  onNavigate,
}: {
  node: NestedNavNode;
  level: number;
  onNavigate?: () => void;
}) {
  const hasChildren = !!node.children && node.children.length > 0;
  const anyChildActive = hasChildren && containsActive(node.children!);
  const [open, setOpen] = useState<boolean>(
    node.defaultOpen || anyChildActive || false,
  );
  const Icon = node.icon;
  const indent = LEVEL_INDENT[Math.min(level, LEVEL_INDENT.length - 1)];

  const row = (children: ReactNode) => (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md pr-2 py-2 text-sm transition-colors",
        indent,
        node.active
          ? "bg-[#F97316]/15 text-white border border-[#F97316]/40"
          : anyChildActive
            ? "text-white bg-white/[0.03] border border-transparent"
            : "text-[#8B95A8] hover:text-white hover:bg-white/[0.04] border border-transparent",
      )}
    >
      {children}
    </div>
  );

  const chevron = hasChildren ? (
    <ChevronRight
      className={cn(
        "h-3.5 w-3.5 shrink-0 text-white/40 transition-transform",
        open && "rotate-90 text-white/70",
      )}
    />
  ) : (
    <span className="w-3.5 shrink-0" />
  );

  const badge =
    typeof node.count === "number" ? (
      <span
        className={cn(
          "ml-auto inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-mono",
          node.active
            ? "bg-[#F97316]/25 text-[#FDBA74]"
            : "bg-white/[0.06] text-white/55",
        )}
      >
        {node.count}
      </span>
    ) : null;

  const label = (
    <span
      className={cn(
        "flex-1 truncate",
        level === 0 ? "text-[13px] font-medium" : "text-[12px]",
      )}
    >
      {node.label}
    </span>
  );

  const iconEl = Icon ? (
    <Icon
      className={cn(
        "h-4 w-4 shrink-0",
        node.active ? "text-[#F97316]" : anyChildActive ? "text-[#3B82F6]" : "text-white/45",
      )}
    />
  ) : null;

  return (
    <li>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full text-left"
          aria-expanded={open}
        >
          {row(
            <>
              {chevron}
              {iconEl}
              {label}
              {badge}
            </>,
          )}
        </button>
      ) : node.to ? (
        <Link
          to={node.to}
          search={node.search as never}
          onClick={onNavigate}
          className="block"
        >
          {row(
            <>
              {chevron}
              {iconEl}
              {label}
              {badge}
            </>,
          )}
        </Link>
      ) : (
        row(
          <>
            {chevron}
            {iconEl}
            {label}
            {badge}
          </>,
        )
      )}

      {hasChildren && open && (
        <div
          className={cn(
            "mt-0.5 ml-4 border-l border-white/[0.06]",
            level === 0 ? "pl-1" : "pl-0",
          )}
        >
          <NestedSidebarNav
            nodes={node.children!}
            level={level + 1}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </li>
  );
}

function containsActive(nodes: NestedNavNode[]): boolean {
  for (const n of nodes) {
    if (n.active) return true;
    if (n.children && containsActive(n.children)) return true;
  }
  return false;
}
