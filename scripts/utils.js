const ModuleName = "enhancedcombathud-sfrpg";

async function getTooltipDetails(item, actortype) {
	let title, description, effect, itemType, skill, vaesenattribute, category, subtitle, subtitlecolor, range, damage, bonus, bonusType, level, spellschool, featType, weaponproperties, descriptors;
	let propertiesLabel;
	let properties = [];
	let materialComponents = "";

	let details = [];
	
	if (!item || !item.system) return;

	title = item.name;
	description = item.system.description.value ? item.system.description.value : item.system.description;
	effect = item.system.effect
	itemType = item.type;
	skill = item.system.skill;
	vaesenattribute = item.system.vaesenattribute;
	category = item.system.category;
	range = item.system?.range;
	damage = item.system?.damage;
	bonus = item.system?.bonus;
	bonusType = item.system?.bonusType;
	level = item.system?.level;
	spellschool = item.system?.school;
	featType =item.system?.details?.category;
	weaponproperties = item.system?.properties;
	descriptors = item.system?.descriptors;
	
	if (bonusType == "none") {
		bonusType = undefined;
	}
	
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
	
	//sub title
	properties = [];
	switch (itemType) {
		case "weapon":
			properties = Object.keys(weaponproperties).filter(key => weaponproperties[key]).map(key => {return {label : CONFIG.SFRPG.weaponProperties[key]}});
			break;
		case "spell":
			properties = Object.keys(descriptors).filter(key => descriptors[key]).map(key => {return {label : CONFIG.SFRPG.descriptors[key]}});
			break;
	}
	
	materialComponents = "";

	switch (itemType) {
	}

	if (description) description = await TextEditor.enrichHTML(description);
	
	if (bonus) {
		details.push({
			label: "CONDITION.BONUS",
			value: bonus
		});
	}
	
	if (effect) {
		propertiesLabel = "GEAR.EFFECT";
		properties.push({ label: effect });
	}
	
	if (bonusType) {
		propertiesLabel = "BONUS_TYPE.HEADER";
		
		switch (bonusType) {
			case "ignoreConditionSkill":
				bonusType = "IGNORE_CONDITIONS_SKILL";
				break;
			case "ignoreConditionPhysical":
				bonusType = "IGNORE_CONDITIONS_PHYSICAL"; 
				break;
			case "ignoreConditionMental":
				bonusType = "IGNORE_CONDITIONS_MENTAL";
				break;
		}
		
		properties.push({ label: "BONUS_TYPE." + bonusType.toUpperCase() });
	}

	return { title, description, subtitle, subtitlecolor, details, properties , propertiesLabel, footerText: materialComponents };
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

export { getTooltipDetails, ModuleName }