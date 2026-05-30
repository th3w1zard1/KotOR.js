<<<<<<< HEAD
import React, { useState } from "react";
import { BaseTabProps } from "../../../interfaces/BaseTabProps";
import { useEffectOnce } from "../../../helpers/UseEffectOnce";
import { TabProjectExplorerState } from "../../../states/tabs";
import { FileTypeManager } from "../../../FileTypeManager";
import { EditorFile } from "../../../EditorFile";
import { FileLocationType } from "../../../enum/FileLocationType";
import { FileBrowserNode } from "../../../FileBrowserNode";
import { ForgeTreeView } from "../../treeview/ForgeTreeView";
import { ForgeState } from "../../../states/ForgeState";
import { Project } from "../../../Project";
import { useContextMenu, ContextMenuItem } from "../../common/ContextMenu";
import { TabReferenceFinderState } from "../../../states/tabs/TabReferenceFinderState";
import "./TabProjectExplorer.scss";
=======
import React, { useCallback, useState } from "react";
import { BaseTabProps } from "@/apps/forge/interfaces/BaseTabProps";
import { useEffectOnce } from "@/apps/forge/helpers/UseEffectOnce";
import { TabGFFEditorState, TabProjectExplorerState } from "@/apps/forge/states/tabs";
import { FileTypeManager } from "@/apps/forge/FileTypeManager";
import { EditorFile } from "@/apps/forge/EditorFile";
import { FileBrowserNode } from "@/apps/forge/FileBrowserNode";
import { ForgeTreeView } from "@/apps/forge/components/treeview/ForgeTreeView";
import { ForgeState } from "@/apps/forge/states/ForgeState";
import { Project } from "@/apps/forge/Project";
import { compileAllNssInProject } from "@/apps/forge/helpers/ForgeNWScriptCompile";
import { ModalBulkNssCompileResultsState } from "@/apps/forge/states/modal/ModalBulkNssCompileResultsState";
import { ListItemNode } from "@/apps/forge/components/treeview/ListItemNode";
import { ContextMenuItem, useContextMenu } from "@/apps/forge/components/common/ContextMenu";
>>>>>>> upstream/master

function folderExpanded(expanded: Record<string, boolean>, relKey: string): boolean {
  if (expanded[relKey] !== undefined) return expanded[relKey] as boolean;
  return relKey === "";
}

function ExplorerTreeBranch(props: {
  node: FileBrowserNode;
<<<<<<< HEAD
  depth?: number;
  children?: any;
  onContextMenu?: (event: React.MouseEvent, node: FileBrowserNode) => void;
}
=======
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  depth: number;
  onResourceContextMenu?: (event: React.MouseEvent, node: FileBrowserNode) => void;
}) {
  const { node, expanded, setExpanded, depth, onResourceContextMenu } = props;
>>>>>>> upstream/master

  if (node.type === "resource") {
    const resPath = node.data?.path as string | undefined;
    return (
<<<<<<< HEAD
      <li
        onClick={(e) => onClickNode(e, props.node)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.onContextMenu?.(e, props.node);
        }}
      >
        <input title="Open State" type="checkbox" checked={!openState} onChange={(e) => onChangeCheckbox(e, props.node)} />
        <label onClick={(e) => onLabelClick(e, props.node)}>{node.name}</label>
        <ul>
          {
            (openState) ? (
              node.nodes.map( (child: FileBrowserNode) => (
                <ResourceListNode key={child.id} node={child} onContextMenu={props.onContextMenu} />
              ))
            ) : (<></>)
          }
        </ul>
      </li>
    );
  }else{
    return (
      <li
        className="link"
        data-path={node.data.path}
        onDoubleClick={(e) => onClickNode(e, props.node)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.onContextMenu?.(e, props.node);
        }}
      >
        {node.name}
      </li>
=======
      <ListItemNode
        id={`file:${String(node.data?.relPath ?? resPath ?? node.name)}`}
        name={node.name}
        depth={depth}
        hasChildren={false}
        isExpanded={false}
        iconType="file"
        onContextMenu={(e) => {
          if (resPath && typeof onResourceContextMenu === "function") {
            onResourceContextMenu(e, node);
          }
        }}
        onDoubleClick={() => {
          if (!resPath) return;
          FileTypeManager.onOpenResource(
            new EditorFile({
              path: resPath,
              useProjectFileSystem: true,
            })
          );
        }}
      />
>>>>>>> upstream/master
    );
  }

  const relKey = String(node.data?.relPath ?? "");
  const isExp = folderExpanded(expanded, relKey);
  const hasChildren = node.nodes.length > 0;

  const toggle = () => {
    setExpanded((prev) => {
      const cur = folderExpanded(prev, relKey);
      return { ...prev, [relKey]: !cur };
    });
  };

  return (
    <ListItemNode
      id={`folder:${relKey || "__root__"}`}
      name={node.name}
      depth={depth}
      hasChildren={hasChildren}
      isExpanded={isExp && hasChildren}
      iconType="folder"
      onToggle={toggle}
      onClick={toggle}
    >
      {hasChildren
        ? node.nodes.map((child: FileBrowserNode) => (
            <ExplorerTreeBranch
              key={`${child.type}-${child.data?.relPath ?? child.data?.path ?? ""}-${child.id}`}
              node={child}
              expanded={expanded}
              setExpanded={setExpanded}
              depth={depth + 1}
              onResourceContextMenu={onResourceContextMenu}
            />
          ))
        : null}
    </ListItemNode>
  );
}

export const TabProjectExplorer = function (props: BaseTabProps) {
  const [resourceList, setResourceList] = useState<FileBrowserNode[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "": true });
  const { showContextMenu, ContextMenuComponent } = useContextMenu("dark");

  const onResourceContextMenu = useCallback(
    (event: React.MouseEvent, node: FileBrowserNode) => {
      const nodeExt = (node.name?.split(".").pop() || "").toLowerCase();
      const gffLikeExtensions = new Set([
        "are",
        "bic",
        "dlg",
        "fac",
        "git",
        "gff",
        "ifo",
        "jrl",
        "res",
        "utc",
        "utd",
        "ute",
        "uti",
        "utm",
        "utp",
        "uts",
        "utt",
        "utw",
      ]);
      const canOpenWithGff =
        node.type === "resource" && !!node.data?.path && gffLikeExtensions.has(nodeExt);
      const canOpenWithHex = node.type === "resource" && !!node.data?.path;

      const items: ContextMenuItem[] = [];
      if (canOpenWithGff) {
        items.push({
          id: "open-with-gff",
          label: "Open with GFF",
          onClick: () => {
            ForgeState.tabManager.addTab(
              new TabGFFEditorState({
                editorFile: new EditorFile({
                  path: node.data!.path,
                  useProjectFileSystem: true,
                }),
              }),
            );
          },
        });
      }
      if (canOpenWithHex) {
        if (items.length) {
          items.push({ id: "sep-open-with-hex", separator: true });
        }
        items.push({
          id: "open-with-hex",
          label: "Open in hex editor",
          onClick: () => {
            FileTypeManager.openHexEditor({
              path: node.data!.path,
              useProjectFileSystem: true,
            });
          },
        });
      }
      if (items.length) {
        showContextMenu(event.clientX, event.clientY, items);
      }
    },
    [showContextMenu],
  );

  const { showContextMenu, ContextMenuComponent } = useContextMenu();

  useEffectOnce(() => {
    const tab = props.tab as TabProjectExplorerState;
    if (tab) {
      tab.onReload = () => {
        setResourceList([...TabProjectExplorerState.Resources]);
      };
      setResourceList([...TabProjectExplorerState.Resources]);
    }
  });

  const handleOpenProject = () => {
    Project.OpenByDirectory();
  };

  const runBulkCompileAllNss = async () => {
    if (bulkRunning) return;
    setBulkRunning(true);
    ForgeState.loaderShow();
    try {
      const outcome = await compileAllNssInProject();
      const modal = new ModalBulkNssCompileResultsState(outcome);
      modal.attachToModalManager(ForgeState.modalManager);
      modal.open();
    } finally {
      ForgeState.loaderHide();
      setBulkRunning(false);
    }
  };

  const runRefreshExplorer = async () => {
    if (refreshing || !ForgeState.project) return;
    setRefreshing(true);
    try {
      await TabProjectExplorerState.GenerateResourceList(ForgeState.projectExplorerTab);
    } finally {
      setRefreshing(false);
    }
  };

  const hasProject = !!ForgeState.project;
  if (!hasProject) {
    return (
<<<<<<< HEAD
      <div className="scroll-container tab-project-explorer__empty">
        <div className="tab-project-explorer__empty-message">
=======
      <div
        className="scroll-container"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            color: "#ccc",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
>>>>>>> upstream/master
          No project is currently open.
        </div>
        <button
          type="button"
          className="tab-project-explorer__open-project-btn"
          onClick={handleOpenProject}
<<<<<<< HEAD
=======
          style={{
            padding: "8px 16px",
            backgroundColor: "#007acc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#005a9e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#007acc";
          }}
>>>>>>> upstream/master
        >
          Open Project
        </button>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="scroll-container tab-project-explorer__scroll">
      <ForgeTreeView>
        {
          resourceList.map( (node: FileBrowserNode) => {
            return (
              <ResourceListNode
                key={node.id}
                node={node}
                depth={0}
                onContextMenu={(e, n) => {
                  const items: ContextMenuItem[] = [];

                  if(n.type === 'resource'){
                    const resref = (n.name || '').split('.')[0] ?? '';
                    items.push({
                      id: 'open-file',
                      label: 'Open File',
                      onClick: () => {
                        FileTypeManager.onOpenResource(
                          new EditorFile({
                            path: n.data.path,
                            useProjectFileSystem: true,
                          })
                        );
                      }
                    });
                    items.push({
                      id: 'copy-resref',
                      label: 'Copy ResRef',
                      disabled: !resref.length,
                      onClick: async () => {
                        if (resref && navigator.clipboard?.writeText) {
                          await navigator.clipboard.writeText(resref);
                        }
                      }
                    });
                    items.push({ id: 'sep-1', separator: true });
                    items.push({
                      id: 'find-references',
                      label: 'Find References…',
                      disabled: !resref.length,
                      onClick: () => {
                        ForgeState.tabManager.addTab(
                          new TabReferenceFinderState({ query: resref, scope: 'project' })
                        );
                      }
                    });
                  }

                  if(items.length){
                    showContextMenu((e as any).clientX, (e as any).clientY, items);
                  }
                }}
              />
            )
          })
        }
      </ForgeTreeView>

=======
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="scroll-container" style={{ width: "100%", flex: 1, overflow: "auto" }}>
        <ForgeTreeView>
          {resourceList.map((root: FileBrowserNode) => (
            <ExplorerTreeBranch
              key={`root-${root.id}`}
              node={root}
              expanded={expanded}
              setExpanded={setExpanded}
              depth={0}
              onResourceContextMenu={onResourceContextMenu}
            />
          ))}
        </ForgeTreeView>
      </div>
>>>>>>> upstream/master
      {ContextMenuComponent}
    </div>
  );
};
