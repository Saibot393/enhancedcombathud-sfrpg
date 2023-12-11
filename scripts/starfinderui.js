import {registerStarfinderECHSItems, StarfinderECHSlowItems, StarfinderECHFastItems, StarfinderECHReactionItems} from "./specialItems.js";
import {ModuleName, getTooltipDetails} from "./utils.js";

Hooks.on("argonInit", (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;
  
	registerStarfinderECHSItems();
	
	function useAction(actionType) {
		switch (actionType) {
			case "standard":
				break;
			case "standard":
				break;
			case "move":
				break;
			case "swift":
				break;
			case "full":
				break;
			case "reaction":
				break;
		}
	}
  
    class StarfinderPortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
		constructor(...args) {
			super(...args);
		}

		get description() {
			const { type, system } = this.actor;
			const actor = this.actor;
			
			switch (type) {
				case "player":
					return `${system.bio.archetype}`;
					break;
				case "npc":
					break;
				case "Starfinder":
					break;
				case "headquater":
					return `${system.bio.building}, ${system.bio.location}`;
					break;
				default:
					return "";
					break;
			}
		}

		get isDead() {
			let isDead = false;
			
			let mental = false;
			let physical = false;
			
			if (this.actor.type == "player") {
				mental = this.actor.system.condition.mental?.isBroken;
				physical = this.actor.system.condition.physical?.isBroken;
			}
			
			if (this.actor.type == "npc") {
				mental = this.actor.system.condition.mental?.value == 0;
				physical = this.actor.system.condition.physical?.value == 0;
			}
			
			isDead = mental || physical;
			
			return isDead;
		}

		async getStatBlocks() {
			let Blocks = [];
			
			const colors = {
				eac: "DeepSkyBlue",
				kac: "LightSteelBlue"
			};
			
			for (const key of ["eac", "kac"]) {
				Blocks.push([
					{
						text: CONFIG.SFRPG.modifierArmorClassAffectedValues[key],
						id : key
					},
					{
						text: this.actor.system.attributes[key].value,
						color: colors[key],
					},
				]);
			}
			
			return Blocks;
		}
		
		async getBars() {
			const bars = document.createElement("div");
			bars.style.width = "160px";
			bars.style.height = "50px";
			bars.style.position = "absolute";
			
			let hp = this.actor.system.attributes.hp;
			let sp = this.actor.system.attributes.sp;
			
			//stamina
			const spbar = document.createElement("div");
			spbar.style.width = "75%";
			spbar.style.height = "40%";
			spbar.style.position = "relative";
			spbar.style.backgroundColor = "grey";
			spbar.style.clipPath = "polygon(0% 0%, 100% 0%, 80% 100%, 0% 100%)";
			
			const spsubbar = document.createElement("div");
			spsubbar.style.width = `${sp.value/sp.max*100}%`;
			spsubbar.style.height = "100%";
			spsubbar.style.backgroundColor = "darkOrange";
			spsubbar.style.position = "absolute";
			spsubbar.style.top = "0";
			spsubbar.style.left = "0";
			
			spbar.appendChild(spsubbar);
			
			//hp
			const hpbar = document.createElement("div");
			hpbar.style.width = "100%";
			hpbar.style.height = "60%";
			hpbar.style.position = "relative";
			hpbar.style.backgroundColor = "grey";
			hpbar.style.clipPath = "polygon(0% 0%, 100% 0%, 80% 100%, 0% 100%)";
			
			const hpsubbar = document.createElement("div");
			hpsubbar.style.width = `${hp.value/hp.max*100}%`;
			hpsubbar.style.height = "100%";
			hpsubbar.style.backgroundColor = "red";
			hpsubbar.style.position = "absolute";
			hpsubbar.style.top = "0";
			hpsubbar.style.left = "0";
			
			const tempsubbar = document.createElement("div");
			tempsubbar.style.width = `${hp.temp/hp.max*100}%`;
			tempsubbar.style.height = "70%";
			tempsubbar.style.backgroundColor = "blue";
			tempsubbar.style.position = "absolute";
			tempsubbar.style.bot = "0";
			tempsubbar.style.left = "0";
			tempsubbar.style.opacity  = "0.5";
			
			hpbar.appendChild(hpsubbar);
			hpbar.appendChild(tempsubbar);
			
			bars.appendChild(spbar);
			bars.appendChild(hpbar);
			
			const splabel = document.createElement("span");
			splabel.innerHTML = `${sp.value}/${sp.max} SP`;
			splabel.style.position = "absolute";
			splabel.style.zIndex = "20";
			splabel.style.width = "70%";
			splabel.style.height = "100%";
			splabel.style.textAlign = "left";
			splabel.style.fontSize = "1.2em";
			splabel.style.color = "white";
			
			spbar.appendChild(splabel);
			
			const hplabel = document.createElement("span");
			if (hp.temp <= 0) {
				hplabel.innerHTML = `${hp.value}/${hp.max} HP`;
			}
			else{
				hplabel.innerHTML = `${hp.temp} TEMP`;
			}
			hplabel.style.position = "absolute";
			hplabel.style.zIndex = "20";
			hplabel.style.width = "70%";
			hplabel.style.height = "100%";
			hplabel.style.textAlign = "left";
			hplabel.style.fontSize = "1.4em";
			hplabel.style.color = "white";
			
			hpbar.appendChild(hplabel);
			
			return bars;
		}
		
		async _renderInner(data) {
			await super._renderInner(data);
			
			const bars = await this.getBars();
			this.element.appendChild(bars);
			bars.style.left = "0px";
			bars.style.bottom = "0px";
			bars.style.zIndex = "10"; //to front
			
			const height = 1.6;
			let bottom = 0;
			for (const key of ["eac", "kac"]) {
				let armorblock = this.element.querySelector(`#${key}`)?.parentElement;
				
				armorblock.style.right = "0";
				armorblock.style.position = "absolute";
				armorblock.style.bottom = `${bottom}em`;
				armorblock.style.height = `${height}em`;
				bottom = bottom + height;
			}
		}
	}
	
	class StarfinderDrawerPanel extends ARGON.DRAWER.DrawerPanel {
		constructor(...args) {
			super(...args);
		}

		get categories() {
			const abilities = this.actor.system.abilities;
			const saves = Object.fromEntries(["fort", "reflex", "will"].map(key => [key, this.actor.system.attributes[key]]));
			const skills = this.actor.system.skills;
			
			let validskills = {};
			
			for (const key of Object.keys(skills)) {
				if (!skills[key].isTrainedOnly || skills[key].ranks > 0) {
					validskills[key] = skills[key]
				}
			}

			const abilitiesbuttons = Object.keys(abilities).map((ability) => {
				const abilitiedata = abilities[ability];
				
				let valueLabel = `<span style="margin: 0 1rem">+${abilitiedata.mod}</span>`;
				
				return new ARGON.DRAWER.DrawerButton([
					{
						label: CONFIG.SFRPG.abilities[ability],
						onClick: () => {this.actor.rollAbility(ability)}
					},
					{
						label: valueLabel,
						onClick: () => {this.actor.rollAbility(ability)},
						style: "display: flex; justify-content: flex-end;"
					}
				]);
			});
			
			const savesbuttons = Object.keys(saves).map((save) => {
				const savedata = saves[save];
				
				let valueLabel = `<span style="margin: 0 1rem">+${savedata.bonus}</span>`;
				
				return new ARGON.DRAWER.DrawerButton([
					{
						label: CONFIG.SFRPG.saves[save],
						onClick: () => {this.actor.rollSave(save)}
					},
					{
						label: valueLabel,
						label: valueLabel,
						onClick: () => {this.actor.rollSave(save)},
						style: "display: flex; justify-content: flex-end;"
					}
				]);
			});
			
			
			let skillsButtons = Object.keys(validskills).map((skill) => {
				const skillData = validskills[skill];
				
				let valueLabel = `+${skillData.mod}<span style="margin: 0 1rem; filter: brightness(0.8)">(${validskills[skill].ranks})</span>`;
				
				return new ARGON.DRAWER.DrawerButton([
					{
						label: CONFIG.SFRPG.skills[skill],
						onClick: () => {this.actor.rollSkill(skill)}
					},
					{
						label: valueLabel,
						onClick: () => {this.actor.rollSkill(skill)},
						style: "display: flex; justify-content: flex-end;"
					},
				]);
			});

			let returncategories = [];

			if (abilitiesbuttons.length) {
				returncategories.push({
					gridCols: "7fr 2fr",
					captions: [
						{
							label: game.i18n.localize("HEADER.ATTRIBUTES"),
						},
						{
							label: game.i18n.localize("ROLL.ROLL"),
						},
					],
					buttons: abilitiesbuttons
				});
			}
			
			if (savesbuttons.length) {
				returncategories.push({
					gridCols: "7fr 2fr",
					captions: [
						{
							label: game.i18n.localize("HEADER.SAVES"),
						},
						{
							label: "",
						},
					],
					buttons: savesbuttons
				});
			}
			
			if (skillsButtons.length) {
				returncategories.push({
					gridCols: "7fr 2fr",
					captions: [
						{
							label: game.i18n.localize("HEADER.SKILLS"),
						},
						{
							label: "",
						}
					],
					buttons: skillsButtons,
				});
			}
			
			return returncategories;
		}

		get title() {
			return `${game.i18n.localize("HEADER.ATTRIBUTES")} & ${game.i18n.localize("HEADER.SKILLS")}`;
		}
	}
  
    class StarfinderSlowActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.SlowAction";
		}
		
		get maxActions() {
            return 1;
        }
		
		get currentActions() {
			return this.isActionUsed ? 0 : 1;
		}
		
		_onNewRound(combat) {
			this.isActionUsed = false;
			this.updateActionUse();
		}
		
		async _getButtons() {
			const specialActions = Object.values(StarfinderECHSlowItems);

			let buttons = [];
			
			buttons.push(new StarfinderItemButton({ item: null, isWeaponSet: true, isPrimary: true }));
			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new StarfinderSpecialActionButton(specialActions[0]), new StarfinderSpecialActionButton(specialActions[1])));
			if (this.actor.items.find(item => item.type == "spell")) {
				buttons.push(new StarfinderButtonPanelButton({type: "spell", color: 0}));
			}
			
			buttons.push(new StarfinderButtonPanelButton({type: "gear", color: 0}));
			
			if (this.actor.type == "player" && this.actor.items.find(item => item.type == "talent") && game.settings.get(ModuleName, "ShowTalents")) {
				buttons.push(new StarfinderButtonPanelButton({type: "talent", color: 0}));
			}
			
			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new StarfinderSpecialActionButton(specialActions[2]), new StarfinderSpecialActionButton(specialActions[3])));
			
			return buttons.filter(button => button.items == undefined || button.items.length);
		}
    }
	
    class StarfinderFastActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.FastAction";
		}
		
		get maxActions() {
            return 1;
        }
		
		get currentActions() {
			return this.isActionUsed ? 0 : 1;
		}
		
		_onNewRound(combat) {
			this.isActionUsed = false;
			this.updateActionUse();
		}
		
		async _getButtons() {
			const specialActions = Object.values(StarfinderECHFastItems);

			const buttons = [
			  new ARGON.MAIN.BUTTONS.SplitButton(new StarfinderSpecialActionButton(specialActions[0]), new StarfinderSpecialActionButton(specialActions[1])),
			  new ARGON.MAIN.BUTTONS.SplitButton(new StarfinderSpecialActionButton(specialActions[2]), new StarfinderSpecialActionButton(specialActions[3]))
			];
			return buttons.filter(button => button.items == undefined || button.items.length);
		}
    }
	
    class StarfinderReactionActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.ReAction";
		}
		
		async _getButtons() {
			const specialActions = Object.values(StarfinderECHReactionItems);

			const buttons = [
			  new ARGON.MAIN.BUTTONS.SplitButton(new StarfinderSpecialActionButton(specialActions[0]), new StarfinderSpecialActionButton(specialActions[1])),
			  new ARGON.MAIN.BUTTONS.SplitButton(new StarfinderSpecialActionButton(specialActions[2]), new StarfinderSpecialActionButton(specialActions[3]))
			];
			return buttons.filter(button => button.items == undefined || button.items.length);
		}
    }
	
	class StarfinderItemButton extends ARGON.MAIN.BUTTONS.ItemButton {
		constructor(...args) {
			super(...args);
		}

		get hasTooltip() {
			return true;
		}

		get targets() {
			return null;
		}

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.item, this.actor.type);
			return tooltipData;
		}

		async _onLeftClick(event) {
			var used = false;
			
			if (this.item.type == "weapon") {
				this.actor.sheet.rollWeapon(this.item.id);
				
				used = true;
			}
			
			if (this.item.type == "attack") {
				const testName = this.item.name;
				let bonus = this.actor.sheet.computeInfoFromConditions();
				let attribute = this.actor.system.attribute[this.item.system.attribute];

				let info = [
				  { name: game.i18n.localize(attribute.label + "_ROLL"), value: attribute.value },
				  bonus
				];

				prepareRollNewDialog(this.actor.sheet, testName, info, this.item.system.damage, null, null);
				
				used = true;
			}
			
			if (this.item.type == "gear" || this.item.type == "magic" || this.item.type == "talent") {
				const data = this.item.data;
				const type = data.type;
				/*
				const skill = this.item.system.skill;
				
				if (skill instanceof Array) {
					if (skill.length == 1) {
						skill = skill[0];
					}
					else {
						skill = undefined;
					}
				}
				*/
				
				let chatData = buildChatCard(type, data);
				ChatMessage.create(chatData, {});;
			}			
			
			if (used) {
				StarfinderItemButton.consumeActionEconomy(this.item);
			}
		}

		static consumeActionEconomy(item) {
			if (item.type == "weapon" || item.type == "attack") {
				ui.ARGON.components.main[0].isActionUsed = true;
				ui.ARGON.components.main[0].updateActionUse();
			}
		}

		async render(...args) {
			await super.render(...args);
			if (this.item?.system.consumableType === "ammo") {
				const weapons = this.actor.items.filter((item) => item.system.consume?.target === this.item.id);
				ui.ARGON.updateItemButtons(weapons);
			}
		}
	}
  
    class StarfinderButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
		constructor({type, color}) {
			super();
			this.type = type;
			this.color = color;
		}

		get colorScheme() {
			return this.color;
		}

		get label() {
			switch (this.type) {
				case "gear": return "GEAR.NAME";
				case "magic": return "MAGIC.NAME";
				case "talent": return "TALENT.NAME";
			}
		}

		get icon() {
			switch (this.type) {
				case "gear": return "modules/enhancedcombathud/icons/svg/backpack.svg";
				case "magic": return "modules/enhancedcombathud/icons/svg/spell-book.svg";
				case "talent": return "icons/svg/book.svg";
			}
		}
		
		validSpells () {
			let spellCategories = [];
			let spells = this.actor.items.filter(item => item.type == "spell");
			
			for (let i = 0; i <= 6; i++) {
				let usesvalue = i == 0 ? Infinity : Object.keys(this.actor.system.classes).map(spellclass => this.actor.system.spells["spell" + i].perClass[spellclass].value).reduce((summ, value) => {return summ = summ+value}, 0);
				let usesmax = i == 0 ? Infinity : this.actor.system.spells["spell" + i].max;
				
				spellCategories.push({
					label: CONFIG.SFRPG.spellLevels[i],
					buttons: spells.filter(spell => spell.system.level == i).map(spell => new StarfinderItemButton({item : spell})),
					uses: { max: usesmax, value: usesvalue }
				});
			}
			
			return spellCategories.filter(category => category.buttons.length > 0);
		}
  
		async _getPanel() {
			if (this.type == "spell") {
				return new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel({accordionPanelCategories: this.validSpells().map(({ label, buttons, uses }) => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory({ label, buttons, uses })) });
			}
			else {
				return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: this.actor.items.filter(item => item.type == this.type).map(item => new StarfinderItemButton({item}))});
			}
		}
    }
	
	class StarfinderSpecialActionButton extends ARGON.MAIN.BUTTONS.ActionButton {
        constructor(specialItem) {
			super();
			this.item = new CONFIG.Item.documentClass(specialItem, {
				parent: this.actor,
			});
		}

		get label() {
			return this.item.name;
		}

		get icon() {
			return this.item.img;
		}

		get hasTooltip() {
			return true;
		}
		

		get colorScheme() {
			switch (this.item?.flags[ModuleName]?.actiontype) {
				case "slow":
					return 0;
					break;
				case "fast":
					return 1;
					break;
				case "react":
					return 3;
					break;
			}
			return 0;
		}

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.item, this.actor.type);
			return tooltipData;
		}

		async _onLeftClick(event) {
			var used = true;
			
			const item = this.item;
			
			switch(this.actor.type) {
				case "player" :
				case "npc" :
					let skill = item.system.skill;
					
					if (skill instanceof Array) {
						const activeSet = await ui.ARGON.components.weaponSets?.getactiveSet();
						
						if (activeSet?.primary?.system.skill) {
							skill = skill.find(key => key == activeSet.primary.system.skill);
						}
						
						if (skill instanceof Array) {
							skill = undefined;
						}
					}
					
					if (skill) {
						this.actor.sheet.rollSkill(skill);
					}
					break;
				case "Starfinder" : 
					let attribute = item.system.Starfinderattribute;
					
					if (attribute) {
						this.actor.sheet.rollAttribute(attribute);
					}
					break;					
			}
			
			if (used) {
				StarfinderSpecialActionButton.consumeActionEconomy(this.item);
			}
		}

		static consumeActionEconomy(item) {
			switch (item.flags[ModuleName].actiontype) {
				case "slow":
					ui.ARGON.components.main[0].isActionUsed = true;
					ui.ARGON.components.main[0].updateActionUse();
					break;
				case "fast":
					if (ui.ARGON.components.main[1].isActionUsed) {
						ui.ARGON.components.main[0].isActionUsed = true;
						ui.ARGON.components.main[0].updateActionUse();
					}
					else {
						ui.ARGON.components.main[1].isActionUsed = true;
						ui.ARGON.components.main[1].updateActionUse()
					}
					break;
				case "react":
					if (ui.ARGON.components.main[1].isActionUsed) {
						ui.ARGON.components.main[0].isActionUsed = true;
						ui.ARGON.components.main[0].updateActionUse()
					}
					else {
						ui.ARGON.components.main[1].isActionUsed = true;
						ui.ARGON.components.main[1].updateActionUse()
					}
					break;
			}
		}
    }
	
	class StarfinderWeaponSets extends ARGON.WeaponSets {
		async getDefaultSets() {
			let attacks;
			
			switch (this.actor.type) {
				case "starship":
					attacks = this.actor.items.filter((item) => item.type === "starshipWeapon");
					break;
				default:
					attacks = this.actor.items.filter((item) => item.type === "weapon");
					break;
			}
			
			return {
				1: {
					primary: attacks[0]?.id ?? null,
					secondary: null,
				},
				2: {
					primary: attacks[1]?.id ?? null,
					secondary: null,
				},
				3: {
					primary: attacks[2]?.id ?? null,
					secondary: null,
				},
			};
		}

		async _onSetChange({sets, active}) {
			const updates = [];
			const activeSet = sets[active];
			const activeItems = Object.values(activeSet).filter((item) => item);
			const inactiveSets = Object.values(sets).filter((set) => set !== activeSet);
			const inactiveItems = inactiveSets.flatMap((set) => Object.values(set)).filter((item) => item);
			activeItems.forEach((item) => {
				if(!item.system?.equipped) updates.push({_id: item.id, "system.equipped": true});
			});
			inactiveItems.forEach((item) => {
				if(item.system?.equipped) updates.push({_id: item.id, "system.equipped": false});
			});
			return await this.actor.updateEmbeddedDocuments("Item", updates);
		}

		async _getSets() { //overwrite because slots.primary/secondary contains id, not uuid
			const sets = mergeObject(await this.getDefaultSets(), deepClone(this.actor.getFlag("enhancedcombathud", "weaponSets") || {}));

			for (const [set, slots] of Object.entries(sets)) {
				slots.primary = slots.primary ? await this.actor.items.get(slots.primary) : null;
				slots.secondary = null;
			}
			return sets;
		}
		
		async _onDrop(event) {
			try {      
				event.preventDefault();
				event.stopPropagation();
				const data = JSON.parse(event.dataTransfer.getData("text/plain"));
				if(data?.type !== "weapon") return;
				const set = event.currentTarget.dataset.set;
				const slot = event.currentTarget.dataset.slot;
				const sets = this.actor.getFlag("enhancedcombathud", "weaponSets") || {};
				sets[set] = sets[set] || {};
				sets[set][slot] = data.itemId;

				await this.actor.setFlag("enhancedcombathud", "weaponSets", sets);
				await this.render();
			} catch (error) {
				
			}
		}
		
		async getactiveSet() {
			const sets = await this._getSets();
			return sets[this.actor.getFlag("enhancedcombathud", "activeWeaponSet")];
		}
    }
  
    /*
    class StarfinderEquipmentButton extends ARGON.MAIN.BUTTONS.EquipmentButton {
		constructor(...args) {
			super(...args);
		}
    }
	*/
  
    CoreHUD.definePortraitPanel(StarfinderPortraitPanel);
    CoreHUD.defineDrawerPanel(StarfinderDrawerPanel);
    CoreHUD.defineMainPanels([
		StarfinderSlowActionPanel,
		StarfinderFastActionPanel,
		StarfinderReactionActionPanel,
		ARGON.PREFAB.PassTurnPanel
    ]);  
	CoreHUD.defineMovementHud(null);
    CoreHUD.defineWeaponSets(StarfinderWeaponSets);
	CoreHUD.defineSupportedActorTypes(["character", "drone", "npc", "npc2", "starship", "vehicle"]);
});
