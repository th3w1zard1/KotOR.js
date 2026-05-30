<<<<<<< HEAD
import type React from "react";
import { TabState } from "../states/tabs";
=======
import { TabState } from "@/apps/forge/states/tabs";
>>>>>>> upstream/master

export interface BaseTabProps {
  tab: TabState;
  northContent?: React.ReactElement;
  southContent?: React.ReactElement;
  eastContent?: React.ReactElement;
  westContent?: React.ReactElement;
}