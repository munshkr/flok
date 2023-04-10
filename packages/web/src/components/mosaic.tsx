import { ReactNode, useMemo, cloneElement } from "react";
import { cn } from "@/lib/utils";

interface MosaicProps {
  className: string;
  items: ReactNode[];
}

export function Mosaic({ className, items }: MosaicProps) {
  const itemsByRows = (items: ReactNode[]) => {
    let rows: ReactNode[][] = [];

    switch (items.length) {
      case 0:
        rows = [];
        break;
      case 1:
      case 2:
        rows = [items];
        break;
      case 3:
        rows = [items.slice(0, 2), [items[2]]];
        break;
      case 4:
        rows = [items.slice(0, 2), items.slice(2, 4)];
        break;
      case 5:
        rows = [items.slice(0, 3), items.slice(3, 5)];
        break;
      case 6:
        rows = [items.slice(0, 3), items.slice(3, 6)];
        break;
      case 7:
        rows = [items.slice(0, 4), items.slice(4, 7)];
        break;
      case 8:
        rows = [items.slice(0, 4), items.slice(4, 8)];
        break;
      default:
        console.warn("More than 8 slots are not supported right now");
        rows = [items.slice(0, 4), items.slice(4, 8)];
    }

    return rows;
  };

  const rows = useMemo(() => itemsByRows(items), [items]);
  const halfHeight = rows.length > 1;

  return (
    <div
      className={cn(
        "flex flex-col items-stretch p-1 h-screen gap-1",
        className
      )}
    >
      {rows.map((rowItems, i) => (
        <div
          className={cn(
            "flex flex-row gap-1",
            halfHeight ? "h-[50vh]" : "h-screen"
          )}
          key={i}
        >
          {rowItems.map((item: any, j: number) => (
            <div
              key={`${i}-${j}`}
              className="flex-grow bg-transparent basis-full"
            >
              {cloneElement(item, { halfHeight })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
