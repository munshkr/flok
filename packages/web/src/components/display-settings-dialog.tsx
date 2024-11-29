import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DisplaySettings,
  sanitizeDisplaySettings,
} from "@/lib/display-settings";
import { DialogProps } from "@radix-ui/react-dialog";
import { FormEvent, useState } from "react";

interface DisplaySettingsDialogProps extends DialogProps {
  settings: DisplaySettings;
  onAccept: (settings: DisplaySettings) => void;
}

export default function DisplaySettingsDialog({
  settings,
  onAccept,
  ...props
}: DisplaySettingsDialogProps) {
  const [unsavedSettings, setUnsavedSettings] = useState({ ...settings });
  const sanitizeAndSetUnsavedSettings = (settings: DisplaySettings) =>
    setUnsavedSettings(sanitizeDisplaySettings(settings));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAccept(unsavedSettings);
    props.onOpenChange && props.onOpenChange(false);
  };

  return (
    <Dialog {...props}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change display settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Canvas pixel size
              </Label>
              <Input
                id="canvasPixelSize"
                type="number"
                value={unsavedSettings.canvasPixelSize}
                className="col-span-3"
                onChange={(e) =>
                  sanitizeAndSetUnsavedSettings({
                    ...unsavedSettings,
                    canvasPixelSize: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Show canvas
              </Label>
              <input
                id="showCanvas"
                type="checkbox"
                checked={unsavedSettings.showCanvas}
                className="w-5"
                onChange={(e) =>
                  sanitizeAndSetUnsavedSettings({
                    ...unsavedSettings,
                    showCanvas: e.target.checked,
                  })
                }
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
