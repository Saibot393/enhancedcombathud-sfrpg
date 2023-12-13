const ModuleName = "enhancedcombathud-sfrpg";

async function getTooltipDetails(item) {
	let description, footerText, itemType, category, subtitle, subtitlecolor, range, area, ammunitionType, attackbonus, save, target, actarget, duration, damage, level, spellschool, featType, weaponproperties, descriptors;
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
	weaponproperties = item.system?.properties;
	descriptors = item.system?.descriptors;
	
	//sub title
	switch (itemType) {
		case "spell":
			subtitle = game.i18n.localize(CONFIG.SFRPG.spellSchools[spellschool]);
			break;
		case "feat":
			subtitle = CONFIG.SFRPG.featureCategories[featType].label;
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
				if (itemType != "base") {
					subtitle = CONFIG.SFRPG.itemTypes[itemType];
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
			const roll = new Roll(part.formula, {actor, abilities});
			
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

export { getTooltipDetails, ModuleName }