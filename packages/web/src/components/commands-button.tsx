import { Button, ButtonProps } from "./ui/button";
import { Command } from "lucide-react";

export const CommandsButton = (props: ButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-5 w-5 p-1 m-1 fixed top-1 right-1 bg-opacity-50 bg-black"
    {...props}
  >
    <Command />
  </Button>
);
