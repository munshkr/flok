import TargetSelect from "@/components/target-select";
import Editor from "@/components/editor";
import type { Document } from "@flok-editor/session";
import { EvaluateButton } from "@/components/evaluate-button";
import { cn } from "@/lib/utils";

interface PaneProps {
  document: Document;
  autoFocus?: boolean;
  halfHeight?: boolean;
  onTargetChange: (document: Document, target: string) => void;
  onEvaluateButtonClick: (document: Document) => void;
}

export function Pane({
  document,
  autoFocus,
  halfHeight,
  onTargetChange,
  onEvaluateButtonClick,
}: PaneProps) {
  return (
    <div className={cn("relative", halfHeight ? "h-[50vh]" : "h-screen")}>
      <TargetSelect
        triggerProps={{
          className:
            "absolute z-10 top-0 w-auto h-6 border-none focus:ring-0 focus:ring-offset-0 p-1 bg-slate-900 bg-opacity-70",
        }}
        value={document.target}
        onValueChange={(target) => onTargetChange(document, target)}
      />
      <Editor
        document={document}
        autoFocus={autoFocus}
        className={cn(
          "absolute top-6 overflow-auto flex-grow w-full",
          halfHeight ? "h-[calc(100%-24px)]" : "h-full"
        )}
      />
      <EvaluateButton
        className="absolute z-10 right-4 top-6 md:hidden"
        onClick={() => onEvaluateButtonClick(document)}
      />
    </div>
  );
}
