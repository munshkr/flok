import {
  Slash,
  CheckCircle2,
  CircleEllipsis,
  Check,
  RefreshCw,
  LucideProps,
  HelpCircle,
  Mail,
  ChevronUp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PropsWithChildren, ReactElement, cloneElement } from "react";
import { Button } from "./ui/button";

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
      <TooltipTrigger className="h-full">
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

interface MessagesCounterProps extends PropsWithChildren {
  tooltip?: string;
}

function MessagesCounter({ children, tooltip }: MessagesCounterProps) {
  return (
    <Tooltip>
      <TooltipTrigger className="flex flex-row">{children}</TooltipTrigger>
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

function MessagesPanelToggle({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="bg-black bg-opacity-50 hover:bg-slate-800 hover:bg-opacity-100 rounded-md p-1"
      onClick={onClick}
    >
      <ChevronUp size={14} />
    </button>
  );
}

export function StatusBar({
  className,
  pubSubState,
  syncState,
  messagesCount,
  onExpandClick,
}: {
  className?: string;
  pubSubState?: PubSubState;
  syncState?: SyncState;
  messagesCount?: number;
  onExpandClick?: () => void;
}) {
  return (
    <TooltipProvider delayDuration={50}>
      <div
        className={cn(
          "fixed bottom-0 left-0 z-10 h-8 w-screen p-1 pl-2 pr-2 text-xs flex flex-row shadow-lg shadow-black/50",
          className
        )}
      >
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
        {messagesCount && messagesCount > 0 ? (
          <>
            <div className="ml-2 mr-2 flex flex-row items-center bg-black bg-opacity-50 pl-2 pr-2 rounded-md">
              <MessagesCounter tooltip="Total unseen messages">
                <Mail size={14} className="mr-1" />
                {messagesCount}
              </MessagesCounter>
            </div>
            <div>
              <MessagesPanelToggle onClick={onExpandClick} />
            </div>
          </>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
