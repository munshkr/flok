import { PropsWithChildren } from "react";

export default function Pane({ children }: PropsWithChildren) {
  return <div className="relative">{children}</div>;
}
