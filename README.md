# Argon-Vaesen
An implementation of the [Argon - Combat HUD](https://foundryvtt.com/packages/enhancedcombathud) (by [TheRipper93](https://theripper93.com/) and [Mouse0270](https://github.com/mouse0270)) for the [Vaesen](https://foundryvtt.com/packages/vaesen) system. The Argon Combat HUD (CORE) module is required for this module to work.

![image](https://github.com/Saibot393/enhancedcombathud-vaesen/assets/137942782/9819feb6-4895-4c1f-9b79-be4a030d5265)

<sup>The icons used for the items are from the [Vaesen - Official Core Rulebook](https://foundryvtt.com/packages/vaesen-core) module</sup>

### The documentation for the core argon features can be found [here](https://api.theripper93.com/modulewiki/enhancedcombathud/free)

This module adjust various Argon features for the Vaesen system:
- **Portrait**
    - For Players and Vaesen the current conditions will be displayed aa icons and can be removed via left click
    - For npcs the the values of the physical and mental conditions will be displayed
    - The favoured armor will be displayed
- **Action tracking** takes the difference of slow and fast actions into account and allows for the use of an available slow action for a fast action
- **Skills and Attributes** adapt to the actor type (player,npc,vaesen)
- **Weapon Sets** use the favoured weapons by default
- **Tooltips** will display used skills/attributes, descriptions, use cases, the bonus, the damage, and the range where applicable

### Client Customization
- **Treat injuries type** to set which type of injurie should be treated with the action button
- **Show talents button** to activate a button for talents in the ui
- **Use dice symbols** to use symbols instead of numbers for Skills and Attributes

### Limitations

Due to licensing i am not able to include official text from the book for the description of the standard actions (flee, wrestle, survey...). The default description of these actions therefore only points to page in the rule book which describes them. Should you wish to customize the description of these actions, you can crate an item (i recommend using a talent) with the name `_argonUI_#ActionID` where `#ActionID` is replaced by the actions id:
- "flee":`Flee`,
- "wrestle":`WPG`
- "survey":`Survey`
- "treat injuries":`TreatInjuries`
- "draw weapon":`DrawWeapon`
- "stand up":`Standup`
- "move":`Move`
- "take cover":`TakeCover`
- "dodge":`Dodge`
- "parry":`Parry`
- "break free":`BreakFree`
- "chase":`Chase`

Due to the way movement works in Vaesen the Movement Tracker is not (yet?) available to in this implementation.

#### Languages:

The module contains an English and a German translation. If you want additional languages to be supported [let me know](https://github.com/Saibot393/enhancedcombathud-vaesen/issues).

**If you have suggestions, questions, or requests for additional features please [let me know](https://github.com/Saibot393/enhancedcombathud-vaesen/issues).**
