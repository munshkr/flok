import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogProps } from "@radix-ui/react-dialog";
import { useState, FormEvent, useEffect } from "react";

interface UsernameDialogProps extends DialogProps {
  name?: string;
  defaultValue?: string;
  onAccept?: (name: string) => void;
}

export default function UsernameDialog({
  name,
  onAccept,
  ...props
}: UsernameDialogProps) {
  const [nameValue, setNameValue] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onAccept && nameValue) {
      onAccept(nameValue);
    }
    props.onOpenChange && props.onOpenChange(false);
  };

  useEffect(() => {
    if (!props.open) setNameValue("");
  }, [props.open]);

  return (
    <Dialog {...props}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change user name</DialogTitle>
            <DialogDescription>
              It will be shown below your cursor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={nameValue}
                placeholder={name || "Enter a username... "}
                className="col-span-3"
                onChange={(e) => setNameValue(e.target.value.trim())}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
