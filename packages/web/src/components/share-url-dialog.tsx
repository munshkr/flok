import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface ConfigureDialogProps extends DialogProps {
  url: string;
  onAccept?: (targets: string[]) => void;
}

export function ShareUrlDialog({ url, ...props }: ConfigureDialogProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
    navigator.clipboard.writeText(url);
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Session</DialogTitle>
          <DialogDescription>
            Copy the URL below and share it with your friends. This URL contains
            a copy of the current session layout and code.
          </DialogDescription>
          <div className="mt-4 mb-4 relative">
            <pre className="rounded bg-slate-800 p-3 whitespace-pre-wrap overflow-x-auto text-sm">
              {url}
            </pre>
            <Button
              className="absolute top-3 right-3 dark:hover:bg-slate-700"
              variant="outline"
              onClick={copyToClipboard}
              size="sm"
              type="button"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
