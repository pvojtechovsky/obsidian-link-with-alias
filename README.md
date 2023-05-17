# Link with alias

This plugin implements one command "Create link with alias", which provides fast creation of link whose display text is added into aliases atribute in front matter of the target note.  

These use cases are supported:
* User puts cursor into text (not into existing link), without selection and runs the action
  1. it creates link brackets and opens autocompletion popup for entering of link target name
  2. after user types in part of the target name or alias and selects it by enter, the link is created
  3. if there is no display text and user moves back into link and enters one, then system detects it (only for last entered link) and after cursor leaves the brackets or user closes the window, the link display text is added as alias into front matter of the target note
* User runs action while cursor is in existing link (between brackets)
  1. the action creates the target document, if it doesn't exist, and adds link display text as alias into front matter of the target note
* User selects some text (not in the exiting link) and runs the action
  1. it creates a new link with target and display name copied from selected text and opens the link autocompletion popup
  2. user can optionally edit the link target or just select a value from the autocompletion popup
  3. when user closes autocompletion popup (either by selection of item or escape) and cursor leaves the link, then the link display text is added as alias into front matter of the target note

Notes:
* The link autocompletion popup is the standard one provided by obsidian so if you feel that it behaves strange, then report bug to obsidian. I have no influence to it
* The alias is added into front matter of the target note only when it is not existing there yet
* The aliases are sorted from longest to shortest, so the obsidian backlinks are detected correctly 
