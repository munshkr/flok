import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";

interface ConfigureDialogProps extends DialogProps {
  onAccept?: (targets: string[]) => void;
}

export function WelcomeDialog({
  onOpenChange,
  ...props
}: ConfigureDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Welcome to Flok! ✨</DialogTitle>
          <DialogDescription>
            This is a collaborative live coding editor. You can invite your
            friends to live code together in real-time, using a number of
            languages and tools.
          </DialogDescription>
          <DialogDescription>
            Read more{" "}
            <a
              className="text-gray-300 font-bold"
              href="https://github.com/munshkr/flok"
              target="_blank"
            >
              here
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange && onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
