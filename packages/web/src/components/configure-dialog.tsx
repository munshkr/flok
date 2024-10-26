import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultTarget, knownTargets } from "@/settings.json";
import { DialogProps } from "@radix-ui/react-dialog";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
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
  targets: string[];
  sessionName: string;
  sessionUrl: string;
  userName: string;
  OS: string;
  onAccept?: (targets: string[]) => void;
}

export function ConfigureDialog({
  targets,
  sessionName,
  sessionUrl,
  userName,
  OS,
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
            <DialogTitle>Configure Layout</DialogTitle>
            <DialogDescription>
              Enter a list of targets, separated by comma.
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
              OS={OS}
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
