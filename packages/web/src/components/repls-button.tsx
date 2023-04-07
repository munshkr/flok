import { Button, ButtonProps } from "./ui/button";

export const ReplsButton = (props: ButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-5 ml-2 bg-opacity-50 bg-black"
    {...props}
  >
    <span className="text-xs">REPLs</span>
  </Button>
);
