import * as path from 'path';
import pLimit from 'p-limit';
import { ILoaderProgress, LoaderProgressTracker } from '@/apps/common/loader/LoaderProgress';
import { GameState } from '@/GameState';
import { ERFObject } from '@/resource/ERFObject';
import { ResourceTypes } from '@/resource/ResourceTypes';
import { RIMObject } from '@/resource/RIMObject';
import { TwoDAObject } from '@/resource/TwoDAObject';
import { GameFileSystem } from '@/utility/GameFileSystem';
import { GamePad, KeyMapper } from '@/controls';
import { CurrentGame } from '@/engine/CurrentGame';
import { ConfigClient } from '@/utility/ConfigClient';
import {
  AppearanceManager,
  AutoPauseManager,
  TLKManager,
  CharGenManager,
  CheatConsoleManager,
  CameraShakeManager,
  ConfigManager,
  CursorManager,
  DialogMessageManager,
  FadeOverlayManager,
  FeedbackMessageManager,
  GlobalVariableManager,
  InventoryManager,
  JournalManager,
  LightManager,
  MenuManager,
  ModuleObjectManager,
  PartyManager,
  ResolutionManager,
  ShaderManager,
  TwoDAManager,
  FactionManager,
  KEYManager,
  RIMManager,
  ERFManager,
  VideoEffectManager,
  PazaakManager,
  UINotificationManager,
  CutsceneManager,
  VideoManager,
  LegalScreenManager,
} from '@/managers';
import { SWRuleSet } from '@/engine/rules/SWRuleSet';
import { ResourceLoader } from '@/loaders';
import { GameEngineType } from '@/enums/engine';
import { SaveGame } from '@/engine/SaveGame';
import { Module } from '@/module/Module';
import { NWScript } from '@/nwscript/NWScript';

import { TalentObject, TalentFeat, TalentSkill, TalentSpell } from '@/talents';
import { ActionMenuManager } from '@/engine/menu/ActionMenuManager';
import { ActionFactory } from '@/actions/ActionFactory';
import { GameEffectFactory } from '@/effects/GameEffectFactory';
import { GameEventFactory } from '@/events/GameEventFactory';
import { INIConfig } from '@/engine/INIConfig';
import { CacheScope } from '@/enums';
import { PerformanceMonitor } from '@/utility/PerformanceMonitor';

const fsLimit = pLimit(16);

/**
 * GameInitializer class.
 *
 * Handles the loading of game archives for use later during runtime
 *
 * KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 *
 * @file GameInitializer.ts
 * @author KobaltBlu <https://github.com/KobaltBlu>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 */
export class GameInitializer {
  static currentGame: GameEngineType;

  /**
   * Event listeners
   */
  static #eventListeners: Record<string, Function[]> = {};

  /**
   * Add an event listener
   * @param type
   * @param cb
   */
  static AddEventListener<T extends string>(type: T, cb: Function): void {
    if (!Array.isArray(this.#eventListeners[type])) {
      this.#eventListeners[type] = [];
    }
    if (Array.isArray(this.#eventListeners[type])) {
      const ev = this.#eventListeners[type];
      const index = ev.indexOf(cb);
      if (index == -1) {
        ev.push(cb);
      } else {
        console.warn('Event Listener: Already added', type);
      }
    } else {
      console.warn('Event Listener: Unsupported', type);
    }
  }

  /**
   * Remove an event listener
   * @param type
   * @param cb
   */
  static RemoveEventListener<T extends string>(type: T, cb: Function): void {
    if (!Array.isArray(this.#eventListeners[type])) {
      this.#eventListeners[type] = [];
    }
    if (Array.isArray(this.#eventListeners[type])) {
      const ev = this.#eventListeners[type];
      const index = ev.indexOf(cb);
      if (index >= 0) {
        ev.splice(index, 1);
      } else {
        console.warn('Event Listener: Already removed', type);
      }
    } else {
      console.warn('Event Listener: Unsupported', type);
    }
  }

  /**
   * Process an event listener
   * @param type
   * @param args
   */
  static ProcessEventListener<T extends string>(type: T, args: any[] = []): void {
    if (!Array.isArray(this.#eventListeners[type])) {
      this.#eventListeners[type] = [];
    }
    if (Array.isArray(this.#eventListeners[type])) {
      const ev = this.#eventListeners[type];
      for (let i = 0; i < ev.length; i++) {
        const callback = ev[i];
        if (typeof callback === 'function') {
          callback(...args);
        }
      }
    } else {
      console.warn('Event Listener: Unsupported', type);
    }
  }

  static SetLoadingMessage(message: string) {
    GameInitializer.ProcessEventListener('on-loader-message', [message]);
    GameInitializer.ProcessEventListener('on-loader-progress', [null]);
  }

  static SetLoadingProgress(progress: ILoaderProgress) {
    GameInitializer.ProcessEventListener('on-loader-progress', [progress]);
  }

  static async Init(game: GameEngineType) {
    ResourceLoader.InitCache();
    GameState.PerformanceMonitor = PerformanceMonitor;

    /**
     * Initialize Managers
     */
    GameState.AppearanceManager = AppearanceManager;
    GameState.AutoPauseManager = AutoPauseManager;
    GameState.CameraShakeManager = CameraShakeManager;
    GameState.CharGenManager = CharGenManager;
    GameState.CheatConsoleManager = CheatConsoleManager;
    GameState.ConfigManager = ConfigManager;
    GameState.CursorManager = CursorManager;
    GameState.DialogMessageManager = DialogMessageManager;
    GameState.FactionManager = FactionManager;
    GameState.FadeOverlayManager = FadeOverlayManager;
    GameState.FeedbackMessageManager = FeedbackMessageManager;
    GameState.GlobalVariableManager = GlobalVariableManager;
    GameState.InventoryManager = InventoryManager;
    GameState.JournalManager = JournalManager;
    GameState.LightManager = LightManager;
    GameState.MenuManager = MenuManager;
    GameState.ModuleObjectManager = ModuleObjectManager;
    GameState.PartyManager = PartyManager;
    GameState.ResolutionManager = ResolutionManager;
    GameState.ShaderManager = ShaderManager;
    GameState.TLKManager = TLKManager;
    GameState.TwoDAManager = TwoDAManager;
    GameState.PazaakManager = PazaakManager;
    GameState.UINotificationManager = UINotificationManager;
    GameState.CutsceneManager = CutsceneManager;
    GameState.VideoManager = VideoManager;
    GameState.LegalScreenManager = LegalScreenManager;

    GameState.SWRuleSet = SWRuleSet;

    GameState.Module = Module;
    GameState.NWScript = NWScript;

    GameState.TalentObject = TalentObject;
    GameState.TalentFeat = TalentFeat;
    GameState.TalentSkill = TalentSkill;
    GameState.TalentSpell = TalentSpell;

    GameState.ActionMenuManager = ActionMenuManager;
    GameState.ActionFactory = ActionFactory;
    GameState.GameEffectFactory = GameEffectFactory;
    GameState.GameEventFactory = GameEventFactory;
    GameState.VideoEffectManager = VideoEffectManager;

    await CurrentGame.CleanGameInProgressFolder();

    //Keeps the initializer from loading the same game twice if it's already loaded
    if (GameInitializer.currentGame == game) {
      return;
    }

    GameInitializer.currentGame = game;

    PerformanceMonitor.start('configclient');
    await ConfigClient.Init();
    PerformanceMonitor.stop('configclient');

    GameInitializer.SetLoadingMessage('Loading Keys');
    PerformanceMonitor.start('keys');
    await KEYManager.Load('chitin.key');
    PerformanceMonitor.stop('keys');

    PerformanceMonitor.start('globalcache');
    await ResourceLoader.InitGlobalCache();
    PerformanceMonitor.stop('globalcache');

    GameInitializer.SetLoadingMessage('Loading Game Resources');
    PerformanceMonitor.start('gameresources');
    await GameInitializer.LoadGameResources();
    PerformanceMonitor.stop('gameresources');

    /**
     * Initialize Journal
     */
    GameInitializer.SetLoadingMessage('Loading JRL File');
    PerformanceMonitor.start('journal');
    await JournalManager.LoadJournal();
    PerformanceMonitor.stop('journal');

    /**
     * Initialize TLK
     */
    GameInitializer.SetLoadingMessage('Loading TLK File');
    PerformanceMonitor.start('tlk');
    await TLKManager.LoadTalkTable();
    PerformanceMonitor.stop('tlk');

    GameInitializer.SetLoadingMessage('Initializing Controls');
    /**
     * Initialize Controls
     */
    KeyMapper.Init();
    GamePad.Init();

    /**
     * Initialize SWRuleSet
     */
    GameState.SWRuleSet.Init();

    /**
     * Initialize AppearanceManager
     */
    GameState.AppearanceManager.Init();

    GameInitializer.SetLoadingMessage('Loading INI File');
    /**
     * Initialize INIConfig
     */
    if (GameState.GameKey == GameEngineType.TSL) {
      GameState.iniConfig = new INIConfig('swkotor2.ini', INIConfig.defaultConfigs.swKotOR2);
    } else {
      GameState.iniConfig = new INIConfig('swkotor.ini', INIConfig.defaultConfigs.swKotOR);
    }
    await GameState.iniConfig.load();
    GameState.SWRuleSet.setIniConfig(GameState.iniConfig);
    GameState.AutoPauseManager.INIConfig = GameState.iniConfig;

    /**
     * Initialize AutoPauseManager
     */
    GameState.AutoPauseManager.Init();

    /**
     * Initialize GLobal Variabled
     */
    GameState.GlobalVariableManager.Init();

    /**
     * Initialize Planetary
     */
    await GameState.Planetary.Init();

    GameInitializer.SetLoadingMessage('Initializing SaveGame Folder');
    /**
     * Initialize SaveGame Folder
     */
    PerformanceMonitor.start('SaveGame.GetSaveGames');
    await SaveGame.GetSaveGames();
    PerformanceMonitor.stop('SaveGame.GetSaveGames');

    VideoEffectManager.Init2DA(TwoDAManager.datatables.get('videoeffects') as any);
  }

  static async LoadGameResources() {
    const tracker = new LoaderProgressTracker(
      (progress) => GameInitializer.SetLoadingProgress(progress),
      'Loading Assets',
    );

    const overrideFiles = await GameInitializer.listOverrideFiles();
    const rimFiles = await GameInitializer.listRimFiles();
    const twoDAResources = KEYManager.Key.getFilesByResType(ResourceTypes['2da']);
    const texturePackErfs = await GameInitializer.listTexturePackErfs();

    tracker.begin(
      overrideFiles.length + rimFiles.length + twoDAResources.length + texturePackErfs.length,
      'Loading Assets',
    );

    const promises = [
      GameInitializer.LoadOverride(tracker, overrideFiles),
      GameInitializer.LoadRIMs(tracker, rimFiles),
      GameInitializer.LoadModules(),
      GameInitializer.LoadLips(),
      GameInitializer.Load2DAs(tracker, twoDAResources),
      GameInitializer.LoadTexturePacks(tracker, texturePackErfs),
    ];
    await Promise.all(promises);

    const nonBlockingPromises = [
      GameInitializer.LoadGameAudioResources('streammusic'),
      GameInitializer.LoadGameAudioResources('streamsounds'),
      GameInitializer.LoadGameAudioResources(GameState.GameKey != GameEngineType.TSL ? 'streamwaves' : 'streamvoice'),
    ];
    Promise.all(nonBlockingPromises);
  }

  static async listOverrideFiles() {
    try {
      const files = await GameFileSystem.readdir('Override', { recursive: false });
      return files
        .map((f) => {
          const _parsed = path.parse(f);
          const ext = _parsed.ext.substr(1, _parsed.ext.length)?.toLocaleLowerCase();
          return { f, _parsed, resId: ResourceTypes[ext] };
        })
        .filter(({ resId }) => typeof resId !== 'undefined');
    } catch (e) {
      return [];
    }
  }

  static async listRimFiles() {
    if (GameState.GameKey == GameEngineType.TSL) {
      return [] as { ext: string; name: string; filename: string }[];
    }
    try {
      const filenames = await GameFileSystem.readdir('rims');
      return filenames
        .map(function (file: string) {
          const filename = file.split(path.sep).pop() as string;
          const args = filename.split('.');
          return {
            ext: args[1].toLowerCase(),
            name: args[0],
            filename: path.join('rims', filename),
          };
        })
        .filter(function (file_obj) {
          return file_obj.ext == 'rim';
        });
    } catch (e) {
      return [];
    }
  }

  static async listTexturePackErfs() {
    const data_dir = 'TexturePacks';
    try {
      const filenames = await GameFileSystem.readdir(data_dir);
      return filenames
        .map(function (file) {
          const filename = file.split(path.sep).pop() as string;
          const args = filename.split('.');
          return {
            ext: args[1].toLowerCase(),
            name: args[0],
            filename: filename,
          };
        })
        .filter(function (file_obj) {
          return file_obj.ext == 'erf';
        });
    } catch (e) {
      return [];
    }
  }

  static async LoadRIMs(
    tracker?: LoaderProgressTracker,
    rims?: { ext: string; name: string; filename: string }[],
  ) {
    const rimFiles = rims ?? (await GameInitializer.listRimFiles());
    if (!rimFiles.length) {
      return;
    }
    PerformanceMonitor.start('RIMManager.Load');
    await Promise.all(
      rimFiles.map((rimObj) =>
        fsLimit(async () => {
          tracker?.itemStart(path.basename(rimObj.filename));
          try {
            const rim = await RIMManager.LoadRIMObject(rimObj);
            rim.group = 'RIMs';
          } catch (e) {
            console.error(e);
          } finally {
            tracker?.itemComplete();
          }
        }),
      ),
    );
    PerformanceMonitor.stop('RIMManager.Load');
  }

  static async LoadLips() {
    PerformanceMonitor.start('GameInitializer.LoadLips');
    const data_dir = 'lips';
    const filenames = await GameFileSystem.readdir(data_dir);
    const modules = filenames
      .map(function (file) {
        const filename = file.split(path.sep).pop() as string;
        const args = filename.split('.');
        return {
          ext: args[1].toLowerCase(),
          name: args[0],
          filename: filename,
        };
      })
      .filter(function (file_obj) {
        return file_obj.ext == 'mod';
      });
    for (let i = 0, len = modules.length; i < len; i++) {
      const module_obj = modules[i];
      switch (module_obj.ext) {
        case 'mod':
          const mod = new ERFObject(path.join(data_dir, module_obj.filename));
          await mod.load();
          if (mod instanceof ERFObject) {
            mod.group = 'Lips';
            ERFManager.addERF(module_obj.name, mod);
          }
          break;
        default:
          console.warn('GameInitializer.LoadLips: Encountered incorrect filetype');
          console.log(module_obj);
          break;
      }
    }
    PerformanceMonitor.stop('GameInitializer.LoadLips');
  }

  static async LoadModules() {
    const data_dir = 'modules';
    PerformanceMonitor.start('GameInitializer.LoadModules');
    try {
      const filenames = await GameFileSystem.readdir(data_dir);
      const modules = filenames
        .map(function (file) {
          const filename = file.split(path.sep).pop() as string;
          const args = filename.split('.');
          return {
            ext: args[1].toLowerCase(),
            name: args[0],
            filename: filename,
          };
        })
        .filter(function (file_obj) {
          return file_obj.ext == 'rim' || file_obj.ext == 'mod';
        });

      for (let i = 0, len = modules.length; i < len; i++) {
        const module_obj = modules[i];
        switch (module_obj.ext) {
          case 'rim':
            const rim = new RIMObject(path.join(data_dir, module_obj.filename));
            await rim.load();
            if (rim instanceof RIMObject) {
              rim.group = 'Module';
              RIMManager.addRIM(module_obj.name, rim);
            }
            break;
          case 'mod':
            const mod = new ERFObject(path.join(data_dir, module_obj.filename));
            await mod.load();
            if (mod instanceof ERFObject) {
              mod.group = 'Module';
              ERFManager.addERF(module_obj.name, mod);
            }
            break;
          default:
            console.warn('GameInitializer.LoadModules: Encountered incorrect filetype');
            console.log(module_obj);
            break;
        }
      }
    } catch (e) {
      console.warn('GameInitializer.LoadModules: Failed to load modules');
      console.error(e);
    }
    PerformanceMonitor.stop('GameInitializer.LoadModules');
  }

  static async Load2DAs(
    tracker?: LoaderProgressTracker,
    resources?: ReturnType<typeof KEYManager.Key.getFilesByResType>,
  ) {
    const twoDAResources = resources ?? KEYManager.Key.getFilesByResType(ResourceTypes['2da']);
    PerformanceMonitor.start('GameInitializer.Load2DAs');
    TwoDAManager.datatables = new Map();
    await Promise.all(
      twoDAResources.map((res) =>
        fsLimit(async () => {
          const key = KEYManager.Key.getFileKeyByRes(res);
          if (!key) {
            tracker?.itemComplete();
            return;
          }
          tracker?.itemStart(`${key.resRef}.2da`);
          try {
            const d = await ResourceLoader.loadResource(ResourceTypes['2da'], key.resRef);
            TwoDAManager.datatables.set(key.resRef, new TwoDAObject(d));
          } catch (e) {
            console.error(e);
          } finally {
            tracker?.itemComplete();
          }
        }),
      ),
    );
    PerformanceMonitor.stop('GameInitializer.Load2DAs');
  }

  static async LoadTexturePacks(
    tracker?: LoaderProgressTracker,
    erfs?: { ext: string; name: string; filename: string }[],
  ) {
    const texturePackErfs = erfs ?? (await GameInitializer.listTexturePackErfs());
    PerformanceMonitor.start('GameInitializer.LoadTexturePacks');
    const data_dir = 'TexturePacks';
    try {
      await Promise.all(
        texturePackErfs.map((_erf) =>
          fsLimit(async () => {
            tracker?.itemStart(_erf.filename);
            try {
              const erf = new ERFObject(path.join(data_dir, _erf.filename));
              await erf.load();
              if (erf instanceof ERFObject) {
                erf.group = 'Textures';
                ERFManager.addERF(_erf.name, erf);
              }
            } catch (e) {
              console.error(e);
            } finally {
              tracker?.itemComplete();
            }
          }),
        ),
      );
    } catch (e) {
      console.warn('GameInitializer.LoadTexturePacks: Failed to load texture packs');
      console.error(e);
    }
    PerformanceMonitor.stop('GameInitializer.LoadTexturePacks');
  }

  static async LoadGameAudioResources(folder: string) {
    PerformanceMonitor.start(`GameInitializer.LoadGameAudioResources[${folder}]`);
    try {
      const files = await GameFileSystem.readdir(folder, { recursive: true });
      for (let i = 0, len = files.length; i < len; i++) {
        const f = files[i];
        const _parsed = path.parse(f);
        const ext = _parsed.ext.substr(1, _parsed.ext.length);

        if (typeof ResourceTypes[ext] != 'undefined') {
          ResourceLoader.setResource(ResourceTypes[ext], _parsed.name.toLowerCase(), {
            inArchive: false,
            file: f,
            resref: _parsed.name,
            resid: ResourceTypes[ext],
            ext: ext,
            offset: 0,
            length: 0,
          });
        }
      }
    } catch (e) {
      console.warn(`GameInitializer.LoadGameAudioResources[${folder}]: Failed to load game audio resources`);
      console.error(e);
    }
    PerformanceMonitor.stop(`GameInitializer.LoadGameAudioResources[${folder}]`);
  }

  static async LoadOverride(
    tracker?: LoaderProgressTracker,
    validOverrideFiles?: Awaited<ReturnType<typeof GameInitializer.listOverrideFiles>>,
  ) {
    const overrideFiles = validOverrideFiles ?? (await GameInitializer.listOverrideFiles());
    PerformanceMonitor.start('GameInitializer.LoadOverride');
    try {
      await Promise.all(
        overrideFiles.map(({ f, _parsed, resId }) =>
          fsLimit(async () => {
            tracker?.itemStart(path.basename(f));
            try {
              const buffer = await GameFileSystem.readFile(f);
              if (buffer && buffer.length) {
                ResourceLoader.setCache(CacheScope.OVERRIDE, resId, _parsed.name.toLocaleLowerCase(), buffer);
              }
            } catch (e) {
              console.error(e);
            } finally {
              tracker?.itemComplete();
            }
          }),
        ),
      );
    } catch (e) {
      console.warn('GameInitializer.LoadOverride: Failed to load override');
      console.error(e);
    }
    PerformanceMonitor.stop('GameInitializer.LoadOverride');
  }
}
