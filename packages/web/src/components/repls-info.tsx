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
  OS: string;
}

export function ReplsInfo({
  targets,
  sessionUrl,
  sessionName,
  userName,
  OS,
}: ReplsInfoProps) {
  const [copied, setCopied] = useState(false);

  const replTargets = targets.filter((t) => !webTargets.includes(t));
  if (replTargets.length === 0) return null;

  const terminalSpec = (OS === "windows" ? 'PowerShell ' : '');
  const lineSeparator = (OS === 'windows' ? `\`` : `\\`);

  const replCommand =
    `npx flok-repl@latest -H ${sessionUrl} ${lineSeparator}\n` +
    `  -s ${sessionName} ${lineSeparator}\n` +
    `  -t ${replTargets.join(" ")} ${lineSeparator}\n` +
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
        need to run <code>flok-repl</code> on a {terminalSpec}terminal, like this:
      </p>
      <div className="mt-4 mb-4 relative">
        <pre className="rounded bg-slate-800 mr-3 p-3 whitespace-pre-wrap w-full">
          {replCommand}
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
