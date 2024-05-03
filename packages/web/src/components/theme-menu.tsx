import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";

interface ConfigureDialogProps extends DialogProps {
  onAccept?: (targets: string[]) => void;
}

export function ThemeMenu({ ...props }: ConfigureDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Theme Selection</DialogTitle>
          <DialogDescription>
            Select a theme
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
