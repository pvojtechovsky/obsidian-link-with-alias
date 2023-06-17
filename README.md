# Link with alias

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22link-with-alias%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&style=plastic) ![](https://img.shields.io/github/v/release/pvojtechovsky/obsidian-link-with-alias?label=Latest%20Release&style=plastic)

This plugin implements one command "Create link with alias", which provides fast creation of link whose display text is added into aliases atribute in front matter of the target note.

![Use cases](use_cases.gif "Use cases")

# Supported use cases

-   User selects some text and runs the command "Create link with alias"
    -   it creates a new link with target and display name copied from selected text and opens the link autocompletion popup
    -   user can optionally edit the link target or just select a value from the autocompletion popup
    -   when user closes autocompletion popup and cursor leaves the link, then the link display text is added as alias into front matter of the target note
-   User puts cursor into existing link and runs command "Create link with alias"
    -   the action creates the target document, if it doesn't exist, and adds link display text as alias into front matter of the target note
-   User puts cursor into text and runs command "Create link with alias"
    -   it creates link brackets and opens autocompletion popup for entering of link target name
    -   after user types in part of the target name or alias and selects it by enter, the link is created
    -   if there is no display text and user moves back into link and enters one, then system detects it and after cursor leaves the brackets or user closes the window, the link display text is added as alias into front matter of the target note

# Notes

-   The alias is added into front matter of the target note only when it isn't there yet
-   The aliases are sorted from longest to shortest, so the Obsidian backlinks are detected correctly
-   The link autocompletion popup is the standard one provided by Obsidian. It sometime replaces the link text automaticaly, but it isn't wanted in this use case. The action "Create link with alias" will keep the link text exactly the same like it was before.

If you find this plugin useful and would like to support its development, you can support me on [Ko-fi](https://ko-fi.com/pavel_knowledge).

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/pavel_knowledge)
