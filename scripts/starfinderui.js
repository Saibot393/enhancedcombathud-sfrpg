import {registerStarfinderECHSItems, StarfinderECHActionItems, StarfinderECHMoveItems, StarfinderECHFullItems, StarfinderManeuvers} from "./specialItems.js";
import {ModuleName, getTooltipDetails} from "./utils.js";

Hooks.on("argonInit", async (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;
  
	await registerStarfinderECHSItems();
	
	function useAction(actionType, fallback = true) {
		switch (actionType) {
			case "action":
				if (!ui.ARGON.components.main[0].isActionUsed) {
					ui.ARGON.components.main[0].isActionUsed = true;
					ui.ARGON.components.main[0].updateActionUse();
				}
				else {
					if (fallback) {
						useAction("full");
					}
				}
				break;
			case "move":
				if (!ui.ARGON.components.main[1].isActionUsed) {
					ui.ARGON.components.main[1].isActionUsed = true;
					ui.ARGON.components.main[1].updateActionUse();
				}
				else {
					if (fallback) {
						useAction("action");
					}
				}
				break;
			case "swift":
				if (!ui.ARGON.components.main[2].isActionUsed) {
					ui.ARGON.components.main[2].isActionUsed = true;
					ui.ARGON.components.main[2].updateActionUse();
				}
				else {
					if (fallback) {
						useAction("move");
					}
				}
				break;
			case "full":
				for (let i = 0; i <= 2; i++) {
					ui.ARGON.components.main[i].isActionUsed = true;
					ui.ARGON.components.main[i].updateActionUse();
				}
				break;
			case "reaction":
				ui.ARGON.components.main[3].isActionUsed = true;
                ui.ARGON.components.main[3].updateActionUse();
				break;
		}
	}
	
	//for ammunition updates
	function onUpdateItemadditional(item) {
		if (item.parent !== ui.ARGON._actor) return;
		for (const itemButton of ui.ARGON.itemButtons) {
			if (itemButton.item?.system?.container?.contents[0]?.id == item.id) itemButton.render();
		}
	}
	Hooks.on("updateItem", onUpdateItemadditional.bind(CoreHUD));
  
    class StarfinderPortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
		constructor(...args) {
			super(...args);
		}

		get description() {
			switch (this.actor.type) {
				case "character":
					const classes = this.actor.items.filter(item => item.type == "class");
					
					return classes.map(characterclass => `${characterclass.name} ${game.i18n.localize("SFRPG.LevelLabelText")} ${characterclass.system.levels}`).join("/");
					break;
			}
			return `${this.actor.name}`;
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
				let aclabel = CONFIG.SFRPG.modifierArmorClassAffectedValues[key];
				
				let aclabelshortened = [aclabel.split(" ")[0][0], aclabel.split(" ")[1]].join("");
				
				Blocks.push([
					{
						text: aclabelshortened,
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
			const widthscale = game.settings.get(ModuleName, "HealthBarWidthScale");
			const heightscale = game.settings.get(ModuleName, "HealthBarHeightScale");
			const minscale = Math.min(widthscale, heightscale);
			const cornercut = 30; //px
			const spheightpart = 0.4;
			const tempheightpart = 0.7;
			
			//probably better as css classes, but oh well
			const bars = document.createElement("div");
			bars.style.width = `${160*widthscale}px`;
			bars.style.height = `${50*heightscale}px`;
			bars.style.position = "absolute";
			
			let hp = this.actor.system.attributes.hp;
			let sp = this.actor.system.attributes.sp;
			
			//stamina
			const spbar = document.createElement("div");
			spbar.style.width = "75%";
			spbar.style.height = `${spheightpart * 100}%`;
			spbar.style.position = "relative";
			//spbar.style.backgroundColor = "grey";
			spbar.style.clipPath = `polygon(0% 0%, 100% 0%, calc(100% - ${(spheightpart/(1-spheightpart))*cornercut}px) 100%, 0% 100%)`;

			const spbackground = document.createElement("div");
			spbackground.style.width = "100%";
			spbackground.style.height = "100%";
			spbackground.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
			spbackground.style.opacity = "0.7";
			spbackground.style.textShadow = "0 0 10px rgba(0,0,0,.7)";
			
			const spsubbar = document.createElement("div");
			spsubbar.style.width = "100%"//`${sp.value/sp.max*100}%`;
			spsubbar.style.height = "100%";
			spsubbar.style.backgroundColor = "darkOrange";
			spsubbar.style.clipPath = `polygon(0% 0%, ${sp.value/sp.max*100}% 0%, calc(${(sp.value/sp.max*100)}% - ${(spheightpart/(1-spheightpart))*cornercut}px) 100%, 0% 100%)`;
			spsubbar.style.opacity = "0.9";
			spsubbar.style.position = "absolute";
			spsubbar.style.top = "0";
			spsubbar.style.left = "0";
			
			spbar.appendChild(spbackground);
			spbar.appendChild(spsubbar);
			
			//hp
			const hpbar = document.createElement("div");
			hpbar.style.width = "100%";
			hpbar.style.height = `${(1-spheightpart) * 100}%`;
			hpbar.style.position = "relative";
			//hpbar.style.backgroundColor = "grey";
			hpbar.style.clipPath = `polygon(0% 0%, 100% 0%, calc(100% - ${cornercut}px) 100%, 0% 100%)`;
			
			const hpbackground = document.createElement("div");
			hpbackground.style.width = "100%";
			hpbackground.style.height = "100%";
			hpbackground.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
			hpbackground.style.opacity = "0.7";
			hpbackground.style.textShadow = "0 0 10px rgba(0,0,0,.7)";
			
			const hpsubbar = document.createElement("div");
			hpsubbar.style.width = "100%"//`${hp.value/hp.max*100}%`;
			hpsubbar.style.height = "100%";
			hpsubbar.style.backgroundColor = "red";
			hpsubbar.style.clipPath = `polygon(0% 0%, ${hp.value/hp.max*100}% 0%, calc(${(hp.value/hp.max*100)}% - ${cornercut}px) 100%, 0% 100%)`;
			hpsubbar.style.opacity = "0.9";
			hpsubbar.style.position = "absolute";
			hpsubbar.style.top = "0";
			hpsubbar.style.left = "0";
			
			const tempsubbar = document.createElement("div");
			tempsubbar.style.width = "100%"//`${hp.temp/hp.max*100}%`;
			tempsubbar.style.height = `${tempheightpart * 100}%`;
			tempsubbar.style.backgroundColor = "blue";
			tempsubbar.style.clipPath = `polygon(0% 0%, ${hp.temp/hp.max*100}% 0%, calc(${(hp.temp/hp.max*100)}% - ${cornercut*tempheightpart}px) 100%, 0% 100%)`;
			tempsubbar.style.opacity = "0.9";
			tempsubbar.style.position = "absolute";
			tempsubbar.style.top = "0";
			tempsubbar.style.left = "0";
			tempsubbar.style.opacity  = "0.5";
			
			hpbar.appendChild(hpbackground);
			hpbar.appendChild(hpsubbar);
			hpbar.appendChild(tempsubbar);
			
			bars.appendChild(spbar);
			bars.appendChild(hpbar);
			
			//labels
			const fontsize = 2;//em
			
			const splabel = document.createElement("span");
			splabel.innerHTML = `${sp.value}/${sp.max} SP`;
			splabel.style.top = "-2px"; //strange format bug
			splabel.style.position = "absolute";
			splabel.style.zIndex = "20";
			splabel.style.width = "70%";
			splabel.style.height = "100%";
			splabel.style.textAlign = "left";
			splabel.style.fontSize = `${fontsize * (spheightpart/(1-spheightpart)) * minscale}em`;
			splabel.style.color = "white";
			splabel.style.textShadow = "grey 1px 1px 10px";
			
			spbar.appendChild(splabel);
			
			const hplabel = document.createElement("span");
			if (hp.temp <= 0) {
				hplabel.innerHTML = `${hp.value}/${hp.max} HP`;
			}
			else{
				hplabel.innerHTML = `${hp.temp} TEMP`;
			}
			hplabel.style.top = "0";
			hplabel.style.position = "absolute";
			hplabel.style.zIndex = "20";
			hplabel.style.width = "70%";
			hplabel.style.height = "100%";
			hplabel.style.textAlign = "left";
			hplabel.style.fontSize = `${fontsize * tempheightpart * minscale}em`;
			hplabel.style.color = "white";
			hplabel.style.textShadow = "grey 1px 1px 10px";
			
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
				
				let valueLabel = `<span style="margin: 0 1rem">${abilitiedata.mod > 0 ? "+" : "" }${abilitiedata.mod}</span>`;
				
				let icon = "";
				
				if (this.actor.system.classes && Object.values(this.actor.system.classes).find(value => value.keyAbilityScore == ability)) {
					icon = ` <i class="fa-solid fa-star"></i>`;
				}
				
				return new ARGON.DRAWER.DrawerButton([
					{
						label: CONFIG.SFRPG.abilities[ability] + icon,
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
				
				let valueLabel = `<span style="margin: 0 1rem">${savedata.bonus > 0 ? "+" : "" }${savedata.bonus}</span>`;
				
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
				
				let valueLabel = `${skillData.mod > 0 ? "+" : "" }${skillData.mod}<span style="margin: 0 1rem; filter: brightness(0.8)">(${validskills[skill].ranks})</span>`;
				
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
							label: game.i18n.localize("SFRPG.Attributes"),
						},
						{
							label: game.i18n.localize("SFRPG.Rolls.Dice.Roll"),
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
							label: game.i18n.localize("SFRPG.DroneSheet.Chassis.Details.Saves.Header"),
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
							label: game.i18n.localize("SFRPG.SkillsToggleHeader"),
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
			return `${game.i18n.localize("SFRPG.Attributes")}, ${game.i18n.localize("SFRPG.DroneSheet.Chassis.Details.Saves.Header")}, & ${game.i18n.localize("SFRPG.SkillsToggleHeader")}`;
		}
	}
  
    class StarfinderStandardActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.StandardAction";
		}
		
		get maxActions() {
            return 1;
        }
		
		get currentActions() {
			return this.isActionUsed ? 0 : 1;
		}
		
		get actionType() {
			return "action";
		}
		
		get colorScheme() {
			return 0;
		}
		
		_onNewRound(combat) {
			this.isActionUsed = false;
			this.updateActionUse();
		}
		
		async _getButtons() {
			const specialActions = Object.values(StarfinderECHActionItems);
			const arms = this.actor?.system.attributes.arms;

			let buttons = [];
			
			for (let i = 1; i <= arms; i++) {
				buttons.push(new StarfinderItemButton({ parent : this, item: null, slotnumber: i}));
			}
			
			buttons.push(new StarfinderSplitButton(new StarfinderButtonPanelButton({parent : this, type: "maneuver", item : specialActions[0]}), new StarfinderSpecialActionButton(specialActions[1])));
			
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
			
			buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[2]), new StarfinderSpecialActionButton(specialActions[3])));
			
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
			
			buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[4]), new StarfinderSpecialActionButton(specialActions[5])));
			
			
			return buttons.filter(button => button.isvalid);
		}
		
    }
	
    class StarfinderMovementActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.MoveAction";
		}
		
		get maxActions() {
            return 1;
        }
		
		get currentActions() {
			return this.isActionUsed ? 0 : 1;
		}
		
		get actionType() {
			return "move";
		}
		
		get colorScheme() {
			return 1;
		}
		
		_onNewRound(combat) {
			this.isActionUsed = false;
			this.updateActionUse();
		}
		
		async _getButtons() {
			const specialActions = Object.values(StarfinderECHMoveItems);

			let buttons = [];
			
			buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[0]), new StarfinderSpecialActionButton(specialActions[1])));
			
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
			
			buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[2]), new StarfinderSpecialActionButton(specialActions[3])));
			 
			return buttons.filter(button => button.isvalid);
		}
    }
	
    class StarfinderSwiftActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.SwiftAction";
		}
		
		get maxActions() {
            return 1;
        }
		
		get currentActions() {
			return this.isActionUsed ? 0 : 1;
		}
		
		get actionType() {
			return "swift";
		}
		
		get colorScheme() {
			return 1;
		}
		
		_onNewRound(combat) {
			this.isActionUsed = false;
			this.updateActionUse();
		}
		
		async _getButtons() {
			let buttons = [];
			
			if (game.settings.get(ModuleName, "ShowSwiftActions")) {
				buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
				buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
				buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
				buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
			}
			
			return buttons.filter(button => button.isvalid);
		}
    }
	
    class StarfinderReactionActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.ReAction";
		}
		
		get maxActions() {
            return 1;
        }
		
		get currentActions() {
			return this.isActionUsed ? 0 : 1;
		}
		
		get actionType() {
			return "reaction";
		}
		
		get colorScheme() {
			return 2;
		}
		
		_onNewRound(combat) {
			this.isActionUsed = false;
			this.updateActionUse();
		}
		
		async _getButtons() {
			const arms = this.actor?.system.attributes.arms;

			let buttons = [];
			
			for (let i = 1; i <= arms; i++) {
				buttons.push(new StarfinderItemButton({ parent : this, item: null, slotnumber: i}));
			}
			
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
			buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
			
			return buttons.filter(button => button.isvalid);
		}
    }
	
    class StarfinderFullActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.FullAction";
		}
		
		get actionType() {
			return "full";
		}
		
		get colorScheme() {
			return 3;
		}
		
		_onNewRound(combat) {
			this.isActionUsed = false;
			this.updateActionUse();
		}
		
		async _getButtons() {
			let buttons = [];
			
			if (game.settings.get(ModuleName, "ShowFullActions")) {
				const specialActions = Object.values(StarfinderECHFullItems);
				
				buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[0]), new StarfinderSpecialActionButton(specialActions[1])));
				
				buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
				buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
				buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
				buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
				
				buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[2]), new StarfinderSpecialActionButton(specialActions[3])));
			}
			
			return buttons.filter(button => button.isvalid);
		}
    }
	
	class StarfinderItemButton extends ARGON.MAIN.BUTTONS.ItemButton {
		constructor(args) {
			super(args);
			this._parent = args.parent;
			
			if (this.item?.flags[ModuleName]?.specialaction) {
				this._item = new CONFIG.Item.documentClass(this.item, {
					parent: this.actor,
				});
			}
			
			this.slotnumber = args.slotnumber;
		}

		get hasTooltip() {
			return !this.item?.system.hasOwnProperty("identified") || this.item?.system.identified || this.item?.flags[ModuleName]?.specialaction;
		}

		get targets() {
			return null;
		}
		
		get actionType() {
			if (this.parent?.actionType) {
				return this.parent.actionType;
			}
			
			if (this.parent?.parent?.actionType) {
				return this.parent.parent.actionType
			}
		}
		
		get isvalid() {
			return  this.item || this.isWeaponSet;
		}
		
		get quantity() {
			switch (this.item?.type) {
				case "weapon":
				case "augmentation":
				case "magic":
				case "hybrid":
				case "technological":
					if (this.item.system?.container?.contents[0]?.id) {
						const ammunition = this.actor.items.get(this.item.system.container.contents[0].id);
						
						if (ammunition) {
							if (ammunition.system.capacity?.max) {
								return ammunition.system.capacity?.value;
							}
							else {
								return ammunition.system.quantity;
							}
						}
					}
					
					if (this.item?.system.uses?.max && this.item?.system.uses?.max > 0) {
						return this.item.system.capacity.value;
					}
					
					return null;
					break;
				
				case "spell":
					if (this.item?.system.uses && this.item?.system.uses.max != null) {
						return this.item.system.uses.value;
					}
					break;
					
				default :
					return this.item?.system.quantity;
					break;
			}
		}
		
		async _onSetChange({sets, active}) {
			const activeSet = sets[active];

			let item;
			
			/*
			if (this.isPrimary) {
				item = activeSet.primary;
			}
			else {
				if (activeSet.primary != activeSet.secondary) {
					item = activeSet.secondary;
				}
			}
			*/
			item = activeSet[this.slotnumber]
			
			if (this.actionType == "reaction") {
				if (!["mwak", "msak"].includes(item?.system.actionType)) {
					item = null;
				}
			}
			
			this.setItem(item);    
		}
		
		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.item);
			return tooltipData;
		}

		async _onLeftClick(event) {
			var used = false;
			
			const item = this.item;
			
			if (item?.flags[ModuleName]?.specialaction) {
				if (item?.flags[ModuleName]?.onclick) {
					used = item.flags[ModuleName].onclick(item);
				}
				else {
					used = true;
				}
			}
			else {
				if (item.type == "weapon") {
					item?.roll();
					
					used = true;
				}
				
				if (item.type == "consumable") {
					item?.roll();
					
					used = true;
				}
				
				if (item.type == "feat") {
					item?.roll();
					
					used = true;
				}
				
				if (item.type == "spell") {
					this.actor.useSpell(item, {configureDialog: !game.settings.get(ModuleName, "OwnSpellSlotConsume")});
					if (game.settings.get(ModuleName, "OwnSpellSlotConsume")) {
						this.consumeSpellSlot(item.system.level);
					}
					
					used = true;
				}	
			}
			
			if (used) {
				useAction(this.actionType);
			}
		}

		async render(...args) {
			await super.render(...args);
			
			if (this.item?.flags[ModuleName]?.specialaction) {
				switch (this.colorScheme) {
					case 1:
						this.element.style.backgroundColor = "var(--ech-bonusAction-base-background)";
						break;
					case 2:
						this.element.style.backgroundColor = "var(--ech-freeAction-base-background)";
						break;
					case 3:
						this.element.style.backgroundColor = "var(--ech-reaction-base-background)";
						break;
					case 0:
					default:
						this.element.style.backgroundColor = "var(--ech-mainAction-base-background)";
						break;
				}
			}
		}
		
		async consumeSpellSlot(level) {
			const consumelevel = this.actor.system.spells["spell" + level];
			
			if (consumelevel) {
				const consumeclass = Object.keys(consumelevel.perClass).find(key => consumelevel.perClass[key].value > 0);
				
				if (consumeclass) {
					const prevValue = consumelevel.perClass[consumeclass].value;
					
					if (prevValue) {
						this.actor.update({system : {spells : {["spell" + level] : {perClass : {[consumeclass] : {value : prevValue - 1}}}}}});
					}
				}
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
		
		get isvalid() {
			return true;
		}

		get hasTooltip() {
			return true;
		}

		get colorScheme() {
			return this.parent.colorScheme;
		}
		
		get actionType() {
			return this.parent.actionType;
		}

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.item);
			return tooltipData;
		}

		async _onLeftClick(event) {
			var used = false;
			
			const item = this.item;
			
			if (item?.flags[ModuleName]?.onclick) {
				used = item?.flags[ModuleName]?.onclick(item);
			}
			else {
				used = true;
			}
			
			if (used) {
				useAction(this.actionType);
			}
		}
    }
  
    class StarfinderButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
		constructor({parent, type, color, item}) {
			super();
			this.type = type;
			this._parent = parent;
			
			this.replacementItem = item;
		}

		get colorScheme() {
			return this.parent.colorScheme;
		}

		get label() {
			if (this.replacementItem) {
				return this.replacementItem.name;
			}
			
			return game.i18n.localize("TYPES.Item." + this.type);
		}
		
		get hasTooltip() {
			return this.replacementItem;
		}

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.replacementItem);
			return tooltipData;
		}

		get icon() {
			switch (this.type) {
				case "maneuver": return "modules/enhancedcombathud-sfrpg/icons/high-kick.svg";
				case "spell": return "modules/enhancedcombathud/icons/svg/spell-book.svg";
				case "consumable": return "modules/enhancedcombathud-sfrpg/icons/vial.svg";
				case "feat": return "modules/enhancedcombathud/icons/svg/mighty-force.svg";
				case "augmentation" : return "modules/enhancedcombathud-sfrpg/icons/cyborg-face.svg";
			}
		}
		
		get actionType() {
			return this.parent.actionType;
		}
		
		get validitems() {
			if (this.type == "maneuver") {
				return Object.values(StarfinderManeuvers);
			}
			
			let items = this.actor.items.filter(item => item.type == this.type);
			
			let validactions = [this.actionType];
			
			if (!game.combat?.started) {
				if (this.actionType == "action") {
					validactions.push("round"); 
					validactions.push("min"); 
					validactions.push("hour");
					validactions.push("day");
					validactions.push("special");
				}
			}
			
			return items.filter(item => validactions.includes(item.system.activation.type))
		}
		
		get isvalid() {
			return  this.actor.items.find(item => item.type == this.type && item.system.activation.type == this.actionType);
		}
		
		sortedSpells() {
			let spellCategories = [];
			let spells = this.validitems;
			
			for (let i = 0; i <= 6; i++) {
				let uses;
				
				if (i == 0) {
					uses = {max: Infinity, value : Infinity}
				}
				else {
					uses = () => {return {
						max: this.actor.system.spells["spell" + i].max || Object.keys(this.actor.system.classes).map(spellclass => this.actor.system.spells["spell" + i].perClass[spellclass]?.max).filter(value => value).reduce((summ, value) => {return summ = summ+value}, 0), 
						value: Object.keys(this.actor.system.classes).map(spellclass => this.actor.system.spells["spell" + i].perClass[spellclass]?.value).filter(value => value).reduce((summ, value) => {return summ = summ+value}, 0)
					}}
				}
				
				spellCategories.push({
					label: CONFIG.SFRPG.spellLevels[i],
					buttons: spells.filter(spell => spell.system.level == i).map(spell => new StarfinderItemButton({item : spell})),
					uses: uses
				});
			}
			
			return spellCategories.filter(category => category.buttons.length > 0);
		}
  
		async _getPanel() {
			switch (this.type) {
				case "spell":
					return new StarfinderAccordionPanel({accordionPanelCategories: this.sortedSpells().map(({ label, buttons, uses }) => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory({ label, buttons, uses })) });
					break;
				/*
				case "maneuver":
					return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: this.validitems.map(item => new StarfinderSpecialActionButton(item))});
					break;
				*/
				default:
					return new StarfinderButtonPanel({buttons: this.validitems.map(item => new StarfinderItemButton({item}))});
					break;
			}
		}
    }
	
	class StarfinderAccordionPanel extends ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel {
		get actionType() {
			return this.parent?.actionType;
		}
	}
	
	class StarfinderButtonPanel extends ARGON.MAIN.BUTTON_PANELS.ButtonPanel {
		get actionType() {
			return this.parent?.actionType;
		}
	}
	
	class StarfinderSplitButton extends ARGON.MAIN.BUTTONS.SplitButton {
		get isvalid() {
			return this.button1?.isvalid || this.button2?.isvalid;
		}
		
		get actionType() {
			return this.parent?.actionType;
		}
		
		get colorScheme() {
			return this.parent.colorScheme;
		}
	}
	
	class StarfinderMovementHud extends ARGON.MovementHud {
		constructor (...args) {
			super(...args);
			
			this.prevUsedMovement = 0;
		}

		get visible() {
			return game.combat?.started;
		}

		get movementMax() {
			return this.actor.system.attributes.speed[this.movementtype].value / canvas.scene.dimensions.distance;
		}
		
		get movementtype() {
			const movementselect = this.element.querySelector("#movementselect");
			
			if (movementselect) {
				return movementselect.value;
			}
			else {
				return "land"
			}
		}
		
		get movementUsed() {
			return this._movementUsed;
		}
		
		set movementUsed(value) {
			super._movementUsed = value;
			
			if (Math.ceil(value/this.movementMax) - Math.ceil(this.prevUsedMovement/this.movementMax) > 0) {
				useAction("move");
			};
			
			this.prevUsedMovement = value;
		}
		
		_onNewRound(combat) {
			super._onNewRound(combat);
			
			this.prevUsedMovement = 0;
	    }
		
		async _renderInner() {
			await super._renderInner();
			
			const movementselect = document.createElement("select");
			movementselect.id = "movementselect";
			movementselect.style.width = "100%";
			movementselect.style.color = "white";
			
			for (const movementtype of Object.keys(this.actor.system.attributes.speed).filter(key => this.actor.system.attributes.speed[key]?.value)) {
				const typeoption = document.createElement("option");
				typeoption.value = movementtype;
				typeoption.innerHTML = CONFIG.SFRPG.speeds[movementtype];
				typeoption.checked = (movementtype == "land");
				typeoption.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
				typeoption.style.width = "200px";
				typeoption.style.height = "20px";
				typeoption.style.backgroundColor = "grey";
				
				movementselect.appendChild(typeoption);
			}
			
			this.element.appendChild(movementselect);
		}
	}
	
	class StarfinderButtonHud extends ARGON.ButtonHud {

		constructor (...args) {
			super(...args);
		}

		get visible() {
			return !game.combat?.started;
		}

		async _getButtons() {
			return [
				{
					label: "SFRPG.Rest.Long.Title",
					onClick: (event) => this.actor.longRest(),
					icon: "fas fa-bed",
				},
				{
					label: "SFRPG.Rest.Short.Title",
					onClick: (event) => this.actor.shortRest(),
					icon: "fas fa-coffee",
				}
			]
		}
	}
	
	class StarfinderWeaponSets extends ARGON.WeaponSets {
		constructor(...args) {
			super(...args);
			
			this.fixoldsets();
		}
		
		async fixoldsets() {
			//for backwards compatibility
			let sets = deepClone(this.actor?.getFlag("enhancedcombathud", "weaponSets"));
			if (sets) {
				let update = false;
				
				for (let setnumber of Object.keys(sets)) {
					if (sets[setnumber]?.hasOwnProperty("primary")) {
						sets[setnumber][1] = sets[setnumber].primary;
						delete sets[setnumber].primary;
						update = true;
					}
					
					if (sets[setnumber]?.hasOwnProperty("secondary")) {
						sets[setnumber][2] = sets[setnumber].secondary;
						delete sets[setnumber].secondary;
						update = true;
					}
				}
				
				if (update) {
					await this.actor.setFlag("enhancedcombathud", "weaponSets", null); //complete reset
					await this.actor.setFlag("enhancedcombathud", "weaponSets", sets);
				}
			}	
		}
	
		async _getSets() { //overwrite because slots.primary/secondary contains id, not uuid
			const arms = this.actor?.system.attributes.arms;
			
			const sets = mergeObject(await this.getDefaultSets(), deepClone(this.actor.getFlag("enhancedcombathud", "weaponSets") || {}));

			for (const [set, slots] of Object.entries(sets)) {
				for (let i = 1; i <= arms; i++) {
					slots[i] = slots[i] ? await fromUuid(slots[i]) : null;
				}
			}
			
			return sets;
		}
		
		async getDefaultSets() {
			const arms = this.actor?.system.attributes.arms;
			
			const activeweapons = this.actor.items.filter((item) => item.type == "weapon");
			
			let defaultsets = {};
			
			for (let i = 1; i <= 3; i++) {
				defaultsets[i] = {};
				
				for (let j = 1; j <= arms; j++) {
					if (j == 1) {
						defaultsets[i][j] = activeweapons[j-1]?.uuid ?? null;
					}
					else {
						defaultsets[i][j] = null;
					}
				}
			}
			
			return defaultsets;
		}

		async _onSetChange({sets, active}) {
			const updates = [];
			const activeSet = sets[active];
			const activeItems = Object.values(activeSet).filter((item) => item);
			const inactiveSets = Object.values(sets).filter((set) => set !== activeSet);
			const inactiveItems = inactiveSets.flatMap((set) => Object.values(set)).filter((item) => item && !activeItems.includes(item));
			inactiveItems.forEach((item) => {
				if(item.system?.equipped) updates.push({_id: item.id, "system.equipped": false});
			});
			activeItems.forEach((item) => {
				if(!item.system?.equipped) updates.push({_id: item.id, "system.equipped": true});
			});
			return await this.actor.updateEmbeddedDocuments("Item", updates);
		}
		
		async _onDrop(event) {
			await super._onDrop(event);
			
			this.fixitemsets();
		}

		async _onDrop(event) {
				event.preventDefault();
				event.stopPropagation();
				const data = JSON.parse(event.dataTransfer.getData("text/plain"));
				if(data?.type !== "Item") return;
				const set = event.currentTarget.dataset.set;
				const slot = event.currentTarget.dataset.slot;
				const sets = this.actor.getFlag("enhancedcombathud", "weaponSets") || {};
				sets[set] = sets[set] || {};
				sets[set][slot] = data.uuid;
				await this.setfixedsets(sets, set, slot);
				await this.render();
			try {      

			} catch (error) {
			  
			}
		}
		
		async setfixedsets(sets, set, slot) {
			let fixedsets = sets;
			/*
			let slots = fixedsets[set];
			
			let items = {primary : (slots.primary ? await fromUuid(slots.primary) : null), secondary : (slots.secondary ? await fromUuid(slots.secondary) : null)};
			
			//handle equipability
			if (!(items[slot]?.system.equippable || items[slot]?.type == "weapon")) {
				items[slot] = null;
				slots[slot] = null;
			}
			
			//handle 2H/1H placement validity
			if (this.actor?.system.attributes.arms <= 2) {

				if (items.secondary == items.primary) {
					if (items.primary && !items.primary.system.properties?.two) {
						items.secondary = null;
						slots.secondary = null;
					}
				}
				
				if (items[slot]?.system.properties?.two) {
					switch (slot) {
						case "primary":
							slots.secondary = slots.primary;
							break;
						case "secondary":
							slots.primary = slots.secondary;
							break;
					}
				}
				else {
					switch (slot) {
						case "primary":
							if (items.secondary?.system.properties?.two) {
								slots.secondary = null;
							}
							break;
						case "secondary":
							if (items.primary?.system.properties?.two) {
								slots.secondary = null;
							}
					}
				}
			}
			
			//handle attached weapons
			if (slot == "primary" && items.primary) {
				if ((slots.primary == slots.secondary) || (slots.secondary == null)) {
					const primaryattachedWeapon = StarfinderWeaponSets.attachedWeapon(items.primary);
					
					if (primaryattachedWeapon) {
						slots.secondary = primaryattachedWeapon.uuid;
					}
				}
			}
			
			fixedsets[set] = slots;
			*/
			
			await this.actor.setFlag("enhancedcombathud", "weaponSets", fixedsets);
		}
		
		static attachedWeapon(Item) {
			const containedIDs = Item?.system.container?.contents.map(content => content.id);
			
			const ownerActor = Item?.parent;
			
			if (containedIDs?.length && ownerActor) {
				const containedItems = containedIDs.map(ID => ownerActor.items.get(ID)).filter(item => item);
				
				for (const item of containedItems) {
					if (item.type == "weapon") {
						return item;
					}
					
					const proxyattachedWeapon = StarfinderWeaponSets.attachedWeapon(item);
					
					if (proxyattachedWeapon) {
						return proxyattachedWeapon;
					}
				}
			}
			
			return null;
		}
		
		async _renderInner() {
			const sizefactor = 50; //px
			
			const arms = this.actor?.system.attributes.arms;
			const setdata = await this._getSets();
			
			let maindiv = document.createElement("div");
			
			maindiv.classList.add("weapon-sets");
			
			for (let i = 1; i <= 3; i++) {
				let armscounter = 0;
				
				let setdiv = document.createElement("div");
				setdiv.style.display = "flex";
				setdiv.style.flexDirection = "column";
				setdiv.style.transform = `translate(0px, -${(Math.ceil(arms/2)-1)*sizefactor}px)`;
					
				while (armscounter < arms) {
					let rowdiv = document.createElement("div");
					rowdiv.classList.add("weapon-set");
					rowdiv.setAttribute("data-type", "switchWeapons");
					rowdiv.setAttribute("data-set", i);
					
					armscounter = armscounter + 1;
					let firstslot = document.createElement("div");
					firstslot.classList.add("set", "set-primary")
					firstslot.draggable = true;
					firstslot.setAttribute("data-set", i);
					firstslot.setAttribute("data-slot", armscounter);
					console.log(i, armscounter);
					console.log(setdata[i] ? setdata[i][armscounter] : undefined);
					if (setdata[i] && setdata[i][armscounter]) {
						console.log(setdata[i][armscounter]?.img);
						firstslot.style.backgroundImage = `url(${setdata[i][armscounter]?.img})`;
					}
					
					rowdiv.appendChild(firstslot);
					
					if (armscounter < arms) {
						armscounter = armscounter + 1;
						let secondslot = document.createElement("div");
						secondslot.classList.add("set", "set-secondary")
						secondslot.draggable = true;
						secondslot.setAttribute("data-set", i);
						secondslot.setAttribute("data-slot", armscounter);
						console.log(i, armscounter);
						console.log(setdata[i] ? setdata[i][armscounter] : undefined);
						if (setdata[i] && setdata[i][armscounter]) {
							secondslot.style.backgroundImage = `url(${setdata[i][armscounter]?.img})`;
						}
						
						rowdiv.appendChild(secondslot);
					}
					
					setdiv.prepend(rowdiv);
				}
				
				maindiv.appendChild(setdiv);
			}
			
			const tempElement = document.createElement("div");
			tempElement.appendChild(maindiv);
			this.element.innerHTML = tempElement.firstElementChild.innerHTML;
			
			/*
			await super._renderInner();
			
			const arms = this.actor?.system.attributes.arms;
			
			for (const set of this.element.querySelectorAll(".weapon-set")) {
				set.style.transform = this.element.style.transform + `translate(0px, -${(Math.ceil(arms/2)-1)*sizefactor}px)`
				
				
				for (const slot of set.querySelectorAll(".set")) {
					slot.style.height = `${sizefactor}px`;
					
					slot.style.position = "absolute";
					slot.style.bottom = "0";
					
					switch(slot.classList[1]) {
						case `set-primary`
					}
					slot.style.left = `sizefactor`
				}
				
				let addslots = [];
				for (let i = 2; i < arms; i++) {
					let newslot = document.createElement("div");
					newslot.classList.add("set");
					
					if (i%2 == 0) {
						newslot.classList.add("set-primary");
					}
					else {
						newslot.classList.add("set-secondary");
					}
					
					addslots.push(newslot);
				}
			}
			
						for(
			const sizefactor = 52; //px
			
			this.element.style.height = `${Math.ceil(arms/2)*sizefactor}px`;
			this.element.style.transform = this.element.style.transform + `translate(0px, -${(Math.ceil(arms/2)-1)*sizefactor}px)`
			console.log(this.element);
			*/
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
		StarfinderStandardActionPanel,
		StarfinderMovementActionPanel,
		StarfinderSwiftActionPanel,
		StarfinderReactionActionPanel,
		StarfinderFullActionPanel,
		ARGON.PREFAB.PassTurnPanel
    ]);  
	CoreHUD.defineMovementHud(StarfinderMovementHud);
	CoreHUD.defineButtonHud(StarfinderButtonHud);
    CoreHUD.defineWeaponSets(StarfinderWeaponSets);
	CoreHUD.defineSupportedActorTypes(["character", "drone", "npc", "npc2" /*, "starship", "vehicle" */]);
});
