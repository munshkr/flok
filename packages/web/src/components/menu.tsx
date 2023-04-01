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

interface MenuProps {
  onSessionConfigure?: (e: Event) => void;
  onSessionChangeUsername?: (e: Event) => void;
  onViewLayoutAdd?: (e: Event) => void;
  onViewLayoutRemove?: (e: Event) => void;
}

export default function Menu({
  onSessionConfigure,
  onSessionChangeUsername,
  onViewLayoutAdd,
  onViewLayoutRemove,
}: MenuProps) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Session</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={onSessionConfigure}>
            Configure<MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onSelect={onSessionChangeUsername}>
            Change username
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
              <MenubarItem onSelect={onViewLayoutAdd}>Add</MenubarItem>
              <MenubarItem onSelect={onViewLayoutRemove}>Remove</MenubarItem>
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
    </Menubar>
  );
}
