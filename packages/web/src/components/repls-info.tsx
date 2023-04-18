import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { webTargets } from "@/settings.json";

interface ReplsInfoProps {
  targets: string[];
  sessionUrl: string;
  sessionName: string;
  userName: string;
}

export function ReplsInfo({
  targets,
  sessionUrl,
  sessionName,
  userName,
}: ReplsInfoProps) {
  const [copied, setCopied] = useState(false);

  const replTargets = targets.filter((t) => !webTargets.includes(t));
  if (replTargets.length === 0) return null;

  const replCommand =
    `npx flok-repl@latest -H ${sessionUrl} \\\n` +
    `  -s ${sessionName} \\\n` +
    `  -t ${replTargets.join(" ")} \\\n` +
    `  -T user:${userName}`;

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
    navigator.clipboard.writeText(replCommand);
  };

  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        This session has one or more targets that need an external REPL process
        to run on your computer. To run code executed on these targets, you will
        need to run <code>flok-repl</code> on a terminal, like this:
      </p>
      <div className="flex items-center mt-4 mb-4">
        <pre className="rounded bg-slate-800 mr-3 p-3 whitespace-pre-wrap">
          {replCommand}
        </pre>
        <Button
          variant="outline"
          onClick={copyToClipboard}
          size="sm"
          type="button"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        For more information, read{" "}
        <Link
          to="https://github.com/munshkr/flok#connect-repls-to-flok"
          reloadDocument
          target="_blank"
        >
          here
        </Link>
        .
      </p>
    </div>
  );
}
