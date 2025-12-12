import { ModuleName, useStunt } from "./utils.js";

const ItemReplacementID = "_argonUI_";

var StarfinderECHReactionItems = {};

var StarfinderECHActionItems = {};
var StarfinderECHMoveItems = {};
var StarfinderECHFullItems = {};
var StarfinderManeuvers = {};
var StarfinderStunts = {};
var StarfinderShipWeapons = {};

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
			},
			flags : {
				[ModuleName] : {
					subtitle : game.i18n.localize(ModuleName+".Titles.MeleeAttack")
				}
			}
		},
		CoveringFire : {
			img: "modules/enhancedcombathud-sfrpg/icons/machine-gun.svg",
			name: game.i18n.localize(ModuleName+".Titles.CoveringFire"),
			type : "base",
			system : {
				descriptionHeader : "Covering Fire"
			},
			flags : {
				[ModuleName] : {
					subtitle : ModuleName+".Titles.RangedAttack",
					onclick : (item) => {
						const rangedweapon = item.parent?.items.find(item => item.type == "weapon" && item.system.equipped && item.system.actionType[0] == "r");
						
						if (rangedweapon) {
							rangedweapon.rollAttack();
							
							return true;
						}
					}
				}
			}
		},
		Feint : {
			img: "modules/enhancedcombathud-sfrpg/icons/return-arrow.svg",
			name: game.i18n.localize(ModuleName+".Titles.Feint"),
			type : "base",
			system : {
				descriptionHeader : "Feint"
			},
			flags : {
				[ModuleName] : {
					subtitle : CONFIG.SFRPG.skills.blu,
					onclick : (item) => {
						item.parent?.rollSkill("blu");
						
						return true;
					}
				}
			}
		},
		FightDefensively : {
			img: "modules/enhancedcombathud-sfrpg/icons/shield-reflect.svg",
			name: game.i18n.localize(ModuleName+".Titles.FightDefensively"),
			type : "base",
			system : {
				descriptionHeader : "Fight Defensively"
			},
			flags : {
				[ModuleName] : {
					subtitle : ModuleName+".Titles.Attack",
					onclick : (item) => {
						//item.parent?.rollSkill("blu"); add effect
						
						return true;
					}
				}
			}
		},
		HarryingFire : {
			img: "modules/enhancedcombathud-sfrpg/icons/distraction.svg",
			name: game.i18n.localize(ModuleName+".Titles.HarryingFire"),
			type : "base",
			system : {
				descriptionHeader : "Harrying Fire"
			},
			flags : {
				[ModuleName] : {
					subtitle : ModuleName+".Titles.RangedAttack",
					onclick : (item) => {
						const rangedweapon = item.parent?.items.find(item => item.type == "weapon" && item.system.equipped && item.system.actionType[0] == "r");
						
						if (rangedweapon) {
							rangedweapon.rollAttack();
							
							return true;
						}
					}
				}
			}
		},
		TotalDefense : {
			img: "modules/enhancedcombathud-sfrpg/icons/shield.svg",
			name: game.i18n.localize(ModuleName+".Titles.TotalDefense"),
			type : "base",
			system : {
				descriptionHeader : "Total Defense"
			},
			flags : {
				[ModuleName] : {
					onclick : (item) => {
						//item.parent?.rollSkill("blu"); add effect
						
						return true;
					}
				}
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
			},
			flags : {
				[ModuleName] : {
					onclick : (item) => {
						//item.parent?.rollSkill("blu"); add
						
						return true;
					}
				}
			}
		},
		GuardedStep : {
			img: "modules/enhancedcombathud-sfrpg/icons/shield-bash.svg",
			name: game.i18n.localize(ModuleName+".Titles.GuardedStep"),
			type : "base",
			system : {
				descriptionHeader : "Guarded Step"
			},			
			flags : {
				[ModuleName] : {
					subtitle : ModuleName+".Titles.Move",
				}
			}
		},
		Reload : {
			img: "modules/enhancedcombathud-sfrpg/icons/reload-gun-barrel.svg",
			name: game.i18n.localize(ModuleName+".Titles.Reload"),
			type : "base",
			system : {
				descriptionHeader : "Reload"
			},
			flags : {
				[ModuleName] : {
					onclick : (item) => {
						const rangedweapon = item.parent?.items.find(item => item.type == "weapon" && item.system.equipped && item.system.actionType[0] == "r");
						
						if (rangedweapon) {
							rangedweapon.reload();
							
							return true;
						}
					}
				}
			}
		},
		StandUp : {
			img: "icons/svg/up.svg",
			name: game.i18n.localize(ModuleName+".Titles.StandUp"),
			type : "base",
			system : {
				descriptionHeader : "Stand Up"
			},
			flags : {
				[ModuleName] : {
					onclick : (item) => {
						//item.parent?.rollSkill("blu"); add effect deletion
						
						return true;
					}
				}
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
			},			
			flags : {
				[ModuleName] : {
					subtitle : ModuleName+".Titles.Move",
				}
			}
		},
		CoupdeGrace : {
			img: "modules/enhancedcombathud-sfrpg/icons/backstab.svg",
			name: game.i18n.localize(ModuleName+".Titles.CoupdeGrace"),
			type : "base",
			system : {
				descriptionHeader : "Coup de Grace"
			},
			flags : {
				[ModuleName] : {
					subtitle : ModuleName+".Titles.Attack",
					onclick : (item) => {
						const weapon = item.parent?.items.find(item => item.type == "weapon");
						
						if (weapon) {
							weapon.rollDamage();
						}
					}
				}
			}
		},
		FightDefensively : {
			img: "modules/enhancedcombathud-sfrpg/icons/armor-upgrade.svg",
			name: game.i18n.localize(ModuleName+".Titles.FightDefensively"),
			type : "base",
			system : {
				descriptionHeader : "Fight Defensively"
			},
			flags : {
				[ModuleName] : {
					subtitle : ModuleName+".Titles.Attack",
					onclick : (item) => {
						//item.parent?.rollSkill("blu"); add
						
						return true;
					}
				}
			}
		},
		Withdraw : {
			img: "modules/enhancedcombathud-sfrpg/icons/exit-door.svg",
			name: game.i18n.localize(ModuleName+".Titles.Withdraw"),
			type : "base",
			system : {
				descriptionHeader : "Withdraw"
			},			
			flags : {
				[ModuleName] : {
					subtitle : ModuleName+".Titles.Move",
				}
			}
		}
	}
	
	StarfinderManeuvers = {
		groupflags : {
			actiontype : "action",
			journalid : "Compendium.sfrpg.rules.JournalEntry.U37n5tY5hn1ctzQL.JournalEntryPage.R33uiOMesYP0ISWl",
			ismaneuver : true,
			subtitle : game.i18n.localize(ModuleName+".Titles.MeleeAttack"),
			onclick : (item, event = {}) => {
				const meleeweapon = item.parent?.items.find(item => item.type == "weapon" && item.system.equipped && item.system.actionType[0] == "m");
				
				if (meleeweapon) {
					meleeweapon.rollAttack({event});
					
					return true;
				}
			}
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
	
	const starshipPackKey = game.settings.get("sfrpg", "starshipActionsSource");
    const starshipActionsPack = game.packs.get(starshipPackKey);
	const stunt = await starshipActionsPack.getDocument("7rt4q9ZonN0GlCXx");
	const stuntformulas = stunt.system.formula;
	StarfinderStunts = {
		groupflags : {
			actiontype : "action",
			isstunt : true,
			subtitle : game.i18n.localize(ModuleName+".Titles.PilotManeuver"),
			onclick : (item) => {
				useStunt(item);
				return true;
			}
		}
	}

	for (let i = 0; i < stuntformulas.length; i++) {
		let idname = stuntformulas[i].name.replaceAll(" ", "").toLowerCase();
		
		StarfinderStunts[idname] = {
			name : stuntformulas[i].name,
			type : "base",
			system : {
				...stunt.system,
				description : stuntformulas[i].effectNormal + stuntformulas[i].effectCritical,
				formula : stuntformulas[i].formula,
				dc : stuntformulas[i].dc,
				effectNormal : stuntformulas[i].effectNormal,
				effectCritical : stuntformulas[i].effectCritical
			},
			img : stuntimage(idname)
		}
	}
	
	StarfinderShipWeapons = {
		groupflags : {
		},
		port : {
			img: "modules/enhancedcombathud-sfrpg/icons/upgrade.svg",
			imgrotation : "-90deg",
			name: game.i18n.localize(ModuleName+".Titles.port"),
			type : "base",
			direction : "port",
			system : {
				descriptionHeader : "port"
			}
		},
		forward : {
			img: "modules/enhancedcombathud-sfrpg/icons/upgrade.svg",
			imgrotation: "0deg",
			name: game.i18n.localize(ModuleName+".Titles.forward"),
			type : "base",
			direction : "forward",
			system : {
				descriptionHeader : "forward"
			}
		},
		aft : {
			img: "modules/enhancedcombathud-sfrpg/icons/upgrade.svg",
			imgrotation: "180deg",
			name: game.i18n.localize(ModuleName+".Titles.aft"),
			type : "base",
			direction : "aft",
			system : {
				descriptionHeader : "aft"
			}
		},
		starboard : {
			img: "modules/enhancedcombathud-sfrpg/icons/upgrade.svg",
			imgrotation: "90deg",
			name: game.i18n.localize(ModuleName+".Titles.starboard"),
			type : "base",
			direction : "starboard",
			system : {
				descriptionHeader : "starboard"
			}
		},
		turret : {
			img: "modules/enhancedcombathud-sfrpg/icons/plain-circle.svg",
			imgrotation: "0deg",
			name: game.i18n.localize(ModuleName+".Titles.turret"),
			type : "base",
			direction : "turret",
			system : {
				descriptionHeader : "turret"
			}
		}
	}

	//some preparation
	for (let itemset of [StarfinderECHActionItems, StarfinderECHMoveItems, StarfinderECHFullItems, StarfinderManeuvers, StarfinderStunts, StarfinderShipWeapons]) {
		const actionJournal = await fromUuid(itemset.groupflags.journalid);
		
		for (let itemkey of Object.keys(itemset)) {
			if (itemkey != "groupflags") {
				if (!itemset[itemkey].flags) {
					itemset[itemkey].flags = {};
				}
				
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

async function starshipactions(role, actor) {
	const starshipPackKey = game.settings.get("sfrpg", "starshipActionsSource");
    const starshipActionsPack = game.packs.get(starshipPackKey);
	const indexes = await starshipActionsPack.getIndex();

	let roleActions = [];
	
	for (const index of indexes) {
		const action = await starshipActionsPack.getDocument(index._id);
		
		if (action.system?.role == role) {
			const localcopy = duplicate(action); //copy to modify
			localcopy.img = shipActionImage(localcopy);
			localcopy.flags = {[ModuleName] : {onclick : shipActionAutomation(localcopy, actor)}};

			if (localcopy._id == "7rt4q9ZonN0GlCXx") {//stunts
				localcopy.flags[ModuleName].suboption = StarfinderStunts;
			}

			roleActions.push(localcopy);
		}
	}
	
	return roleActions;
}

function shipActionImage(shipAction) {
	switch(shipAction._id) {
		case "qHsecClYOjza7Lyb": return "modules/enhancedcombathud-sfrpg/icons/circuitry.svg"; //Activate ECM
		case "sUkNIfIG9WNC3F3A": return "modules/enhancedcombathud-sfrpg/icons/rocket-flight.svg"; //Audacious Gambit
		case "nBvPpilpblioZptC": return "modules/enhancedcombathud-sfrpg/icons/scales.svg"; //Balance
		case "yW30fIr6P855ynYo": return "modules/enhancedcombathud-sfrpg/icons/cannon-shot.svg"; //Broadside
		case "tRnh0wFq61ScHfxf": return "modules/enhancedcombathud-sfrpg/icons/receive-money.svg"; //Demand
		case "p0sQQHqhVWOtHAn1": return "modules/enhancedcombathud-sfrpg/icons/delivery-drone.svg"; //Deploy Drone
		case "RKHIOu4uCqrEcFoC": return "modules/enhancedcombathud-sfrpg/icons/divert.svg"; //Divert
		case "exvXNMIOA2BnaL39": return "modules/enhancedcombathud-sfrpg/icons/ember-shot.svg"; //Eldritch Shot
		case "gsPzG6Y9PW24YgUa": return "modules/enhancedcombathud-sfrpg/icons/sword-brandish.svg"; //Encourage
		case "amVSLKRqQRXdKk4M": return "modules/enhancedcombathud-sfrpg/icons/thrust-bend.svg"; //Erratic Maneuvering
		case "YgHwyM4ATjSmUfX9": return "modules/enhancedcombathud-sfrpg/icons/cracked-glass.svg"; //Feign Disaster
		case "gTnq68hXhcwfMhfO": return "modules/enhancedcombathud-sfrpg/icons/striking-balls.svg"; //Fire At Will
		case "HzOXH8vFMCgBnMjg": return "modules/enhancedcombathud-sfrpg/icons/rocket.svg"; //Fly
		case "FDcymzZLqnp2K8eC": return "modules/enhancedcombathud-sfrpg/icons/power-lightning.svg"; //Full Power
		case "OGHHS1o91ZCaaiNa": return "modules/enhancedcombathud-sfrpg/icons/hang-glider.svg"; //Glide
		case "ggqDHMMCQdYdFfed": return "modules/enhancedcombathud-sfrpg/icons/return-arrow.svg"; //Hard Turn
		case "JnvLkvtuSdTbSQJ9": return "modules/enhancedcombathud-sfrpg/icons/distraction.svg"; //Harrying Shot
		case "B9CsbXIcE9ZGlGv9": return "modules/enhancedcombathud-sfrpg/icons/crime-scene-tape.svg"; //Hold It Together
		case "MkGcNrSOwmE0hFyW": return "modules/enhancedcombathud-sfrpg/icons/growth.svg"; //Improve Countermeasures
		case "J1x8JPeFUy0FLUKW": return "modules/enhancedcombathud-sfrpg/icons/lightning-electron.svg"; //Insidious Electronics
		case "FQJePy9WOiWXT0SO": return "modules/enhancedcombathud-sfrpg/icons/teller-mine.svg"; //Lay Mines
		case "9mCZxidXk8Txsdoz": return "modules/enhancedcombathud-sfrpg/icons/dozen.svg"; //Lead Boarding Party
		case "ML6Dh5dRr3XItvZx": return "modules/enhancedcombathud-sfrpg/icons/targeting.svg"; //Lock on
		case "hSOm5TfBN03pf5bJ": return "modules/enhancedcombathud-sfrpg/icons/pipes.svg"; //Maintenance Panel Access
		case "YWYFgrrLuurLr0KG": return "modules/enhancedcombathud-sfrpg/icons/swan-breeze.svg"; //Maneuver
		case "usI8JwlwHEtwjHSy": return "modules/enhancedcombathud-sfrpg/icons/joystick.svg"; //Manual realignment
		case "tlib3m1UOWD0LFDZ": return "modules/enhancedcombathud-sfrpg/icons/speedometer.svg"; //Maximize Speed
		case "jLK5slr8t0KuxeYn": return "modules/enhancedcombathud-sfrpg/icons/public-speaker.svg"; //Moving Speech
		case "OTWPk0lEeOwebAD3": return "modules/enhancedcombathud-sfrpg/icons/sparkles.svg"; //Mystic Haze
		case "8qwgKhbzm77VuNgQ": return "modules/enhancedcombathud-sfrpg/icons/acoustic-megaphone.svg"; //Orders
		case "xuRQbRMlMpPppWbH": return "modules/enhancedcombathud-sfrpg/icons/overdrive.svg"; //Overpower
		case "zWxJLgoAgkHsdr61": return "modules/enhancedcombathud-sfrpg/icons/sticking-plaster.svg"; //Patch
		case "XPBs4pSEl3XYXBE1": return "modules/enhancedcombathud-sfrpg/icons/bullseye.svg"; //Precise Targeting
		case "j7QVUYCTfHXDQMOX": return "modules/enhancedcombathud-sfrpg/icons/crystal-ball.svg"; //Precognition
		case "BeKPQFkSRO2c79rn": return "modules/enhancedcombathud-sfrpg/icons/calculator.svg"; //Prioritize Calculation
		case "WBO4aqcsNAfF5ziy": return "modules/enhancedcombathud-sfrpg/icons/psychic-waves.svg"; //Psychic Currents
		case "qbKzyS9YiTO6OTvg": return "modules/enhancedcombathud-sfrpg/icons/screwdriver.svg"; //Quick Fix
		case "QiXsxUPrbd44tr16": return "modules/enhancedcombathud-sfrpg/icons/radar-sweep.svg"; //Quick Rescan
		case "tbUCFKttNbU2Znbj": return "modules/enhancedcombathud-sfrpg/icons/measure-tape.svg"; //Range Finding
		case "JomStKwZWIbTDLif": return "modules/enhancedcombathud-sfrpg/icons/amplitude.svg"; //Rapid Jam
		case "OCikBLKbl1oRiVbd": return "modules/enhancedcombathud-sfrpg/icons/power-button.svg"; //Ready Weapon System
		case "f7azdHY89WWjV1Ti": return "modules/enhancedcombathud-sfrpg/icons/arrow-dunk.svg"; //Recall Beacon
		case "wOZ9xGH2l1S5lQ9g": return "modules/enhancedcombathud-sfrpg/icons/radar-sweep.svg"; //Scan
		case "OR6r6VkBCr9Ifand": return "modules/enhancedcombathud-sfrpg/icons/eyeball.svg"; //Scrying
		case "umc9JwD3YQmZhOyh": return "modules/enhancedcombathud-sfrpg/icons/strafe.svg"; //Shoot
		case "zSdO7axt0084UMB3": return "modules/enhancedcombathud-sfrpg/icons/gunshot.svg"; //Snapshot
		case "7rt4q9ZonN0GlCXx": return "modules/enhancedcombathud-sfrpg/icons/daemon-skull.svg"; //stunt
		case "7pFE0l7GHybA79CF": return "modules/enhancedcombathud-sfrpg/icons/closed-doors.svg"; //Subdue Boarding Party
		case "SvmYvEk0UTJ8MRhE": return "modules/enhancedcombathud-sfrpg/icons/boot-kick.svg"; //Swift Kick
		case "CGOK99xDHW47gA3M": return "modules/enhancedcombathud-sfrpg/icons/target-laser.svg"; //Target System
		case "rduQ5X6UqXWduwRQ": return "modules/enhancedcombathud-sfrpg/icons/tongue.svg"; //Taunt
		case "GO5w2bC91j0o7hh0": return "modules/enhancedcombathud-sfrpg/icons/pointing.svg"; //Targeting Aid
		case "0U3Voy2pxhR4g6W6": return "modules/enhancedcombathud-sfrpg/icons/binoculars.svg"; //Visual Identification
		default: return "icons/svg/mystery-man.svg";
	}
}

function shipActionAutomation(shipAction, actor) {
	switch(shipAction._id) {
		default: return () => {
			actor.useStarshipAction(shipAction._id);
			return true;
		};
	}
}

function stuntimage(nameid) {
	switch (nameid) {
		case "runinterference": return "modules/enhancedcombathud-sfrpg/icons/lightning-frequency.svg";
		case "flyby": return "modules/enhancedcombathud-sfrpg/icons/strafe.svg";
		case "flank": return "modules/enhancedcombathud-sfrpg/icons/encirclement.svg";
		case "rammingspeed": return "modules/enhancedcombathud-sfrpg/icons/siege-ram.svg";
		case "backoff": return "modules/enhancedcombathud-sfrpg/icons/fast-backward-button.svg";
		case "barrelroll": return "modules/enhancedcombathud-sfrpg/icons/clockwise-rotation.svg";
		case "evade": return "modules/enhancedcombathud-sfrpg/icons/sideswipe.svg";
		case "flipandburn": return "modules/enhancedcombathud-sfrpg/icons/burning-dot.svg";
		case "slide": return "modules/enhancedcombathud-sfrpg/icons/chess-bishop.svg";
		case "turninplace": return "modules/enhancedcombathud-sfrpg/icons/arrow-dunk.svg";
		case "escort": return "modules/enhancedcombathud-sfrpg/icons/team-upgrade.svg";
		default: return "icons/svg/mystery-man.svg";
	}
}

function defaultaction(role) {
	
}

export {registerStarfinderECHSItems, StarfinderECHActionItems, StarfinderECHMoveItems, StarfinderECHFullItems, StarfinderManeuvers, StarfinderStunts, starshipactions, StarfinderShipWeapons}