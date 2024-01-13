import { EvaluateButton } from "@/components/evaluate-button";
import TargetSelect from "@/components/target-select";
import { cn } from "@/lib/utils";
import type { Document } from "@flok-editor/session";
import { PropsWithChildren } from "react";

interface PaneProps extends PropsWithChildren {
  document: Document;
  halfHeight?: boolean;
  onTargetChange: (document: Document, target: string) => void;
  onEvaluateButtonClick: (document: Document) => void;
}

export const Pane = ({
  children,
  document,
  halfHeight,
  onTargetChange,
  onEvaluateButtonClick,
}: PaneProps) => (
  <div
    className={cn(
      "flex overflow-auto relative",
      halfHeight ? "h-[50vh]" : "h-screen"
    )}
  >
    <TargetSelect
      triggerProps={{
        className:
          "absolute z-10 top-0 w-auto h-6 border-none focus:ring-0 focus:ring-offset-0 p-1 bg-slate-900 bg-opacity-70",
      }}
      value={document.target}
      onValueChange={(target) => onTargetChange(document, target)}
    />
    {children}
    <EvaluateButton
      className="absolute z-10 right-4 top-6 sm:hidden"
      onClick={() => onEvaluateButtonClick(document)}
    />
  </div>
);
