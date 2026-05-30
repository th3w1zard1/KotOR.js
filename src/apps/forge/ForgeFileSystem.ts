import * as fs from "fs";
<<<<<<< HEAD
import * as KotOR from "./KotOR";
/** Electron dialog when ENV is ELECTRON; provided by preload. */
declare const dialog: {
  showOpenDialog: (options: { title?: string; defaultPath?: string; buttonLabel?: string; filters?: { name: string; extensions: string[] }[]; properties?: string[]; message?: string; securityScopedBookmarks?: boolean }) => Promise<{ canceled?: boolean; filePaths?: string[] }>;
  showSaveDialog: (options?: { title?: string; defaultPath?: string; buttonLabel?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<{ canceled?: boolean; filePath?: string }>;
};
=======
import * as path from "path";
import * as KotOR from "@/apps/forge/KotOR";
declare const dialog: any;
>>>>>>> upstream/master

export enum ForgeFileSystemResponseType {
  FILE_PATH_STRING = 0,
  FILE_SYSTEM_HANDLE = 1,
}

export interface ForgeFileSystemResponse {
  type: ForgeFileSystemResponseType;
  handles?: FileSystemFileHandle[]|FileSystemDirectoryHandle[];
  paths?: string[];
  multiple?: boolean;
}

export interface OpenFileOptions {
  multiple?: boolean;
  ext?: string[];
}

interface ShowOpenDirectoryDialogOptions {
  /**
   * File System Access API
   */
  id?: string;
  mode?: 'readwrite' | 'readonly';
  types?: {
    description: string;
    accept: {
      [key: string]: string[];
    };
  }[];
  multiple?: boolean;
  startIn?: string|FileSystemHandle;

  /**
   * Electron arguments
   */
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: {
    name: string;
    extensions: string[];
  }[];
  properties?: ('openDirectory' | 'createDirectory' | 'multiSelections' | 'showHiddenFiles' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent')[];
  message?: string;
  securityScopedBookmarks?: boolean;
}

export class ForgeFileSystem {
  static OpenFile(options: OpenFileOptions = {}): Promise<ForgeFileSystemResponse> {
    options = Object.assign({
      multiple: false,
      ext: []
    }, options);
    return new Promise( (resolve, reject) => {
      if(KotOR.ApplicationProfile.ENV == KotOR.ApplicationEnvironment.ELECTRON){
        const properties: ('createDirectory' | 'openFile' | 'multiSelections')[] = ['createDirectory', 'openFile'];
        if (options.multiple) {
          properties.push('multiSelections');
        }
        dialog.showOpenDialog({
          title: 'Open File',
          filters: ForgeFileSystem.GetFilteredFilePickerTypes(options.ext),
<<<<<<< HEAD
          properties: ['createDirectory', 'openFile'],
        }).then( (result: { canceled?: boolean; filePaths?: string[] }) => {
=======
          properties,
        }).then( (result: any) => {
>>>>>>> upstream/master
          if(!result.canceled){
            if(result.filePaths?.length){
              resolve({
                type: ForgeFileSystemResponseType.FILE_PATH_STRING,
                paths: result.filePaths as string[],
                multiple: options.multiple,
              });
              return;
            }
          }
          resolve({
            type: ForgeFileSystemResponseType.FILE_PATH_STRING,
            paths: [],
            multiple: options.multiple,
          });
          // console.log(result.canceled);
          // console.log(result.filePaths);
        }).catch( (e: unknown) => {
          console.error(e);
          resolve({
            type: ForgeFileSystemResponseType.FILE_PATH_STRING,
            paths: [],
            multiple: options.multiple,
          });
        })
      }else{
        window.showOpenFilePicker({
          types: ForgeFileSystem.GetFilteredFilePickerTypes(options.ext),
<<<<<<< HEAD
          multiple: options.multiple ?? false,
        }).then( (handles: FileSystemFileHandle | FileSystemFileHandle[]) => {
          const arr = Array.isArray(handles) ? handles : (handles ? [handles] : []);
          if(arr.length){
=======
          multiple: !!options.multiple,
        }).then( (handles: FileSystemFileHandle[]) => {
          if(handles.length){
>>>>>>> upstream/master
            resolve({
              type: ForgeFileSystemResponseType.FILE_SYSTEM_HANDLE,
              handles: arr,
              multiple: options.multiple,
            });
            return;
          }
          resolve({
            type: ForgeFileSystemResponseType.FILE_SYSTEM_HANDLE,
            handles: [],
            multiple: options.multiple,
          });
        }).catch((e: unknown) => {
          console.error(e);
          resolve({
            type: ForgeFileSystemResponseType.FILE_SYSTEM_HANDLE,
            handles: [],
            multiple: options.multiple,
          });
        });
      }
    });
  }

  static async OpenFileBuffer( options: OpenFileOptions = {} ): Promise<Uint8Array> {
    options = Object.assign({
      multiple: false,
      exts: []
    }, options);
    try{
      const response = await ForgeFileSystem.OpenFile(options);
      return await ForgeFileSystem.ReadFileBufferFromResponse(response);
    }catch(e: unknown){
      console.error(e);
    }
    return new Uint8Array(0);
  }

  /** Read file contents from an OpenFile dialog response (Electron path or browser handle). */
  static async ReadFileBufferFromResponse(response: ForgeFileSystemResponse): Promise<Uint8Array> {
    try {
      if (KotOR.ApplicationProfile.ENV === KotOR.ApplicationEnvironment.ELECTRON) {
        if (response.paths && response.paths.length > 0) {
          const buf = await fs.promises.readFile(response.paths[0]);
          return new Uint8Array(buf);
        }
      } else {
        if (response.handles && response.handles.length > 0) {
          const handle = response.handles[0] as FileSystemFileHandle;
          const file = await handle.getFile();
          const ab = await file.arrayBuffer();
          return new Uint8Array(ab);
        }
      }
    } catch (e: unknown) {
      console.error(e);
    }
    return new Uint8Array(0);
  }

  static OpenDirectory(options: OpenFileOptions = {}): Promise<ForgeFileSystemResponse> {
    options = Object.assign({
      multiple: false,
      exts: []
    }, options);
    options.multiple = false;
    return new Promise( (resolve, reject) => {
      if(KotOR.ApplicationProfile.ENV == KotOR.ApplicationEnvironment.ELECTRON){
        dialog.showOpenDialog({
          title: 'Open Directory',
          // filters: ForgeFileSystem.GetFilteredFilePickerTypes(options.ext),
          properties: ['createDirectory', 'openDirectory'],
        }).then( (result: any) => {
          if(!result.canceled){
            if(result.filePaths.length){
              resolve({
                type: ForgeFileSystemResponseType.FILE_PATH_STRING,
                paths: result.filePaths as string[],
                multiple: false,
              });
              return;
            }
          }
          resolve({
            type: ForgeFileSystemResponseType.FILE_PATH_STRING,
            paths: [],
            multiple: false,
          });
          // console.log(result.canceled);
          // console.log(result.filePaths);
        }).catch( (e: unknown) => {
          console.error(e);
          resolve({
            type: ForgeFileSystemResponseType.FILE_PATH_STRING,
            paths: [],
            multiple: options.multiple,
          });
        })
      }else{
        window.showDirectoryPicker({
          mode: "readwrite" as FileSystemPermissionMode,
        }).then( (handle: FileSystemDirectoryHandle) => {
          if(handle){
            resolve({
              type: ForgeFileSystemResponseType.FILE_SYSTEM_HANDLE,
              handles: [handle],
              multiple: false,
            });
            return;
          }
          resolve({
            type: ForgeFileSystemResponseType.FILE_SYSTEM_HANDLE,
            handles: [],
            multiple: options.multiple,
          });
        }).catch((e: unknown) => {
          console.error(e);
          resolve({
            type: ForgeFileSystemResponseType.FILE_SYSTEM_HANDLE,
            handles: [],
            multiple: options.multiple,
          });
        });
      }
    });
  }

  static GetFilteredFilePickerTypes(ext: string[] = []){
    if(KotOR.ApplicationProfile.ENV == KotOR.ApplicationEnvironment.ELECTRON){
      if(ext.length){
        return supportedFileDialogTypes.filter( (element: { extensions: string[] }) => {
          return element.extensions.some( (extension: string)=> ext.includes(extension) )
        });
      }else{
        return supportedFileDialogTypes;
      }
    }else{
      if(ext.length){
        const normalized = [
          ...new Set(
            ext.map((e) => {
              const t = e.trim().toLowerCase();
              return t.startsWith('.') ? t : `.${t}`;
            }),
          ),
        ];
        const textExts = new Set(['.txt', '.lyt', '.nss', '.vis', '.txi', '.pth']);
        const accept: Record<string, string[]> = {};
        const octet: string[] = [];
        const plain: string[] = [];
        const png: string[] = [];
        const jpeg: string[] = [];
        const wav: string[] = [];
        const mp3: string[] = [];
        for (const d of normalized) {
          if (textExts.has(d)) plain.push(d);
          else if (d === '.png') png.push(d);
          else if (d === '.jpg' || d === '.jpeg') jpeg.push(d);
          else if (d === '.wav') wav.push(d);
          else if (d === '.mp3') mp3.push(d);
          else octet.push(d);
        }
        if (plain.length) accept['text/plain'] = plain;
        if (png.length) accept['image/png'] = png;
        if (jpeg.length) accept['image/jpeg'] = jpeg;
        if (wav.length) accept['audio/wav'] = wav;
        if (mp3.length) accept['audio/mpeg'] = mp3;
        if (octet.length) accept['application/octet-stream'] = octet;
        return [{ description: 'File', accept }];
      }else{
        return supportedFilePickerTypes
      }
    }
  }

  static async showOpenDirectoryDialog( options: ShowOpenDirectoryDialogOptions = {} ){
    const responseType = KotOR.ApplicationProfile.ENV == KotOR.ApplicationEnvironment.ELECTRON ? ForgeFileSystemResponseType.FILE_PATH_STRING : ForgeFileSystemResponseType.FILE_SYSTEM_HANDLE;
    let cancelled = false;
    if(KotOR.ApplicationProfile.ENV == KotOR.ApplicationEnvironment.ELECTRON){
      try{
        const result = await dialog.showOpenDialog({
          title: options.title,
          defaultPath: options.defaultPath,
          buttonLabel: options.buttonLabel,
          filters: options.filters,
          properties: options.properties || ['createDirectory', 'openDirectory'],
          message: options.message,
          securityScopedBookmarks: options.securityScopedBookmarks,
        });
        console.log('result', result);
        cancelled = !!result.canceled;
        if(!cancelled){
          if(result.filePaths.length){
            return {
              type: responseType,
              path: result.filePaths[0],
              handle: undefined as unknown as FileSystemDirectoryHandle,
            };
          }
        }
      }catch(e){
        console.error(e);
        cancelled = true;
      }
    }

    if(KotOR.ApplicationProfile.ENV == KotOR.ApplicationEnvironment.BROWSER){
      try{
        const result = await window.showDirectoryPicker({
          mode: (options.mode || "readwrite") as FileSystemPermissionMode,
        });
        console.log('result', result);

        if(result){
          return {
            type: responseType,
            path: result.name,
            handle: result as FileSystemDirectoryHandle,
          };
        }
      }catch(e){
        console.error(e);
        cancelled = true;
      }
    }
    return {
      cancelled: cancelled,
      type: responseType,
      path: undefined as string | undefined,
      handle: undefined as FileSystemDirectoryHandle | undefined,
    };
  }

  /** Electron only: writes bytes to an absolute filesystem path. */
  static async writeUint8ArrayToPath(fullPath: string, data: Uint8Array): Promise<void> {
    if(KotOR.ApplicationProfile.ENV != KotOR.ApplicationEnvironment.ELECTRON){
      throw new Error('writeUint8ArrayToPath is only supported in Electron');
    }
    const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, buf);
  }

}

(window as Window & { ForgeFileSystem?: typeof ForgeFileSystem }).ForgeFileSystem = ForgeFileSystem

export const supportedFilePickerTypes: any[] = [
  {
<<<<<<< HEAD
    description: 'All Supported Formats',
=======
    description: "All Supported Formats",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [
        ".2da",
        ".are",
        ".bic",
        ".bik",
        ".dlg",
        ".dwk",
        ".erf",
        ".fac",
        ".git",
        ".gff",
        ".gui",
        ".ifo",
        ".jrl",
        ".lip",
        ".mdl",
        ".mdl.ascii",
        ".mdx",
        ".mod",
        ".ncs",
        ".phn",
        ".pwk",
        ".res",
        ".rim",
        ".sav",
        ".ssf",
        ".tga",
        ".tpc",
        ".utc",
        ".utd",
        ".ute",
        ".uti",
        ".utm",
        ".utp",
        ".uts",
        ".utt",
        ".utw",
        ".wok",
      ],
      "text/plain": [".txt", ".lyt", ".nss", ".vis", ".txi", ".pth"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "audio/wav": [".wav"],
      "audio/mpeg": [".mp3"],
    },
  },
  {
<<<<<<< HEAD
    description: 'TPC Image',
=======
    description: "TPC Image",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".tpc"],
    },
  },
  {
<<<<<<< HEAD
    description: 'TGA Image',
=======
    description: "TGA Image",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".tga"],
    },
  },
  {
<<<<<<< HEAD
    description: '.GFF',
=======
    description: "PNG Image",
>>>>>>> upstream/master
    accept: {
      "image/png": [".png"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Creature Template',
=======
    description: "JPG Image",
>>>>>>> upstream/master
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Door Template',
=======
    description: "GFF / Blueprint",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".gff", ".dlg", ".bic", ".jrl", ".res", ".fac", ".are", ".git", ".ifo"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Placeable Template',
=======
    description: "Creature Template",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".utc"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Merchant Template',
=======
    description: "Door Template",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".utd"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Sound Template',
=======
    description: "Placeable Template",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".utp"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Trigger Template',
=======
    description: "Merchant Template",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".utm"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Waypoint Template',
=======
    description: "Sound Template",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".uts"],
    },
  },
  {
<<<<<<< HEAD
    description: 'LIP Animation',
=======
    description: "Trigger Template",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".utt"],
    },
  },
  {
<<<<<<< HEAD
    description: 'PHN File',
=======
    description: "Encounter Template",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".ute"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Audio File',
=======
    description: "Item Template",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".uti"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Video File',
=======
    description: "Waypoint Template",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".utw"],
    },
  },
  {
<<<<<<< HEAD
    description: 'MOD File',
=======
    description: "LIP Animation",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".lip"],
    },
  },
  {
<<<<<<< HEAD
    description: 'ERF File',
=======
    description: "PHN File",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".phn"],
    },
  },
  {
<<<<<<< HEAD
    description: 'RIM File',
=======
    description: "Audio File",
>>>>>>> upstream/master
    accept: {
      "audio/wav": [".wav"],
      "audio/mpeg": [".mp3"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Model File',
=======
    description: "Video File",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".bik"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Module File',
=======
    description: "MOD File",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".mod"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Area File',
=======
    description: "ERF File",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".erf", ".sav"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Path File',
=======
    description: "RIM File",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".rim"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Script Source File',
=======
    description: "Model File",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".mdl", ".mdl.ascii", ".mdx", ".wok", ".pwk", ".dwk"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Script Compiled File',
=======
    description: "Module File",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".git", ".ifo"],
    },
  },
  {
<<<<<<< HEAD
    description: 'VIS File',
=======
    description: "Area File",
>>>>>>> upstream/master
    accept: {
      "application/octet-stream": [".are"],
    },
  },
  {
<<<<<<< HEAD
    description: 'Layout File',
=======
    description: "Path File",
>>>>>>> upstream/master
    accept: {
      "text/plain": [".pth"],
    },
  },
  {
<<<<<<< HEAD
    description: '2D Array File',
=======
    description: "Script Source (NSS)",
>>>>>>> upstream/master
    accept: {
      "text/plain": [".nss"],
    },
  },
  {
    description: "Script Compiled (NCS)",
    accept: {
      "application/octet-stream": [".ncs"],
    },
  },
  {
    description: "VIS File",
    accept: {
      "text/plain": [".vis"],
    },
  },
  {
    description: "Texture Info (TXI)",
    accept: {
      "text/plain": [".txi"],
    },
  },
  {
    description: "Plain Text",
    accept: {
      "text/plain": [".txt"],
    },
  },
  {
    description: "Sound Set (SSF)",
    accept: {
      "application/octet-stream": [".ssf"],
    },
  },
  {
    description: "GUI File",
    accept: {
      "application/octet-stream": [".gui"],
    },
  },
  {
    description: "Layout File",
    accept: {
      "text/plain": [".lyt"],
    },
  },
  {
    description: "2D Array File",
    accept: {
      "application/octet-stream": [".2da"],
    },
  },
<<<<<<< HEAD
  // {
  //   description: 'All Formats',
  //   accept: {
  //     'application/*': ['.*']
  //   }
  // },
=======
>>>>>>> upstream/master
];

export const supportedFileDialogTypes: any[] = [
  {
    name: 'All Supported Formats',
    extensions: [
      '2da', 'are', 'bic', 'bik', 'dlg', 'dwk', 'erf', 'fac', 'git', 'gff', 'gui', 'ifo',
      'jpg', 'jpeg', 'jrl', 'lip', 'lyt', 'mdl', 'mdl.ascii', 'mdx', 'mod', 'mp3', 'ncs',
      'nss', 'phn', 'png', 'pth', 'pwk', 'res', 'rim', 'sav', 'ssf', 'tga', 'tpc', 'txi',
      'txt', 'utc', 'utd', 'ute', 'uti', 'utm', 'utp', 'uts', 'utt', 'utw', 'vis', 'wav',
      'wok',
    ],
  },
  {name: 'TPC Image', extensions: ['tpc']},
  {name: 'TGA Image', extensions: ['tga']},
  {name: 'PNG Image', extensions: ['png']},
  {name: 'JPG Image', extensions: ['jpg', 'jpeg']},
  {name: 'GFF / Blueprint', extensions: ['gff', 'dlg', 'bic', 'jrl', 'res', 'fac', 'are', 'git', 'ifo']},
  {name: 'Creature Template', extensions: ['utc']},
  {name: 'Door Template', extensions: ['utd']},
  {name: 'Placeable Template', extensions: ['utp']},
  {name: 'Merchant Template', extensions: ['utm']},
  {name: 'Sound Template', extensions: ['uts']},
  {name: 'Trigger Template', extensions: ['utt']},
  {name: 'Encounter Template', extensions: ['ute']},
  {name: 'Item Template', extensions: ['uti']},
  {name: 'Waypoint Template', extensions: ['utw']},
  {name: 'LIP Animation', extensions: ['lip']},
  {name: 'PHN File', extensions: ['phn']},
  {name: 'Audio File', extensions: ['wav', 'mp3']},
  {name: 'Video File', extensions: ['bik']},
  {name: 'MOD File', extensions: ['mod']},
  {name: 'ERF File', extensions: ['erf', 'sav']},
  {name: 'RIM File', extensions: ['rim']},
  {name: 'Model File', extensions: ['mdl', 'mdl.ascii', 'mdx', 'wok', 'pwk', 'dwk']},
  {name: 'Module File', extensions: ['git', 'ifo']},
  {name: 'Area File', extensions: ['are']},
  {name: 'Path File', extensions: ['pth']},
  {name: 'Script Source (NSS)', extensions: ['nss']},
  {name: 'Script Compiled (NCS)', extensions: ['ncs']},
  {name: 'VIS File', extensions: ['vis']},
  {name: 'Texture Info (TXI)', extensions: ['txi']},
  {name: 'Plain Text', extensions: ['txt']},
  {name: 'Sound Set (SSF)', extensions: ['ssf']},
  {name: 'GUI File', extensions: ['gui']},
  {name: 'Layout File', extensions: ['lyt']},
  {name: '2D Array File', extensions: ['2da']},
  {name: 'All Formats', extensions: ['*']},
];
