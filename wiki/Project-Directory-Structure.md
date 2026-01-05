
**KotOR.js Directory Structure**
```
├── src		    #All the source code for the game and editor
│   ├── actions		#Game Action classes (ActionOpenDoor, ActionDialogObject, etc...)
│   ├── apps		#Application source files used to create app windows (including the launcher)
│   ├── assets		#static assets
│   ├── audio		#Audio Engine class files
│   ├── combat		#Combat Engine class files
│   ├── controls	#Input Control class files
│   ├── effects		#Game effect classes (EffectDeath, EffectVisualEffect, EffectAssuredHit, etc...)
│   ├── electron	#Electron app source files
│   ├── engine		#THREE.js objects, effects, and utilities
│   ├── enums		#Typescript enum files
│   ├── events		#Game event objects (EventApplyEffect, EventDestroyObject, etc...)
│   ├── game		#Game-specific code files
│   ├── gui		#Menu and GUI class files used by both games
│   ├── interface	#Typescript interface files
│   ├── loaders		#Asset Loader class files
│   ├── managers	#Manager files (CharGenManager, JournalManager, CursorManager, etc...)
│   ├── module		#Module class files (Module, ModuleArea, ModuleCreature, etc...)
│   ├── nwscript	#NWScript code files
│   ├── odyssey		#Odyssey Model specific class files
│   ├── resource	#Resource files and Resource Loading files
│   ├── shaders 	#GLSL Shader files
│   |── talents		#Talent objects used by KotOR
│   ├── three		#THREE.js custom classes
│   ├── types		#Typescript definition files
│   ├── utility		#Utility class files
│   └── worker		#WebWorker files
├── main.js	    #The main js file called by nodeJS to start the program
└── README.md	    #The project's README file
```