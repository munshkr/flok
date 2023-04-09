import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";
import { Link } from "react-router-dom";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ReplsDialogProps extends DialogProps {
  targets: string[];
  sessionUrl: string;
  sessionName: string;
}

export function ReplsDialog({
  targets,
  sessionUrl,
  sessionName,
  ...props
}: ReplsDialogProps) {
  const [copied, setCopied] = useState(false);

  const replCommand =
    `npx flok-repl -H ${sessionUrl} ` +
    `-s ${sessionName} ` +
    `-t ${targets.join(" ")}`;

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
    navigator.clipboard.writeText(replCommand);
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>REPL Configuration</DialogTitle>
          <DialogDescription>
            This session has one or more targets that need an external REPL
            process to run on your computer. To run code executed on these
            targets, you will need to run <code>flok-repl</code> on a terminal,
            like this:
          </DialogDescription>
          <div className="flex items-center mt-4 mb-4">
            <pre className="rounded bg-slate-800 mr-3 p-3 whitespace-pre-wrap">
              {replCommand}
            </pre>
            <Button variant="outline" onClick={copyToClipboard} size="sm">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
          <DialogDescription>
            For more information, read{" "}
            <Link
              to="https://github.com/munshkr/flok#connect-repls-to-flok"
              reloadDocument
              target="_blank"
            >
              here
            </Link>
            .
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
