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

export function FontMenu({ ...props }: ConfigureDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Font Selection</DialogTitle>
          <DialogDescription>
            Select a font
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
