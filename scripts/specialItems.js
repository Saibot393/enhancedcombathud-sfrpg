import { ModuleName } from "./utils.js";

const ItemReplacementID = "_argonUI_";

var StarfinderECHSlowItems = {};

var StarfinderECHFastItems = {};

var StarfinderECHReactionItems = {};

function registerStarfinderECHSItems () {
	StarfinderECHSlowItems = {
		groupflags : {
			actiontype : "slow"
		},
		Flee : {
			img: "modules/enhancedcombathud/icons/svg/run.svg",
			name: game.i18n.localize(ModuleName+".Titles.Flee"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Flee"),
				skill : "agility",
				Starfinderattribute : "bodyControl"
			}
		},
		WPG : {
			img: "modules/enhancedcombathud/icons/svg/shield-bash.svg",
			name: game.i18n.localize(ModuleName+".Titles.WPG"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.WPG"),
				skill : "force",
				Starfinderattribute : "might"
			}
		},
		Survey : {
			img: "icons/svg/eye.svg",
			name: game.i18n.localize(ModuleName+".Titles.Survey"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Survey"),
				skill : "observation",
				Starfinderattribute : "bodyControl"
			}
		},
		TreatInjuries : {
			img: "icons/svg/heal.svg",
			name: game.i18n.localize(ModuleName+".Titles.TreatInjuries"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.TreatInjuries"),
				skill : "",
				Starfinderattribute : "bodyControl"
			}
		}
	}
	
	switch(game.settings.get(ModuleName, "TreatType")) {
		case "physical" :
			StarfinderECHSlowItems.TreatInjuries.system.skill = "medicine";
			break;
		case "mental" :
			StarfinderECHSlowItems.TreatInjuries.system.skill = "inspiration";
			break;
	}
	
	StarfinderECHFastItems = {
		groupflags : {
			actiontype : "fast"
		},
		DrawWeapon : {
			img: "icons/svg/sword.svg",
			name: game.i18n.localize(ModuleName+".Titles.DrawWeapon"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.DrawWeapon")
			}
		},
		Standup : {
			img: "icons/svg/up.svg",
			name: game.i18n.localize(ModuleName+".Titles.Standup"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Standup")
			}
		},
		Move : {
			img: "modules/enhancedcombathud/icons/svg/journey.svg",
			name: game.i18n.localize(ModuleName+".Titles.Move"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Move")
			}
		},
		TakeCover : {
			img: "modules/enhancedcombathud/icons/svg/armor-upgrade.svg",
			name: game.i18n.localize(ModuleName+".Titles.TakeCover"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.TakeCover")
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
	for (let itemset of [StarfinderECHSlowItems, StarfinderECHFastItems, StarfinderECHReactionItems]) {
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

export {registerStarfinderECHSItems, StarfinderECHSlowItems, StarfinderECHFastItems, StarfinderECHReactionItems}