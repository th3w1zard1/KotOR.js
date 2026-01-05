Mod management is one of the trickier aspects of modding the original game. If multiple mods modify the same 2da files things got even trickier. This is a proposal on how I think various the reimplementation projects could make things a little easier for modding.

I think this could be achieved very easily with the concept of namespacing. Namespaced mods should have their own sub folder inside the game's Override folder. Any GFF files could only require one new CExoString field called "Namespace", which would be a reference to the "namespace" property in the mod.json file.
***
**mod.json:**
```
{
    "name: "My Mod 1234",
    "namespace": "mymod1234",
    "author":"John Doe",
    "website":"http://someurl.com",
    "description": ""
}
```

***

**GFF Files:**
All that would need to be added to this file is one CExoString field called "Namespace"
***
**2DA Files:**
Any 2DA files inside the mod's folder will be loaded into the engine with the namespace value set in the mod.json file. When a GFF file is loaded that has the Namespace field it will use the namespaced 2DA or fallback to the original 2DA.
***
**dialog.TLK File:**
If a dialog.TLK file is present in the mod's folder it will be loaded into the engine with the namespace value set in the mod.json file. When a GFF file is loaded that has the Namespace field it will use the namespaced dialog.TLK or fallback to the original dialog.TLK.