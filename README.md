# MirrorWorldsHTMLServer



## Package Dependences


### nodeJS

### yui-compressor (optional, build-time only)




## Developer Notes


### On file structure

Making nodeJS applications that use many files requires a planning the for
the file directory structure.  No matter how you lay it out there will
always be give and take.  ref: https://gist.github.com/branneman/8048520

1. We decided to keep the installed executables directory (bin/) free of
   any files that the user does not directly execute.  We use the fact
   that NodeJs resolves symbolic links to full file paths in __dirname to
   lib/ where we keep all the code.

2. We decided to keep the test running of the programs not require that
   the package be installed.  The structure of the source files is close
   to that of the installed files.

3. We decided it have the package installation be automated.


### Profiling
- https://nodejs.org/en/docs/guides/simple-profiling/

### Finished:
- socket connection
- chat function
- 1st and 3rd person views
- avatars added
- changable avatars
- small environment events

### Future Milestones:
- Enviroment Watch List so that environment is always up to date
  - need to have multiple scene events
  - probably need some other kind of event besides turning on a light
- New Avatars (more compact and less warthoggy)
- Increase Efficiency (some lag with multiple users)

### Bugs:

- When a new user connects and there are already users in the scene, the
  new user isn’t seeing where everybody really is at first. All other
  users are being rendered from the spawn location
- Random semi colon in the middle of the x3d scene
- Headlights on avatars (should be fixed when we add new avatars)
- Teapot needs a material

### Thoughts and Ideas:
- Abstract Factories in Node:
  http://thenodeway.io/posts/designing-factories/


