import { ModuleName } from "./utils.js";

const ItemReplacementID = "_argonUI_";

var StarfinderECHReactionItems = {};

var StarfinderECHActionItems = {};
var StarfinderECHMoveItems = {};
var StarfinderECHFullItems = {};
var StarfinderManeuvers = {};

async function registerStarfinderECHSItems () {
	StarfinderECHActionItems = {
		groupflags : {
			actiontype : "action",
			journalid : "Compendium.sfrpg.rules.JournalEntry.U37n5tY5hn1ctzQL.JournalEntryPage.R33uiOMesYP0ISWl",
		},
		CombatManeuver : {
			img: "modules/enhancedcombathud-sfrpg/icons/high-kick.svg",
			name: game.i18n.localize(ModuleName+".Titles.CombatManeuver"),
			type : "base",
			system : {
				descriptionHeader : "Combat Maneuver"
			}
		},
		CoveringFire : {
			img: "modules/enhancedcombathud-sfrpg/icons/machine-gun.svg",
			name: game.i18n.localize(ModuleName+".Titles.CoveringFire"),
			type : "base",
			system : {
				descriptionHeader : "Covering Fire"
			}
		},
		Feint : {
			img: "modules/enhancedcombathud-sfrpg/icons/return-arrow.svg",
			name: game.i18n.localize(ModuleName+".Titles.Feint"),
			type : "base",
			system : {
				descriptionHeader : "Feint"
			}
		},
		FightDefensively : {
			img: "modules/enhancedcombathud-sfrpg/icons/shield-reflect.svg",
			name: game.i18n.localize(ModuleName+".Titles.FightDefensively"),
			type : "base",
			system : {
				descriptionHeader : "Fight Defensively"
			}
		},
		HarryingFire : {
			img: "modules/enhancedcombathud-sfrpg/icons/distraction.svg",
			name: game.i18n.localize(ModuleName+".Titles.HarryingFire"),
			type : "base",
			system : {
				descriptionHeader : "Harrying Fire"
			}
		},
		TotalDefense : {
			img: "modules/enhancedcombathud-sfrpg/icons/shield.svg",
			name: game.i18n.localize(ModuleName+".Titles.TotalDefense"),
			type : "base",
			system : {
				descriptionHeader : "Total Defense"
			}
		}
	}
	
	StarfinderECHMoveItems = {
		groupflags : {
			actiontype : "move",
			journalid : "Compendium.sfrpg.rules.JournalEntry.U37n5tY5hn1ctzQL.JournalEntryPage.SKgwxeMd2gB1g2W8",
		},
		DrawSheathe : {
			img: "modules/enhancedcombathud-sfrpg/icons/cowboy-holster.svg",
			name: game.i18n.localize(ModuleName+".Titles.DrawSheathe"),
			type : "base",
			system : {
				descriptionHeader : "Draw or Sheathe a Weapon"
			}
		},
		GuardedStep : {
			img: "modules/enhancedcombathud-sfrpg/icons/shield-bash.svg",
			name: game.i18n.localize(ModuleName+".Titles.GuardedStep"),
			type : "base",
			system : {
				descriptionHeader : "Guarded Step"
			}
		},
		Reload : {
			img: "modules/enhancedcombathud-sfrpg/icons/reload-gun-barrel.svg",
			name: game.i18n.localize(ModuleName+".Titles.Reload"),
			type : "base",
			system : {
				descriptionHeader : "Reload"
			}
		},
		StandUp : {
			img: "icons/svg/up.svg",
			name: game.i18n.localize(ModuleName+".Titles.StandUp"),
			type : "base",
			system : {
				descriptionHeader : "Stand Up"
			}
		}
	}
	
	StarfinderECHFullItems = {
		groupflags : {
			actiontype : "full",
			journalid : "Compendium.sfrpg.rules.JournalEntry.U37n5tY5hn1ctzQL.JournalEntryPage.Fu5eDR99bGo9WdUU",
		},
		Charge : {
			img: "modules/enhancedcombathud-sfrpg/icons/run.svg",
			name: game.i18n.localize(ModuleName+".Titles.Charge"),
			type : "base",
			system : {
				descriptionHeader : "Charge"
			}
		},
		CoupdeGrace : {
			img: "modules/enhancedcombathud-sfrpg/icons/backstab.svg",
			name: game.i18n.localize(ModuleName+".Titles.CoupdeGrace"),
			type : "base",
			system : {
				descriptionHeader : "Coup de Grace"
			}
		},
		FightDefensively : {
			img: "modules/enhancedcombathud-sfrpg/icons/armor-upgrade.svg",
			name: game.i18n.localize(ModuleName+".Titles.FightDefensively"),
			type : "base",
			system : {
				descriptionHeader : "Fight Defensively"
			}
		},
		Withdraw : {
			img: "modules/enhancedcombathud-sfrpg/icons/exit-door.svg",
			name: game.i18n.localize(ModuleName+".Titles.Withdraw"),
			type : "base",
			system : {
				descriptionHeader : "Withdraw"
			}
		}
	}
	
	StarfinderManeuvers = {
		groupflags : {
			actiontype : "action",
			journalid : "Compendium.sfrpg.rules.JournalEntry.U37n5tY5hn1ctzQL.JournalEntryPage.R33uiOMesYP0ISWl",
			ismaneuver : "true"
		},
		BullRush : {
			img: "modules/enhancedcombathud-sfrpg/icons/bull.svg",
			name: game.i18n.localize(ModuleName+".Titles.BullRush"),
			type : "base",
			system : {
				descriptionHeader : "Bull Rush"
			}
		},
		DirtyTrick : {
			img: "modules/enhancedcombathud-sfrpg/icons/cloak-dagger.svg",
			name: game.i18n.localize(ModuleName+".Titles.DirtyTrick"),
			type : "base",
			system : {
				descriptionHeader : "Dirty Trick"
			}
		},
		Disarm : {
			img: "modules/enhancedcombathud-sfrpg/icons/drop-weapon.svg",
			name: game.i18n.localize(ModuleName+".Titles.Disarm"),
			type : "base",
			system : {
				descriptionHeader : "Disarm"
			}
		},
		Grapple : {
			img: "modules/enhancedcombathud-sfrpg/icons/grab.svg",
			name: game.i18n.localize(ModuleName+".Titles.Grapple"),
			type : "base",
			system : {
				descriptionHeader : "Grapple"
			}
		},
		Reposition : {
			img: "modules/enhancedcombathud-sfrpg/icons/move.svg",
			name: game.i18n.localize(ModuleName+".Titles.Reposition"),
			type : "base",
			system : {
				descriptionHeader : "Reposition"
			}
		},
		Sunder : {
			img: "modules/enhancedcombathud-sfrpg/icons/hammer-break.svg",
			name: game.i18n.localize(ModuleName+".Titles.Sunder"),
			type : "base",
			system : {
				descriptionHeader : "Sunder"
			}
		},
		Trip : {
			img: "modules/enhancedcombathud-sfrpg/icons/falling.svg",
			name: game.i18n.localize(ModuleName+".Titles.Trip"),
			type : "base",
			system : {
				descriptionHeader : "Trip"
			}
		}
	}
	
	const actionJournal = await fromUuid("Compendium.sfrpg.rules.JournalEntry.U37n5tY5hn1ctzQL.JournalEntryPage.R33uiOMesYP0ISWl.IvGviTIPp5SVY7pp");
	console.log(actionJournal);
	console.log(findTextunderHeader(actionJournal.text.content, "Bull Rush"));
	//some preparation
	for (let itemset of [StarfinderECHActionItems, StarfinderECHMoveItems, StarfinderECHFullItems, StarfinderManeuvers]) {
		const actionJournal = await fromUuid(itemset.groupflags.journalid);
		
		for (let itemkey of Object.keys(itemset)) {
			if (itemkey != "groupflags") {
				itemset[itemkey].flags = {};
				itemset[itemkey].flags[ModuleName] = {...itemset.groupflags, ...itemset[itemkey].flags[ModuleName], specialaction : true};
				
				let ReplacementItem = game.items.find(item => item.name == ItemReplacementID + itemkey);
				
				if (ReplacementItem) {
					itemset[itemkey].system.description = ReplacementItem.system.description;
				}
				else {
					//load descriptions from journal
					if (actionJournal && itemset[itemkey].system.descriptionHeader) {
						const text = findTextunderHeader(actionJournal.text.content, itemset[itemkey].system.descriptionHeader);
						
						if (text) {
							itemset[itemkey].system.description = text;
						}
					}
				}
			}
		}
		
		delete itemset.groupflags;
	}
}

function findTextunderHeader(htmlText, header) {
	let headerposition = htmlText.search(header);
	
	if (headerposition >= 0) {
		let cuttext = htmlText.substr(headerposition + header.length); //remove header
		
		cuttext = cuttext.substr(cuttext.search(">")+1); //remove closing of header
		
		if (cuttext.search("<h") > 0) {
			cuttext = cuttext.substr(0, cuttext.search("<h")); //remove everything after next header
		}
		
		return cuttext;
	}
	
	return "";
}

export {registerStarfinderECHSItems, StarfinderECHActionItems, StarfinderECHMoveItems, StarfinderECHFullItems, StarfinderManeuvers}