import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const knownTargets = [
  "tidal",
  "hydra",
  "foxdot",
  "sclang",
  "sardine",
  "mercury",
];

interface TargetSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TargetSelect({ value, onChange }: TargetSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Target" />
      </SelectTrigger>
      <SelectContent>
        {knownTargets.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
