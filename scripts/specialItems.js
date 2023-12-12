import { ModuleName } from "./utils.js";

const ItemReplacementID = "_argonUI_";

var StarfinderECHReactionItems = {};

var StarfinderECHActionItems = {};
var StarfinderECHMoveItems = {};
var StarfinderECHSwiftItems = {};
var StarfinderECHFullItems = {};
var StarfinderECHReactionItems = {};

function registerStarfinderECHSItems () {
	StarfinderECHActionItems = {
		groupflags : {
			actiontype : "action"
		},
		CombatManeuver : {
			img: "modules/enhancedcombathud-sfrpg/icons/high-kick.svg",
			name: game.i18n.localize(ModuleName+".Titles.CombatManeuver"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.CombatManeuver"),
				skill : "agility"
			}
		},
		CoveringFire : {
			img: "modules/enhancedcombathud-sfrpg/icons/machine-gun.svg",
			name: game.i18n.localize(ModuleName+".Titles.CoveringFire"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.CoveringFire"),
				skill : "agility"
			}
		},
		Feint : {
			img: "modules/enhancedcombathud-sfrpg/icons/return-arrow.svg",
			name: game.i18n.localize(ModuleName+".Titles.Feint"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Feint"),
				skill : "blu"
			}
		},
		FightDefensively : {
			img: "modules/enhancedcombathud-sfrpg/icons/shield-reflect.svg",
			name: game.i18n.localize(ModuleName+".Titles.FightDefensively"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.FightDefensively"),
				skill : "observation"
			}
		},
		HarryingFire : {
			img: "modules/enhancedcombathud-sfrpg/icons/distraction.svg",
			name: game.i18n.localize(ModuleName+".Titles.HarryingFire"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.HarryingFire"),
				skill : "",
				Starfinderattribute : "bodyControl"
			}
		},
		TotalDefense : {
			img: "modules/enhancedcombathud-sfrpg/icons/shield.svg",
			name: game.i18n.localize(ModuleName+".Titles.TotalDefense"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.TotalDefense"),
				skill : "",
				Starfinderattribute : "bodyControl"
			}
		}
	}
	
	StarfinderECHMoveItems = {
		groupflags : {
			actiontype : "move"
		},
		DrawSheathe : {
			img: "modules/enhancedcombathud-sfrpg/icons/cowboy-holster.svg",
			name: game.i18n.localize(ModuleName+".Titles.DrawSheathe"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.DrawSheathe")
			}
		},
		GuardedStep : {
			img: "modules/enhancedcombathud-sfrpg/icons/shield-bash.svg",
			name: game.i18n.localize(ModuleName+".Titles.GuardedStep"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.GuardedStep")
			}
		},
		Reload : {
			img: "modules/enhancedcombathud-sfrpg/icons/reload-gun-barrel.svg",
			name: game.i18n.localize(ModuleName+".Titles.Reload"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Reload"),
				skill : "observation",
				Starfinderattribute : "bodyControl"
			}
		},
		StandUp : {
			img: "icons/svg/up.svg",
			name: game.i18n.localize(ModuleName+".Titles.StandUp"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.StandUp"),
				skill : "",
				Starfinderattribute : "bodyControl"
			}
		}
	}
	
	StarfinderECHReactionItems = {
		groupflags : {
			actiontype : "react"
		},
		Dodge : {
			img: "modules/enhancedcombathud/icons/svg/dodging.svg",
			name: game.i18n.localize(ModuleName+".Titles.Dodge"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Dodge"),
				skill : "agility",
				Starfinderattribute : "bodyControl"
			}
		},
		Parry : {
			img: "modules/enhancedcombathud/icons/svg/crossed-swords.svg",
			name: game.i18n.localize(ModuleName+".Titles.Parry"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Parry"),
				skill : ["closeCombat", "force"],
				Starfinderattribute : "might"
			}
		},
		BreakFree : {
			img: "modules/enhancedcombathud/icons/svg/mighty-force.svg",
			name: game.i18n.localize(ModuleName+".Titles.BreakFree"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.BreakFree"),
				skill : "force",
				Starfinderattribute : "might"
			}
		},
		Chase : {
			img: "modules/enhancedcombathud/icons/svg/walking-boot.svg",
			name: game.i18n.localize(ModuleName+".Titles.Chase"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Chase"),
				skill : "agility",
				Starfinderattribute : "bodyControl"
			}
		}
	}
	
	//some preparation
	for (let itemset of [StarfinderECHActionItems, StarfinderECHMoveItems, StarfinderECHReactionItems]) {
		for (let itemkey of Object.keys(itemset)) {
			if (itemkey != "groupflags") {
				itemset[itemkey].flags = {};
				itemset[itemkey].flags[ModuleName] = {...itemset.groupflags, ...itemset[itemkey].flags[ModuleName]};
				
				let ReplacementItem = game.items.find(item => item.name == ItemReplacementID + itemkey);
				
				if (ReplacementItem) {
					itemset[itemkey].system.description = ReplacementItem.system.description;
				}
			}
		}
		
		delete itemset.groupflags;
	}
}

export {registerStarfinderECHSItems, StarfinderECHActionItems, StarfinderECHMoveItems, StarfinderECHReactionItems}