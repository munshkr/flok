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
import { Link } from "react-router-dom";
import { repoUrl, changeLogUrl } from "@/settings.json";

interface MenuProps {
  onSessionConfigure?: (e: Event) => void;
  onSessionChangeUsername?: (e: Event) => void;
  onSessionNew?: (e: Event) => void;
  onViewLayoutAdd?: (e: Event) => void;
  onViewLayoutRemove?: (e: Event) => void;
}

export default function SessionMenu({
  onSessionConfigure,
  onSessionChangeUsername,
  onSessionNew,
  onViewLayoutAdd,
  onViewLayoutRemove,
}: MenuProps) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Session</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled onSelect={onSessionConfigure}>
            Configure<MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onSelect={onSessionChangeUsername}>
            Change username
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onSelect={onSessionNew}>New</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Open</MenubarItem>
          <MenubarItem disabled>Open Recent</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Save As...</MenubarItem>
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
          <MenubarItem disabled>
            Quickstart <MenubarShortcut>⌘H</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Show All Commands <MenubarShortcut>⌘K</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <Link to={changeLogUrl} reloadDocument target="_blank">
            <MenubarItem>Show Release Notes</MenubarItem>
          </Link>
          <Link to={repoUrl} reloadDocument target="_blank">
            <MenubarItem>Go to GitHub</MenubarItem>
          </Link>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
