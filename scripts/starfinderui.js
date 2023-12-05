import {registerStarfinderECHSItems, StarfinderECHSlowItems, StarfinderECHFastItems, StarfinderECHReactionItems} from "./specialItems.js";
import {ModuleName, getTooltipDetails} from "./utils.js";

Hooks.on("argonInit", (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;
  
	registerStarfinderECHSItems();
  
    class StarfinderPortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
		constructor(...args) {
			super(...args);

			Hooks.on("deleteActiveEffect", this.onEffectUpdate.bind(this));
			Hooks.on("createActiveEffect", this.onEffectUpdate.bind(this));
			
			this.wasDead = false;
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
			
			if (isDead && !this.wasDead) {
				if (game.settings.get(ModuleName, "AutoRollInjuries")) {
					if (mental) {
						this.rollMental();
					}
					
					if (physical) {
						this.rollPhysical();
					}
				}
			}
			
			this.wasDead = isDead;
			
			return isDead;
		}
		
		async getConditions() {
			let LeftIcons = [];
			let RightIcons = [];
			
			switch (this.actor.type) {
				case "player":
					const playerConditions = this.actor.system.condition;
					
					const PhysicalConditions = Object.keys(playerConditions.physical.states).filter(Key => playerConditions.physical.states[Key].isChecked);
					const MentalConditions = Object.keys(playerConditions.mental.states).filter(Key => playerConditions.mental.states[Key].isChecked);
			
					LeftIcons = PhysicalConditions.map((Condition) => {	const ConditionInfo = CONFIG.Starfinder.allConditions.find(ConditionInfo => ConditionInfo.id == Condition);
					
																		return {img : ConditionInfo.icon, description : ConditionInfo.label, key : Condition, click : () => {this.removeCondtion(Condition)}}});
																			
					RightIcons = MentalConditions.map((Condition) => {	const ConditionInfo = CONFIG.Starfinder.allConditions.find(ConditionInfo => ConditionInfo.id == Condition);
					
																		return {img : ConditionInfo.icon, description : ConditionInfo.label, key : Condition, click : () => {this.removeCondtion(Condition)}}});
												
					/*
					if (game.settings.get(ModuleName, "AutoApplyBroken")) {
						if (MentalConditions.length == 3) {
							if (!this.actor.system.condition.mental.isBroken) {
								this.actor.createEmbeddedDocuments("ActiveEffect", [CONFIG.Starfinder.allConditions.find(condition => condition.id == "mental")]);
							}
						}
						
						if (PhysicalConditions.length == 3) {
							if (!this.actor.system.condition.physical.isBroken) {
								this.actor.createEmbeddedDocuments("ActiveEffect", [CONFIG.Starfinder.allConditions.find(condition => condition.id == "physical")]);
							}
						}
					}
					*/
					break;
				case "Starfinder":
					const StarfinderConditions = this.actor.items.filter(item => item.type == "condition" && item.system.active);
					
					let ConditionImages = []
					
					for (let i = 0; i < StarfinderConditions.length; i++) {
						if (StarfinderConditions[i].img == "icons/svg/item-bag.svg" && i <= 10) {
							ConditionImages[i] = `systems/Starfinder/asset/counter_tokens/${i+1}.png`; //nicer than a simple bag
						}
						else {
							ConditionImages[i] = StarfinderConditions[i].img;
						}
					}
					
					LeftIcons = StarfinderConditions.map((Condition, i) => {return {
						img : ConditionImages[i], 
						description : Condition.name, 
						key : Condition.id, 
						click : async () => {
							await this.actor.items.filter(item => item.type == "condition").reverse().find(item => item.system.active)?.update({system : {active : false}});
							this.render()
						}}});
					break;
			}
						
			return {left : LeftIcons, right : RightIcons}
		}

		async getStatBlocks() {
			let ActiveArmor;
			
			switch (this.actor.type) {
				case "player" :
					ActiveArmor = this.actor.items.find(Item => Item.type == "armor" && Item.system.isFav); //serach for favoured armor
					break;
				case "npc" :
				case "Starfinder" :
					ActiveArmor = this.actor.items.find(Item => Item.type == "armor"); //serach for favoured armor
					break;				
			}

			const ArmorText = game.i18n.localize("ARMOR.NAME");
			
			let physical;
			let mental;
			
			if (this.actor.type == "npc") {
				physical = this.actor.system.condition.physical;
				
				mental = this.actor.system.condition.mental;
			}
			
			let Blocks = [];
			
			if (physical) {
				Blocks.push([
					{
						text: game.i18n.localize("CONDITION.PHYSICAL"),
					},
					{
						text: physical.value,
					},
					{
						text: "/",
					},
					{
						text: physical.max
					},
				]);				
			}
			
			if (ActiveArmor) {
				Blocks.push([
					{
						text: ArmorText,
					},
					{
						text: ActiveArmor.system.protection,
						color: "var(--ech-movement-baseMovement-background)",
					},
				]);
			}
			
			if (mental) {
				Blocks.push([
					{
						text: game.i18n.localize("CONDITION.MENTAL"),
					},
					{
						text: mental.value,
					},
					{
						text: "/",
					},
					{
						text: mental.max
					},
				]);				
			}
			
			return Blocks;
		}
		
		async _renderInner(data) {
			await super._renderInner(data);
			
			//this.element.querySelector(".death-save-success").style.visibility = "hidden";
			//this.element.querySelector(".death-save-fail").style.visibility = "hidden";
			
			const ConditionIcons = await this.getConditions();
			
			if (ConditionIcons) {
				for (const Side of ["left", "right"]) {
					const SideIcons = ConditionIcons[Side];
					
					if (SideIcons) {
						const SideIconsBar = document.createElement("div");
						SideIconsBar.classList.add("status-effects");
						//top:50%;transform:translateY(-50%)
						SideIconsBar.setAttribute("style", `position:absolute;${Side}:0;display:flex;flex-direction:column`);
						
						for (const Icon of SideIcons) {
							const IconImage =  document.createElement("img");
							IconImage.classList.add("effect-control");
							
							IconImage.setAttribute("src", Icon.img);
							IconImage.setAttribute("style", "width: 50px;border-width:0px");
							IconImage.onclick = () => {Icon.click()};
							IconImage.setAttribute("data-tooltip", Icon.description);
							
							SideIconsBar.appendChild(IconImage);
						}
						
						this.element.appendChild(SideIconsBar);
					}
				}
			}
			
			this.element.querySelector(".player-buttons").style.right = "0%";
		}
		
		async removeCondtion(ConditionKey) {
			const currentEffect = this.actor.effects.find(Effect => Effect.name == ConditionKey.toUpperCase());
			
			if (currentEffect) {
				this.actor.deleteEmbeddedDocuments('ActiveEffect', [currentEffect.id]);
			}
		}
		
		async onEffectUpdate(Effect) {
			if (this.actor == Effect.parent) {
				this.render();
			}
		}
		
		async rollMental() {
			let table = await fromUuid("RollTable." + game.settings.get(ModuleName, "MentalInjurieTable"));
			if (table) {
				table.draw({roll: true, displayChat: true});
			}
		}
		
		async rollPhysical() {
			let table = await fromUuid("RollTable." + game.settings.get(ModuleName, "PhysicalInjurieTable"));
			if (table) {
				table.draw({roll: true, displayChat: true});
			}
		}
	}
	
	class StarfinderDrawerPanel extends ARGON.DRAWER.DrawerPanel {
		constructor(...args) {
			super(...args);
		}

		get categories() {
			const attributes = {...this.actor.system.attribute};
			const skills = this.actor.system.skill;
			
			var allowedattributes = [];
			
			switch (this.actor.type) {
				case "player":
					allowedattributes = Object.keys(attributes).filter(key => key != "magic");
					break;
				default:
					allowedattributes = Object.keys(attributes);
					break;
			}
			
			for (let key of Object.keys(attributes)) {
				if (!allowedattributes.includes(key)) {
					delete attributes[key];
				}
			}
			
			let maxAttribute = Math.max(...Object.values(attributes).map(content => content.value));

			const attributesButtons = Object.keys(attributes).map((attribute) => {
				const attributeData = attributes[attribute];
				
				let valueLabel = attributeData.value;
				
				if (game.settings.get(ModuleName, "UseDiceCircles")) {
					valueLabel = "";
					
					valueLabel = valueLabel + `<div style="display:flex">`;
					
					valueLabel = valueLabel + "</div>";
					
					valueLabel = valueLabel + `<div style="display:flex">`;
					
					for (let i = 0; i < attributeData.value; i++) {
						valueLabel = valueLabel + `<i class="fa-regular fa-circle"></i>`;
					}
					
					valueLabel = valueLabel + "</div>";
				}
				
				return new ARGON.DRAWER.DrawerButton([
					{
						label: game.i18n.localize(attributes[attribute].label),
						onClick: () => {this.actor.sheet.rollAttribute(attribute)}
					},
					{
						label: valueLabel,
						onClick: () => {this.actor.sheet.rollAttribute(attribute)},
						style: "display: flex; justify-content: flex-end;"
					}
				]);
			});
			
			let skillsButtons = [];
			
			if (skills) {
				skillsButtons = Object.keys(skills).map((skill) => {
					const skillData = skills[skill];
					
					let valueLabel = `${skillData.value}<span style="margin: 0 1rem; filter: brightness(0.8)">(+${attributes[skills[skill].attribute].value})</span>`;
					
					
					if (game.settings.get(ModuleName, "UseDiceCircles")) {
						valueLabel = "";
						
						valueLabel = valueLabel + `<div style="display:flex">`;
						
						for (let i = 0; i < skillData.value; i++) {
							valueLabel = valueLabel + `<i class="fa-solid fa-circle"></i>`;
						}
						
						valueLabel = valueLabel + "</div>";
						
						valueLabel = valueLabel + `<div style="display:flex">`;
						
						for (let i = 0; i < maxAttribute; i++) {
							if (i < attributes[skills[skill].attribute].value) {
								valueLabel = valueLabel + `<i class="fa-regular fa-circle"></i>`;
							}
							else {
								valueLabel = valueLabel + `<i class="fa-regular fa-circle" style="visibility:hidden"></i>`;
							}
						}
						
						valueLabel = valueLabel + "</div>";
					}
					
					return new ARGON.DRAWER.DrawerButton([
						{
							label: game.i18n.localize(CONFIG.Starfinder.skills[skill]),
							onClick: () => {this.actor.sheet.rollSkill(skill)}
						},
						{
							label: valueLabel,
							onClick: () => {this.actor.sheet.rollSkill(skill)},
							style: "display: flex; justify-content: flex-end;"
						},
					]);
				});
			}

			let returncategories = [];

			if (attributesButtons.length) {
				if (!game.settings.get(ModuleName, "UseDiceCircles")) {
					returncategories.push({
						gridCols: "7fr 2fr 2fr",
						captions: [
							{
								label: game.i18n.localize("HEADER.ATTRIBUTES"),
							},
							{
								label: "", //looks nicer
							},
							{
								label: game.i18n.localize("ROLL.ROLL"),
							},
						],
						buttons: attributesButtons
					});
				}
				else {
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
						buttons: attributesButtons
					});
				}
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
			
			if (this.actor.type == "Starfinder" || this.actor.type == "npc" && this.actor.items.find(item => item.type == "magic")) {
				buttons.push(new StarfinderButtonPanelButton({type: "magic", color: 0}));
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
  
		async _getPanel() {
			return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: this.actor.items.filter(item => item.type == this.type).map(item => new StarfinderItemButton({item}))});
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
