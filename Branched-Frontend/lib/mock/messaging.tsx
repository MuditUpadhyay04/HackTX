/**
 * lib/mock/messaging.tsx: the spec's path for the messaging store (Phase 2 COMPONENTS). The store
 * itself is zustand (docs/RULES.md rule 3a wins over "React context + useReducer";
 * docs/plans/Phase2_plan.md Decisions), so this file re-exports it.
 */
export {
  useMessaging,
  useThread,
  messaging,
  RECEIPT_TIMING,
  type SeedState,
  type Message,
  type Thread,
  type ThreadId,
  type Receipt,
} from "@/lib/store/messaging";
