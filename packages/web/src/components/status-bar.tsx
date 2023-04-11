import {
  Slash,
  CheckCircle2,
  CircleEllipsis,
  Check,
  RefreshCw,
  LucideProps,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactElement, cloneElement } from "react";

export type PubSubState = "disconnected" | "connected" | "connecting";
export type SyncState = "syncing" | "synced" | "partiallySynced";

interface StateAttributes {
  [state: string]: {
    icon: ReactElement<LucideProps>;
    color: string;
    tooltip?: string;
  };
}

const connectionStates: StateAttributes = {
  disconnected: {
    tooltip: "Disconnected from server",
    color: "red",
    icon: <Slash />,
  },
  connecting: {
    tooltip: "Connecting to server...",
    color: "orange",
    icon: <CircleEllipsis />,
  },
  connected: {
    tooltip: "Connected to server",
    color: "lightgreen",
    icon: <CheckCircle2 />,
  },
};

const syncStates: StateAttributes = {
  syncing: {
    tooltip: "Syncing session...",
    color: "orange",
    icon: <RefreshCw />,
  },
  synced: {
    tooltip: "Session synced",
    color: "lightgreen",
    icon: <Check />,
  },
  partiallySynced: {
    tooltip: "Session synced, but disconnected from server",
    color: "orange",
    icon: <HelpCircle />,
  },
};

function ConnectionIndicator({
  color,
  tooltip,
  icon,
}: {
  color: string;
  tooltip?: string;
  icon: ReactElement<LucideProps>;
}) {
  return (
    <Tooltip>
      <TooltipTrigger>
        {cloneElement(icon, {
          size: 12,
          color,
          className: "mr-1",
        })}
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent align="start">
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

function PubSubIndicator({ state }: { state: PubSubState }) {
  return <ConnectionIndicator {...connectionStates[state]} />;
}

function SyncIndicator({ state }: { state: SyncState }) {
  return <ConnectionIndicator {...syncStates[state]} />;
}

export function StatusBar({
  pubSubState,
  syncState,
}: {
  pubSubState?: PubSubState;
  syncState?: SyncState;
}) {
  return (
    <TooltipProvider delayDuration={50}>
      <div className="fixed bottom-0 left-0 z-10 h-6 w-screen p-1 pl-2 pr-2 text-xs flex flex-row">
        {pubSubState && (
          <div>
            <PubSubIndicator state={pubSubState} />
          </div>
        )}
        {syncState && (
          <div>
            <SyncIndicator state={syncState} />
          </div>
        )}
        <div className="grow" />
        {/* <div>Right</div> */}
      </div>
    </TooltipProvider>
  );
}
