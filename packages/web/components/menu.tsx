"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "@/components/ui/menubar";
import ThemeToggle from "./theme-toggle";
import ConfigureDialog from "./configure-dialog";

interface IMenuProps {
  onSessionConfigure?: any;
  onViewLayoutAdd?: any;
  onViewLayoutRemove?: any;
}

export default function Menu({
  onSessionConfigure,
  onViewLayoutAdd,
  onViewLayoutRemove,
}: IMenuProps) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Session</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={onSessionConfigure}>
            Configure<MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>New</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Open</MenubarItem>
          <MenubarItem>Open Recent</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Save As...</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Layout</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={onViewLayoutAdd}>Add</MenubarItem>
              <MenubarItem onClick={onViewLayoutRemove}>Remove</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Quickstart <MenubarShortcut>⌘H</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Show All Commands <MenubarShortcut>⌘K</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Show Release Notes</MenubarItem>
          <MenubarItem>Go to GitHub</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <ThemeToggle />
    </Menubar>
  );
}
