# KotOR.js Development Roadmap

This roadmap outlines the development goals for KotOR.js, organized into four major phases with detailed subsections and actionable tasks. Each item includes specific code references where relevant.

## Overview

The project aims to create a complete, faithful recreation of the Odyssey Game Engine that powered both KotOR games, followed by implementing modern enhancements and tooling. Development is organized into four primary phases:

1. **Phase 1**: KotOR I Feature Parity
2. **Phase 2**: KotOR II Feature Parity  
3. **Phase 3**: Forge Modding Tool Development
4. **Phase 4**: Engine Enhancements & Community Features

---

## Phase 1: KotOR I Feature Parity

Achieve 1:1 parity with the first Knights of the Old Republic game to ensure full functionality and accurate gameplay.

### 1.1 Core Rendering & Graphics

#### 1.1.1 Lighting System
- [ ] **Dynamic Lighting**: Complete implementation of dynamic light sources
  - Reference: [`src/managers/LightManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/LightManager.ts)
  - Reference: [`src/three/odyssey/OdysseyLight3D.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/three/odyssey/OdysseyLight3D.ts)
- [ ] **Ambient Lighting**: Fix lighting intensity and color calculations
  - Reference: [`src/module/ModuleArea.ts:989-991`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleArea.ts#L989-L991)
- [ ] **Light Culling**: Optimize light rendering for performance
  - Reference: [`src/managers/LightManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/LightManager.ts)

#### 1.1.2 Shadow System
- [ ] **Shadow Casting**: Implement proper shadow projection from models
  - Reference: [`src/odyssey/controllers/ShadowRadiusController.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/odyssey/controllers/ShadowRadiusController.ts)
- [ ] **Shadow Quality**: Implement shadow map resolution settings
  - Reference: [`src/three/odyssey/OdysseyModel3D.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/three/odyssey/OdysseyModel3D.ts)
- [ ] **Shadow Culling**: Optimize shadow rendering performance

#### 1.1.3 Browser Compatibility
- [x] **Chrome Support**: Functional in Chrome (completed)
- [ ] **Firefox Support**: Resolve initialization issues preventing startup on Firefox
  - Reference: [`src/GameInitializer.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/GameInitializer.ts)
- [ ] **Cross-browser Testing**: Validate rendering across major browsers

### 1.2 User Interface & Controls

#### 1.2.1 Input Handling
- [ ] **Keyboard Navigation**: Enable arrow key navigation in menus
  - Reference: [`src/controls/IngameControls.ts:60-72`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/IngameControls.ts#L60-L72)
  - Reference: [`src/controls/Keyboard.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/Keyboard.ts)
- [ ] **Double-Click Support**: Enable double-click to load saves
  - Reference: [`src/game/kotor/menu/MenuSaveLoad.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/MenuSaveLoad.ts)
- [ ] **Enter Key Actions**: Enable Enter key to confirm selections in menus
  - Reference: [`src/gui/GameMenu.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/gui/GameMenu.ts)
- [ ] **Menu Hotkey Swapping**: Fix hotkey menu switching (M/I alternation)
  - Reference: [`src/controls/KeyMapper.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/KeyMapper.ts)
  - Reference: [`src/enums/controls/KeyMapAction.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/enums/controls/KeyMapAction.ts)

#### 1.2.2 Mouse & Camera Controls
- [ ] **Cursor Rendering**: Fix green pixel artifacts on cursor hover
  - Reference: [`src/managers/CursorManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/CursorManager.ts)
  - Reference: [`src/controls/Mouse.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/Mouse.ts)
- [ ] **Right-Click Camera Rotation**: Implement camera rotation on right mouse button
  - Reference: [`src/controls/IngameControls.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/IngameControls.ts)
  - Reference: [`src/module/ModuleCamera.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleCamera.ts)
- [ ] **Freelook Camera**: Implement freelook camera mode
  - Reference: [`src/engine/FollowerCamera.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/engine/FollowerCamera.ts)
- [ ] **Two-Button Movement**: Enable forward movement by holding both mouse buttons
  - Reference: [`src/controls/IngameControls.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/IngameControls.ts)

#### 1.2.3 GUI Menus & Screens
- [ ] **Gameplay Menu**: Implement gameplay settings menu
  - Reference: [`src/game/kotor/menu/MenuOptions.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/MenuOptions.ts)
- [ ] **Feedback Menu**: Implement feedback settings menu
  - Reference: [`src/managers/MenuManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/MenuManager.ts)
- [ ] **Abilities Menu**: Fix abilities menu functionality
  - Reference: [`src/game/kotor/menu/MenuAbilities.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/MenuAbilities.ts)
- [ ] **Party Selection via Map**: Enable Enter key on map to open party selection
  - Reference: [`src/game/kotor/menu/MenuMap.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/MenuMap.ts)
- [ ] **Party Member Swapping**: Enable party member changes on character sheet
  - Reference: [`src/game/kotor/menu/MenuCharacter.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/MenuCharacter.ts)
- [ ] **Menu Icon Highlighting**: Fix inappropriate icon highlighting in menus
  - Reference: [`src/gui/GUIControl.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/gui/GUIControl.ts)
- [ ] **Character Model Loading**: Fix injured state display during character sheet load
  - Reference: [`src/game/kotor/menu/MenuCharacter.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/MenuCharacter.ts)

### 1.3 Movement & Pathfinding

#### 1.3.1 Player Movement
- [ ] **Movement Acceleration**: Reduce acceleration rate to match original game
  - Reference: [`src/module/ModuleCreature.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleCreature.ts)
- [ ] **Movement Velocity**: Fix excessive movement speed (especially with alacrity stim)
  - Reference: [`src/module/ModuleObject.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleObject.ts)
- [ ] **Movement Deceleration**: Increase deceleration rate for proper stopping behavior
  - Reference: [`src/module/ModuleCreature.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleCreature.ts)
- [ ] **Direction Switching**: Smooth transition when switching directions (W to S)
  - Reference: [`src/controls/IngameControls.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/IngameControls.ts)
- [ ] **Wall Collision Bump**: Implement backward bump when stopping against walls
  - Reference: [`src/module/ModuleObject.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleObject.ts)
- [ ] **Walk Toggle**: Implement walk mode toggle functionality
  - Reference: [`src/controls/KeyMapper.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/KeyMapper.ts)

#### 1.3.2 NPC Pathfinding
- [ ] **Path Calculation**: Improve NPC pathfinding algorithms
  - Reference: [`src/engine/pathfinding/PathPoint.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/engine/pathfinding/PathPoint.ts)
  - Reference: [`src/engine/pathfinding/ComputedPath.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/engine/pathfinding/ComputedPath.ts)
- [ ] **Personal Space**: Implement personal space calculations for NPC pathfinding
  - Reference: [`src/module/ModulePath.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModulePath.ts)
  - Reference: [`src/actions/ActionMoveToPoint.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/actions/ActionMoveToPoint.ts)
- [ ] **Obstacle Avoidance**: Enhance NPC navigation around obstacles
  - Reference: [`src/engine/pathfinding/BinaryHeap.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/engine/pathfinding/BinaryHeap.ts)

### 1.4 Combat System

#### 1.4.1 Combat Actions
- [ ] **Target Swapping**: Fix target swap and default action functionality
  - Reference: [`src/module/ModuleCreature.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleCreature.ts)
- [ ] **Combat Cancellation**: Enable combat cancellation via hotkey
  - Reference: [`src/controls/KeyMapper.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/KeyMapper.ts)
- [ ] **Combat Round Start**: Fix combat music/rounds starting on weapon flourish
  - Reference: [`src/combat/CombatRound.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/combat/CombatRound.ts)

### 1.5 Inventory System

#### 1.5.1 Inventory Management
- [ ] **Item Quantities**: Fix incorrect item quantity rendering
  - Reference: [`src/gui/protoitem/GUIInventoryItem.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/gui/protoitem/GUIInventoryItem.ts)
  - Reference: [`src/game/kotor/gui/GUIInventoryItem.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/gui/GUIInventoryItem.ts)
- [ ] **Item Usage**: Enable Enter key and double-click to use inventory items
  - Reference: [`src/game/kotor/menu/MenuInventory.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/MenuInventory.ts)
- [ ] **Force Power Icons**: Fix hostile force powers appearing in medical item action bar
  - Reference: [`src/game/kotor/menu/InGameOverlay.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/InGameOverlay.ts)

### 1.6 Audio System

#### 1.6.1 Audio Mixing
- [ ] **Ambient Noise Mixing**: Fix Taris ambient noise (droning AC sound)
  - Reference: [`src/audio/AmbientAudioEmitter.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/audio/AmbientAudioEmitter.ts)
  - Reference: [`src/audio/AudioEngine.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/audio/AudioEngine.ts)
- [ ] **Audio Volume Levels**: Implement proper audio mixing for all channels
  - Reference: [`src/audio/AudioEngine.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/audio/AudioEngine.ts)

### 1.7 Configuration & Settings

#### 1.7.1 INI File Parsing
- [ ] **Autopause Settings**: Fix INI parsing for autopause configuration
  - Reference: [`src/managers/AutoPauseManager.ts:35-42`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/AutoPauseManager.ts#L35-L42)
  - Reference: [`src/engine/INIConfig.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/engine/INIConfig.ts)
  - Reference: [`src/game/kotor/swkotor-config.ts:30`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/swkotor-config.ts#L30)
- [ ] **Keyboard Camera Acceleration**: Implement INI setting for camera controls
  - Reference: [`src/utility/ConfigClient.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/utility/ConfigClient.ts)
- [ ] **Game Directory Switching**: Add UI for easy game directory switching
  - Reference: [`src/utility/GameFileSystem.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/utility/GameFileSystem.ts)

### 1.8 Save/Load System

#### 1.8.1 Save Game Management
- [ ] **F4 Quicksave**: Implement F4 quicksave functionality (currently non-functional)
  - Reference: [`src/controls/KeyMapper.ts:486`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/KeyMapper.ts#L486)
  - Reference: [`src/engine/SaveGame.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/engine/SaveGame.ts)
- [ ] **F5 Quickload**: Implement F5 quickload (prevent browser refresh conflict)
  - Reference: [`src/controls/IngameControls.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/controls/IngameControls.ts)
  - Reference: [`src/engine/SaveGame.ts:661-673`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/engine/SaveGame.ts#L661-L673)

### 1.9 UI Icons & Indicators

#### 1.9.1 Status Icons
- [ ] **Stealth Icon**: Hide stealth icon when stealth unavailable
  - Reference: [`src/game/kotor/menu/InGameOverlay.ts:172-181`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/InGameOverlay.ts#L172-L181)
  - Reference: [`src/game/kotor/menu/InGameOverlay.ts:305-308`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/InGameOverlay.ts#L305-L308)
- [ ] **Solo Mode Icon**: Hide solo mode icon when no party members present
  - Reference: [`src/game/kotor/menu/InGameOverlay.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/InGameOverlay.ts)

### 1.10 Developer Console

#### 1.10.1 Console Improvements
- [ ] **Auto-Focus Input**: Automatically focus console text input when opened
  - Reference: [`src/apps/game/components/cheat-console/cheatConsole.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/game/components/cheat-console/cheatConsole.tsx)
- [ ] **Input Blocking**: Prevent game input while typing in console
  - Reference: [`src/apps/game/components/cheat-console/cheatConsole.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/game/components/cheat-console/cheatConsole.tsx)
- [ ] **Help Command**: Implement help command to list available commands
  - Reference: [`src/managers/CheatConsoleManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/CheatConsoleManager.ts)

### 1.11 Pause Display

#### 1.11.1 Pause UI
- [ ] **Pause Text Color**: Fix pause text color to match original game
  - Reference: [`src/game/kotor/menu/InGamePause.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/kotor/menu/InGamePause.ts)

---

## Phase 2: KotOR II Feature Parity

Achieve 1:1 parity with Knights of the Old Republic II: The Sith Lords to ensure complete TSL functionality.

### 2.1 TSL-Specific Features

#### 2.1.1 Influence System
- [ ] **Influence Tracking**: Implement party member influence mechanics
  - Reference: [`src/module/ModuleCreature.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleCreature.ts)
- [ ] **Influence Dialog**: Add influence notifications in dialogs
  - Reference: [`src/resource/DLGObject.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/resource/DLGObject.ts)
- [ ] **Influence UI**: Display influence levels in menus
  - Reference: [`src/game/tsl/menu/MenuCharacter.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/tsl/menu/MenuCharacter.ts)

#### 2.1.2 Crafting System
- [ ] **Workbench Interface**: Implement workbench crafting UI
  - Reference: [`src/game/tsl/menu/MenuUpgrade.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/tsl/menu/MenuUpgrade.ts)
- [ ] **Component System**: Implement item component breakdown mechanics
  - Reference: [`src/module/ModuleItem.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleItem.ts)
- [ ] **Upgrade Slots**: Handle TSL's expanded upgrade slot system
  - Reference: [`src/game/tsl/menu/MenuUpgrade.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/tsl/menu/MenuUpgrade.ts)

#### 2.1.3 Prestige Classes
- [ ] **Jedi Classes**: Implement Jedi Watchman, Jedi Master, Jedi Weapon Master
  - Reference: [`src/combat/CreatureClass.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/combat/CreatureClass.ts)
- [ ] **Sith Classes**: Implement Sith Assassin, Sith Lord, Sith Marauder
  - Reference: [`src/combat/CreatureClass.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/combat/CreatureClass.ts)
- [ ] **Class Selection**: Implement prestige class selection dialog
  - Reference: [`src/game/tsl/menu/CharGenClass.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/tsl/menu/CharGenClass.ts)

### 2.2 Enhanced UI Features

#### 2.2.1 TSL Menu Improvements
- [ ] **Journal Redesign**: Implement TSL-style journal interface
  - Reference: [`src/game/tsl/menu/MenuJournal.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/tsl/menu/MenuJournal.ts)
- [ ] **Enhanced Map**: Add TSL map features (fast travel markers, etc.)
  - Reference: [`src/game/tsl/menu/MenuMap.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/tsl/menu/MenuMap.ts)
- [ ] **Character Screen Updates**: Add TSL-specific character screen features
  - Reference: [`src/game/tsl/menu/MenuCharacter.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/game/tsl/menu/MenuCharacter.ts)

### 2.3 Additional Combat Features

#### 2.3.1 TSL Combat Mechanics
- [ ] **Form System**: Implement lightsaber form mechanics
  - Reference: [`src/talents/TalentSpell.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/talents/TalentSpell.ts)
- [ ] **Targeting Improvements**: Enhanced enemy targeting system
  - Reference: [`src/module/ModuleCreature.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleCreature.ts)
- [ ] **Force Form Powers**: Implement TSL-exclusive force powers
  - Reference: [`src/talents/TalentSpell.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/talents/TalentSpell.ts)

### 2.4 Additional Content

#### 2.4.1 TSL-Specific Gameplay
- [ ] **Pazaak Updates**: TSL pazaak variant rules and cards
  - Reference: [`src/managers/PazaakManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/PazaakManager.ts)
- [ ] **Swoop Racing**: TSL swoop racing variants
  - Reference: [`src/module/ModuleMiniGame.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleMiniGame.ts)
- [ ] **Party AI**: Enhanced party AI options
  - Reference: [`src/module/ModuleCreature.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleCreature.ts)

---

## Phase 3: Forge Modding Tool Development

Implement KotOR Forge in tandem with gameplay features, using it to validate correctness. Use KotOR Tool and Holocron Toolset as references until Forge can meet expected standards.

### 3.1 Core Forge Features

#### 3.1.1 Resource Browser
- [ ] **File Tree View**: Enhance resource explorer tree navigation
  - Reference: [`src/apps/forge/states/tabs/TabResourceExplorerState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabResourceExplorerState.tsx)
  - Reference: [`src/apps/forge/components/treeview/ForgeTreeView.scss`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/treeview/ForgeTreeView.scss)
- [ ] **Search Functionality**: Implement resource search and filtering
  - Reference: [`src/apps/forge/FileTypeManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/FileTypeManager.ts)
- [ ] **Preview System**: Add resource preview pane
  - Reference: [`src/apps/forge/states/tabs/TabModelViewerState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabModelViewerState.tsx)

#### 3.1.2 File Editors
- [ ] **GFF Editor**: Complete generic GFF file editor
  - Reference: [`src/apps/forge/components/tabs/tab-gff-editor/TabGFFEditor.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/tabs/tab-gff-editor/TabGFFEditor.tsx)
- [ ] **2DA Editor**: Enhance 2DA table editor
  - Reference: [`src/apps/forge/components/TwoDAEditorRow.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/TwoDAEditorRow.tsx)
- [ ] **Script Editor**: Implement NWScript editor with syntax highlighting
  - Reference: [`src/apps/forge/components/tabs/tab-text-editor/TabTextEditor.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/tabs/tab-text-editor/TabTextEditor.tsx)
- [ ] **Dialog Editor**: Implement dialog tree editor
  - Reference: [`src/resource/DLGObject.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/resource/DLGObject.ts)

### 3.2 Creature & Item Editors

#### 3.2.1 Template Editors
- [ ] **UTC Editor**: Complete creature template editor
  - Reference: [`src/apps/forge/states/tabs/TabUTCEditorState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabUTCEditorState.tsx)
- [ ] **UTI Editor**: Complete item template editor
  - Reference: [`src/apps/forge/states/tabs/TabUTIEditorState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabUTIEditorState.tsx)
- [ ] **UTP Editor**: Complete placeable template editor
  - Reference: [`src/apps/forge/states/tabs/TabUTPEditorState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabUTPEditorState.tsx)
- [ ] **UTD Editor**: Complete door template editor
  - Reference: [`src/apps/forge/states/tabs/TabUTDEditorState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabUTDEditorState.tsx)
- [ ] **UTS Editor**: Complete sound template editor
  - Reference: [`src/apps/forge/components/tabs/tab-uts-editor/TabUTSEditor.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/tabs/tab-uts-editor/TabUTSEditor.tsx)

### 3.3 Visual Editors

#### 3.3.1 3D Model Tools
- [ ] **Model Viewer**: Enhanced model viewer with animation controls
  - Reference: [`src/apps/forge/states/tabs/TabModelViewerState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabModelViewerState.tsx)
  - Reference: [`src/apps/forge/components/ModelViewerSidebarComponent.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/ModelViewerSidebarComponent.tsx)
- [ ] **Walkmesh Editor**: Implement walkmesh editing and visualization
  - Reference: [`src/apps/forge/states/tabs/TabWOKEditorState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabWOKEditorState.tsx)
- [ ] **Path Editor**: Implement pathfinding editor
  - Reference: [`src/apps/forge/states/tabs/TabPTHEditorState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabPTHEditorState.tsx)

#### 3.3.2 Texture & Image Tools
- [ ] **Texture Viewer**: Enhanced texture/TPC/TGA viewer
  - Reference: [`src/apps/forge/components/tabs/tab-image-viewer/TabImageViewer.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/tabs/tab-image-viewer/TabImageViewer.tsx)
  - Reference: [`src/apps/forge/components/TextureCanvas/TextureCanvas.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/TextureCanvas/TextureCanvas.tsx)
- [ ] **Texture Converter**: Add texture format conversion tools
  - Reference: [`src/loaders/TPCLoader.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/loaders/TPCLoader.ts)
  - Reference: [`src/loaders/TGALoader.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/loaders/TGALoader.ts)

### 3.4 Module Editor

#### 3.4.1 Area Editing
- [ ] **Module Structure**: Implement module file management
  - Reference: [`src/apps/forge/states/tabs/TabModuleEditorState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/TabModuleEditorState.tsx)
- [ ] **Object Placement**: Visual object placement in modules
  - Reference: [`src/apps/forge/UI3DRenderer.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/UI3DRenderer.tsx)
- [ ] **Trigger Editor**: Visual trigger zone editor
  - Reference: [`src/module/ModuleTrigger.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleTrigger.ts)

### 3.5 Lip Sync Editor

#### 3.5.1 Animation Tools
- [ ] **LIP Editor**: Complete lip sync animation editor
  - Reference: [`src/apps/forge/states/tabs/tab-lip-editor/TabLIPEditorState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/states/tabs/tab-lip-editor/TabLIPEditorState.tsx)
  - Reference: [`src/apps/forge/components/tabs/tab-lip-editor/TabLIPEditor.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/tabs/tab-lip-editor/TabLIPEditor.tsx)
- [ ] **Audio Integration**: Link audio playback with lip sync
  - Reference: [`src/apps/forge/components/tabs/tab-audio-player/TabAudioPlayer.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/tabs/tab-audio-player/TabAudioPlayer.tsx)

### 3.6 Script Compiler & Debugger

#### 3.6.1 Development Tools
- [ ] **Script Compiler**: Implement NWScript compiler
  - Reference: [`src/nwscript/NWScriptCompiler.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/nwscript/NWScriptCompiler.ts)
- [ ] **Compile Log**: Display compilation errors and warnings
  - Reference: [`src/apps/forge/components/tabs/tab-script-compile-log/TabScriptCompileLog.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/tabs/tab-script-compile-log/TabScriptCompileLog.tsx)
- [ ] **Script Debugger**: Implement script debugging interface
  - Reference: [`src/apps/debugger/states/DebuggerState.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/debugger/states/DebuggerState.tsx)
  - Reference: [`src/engine/Debugger.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/engine/Debugger.ts)

### 3.7 ERF/MOD Management

#### 3.7.1 Archive Tools
- [ ] **ERF Editor**: Complete ERF/MOD archive editor
  - Reference: [`src/apps/forge/components/tabs/tab-erf-editor/TabERFEditor.tsx`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/tabs/tab-erf-editor/TabERFEditor.tsx)
- [ ] **Mod Installation**: Implement mod installation workflow
  - Reference: [`src/resource/ERFObject.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/resource/ERFObject.ts)
- [ ] **Conflict Resolution**: Add mod conflict detection and resolution
  - Reference: [`src/apps/forge/ForgeFileSystem.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/ForgeFileSystem.ts)

---

## Phase 4: Engine Enhancements & Community Features

Implement additional engine features and functionality as the community sees fit, allowing for a more moddable game overall.

### 4.1 Enhanced Rendering

#### 4.1.1 Advanced Graphics
- [ ] **Post-Processing Effects**: Add modern post-processing pipeline
  - Reference: [`src/GameState.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/GameState.ts)
- [ ] **Dynamic Shadows**: Implement real-time shadow mapping
  - Reference: [`src/three/odyssey/OdysseyModel3D.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/three/odyssey/OdysseyModel3D.ts)
- [ ] **Improved Lighting**: Enhanced dynamic lighting system
  - Reference: [`src/managers/LightManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/LightManager.ts)
- [ ] **Shader Enhancements**: Modernize shader system
  - Reference: [`src/shaders/ShaderOdysseyModel.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/shaders/ShaderOdysseyModel.ts)

### 4.2 Extended Modding API

#### 4.2.1 Scripting Enhancements
- [ ] **Extended NWScript**: Add new script functions for modders
  - Reference: [`src/nwscript/NWScriptDefK1.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/nwscript/NWScriptDefK1.ts)
  - Reference: [`src/nwscript/NWScriptDefK2.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/nwscript/NWScriptDefK2.ts)
- [ ] **Custom Events**: Allow custom event definitions
  - Reference: [`src/nwscript/events/NWScriptEventFactory.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/nwscript/events/NWScriptEventFactory.ts)
- [ ] **Plugin System**: Implement JavaScript plugin architecture
  - Reference: [`src/apps/forge/Project.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/Project.ts)

### 4.3 Quality of Life

#### 4.3.1 Player Experience
- [ ] **Quick Travel**: Add fast travel between discovered locations
  - Reference: [`src/module/Module.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/Module.ts)
- [ ] **Auto-Loot**: Implement automatic loot collection
  - Reference: [`src/managers/InventoryManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/InventoryManager.ts)
- [ ] **Quest Markers**: Add optional quest markers on map
  - Reference: [`src/gui/LBL_MapView.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/gui/LBL_MapView.ts)
- [ ] **Enhanced Journal**: Add journal search and filtering
  - Reference: [`src/managers/JournalManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/JournalManager.ts)

### 4.4 Multiplayer Support

#### 4.4.1 Network Architecture
- [ ] **Client-Server**: Implement basic client-server architecture
  - Reference: [`src/server`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/server)
- [ ] **Co-op Gameplay**: Enable cooperative multiplayer
  - Reference: [`src/managers/PartyManager.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/managers/PartyManager.ts)
- [ ] **State Sync**: Synchronize game state across clients
  - Reference: [`src/GameState.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/GameState.ts)

### 4.5 Performance Optimization

#### 4.5.1 Engine Optimization
- [ ] **Asset Streaming**: Implement progressive asset loading
  - Reference: [`src/loaders/ResourceLoader.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/loaders/ResourceLoader.ts)
- [ ] **Culling Improvements**: Enhance frustum and occlusion culling
  - Reference: [`src/module/ModuleArea.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/module/ModuleArea.ts)
- [ ] **Memory Management**: Optimize memory usage and cleanup
  - Reference: [`src/utility/Utility.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/utility/Utility.ts)
- [ ] **Worker Threads**: Offload processing to web workers
  - Reference: [`src/worker/server.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/worker/server.ts)

### 4.6 Community Content

#### 4.6.1 Content Creation
- [ ] **Mod Workshop**: Create community mod sharing platform
  - Reference: [`src/apps/forge/ForgeFileSystem.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/ForgeFileSystem.ts)
- [ ] **Documentation**: Comprehensive modding documentation
- [ ] **Tutorial System**: In-app tutorials for Forge
  - Reference: [`src/apps/forge/components/tabs/tab-quick-start/TabQuickStart.scss`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/apps/forge/components/tabs/tab-quick-start/TabQuickStart.scss)

### 4.7 Extended Features

#### 4.7.1 New Capabilities
- [ ] **Custom Animations**: Support for custom creature animations
  - Reference: [`src/odyssey/OdysseyModelAnimation.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/odyssey/OdysseyModelAnimation.ts)
- [ ] **New Force Powers**: Framework for custom force powers
  - Reference: [`src/talents/TalentSpell.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/talents/TalentSpell.ts)
- [ ] **Custom UI Themes**: Allow UI customization and theming
  - Reference: [`src/gui/GameMenu.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/gui/GameMenu.ts)

---

## Testing & Validation

Throughout all phases, testing and validation will be continuous:

- [ ] **Unit Tests**: Expand test coverage for core systems
  - Reference: [`jest.config.js`](https://github.com/KobaltBlu/KotOR.js/tree/master/jest.config.js)
- [ ] **Integration Tests**: Test interactions between systems
- [ ] **Regression Testing**: Prevent feature breaks during development
- [ ] **Community Testing**: Beta testing with community feedback
- [ ] **Performance Benchmarks**: Track and optimize performance metrics
  - Reference: [`src/utility/PerformanceMonitor.ts`](https://github.com/KobaltBlu/KotOR.js/tree/master/src/utility/PerformanceMonitor.ts)

---

## Contributing

This roadmap is a living document and will evolve based on community needs and development progress. To contribute:

1. Check the roadmap for items marked as available to work on
2. Discuss significant changes in the [Discord server](https://discord.gg/QxjqVAuN8T)
3. Reference this roadmap in pull requests
4. Update the roadmap when completing items

For more information, see the [main README](https://github.com/KobaltBlu/KotOR.js) and [project wiki](https://github.com/KobaltBlu/KotOR.js/wiki).
