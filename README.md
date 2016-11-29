# MirrorWorldsHTMLServer

Finished:
- socket connection
- chat function
- 1st and 3rd person views
- avatars added
- changable avatars
- small environment events

Future Milestones:
- Enviroment Watch List so that environment is always up to date
  - need to have multiple scene events
  - probably need some other kind of event besides turning on a light
- New Avatars (more compact and less warthoggy)
- Increase Efficiency (some lag with multiple users)

Bugs:

- When a new user connects and there are already users in the scene, the new user isn’t seeing where everybody really is at first. All other users are being rendered from the spawn location
- Random semi colon in the middle of the x3d scene
- Headlights on avatars (should be fixed when we add new avatars)
- Teapot needs a material
