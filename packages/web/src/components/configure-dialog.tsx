import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogProps } from "@radix-ui/react-dialog";
import { Input, InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { knownTargets, defaultTarget } from "@/settings.json";
import { useState, useMemo, FormEvent, ChangeEvent, useEffect } from "react";
import { ReplsInfo } from "./repls-info";

function TargetsInput(props: InputProps) {
  return (
    <div className="grid w-full items-center gap-1.5 mt-4 mb-2">
      <Label className="mb-1" htmlFor="email-2">
        Targets
      </Label>
      <Input {...props} />
      <div className="text-sm text-slate-500 mb-2">
        <span>Known targets are: </span>
        <ul className="inline list-none p-0">
          {knownTargets.map((t) => (
            <li
              key={t}
              className="inline after:content-[',_'] last:after:content-none"
            >
              <code>{t}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface ConfigureDialogProps extends DialogProps {
  isWelcome: boolean;
  targets: string[];
  sessionName: string;
  sessionUrl: string;
  userName: string;
  onAccept?: (targets: string[]) => void;
}

export function ConfigureDialog({
  isWelcome,
  targets,
  sessionName,
  sessionUrl,
  userName,
  onAccept,
  ...props
}: ConfigureDialogProps) {
  const [targetsValue, setTargetsValue] = useState("");

  useEffect(() => {
    if (!props.open) {
      setTargetsValue("");
    }
  }, [props.open]);

  const newTargets = useMemo(
    () =>
      targetsValue
        .split(",")
        .map((t) => t.trim())
        .filter((t) => knownTargets.includes(t)),
    [targetsValue]
  );

  const newOrCurrentTargets = newTargets.length > 0 ? newTargets : targets;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTargetsValue(newOrCurrentTargets.join(", "));
    if (onAccept) {
      if (newOrCurrentTargets.length === 0)
        newOrCurrentTargets.push(defaultTarget);
      console.log("new targets", newOrCurrentTargets);
      onAccept(newOrCurrentTargets);
    }
    props.onOpenChange && props.onOpenChange(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTargetsValue(e.target.value.replace(/,\s*/g, ", ").trim());
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isWelcome ? "Welcome to Flok! ✨" : "Configure Layout"}
            </DialogTitle>
            <DialogDescription>
              {isWelcome
                ? "This is a collaborative live coding editor. To get started, enter a list of targets, separated by comma."
                : "Enter a list of targets, separated by comma."}
            </DialogDescription>
          </DialogHeader>
          <TargetsInput
            value={targetsValue}
            placeholder={targets.join(", ")}
            onChange={handleChange}
          />
          {newOrCurrentTargets.length > 0 && (
            <ReplsInfo
              targets={newOrCurrentTargets}
              sessionName={sessionName}
              sessionUrl={sessionUrl}
              userName={userName}
            />
          )}
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
