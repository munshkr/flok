import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectProps, SelectTriggerProps } from "@radix-ui/react-select";
import { knownTargets } from "@/settings.json";

interface TargetSelectProps extends SelectProps {
  triggerProps: SelectTriggerProps;
}

export default function TargetSelect({
  triggerProps,
  ...props
}: TargetSelectProps) {
  return (
    <Select {...props}>
      <SelectTrigger {...triggerProps}>
        <SelectValue placeholder="Target" />
      </SelectTrigger>
      <SelectContent>
        {knownTargets.sort().map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
