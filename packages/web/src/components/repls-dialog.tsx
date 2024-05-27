import { ReplsInfo } from "@/components/repls-info";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";

interface ReplsDialogProps extends DialogProps {
  targets: string[];
  sessionUrl: string;
  sessionName: string;
  userName: string;
  OS: string;
}

export function ReplsDialog({
  targets,
  sessionUrl,
  sessionName,
  userName,
  OS,
  ...props
}: ReplsDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>REPL Configuration</DialogTitle>
          <ReplsInfo
            targets={targets}
            sessionName={sessionName}
            sessionUrl={sessionUrl}
            userName={userName}
            OS={OS}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
