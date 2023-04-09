import { Button, ButtonProps } from "./ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export const EvaluateButton = (props: ButtonProps) => (
  <Button
    variant="outline"
    className={cn("p-1 bg-opacity-50 bg-black", props?.className)}
    {...props}
  >
    <Play />
  </Button>
);
