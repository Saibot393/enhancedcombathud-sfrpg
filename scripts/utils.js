const ModuleName = "enhancedcombathud-sfrpg";

const DiceSFRPG = sfrpg.dice;
const RollContext = sfrpg.rolls.RollContext;

async function getTooltipDetails(item) {
	let description, footerText, itemType, category, subtitle, subtitlecolor, range, area, ammunitionType, attackbonus, save, target, actarget, duration, damage, level, spellschool, featType, specialAbilityType, weaponproperties, descriptors, role;
	let actor, abilities, actordetails;
	let title = "";
	let propertiesLabel;
	let properties = [];

	let details = [];
	
	if (!item || !item.system) return;

	actor = item.parent;
	abilities = actor?.system.abilities;
	actordetails = actor?.system.details;
	
	title = item.name;
	description = item.system?.description.value ? item.system?.description.value : item.system?.description;
	footerText = item.system?.description?.short;
	itemType = item.type;
	category = item.system.category;
	range = item.system?.range;
	area = item.system?.area;
	ammunitionType = item.system?.ammunitionType;
	attackbonus = item.system?.attackBonus;
	save = item.system?.save;
	target = item.system?.target;
	actarget = item.system?.actionTarget;
	duration = item.system?.duration;
	damage = item.system?.damage;
	level = item.system?.level;
	spellschool = item.system?.school;
	featType = item.system?.details?.category;
	specialAbilityType = item.system?.details?.specialAbilityType;
	weaponproperties = item.system?.properties;
	descriptors = item.system?.descriptors;
	role = item.system?.role;
	
	//sub title
	switch (itemType) {
		case "spell":
			subtitle = game.i18n.localize(CONFIG.SFRPG.spellSchools[spellschool]);
			break;
		case "feat":
			if (specialAbilityType && specialAbilityType != "none") {
				subtitle = CONFIG.SFRPG.specialAbilityTypes[specialAbilityType];
			}
			break;
		default:
			if (!isNaN(level)) {
				subtitle = game.i18n.localize("SFRPG.LevelLabelText") + " " + level;
				
				if (itemType == "spell") {
					subtitlecolor = levelColor(level*4);
				}
				else {
					subtitlecolor = levelColor(level);
				}
			}
			else {
				if (role) {
					subtitle = game.i18n.localize(CONFIG.SFRPG.starshipRoleNames[role]);
				}
				else {
					if (itemType != "base") {
						subtitle = CONFIG.SFRPG.itemTypes[itemType];
					}
					else {
						if (item.flags[ModuleName].subtitle) {
							subtitle = game.i18n.localize(item.flags[ModuleName].subtitle);
						}
					}
				}
			}
			break;
	}
	
	//properties
	properties = [];
	switch (itemType) {
		case "weapon":
			propertiesLabel = game.i18n.localize("SFRPG.Items.Weapon.Properties");
			properties = Object.keys(weaponproperties).filter(key => weaponproperties[key]).map(key => {return {label : CONFIG.SFRPG.weaponProperties[key]}});
			break;
		case "spell":
			propertiesLabel = game.i18n.localize("SFRPG.Descriptors.Descriptors");
			properties = Object.keys(descriptors).filter(key => descriptors[key]).map(key => {return {label : CONFIG.SFRPG.descriptors[key]}});
			break;
	}

	//details
	if (range && range.units && range.units != "none") {
		let valuetext = range.units;
		
		if (range.value) {
			valuetext = range.value + " " + valuetext;
		}
		else {
			valuetext = firstUpper(valuetext);
		}
		
		details.push({
			label: "SFRPG.Items.Activation.Range",
			value: valuetext,
		});
	}
	
	if (area) {
		if (area.shape && area.total && area.units) {
			details.push({
				label: "SFRPG.Items.Activation.Area",
				value: `${area.total}${area.units} ${firstUpper(area.shape)} ${area.effect ? firstUpper(area.effect) : ""}`,
			});
		}
	}
	
	if (damage?.parts.length) {
		let damageparts = damage.parts.map(part => {return{formula : part.formula, types : part.types}});
		
		for (const part of damageparts) {
			const roll = new Roll(part.formula, {actor, abilities, details : actordetails, classes : actor.system.classes});
			
			await roll.evaluate();
			
			part.formulaReduced = roll.formula;
		}
		
		let label;
		if (!damageparts.find(part => part.types?.healing)) {
			label = "SFRPG.Damage.Title";
		}
		else {
			label  = "SFRPG.HealingTypesHealing";
		}
		
		details.push({
			label: label,
			value: damageparts.map(part => part.formulaReduced + " " +Object.keys(part.types).filter(key => part.types[key]).map(key => damageIcon(key)).join("<br>")),
		});
	}
	
	if (attackbonus) {
		let attackbonustext = attackbonus;
		
		if (attackbonus > 0) {
			attackbonustext = "+" + attackbonustext;
		}
		
		details.push({
			label: "SFRPG.Items.Action.AttackRollBonus",
			value: attackbonustext,
		});
	}
	
	if (target?.value) {
		details.push({
			label: "SFRPG.Items.Activation.Target",
			value: target.value,
		});
	}
	
	if (duration?.value) {
		let durationtext = duration.value;
		
		if (durationtext && durationtext.includes("@")) {
			const roll = new Roll(durationtext, {actor, details : actordetails});
			
			await roll.evaluate();
			
			durationtext = roll.total;
		}
		
		if (duration.units != "text" && duration.units) {
			durationtext = durationtext + " " + CONFIG.SFRPG.effectDurationTypes[duration.units];
		}
		
		details.push({
			label: "SFRPG.Items.Activation.Duration",
			value: durationtext,
		});
	}
	
	if (ammunitionType && ammunitionType != "none") {
		details.push({
			label: "SFRPG.WeaponPropertiesAmmunition",
			value: CONFIG.SFRPG.ammunitionTypes[ammunitionType],
		});
	}
	
	if (save?.type && save?.dc) {
		const roll = new Roll(save.dc, {actor, item, abilities});
		
		await roll.evaluate();
		
		let dc = roll.total;
		
		details.push({
			label: "SFRPG.Save",
			value: `DC ${dc} ${CONFIG.SFRPG.saves[save.type]} ${CONFIG.SFRPG.saveDescriptors[save.descriptor]}`,
		});	
	}
	
	if (actarget) {
		details.push({
			label: ModuleName + ".Titles.Against",
			value: actarget.toUpperCase(),
		});
	}

	if (description) description = await TextEditor.enrichHTML(description);

	return { title, description, subtitle, subtitlecolor, details, properties , propertiesLabel, footerText };
}

function levelColor(level) {
					//blue -> green -> violet -> red -> orange
	const colors = ["#1d91de", "#198f17", "#981cb8", "#ab260c", "#c29810"];
	
	if (level >= 21) {
		return "#000000";
	}
	
	if (level <= 0) {
		return "#8c4c0b";
	}
	
	return colors[Math.floor(level/5)];
}

function damageIcon(damageType) {
	switch (damageType.toLowerCase()) {
		case "acid":
			return '<i class="fa-solid fa-flask"></i>';
		case "bludgeoning":
			return '<i class="fa-solid fa-hammer"></i>';
		case "cold":
			return '<i class="fa-solid fa-snowflake"></i>';
		case "electricity":
			return '<i class="fa-solid fa-bolt"></i></i>'
		case "fire":
			return '<i class="fa-solid fa-fire"></i>';
		case "healing":
			return '<i class="fa-solid fa-heart"></i>';
		case "piercing":
			return '<i class="fa-solid fa-crosshairs"></i>';
		case "slashing":
			return '<i class="fa-solid fa-scissors"></i>';
		case "sonic":
			return '<i class="fa-solid fa-volume-high"></i>';
		default:
			return "";
	}
}

function firstUpper(string) {
	return string[0].toUpperCase() + string.substr(1);
}

async function useStunt(stunt) {
	let actor = stunt.parent;
	let selectedFormula = stunt.system;
	
	console.log(stunt);

	const rollContext = new RollContext();
	rollContext.addContext("ship", actor);
	rollContext.setMainContext("ship");

	actor.setupRollContexts(rollContext, stunt.system.selectors || []);

	/** Create additional modifiers. */
	const additionalModifiers = [
		{bonus: { name: game.i18n.format("SFRPG.Rolls.Starship.ComputerBonus"), modifier: "@ship.attributes.computer.value", enabled: false} },
		{bonus: { name: game.i18n.format("SFRPG.Rolls.Starship.CaptainDemand"), modifier: "4", enabled: false} },
		{bonus: { name: game.i18n.format("SFRPG.Rolls.Starship.CaptainEncouragement"), modifier: "2", enabled: false} },
		{bonus: { name: game.i18n.format("SFRPG.Rolls.Starship.ScienceOfficerLockOn"), modifier: "2", enabled: false} }
	];
	rollContext.addContext("additional", {name: "additional"}, {modifiers: { bonus: "n/a", rolledMods: additionalModifiers } });

	let systemBonus = "";
	
	for (const [key, value] of Object.entries(actor.system.attributes.systems)) {
		if (value.affectedRoles && value.affectedRoles[stunt.system.role]) {
			if (key === "powerCore" && stunt.system.role !== "engineer") {
				systemBonus += ` + @ship.attributes.systems.${key}.modOther`;
			} else {
				systemBonus += ` + @ship.attributes.systems.${key}.mod`;
			}
		}
	}

	console.log( selectedFormula.formula + systemBonus + " + @additional.modifiers.bonus");
	
	const rollResult = await DiceSFRPG.createRoll({
		rollContext: rollContext,
		rollFormula: selectedFormula.formula + systemBonus + " + @additional.modifiers.bonus",
		title: game.i18n.format("SFRPG.Rolls.StarshipAction", {action: stunt.name})
	});
	
	console.log( selectedFormula.formula + systemBonus + " + @additional.modifiers.bonus");

	if (!rollResult) {
		return;
	}

	let speakerActor = actor;
	const roleKey = CONFIG.SFRPG.starshipRoleNames[stunt.system.role];
	let roleName = game.i18n.format(roleKey);

	const desiredKey = stunt.system.selectorKey;
	if (desiredKey) {
		const selectedContext = rollContext.allContexts[desiredKey];
		if (!selectedContext) {
			ui.notifications.error(game.i18n.format("SFRPG.Rolls.StarshipActions.NoActorError", {name: desiredKey}));
			return;
		}

		speakerActor = selectedContext?.entity || actor;

		const actorRole = actor.getCrewRoleForActor(speakerActor.id);
		if (actorRole) {
			const actorRoleKey = CONFIG.SFRPG.starshipRoleNames[actorRole];
			roleName = game.i18n.format(actorRoleKey);
		}
	}

	let flavor = "";
	flavor += game.i18n.format("SFRPG.Rolls.StarshipActions.Chat.Role", {role: roleName, name: actor.name});
	flavor += "<br/>";
	flavor += `<h2>${stunt.name}</h2>`;

	const dc = selectedFormula.dc || stunt.system.dc;
	if (dc) {
		if (dc.resolve) {
			const dcRoll = await DiceSFRPG.createRoll({
				rollContext: rollContext,
				rollFormula: dc.value,
				mainDie: 'd0',
				title: game.i18n.format("SFRPG.Rolls.StarshipAction", {action: stunt.name}),
				dialogOptions: { skipUI: true }
			});

			flavor += `<p><strong>${game.i18n.format("SFRPG.Rolls.StarshipActions.Chat.DC")}: </strong>${dcRoll.roll.total}</p>`;
		} else {
			flavor += `<p><strong>${game.i18n.format("SFRPG.Rolls.StarshipActions.Chat.DC")}: </strong>${await TextEditor.enrichHTML(dc.value, {
				async: true,
				rollData: this.getRollData() ?? {}
			})}</p>`;
		}
	}
	
	flavor += `<p><strong>${game.i18n.format("SFRPG.Rolls.StarshipActions.Chat.NormalEffect")}: </strong>`;
	flavor += await TextEditor.enrichHTML(selectedFormula.effectNormal || stunt.system.effectNormal, {
		async: true,
		rollData: actor.getRollData() ?? {}
	});
	flavor += "</p>";

	if (stunt.system.effectCritical) {
		const critEffectDisplayState = game.settings.get("sfrpg", "starshipActionsCrit");
		if (critEffectDisplayState !== 'never') {
			if (critEffectDisplayState === 'always' || rollResult.roll.dice[0].values[0] === 20) {
				flavor += `<p><strong>${game.i18n.format("SFRPG.Rolls.StarshipActions.Chat.CriticalEffect")}: </strong>`;
				flavor += await TextEditor.enrichHTML(selectedFormula.effectCritical || stunt.system.effectCritical, {
					async: true,
					rollData: actor.getRollData() ?? {}
				});
				flavor += "</p>";
			}
		}
	}

	const rollMode = game.settings.get("core", "rollMode");
	const preparedRollExplanation = DiceSFRPG.formatFormula(rollResult.formula.formula);
	const rollContent = await rollResult.roll.render({ breakdown: preparedRollExplanation });

	ChatMessage.create({
		flavor: flavor,
		speaker: ChatMessage.getSpeaker({ actor: speakerActor }),
		content: rollContent,
		rollMode: rollMode,
		roll: rollResult.roll,
		type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		sound: CONFIG.sounds.dice
	});
}

export { getTooltipDetails, ModuleName, firstUpper, useStunt }