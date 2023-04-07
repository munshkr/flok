import { Button, ButtonProps } from "./ui/button";
import { Command } from "lucide-react";

export const CommandsButton = (props: ButtonProps) => (
  <Button
    variant="ghost"
    className="h-5 w-5 p-1 ml-2 bg-opacity-50 bg-black"
    {...props}
  >
    <Command />
  </Button>
);
