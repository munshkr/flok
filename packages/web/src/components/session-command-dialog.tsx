"use client";

import { useEffect, useState } from "react";
import { Edit2, FilePlus, Minus, Plus, Github, Settings } from "lucide-react";
import {
  CommandDialog,
  CommandDialogProps,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Link } from "react-router-dom";
import { repoUrl, changeLogUrl } from "@/settings.json";

interface SessionCommandDialogProps extends CommandDialogProps {
  onSessionChangeUsername: () => void;
  onSessionNew: () => void;
  onLayoutAdd: () => void;
  onLayoutRemove: () => void;
  onLayoutConfigure: () => void;
}

export default function SessionCommandDialog(props: SessionCommandDialogProps) {
  const wrapHandler = (callback: () => void) => {
    return () => {
      const { onOpenChange } = props;

      callback();
      if (onOpenChange) onOpenChange(false);
    };
  };

  return (
    <CommandDialog {...props}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Session">
          <CommandItem onSelect={wrapHandler(props.onSessionChangeUsername)}>
            <Edit2 className="mr-2 h-4 w-4" />
            <span>Change Username</span>
          </CommandItem>
          <CommandItem onSelect={wrapHandler(props.onSessionNew)}>
            <FilePlus className="mr-2 h-4 w-4" />
            <span>New</span>
          </CommandItem>
          {/* <CommandItem>
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Open</span>
          </CommandItem>
          <CommandItem>
            <span className="ml-7">Open Recent</span>
          </CommandItem>
          <CommandItem>
            <Save className="mr-2 h-4 w-4" />
            <span>Save As...</span>
          </CommandItem> */}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Layout">
          {/* <CommandItem disabled onSelect={wrapHandler(props.onLayoutConfigure)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configure</span>
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem> */}
          <CommandItem onSelect={wrapHandler(props.onLayoutAdd)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Pane</span>
          </CommandItem>
          <CommandItem onSelect={wrapHandler(props.onLayoutRemove)}>
            <Minus className="mr-2 h-4 w-4" />
            <span>Remove Pane</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Help">
          {/* <CommandItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Quickstart</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span className="ml-7">Show All Commands</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem> */}
          <Link to={changeLogUrl} reloadDocument target="_blank">
            <CommandItem>
              <span>Show Release Notes</span>
            </CommandItem>
          </Link>
          <Link to={repoUrl} reloadDocument target="_blank">
            <CommandItem>
              <Github className="mr-2 h-4 w-4" />
              <span>Go to GitHub</span>
            </CommandItem>
          </Link>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
