import {registerStarfinderECHSItems, StarfinderECHActionItems, StarfinderECHMoveItems, StarfinderECHFullItems, StarfinderManeuvers, starshipactions, StarfinderShipWeapons} from "./specialItems.js";
import {ModuleName, getTooltipDetails, firstUpper} from "./utils.js";

const systemicons = {
	lifeSupport : "fa-heart-pulse",
	sensors : "fa-satellite-dish",
	engines : "fa-rocket",
	powerCore : "fa-bolt",

	weaponsArrayForward : "fa-up-long",
	weaponsArrayAft : "fa-down-long",
	weaponsArrayStarboard : "fa-right-long",
	weaponsArrayPort : "fa-left-long"
}

const systemconditionicons = {
	nominal : "fa-check",
	glitching : "fa-bug",
	malfunctioning : "fa-exclamation",
	wrecked : "fa-xmark"
}

const systemconditioncolor = {
	nominal : "green",
	glitching : "yellow",
	malfunctioning : "orange",
	wrecked : "red"
}

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
	
	function armsof(actor) {
		let attributes = actor?.system.attributes;
		
		switch(actor?.type) {
			case "character":
			case "npc":
			case "npc2":
				return attributes?.arms
				break;
			case "drone":
				let arms = 0;
				
				if (attributes?.arms) {
					arms = arms + attributes.arms;
				}
				
				if (attributes?.weaponMounts?.melee) {
					arms = arms + attributes.weaponMounts.melee.max;
				}
				
				if (attributes?.weaponMounts?.ranged) {
					arms = arms + attributes.weaponMounts.ranged.max;
				}
				
				return arms;
				break;
			case "starship":
				return 1;
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

			if (game.user.getFlag(ModuleName, "starshiprole")) {
				this._role = game.user.getFlag(ModuleName, "starshiprole");
			}
			else {
				this._role = "openCrew";
			}
		}
		
		get role() {
			return this._role;
		}
		
		set role(value) {
			this._role = value;
			
			game.user.setFlag(ModuleName, "starshiprole", value);
			
			if (this.actor.type == "starship") {
				ui.ARGON.components.portrait.render();
				ui.ARGON.components.main[0].render();
				ui.ARGON.components.weaponSets.render();
			}
		}

		get description() {
			switch (this.actor.type) {
				case "character":
					const classes = this.actor.items.filter(item => item.type == "class");
					
					return classes.map(characterclass => `${characterclass.name} ${game.i18n.localize("SFRPG.LevelLabelText")} ${characterclass.system.levels}`).join("/");
					break;
				case "npc":
				case "npc2":
						let cr = this.actor.system.details.cr;
						
						switch (cr) {
							case 1/3:
								cr = "1/3";
								break;
							case 1/2:
								cr = "1/2";
								break;
						}
						
						return `${this.actor.system.details.type} ${this.actor.system.details.subtype? "," : ""} ${this.actor.system.details.subtype} ${game.i18n.localize("SFRPG.Combat.Difficulty.Tooltip.CR")} ${cr}`
					break;
				case "drone":
					return `${game.i18n.localize("SFRPG.DroneSheet.Header.Owner")}: ${this.actor.system.details.owner}, ${game.i18n.localize("SFRPG.LevelLabelText")} ${this.actor.system.details.level.value}`
					break;
			}
			return `${this.actor.name}`;
		}

		get isDead() {
			return this.actor?.system.attributes.hp?.value == 0;
		}

		async getStatBlocks() {
			let Blocks = [];
			
			/*
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
						text: this.actor.system.attributes[key]?.value,
						color: colors[key],
					},
				]);
			}
			*/
			
			return Blocks;
		}
		
		async speciestype() {
			const types = ["plant", "construct", "undead"];
			const explicittype = this.actor.system.details.type;
			
			if (explicittype) {
				for (const type of types) {
					if (explicittype.toLowerCase().search(type) >= 0) {
						return type;
					}
				}
			}
			else {
				const roughtypes = ["plant", "constructed", "undead"];
				const speciesitem = this.actor.items.find(item => item.type == "race");
				if (speciesitem) {
					const description = speciesitem.system.description.value;
					for (const type of roughtypes) {
						if (description.toLowerCase().search(type) >= 0) {
							return type;
						}
					}
				}
			}
			
			return "default";
		}
		
		async getBarColors() {
			let barColors = {sp : "darkOrange", shield : "blue"};
			
			switch (this.actor.type) {
				case "drone":
					barColors.hp = "LightSteelBlue";
					break;
				default:
					const speciestype = await this.speciestype();
					
					switch (speciestype) {
						case "plant":
							barColors.hp = "green";
							break;
						case "construct":
						case "constructed":
							barColors.hp = "#d1c6a5";
							break;
						case "undead":
							barColors.hp = "purple";
							break;
						default:
							barColors.hp = "red";
							break;
					}
					break;
			}
			
			return barColors;
		}
		
		async getBarsCreature() {
			const widthscale = game.settings.get(ModuleName, "HealthBarWidthScale");
			const heightscale = game.settings.get(ModuleName, "HealthBarHeightScale");
			const minscale = Math.min(widthscale, heightscale);
			const cornercut = 30; //px
			const spheightpart = 0.4;
			const tempheightpart = 0.7;
			const barColors = await this.getBarColors();
			
			//probably better as css classes, but oh well
			const bars = document.createElement("div");
			bars.style.width = `${160*widthscale}px`;
			bars.style.height = `${50*heightscale}px`;
			bars.style.position = "absolute";
			
			let hp = this.actor.system.attributes.hp;
			let sp = this.actor.system.attributes.sp;
			
			if (this.actor.type == "drone") {
				sp = null;
			}

			//stamina
			const spbar = document.createElement("div");
			spbar.style.width = "75%";
			spbar.style.height = `${spheightpart * 100}%`;
			spbar.style.position = "relative";
			//spbar.style.backgroundColor = "grey";
			spbar.style.clipPath = `polygon(0% 0%, 100% 0%, calc(100% - ${(spheightpart/(1-spheightpart))*cornercut}px) 100%, 0% 100%)`;

			const spbackground = document.createElement("div");
			spbackground.style.width = sp?.max ? "100%" : "0%";
			spbackground.style.height = "100%";
			spbackground.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
			spbackground.style.opacity = "0.7";
			spbackground.style.textShadow = "0 0 10px rgba(0,0,0,.7)";
			
			const sppercent = sp?.max ? sp?.value/sp.max : 0;
			const spsubbar = document.createElement("div");
			spsubbar.style.width = "100%"//`${sp.value/sp.max*100}%`;
			spsubbar.style.height = "100%";
			spsubbar.style.backgroundColor = barColors.sp;
			spsubbar.style.clipPath = `polygon(0% 0%, ${sppercent*100}% 0%, calc(${(sppercent*100)}% - ${(spheightpart/(1-spheightpart))*cornercut}px) 100%, 0% 100%)`;
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
			
			const hppercent = hp?.max ? hp.value/hp.max : 0;
			const hpsubbar = document.createElement("div");
			hpsubbar.style.width = "100%"//`${hp.value/hp.max*100}%`;
			hpsubbar.style.height = "100%";
			hpsubbar.style.backgroundColor = barColors.hp;
			hpsubbar.style.clipPath = `polygon(0% 0%, ${hppercent*100}% 0%, calc(${(hppercent*100)}% - ${cornercut}px) 100%, 0% 100%)`;
			hpsubbar.style.opacity = "0.9";
			hpsubbar.style.position = "absolute";
			hpsubbar.style.top = "0";
			hpsubbar.style.left = "0";
			
			const temppercent = hp?.max ? hp.temp/hp.max : 0;
			const tempsubbar = document.createElement("div");
			tempsubbar.style.width = "100%"//`${hp.temp/hp.max*100}%`;
			tempsubbar.style.height = `${tempheightpart * 100}%`;
			tempsubbar.style.backgroundColor = barColors.shield;
			tempsubbar.style.clipPath = `polygon(0% 0%, ${temppercent*100}% 0%, calc(${(temppercent*100)}% - ${cornercut*tempheightpart}px) 100%, 0% 100%)`;
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
			
			//bottom left
			bars.style.left = "0px";
			bars.style.bottom = "0px";
			bars.style.zIndex = "10"; //to front
			
			//labels
			const fontsize = 2;//em
			
			const splabel = document.createElement("span");
			splabel.innerHTML = sp?.max ? `${sp.value}/${sp.max} SP` : `- SP`;
			splabel.style.top = "-2px"; //strange format bug
			splabel.style.position = "absolute";
			splabel.style.zIndex = "20";
			splabel.style.width = "70%";
			splabel.style.height = "100%";
			splabel.style.textAlign = "left";
			splabel.style.fontSize = `${fontsize * (spheightpart/(1-spheightpart)) * minscale}em`;
			splabel.style.color = "white";
			splabel.style.textShadow = "grey 1px 1px 10px";
			if (sp?.max){
				spbar.appendChild(splabel);
			}
			
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
			if (hp?.max) {
				hpbar.appendChild(hplabel);
			}
			
			return bars;
		}
		
		async getBarsShip() {
			const totalwidth = 60;//%
			const widthscale = game.settings.get(ModuleName, "HealthBarWidthScale");
			const heightscale = game.settings.get(ModuleName, "HealthBarHeightScale");
			const minscale = Math.min(widthscale, heightscale);
			
			//probably better as css classes, but oh well
			const bars = document.createElement("div");
			bars.style.width = `${totalwidth*widthscale}%`;
			bars.style.height = `${75*heightscale}px`;
			bars.style.position = "absolute";
			
			let hp = this.actor.system.attributes.hp;
			let shields = this.actor.system.attributes.shields;
			let directions = this.actor.system.quadrants;
			let aft = this.actor.system.quadrants.aft;
			let forward = this.actor.system.quadrants.forward;
			let port = this.actor.system.quadrants.port;
			let starboard = this.actor.system.quadrants.starboard;
			
			//shields
			const shieldbar = document.createElement("div");
			shieldbar.style.width = "100%";
			shieldbar.style.height = "100%";
			shieldbar.style.position = "relative";
			shieldbar.style.clipPath = `polygon(0% 67%, 33% 100%, 67% 100%, 100% 67%, 100% 33%, 67% 0%, 33% 0%, 0% 33%, 0% 67%)`;

			const shieldbackground = document.createElement("div");
			shieldbackground.style.width = "100%";
			shieldbackground.style.height = "100%";
			shieldbackground.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
			shieldbackground.style.opacity = "0.7";
			shieldbackground.style.textShadow = "0 0 10px rgba(0,0,0,.7)";
			
			shieldbar.appendChild(shieldbackground);
			
			const directionbackground = {};
			const shieldsubbar = {};
			for (const direction of ["aft", "forward", "port", "starboard"]) {
				directionbackground[direction] = document.createElement("div");
				directionbackground[direction].style.position = "absolute";
				directionbackground[direction].style.top = "0";
				directionbackground[direction].style.left = "0";
				switch (direction) {
					case "aft":
						directionbackground[direction].style.top = "";
						directionbackground[direction].style.bottom = "0";
					case "forward":
						directionbackground[direction].style.width = "100%";
						directionbackground[direction].style.height = "33%";
						directionbackground[direction].style.clipPath = `polygon(67% 0%, 83.5% 50%, 67% 100%, 33% 100%, 16.5% 50%, 33% 0%, 67% 0%)`;
						break;
					case "starboard":
						directionbackground[direction].style.left = "";
						directionbackground[direction].style.right = "0";
					case "port":
						directionbackground[direction].style.width = "33%";
						directionbackground[direction].style.height = "100%";
						directionbackground[direction].style.clipPath = `polygon(0% 67%, 50% 83.5%, 100% 67%, 100% 33%, 50% 16.5%, 0% 33%, 0% 67%)`;
						break;
				}
				
				let percentage = directions[direction].shields.value/shields.limit;
				let color = "#3498DB"; //shiled blue
				
				if (directions[direction].shields.value <= 0 && directions[direction].ablative.max > 0) {
					percentage = directions[direction].ablative.value/directions[direction].ablative.max;
					color = "#43464B"; //dark grey
				}
				
				shieldsubbar[direction] = document.createElement("div");
				shieldsubbar[direction].style.top = "0";
				shieldsubbar[direction].style.left = "0";
				shieldsubbar[direction].style.position = "absolute";
				shieldsubbar[direction].style.backgroundColor = color;
				shieldsubbar[direction].style.opacity = "1";
				switch (direction) {
					case "forward":
						shieldsubbar[direction].style.top = "";
						shieldsubbar[direction].style.bottom = "0";
					case "aft":
						shieldsubbar[direction].style.width = "100%";
						shieldsubbar[direction].style.height = `${percentage * 100}%`;
						break;
					case "port":
						shieldsubbar[direction].style.left = "";
						shieldsubbar[direction].style.right = "0";
					case "starboard":
						shieldsubbar[direction].style.width = `${percentage * 100}%`;
						shieldsubbar[direction].style.height = "100%";
						break;
				}
				
				directionbackground[direction].appendChild(shieldsubbar[direction]);
				shieldbar.append(directionbackground[direction]);
			}
			
			//hull points
			const hpbar = document.createElement("div");
			hpbar.style.width = "34%";
			hpbar.style.height = "34%";
			hpbar.style.position = "absolute";
			hpbar.style.top = "33%";
			hpbar.style.left = "33%";
			
			const hpbackground = document.createElement("div");
			hpbackground.style.width = "100%";
			hpbackground.style.height = "100%";
			hpbackground.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
			hpbackground.style.opacity = "0.7";
			hpbackground.style.border = "0.5px solid white";

			const hpsubbar = document.createElement("div");
			hpsubbar.style.width = `${hp.value/hp.max*100}%`;
			hpsubbar.style.height = "100%";
			hpsubbar.style.backgroundColor = "#9FA1A3";
			hpsubbar.style.opacity = "0.9";
			hpsubbar.style.position = "absolute";
			hpsubbar.style.top = "0";
			hpsubbar.style.left = "0";
			
			hpbar.append(hpbackground);
			hpbar.append(hpsubbar);
			
			bars.appendChild(shieldbar);
			bars.appendChild(hpbar);
			
			//labels
			const fontsize = 1.1;//em
			
			const hplabel = document.createElement("span");
			hplabel.innerHTML = `${hp.value}/${hp.max} HP`;
			hplabel.style.position = "absolute";
			hplabel.style.zIndex = "20";
			hplabel.style.width = "100%";
			hplabel.style.height = "100%";
			hplabel.style.textAlign = "center";
			hplabel.style.top = `calc(50% - 0.55em)`;
			hplabel.style.fontSize = `${fontsize * minscale}em`;
			hplabel.style.color = "white";
			//hplabel.style.textShadow = "grey 1px 1px 10px";
			hplabel.style.textShadow = "1px  1px 1px black, 1px -1px 1px black, -1px  1px 1px black, -1px -1px 1px black";
			hpbar.appendChild(hplabel);
			
			for (const direction of ["aft", "forward", "port", "starboard"]) {
				let labelname = "SHL";
				let labelvalue = directions[direction].shields.value;

				if (directions[direction].shields.value <= 0 && directions[direction].ablative.max > 0) {
					labelname = "ABL";
					labelvalue = directions[direction].ablative.value;
				}
				
				const shieldlabel = document.createElement("span");
				shieldlabel.innerHTML = `${labelvalue} ${labelname}`;
				shieldlabel.style.position = "absolute";
				shieldlabel.style.zIndex = "20";
				shieldlabel.style.width = "100%";
				shieldlabel.style.height = "100%";
				shieldlabel.style.textAlign = "center";
				shieldlabel.style.top = `calc(50% - 0.55em)`;
				shieldlabel.style.fontSize = `${fontsize * minscale}em`;
				shieldlabel.style.color = "white";
				//shieldlabel.style.textShadow = "grey 1px 1px 10px";
				shieldlabel.style.textShadow = "1px  1px 1px black, 1px -1px 1px black, -1px  1px 1px black, -1px -1px 1px black";
				directionbackground[direction].appendChild(shieldlabel);
			}
			
			//bottom middle
			bars.style.left = `${(100-totalwidth*widthscale)/2}%`;
			bars.style.bottom = "0px";
			bars.style.zIndex = "10"; //to front
			
			return bars;
		}
		
		async getsideStatBlocks() {
			const colors = {
				eac: "DeepSkyBlue",
				kac: "LightSteelBlue",
				ac: "LightSteelBlue",
				tl: "gold"
				
			};
			
			let attributes = this.actor.system.attributes;
			
			let Blocks = {left : [], right : []};
			
			switch (this.actor.type) {
				case "character":
				case "npc":
				case "npc2":
				case "drone":
					for (const key of ["kac", "eac"]) {
						let aclabel = CONFIG.SFRPG.modifierArmorClassAffectedValues[key];
						
						let aclabelshortened = [aclabel.split(" ")[0][0], aclabel.split(" ")[1]].join("");
						
						Blocks["right"].push([
							{
								text: aclabelshortened,
								id : key
							},
							{
								text: this.actor.system.attributes[key]?.value,
								color: colors[key],
							},
						]);
					}
					break;
				case "starship":
					for (const side of ["left", "right"]) {
						let valuetype;
						let key;
							
						switch (side) {
							case "left":
								valuetype = "targetLock";
								key = "tl";
								break;
							case "right":
								valuetype = "ac";
								key = "ac";
								break;
						}
						
						Blocks[side].push([
							{
								text: game.i18n.localize("SFRPG.Items.Action.ActionTarget.Starship"+key.toUpperCase()),
								id : key
							},
							{
								text: Math.min(...Object.values(this.actor.system.quadrants).map(values => values[valuetype].value)),
								color: colors[key],
							},
						]);
					}
					
					let showsystems = game.settings.get(ModuleName, "ShowSystemStatus") == "always" || game.settings.get(ModuleName, "ShowSystemStatus").split(",").includes(this.role);
					let showweapons = game.settings.get(ModuleName, "ShowWeaponStatus") == "always" || game.settings.get(ModuleName, "ShowWeaponStatus").split(",").includes(this.role);

					const systems = this.actor.system.attributes.systems;
					for (const systemkey of Object.keys(systems)) {
						let weaponsystem = false;
						let side = "left";
						if (systemkey.search("weapon") >= 0) {
							side = "right";
							weaponsystem = true;
						}
						let systemcondition = this.actor.system.attributes.systems[systemkey].value;
						
						if (((weaponsystem && showweapons) || (!weaponsystem && showsystems))) {
							Blocks[side].unshift([
								{
									icon: ["fa-solid", systemicons[systemkey]],
									id : systemkey,
									tooltip: game.i18n.localize("SFRPG.StarshipSheet.Critical.Systems." + firstUpper(systemkey))
								},
								{
									text: ":"
								},
								{
									icon: ["fa-solid", systemconditionicons[systemcondition]],
									color: systemconditioncolor[systemcondition],
									tooltip: CONFIG.SFRPG.starshipSystemStatus[systemcondition]
								},
							]);
						}
					}
					break;
			}
			
			return Blocks;
		}
		
		async _renderInner(data) {
			await super._renderInner(data);
			
			let bars;
			switch (this.actor.type) {
				case "character":
				case "npc":
				case "npc2":
				case "drone":
					bars = await this.getBarsCreature();
					break;
				case "starship":
					bars = await this.getBarsShip();
					break;
			}
			this.element.appendChild(bars);
			
			const statBlocks = await this.getsideStatBlocks();
			const height = 1.6;
			for (const position of ["left", "right"]) {
				if (statBlocks[position].length) {
					const sb = document.createElement("div");
					
					sb.style = `position : absolute;${position} : 0px`;
					
					for (const block of statBlocks[position]) {
						const sidesb = document.createElement("div");
						sidesb.classList.add("portrait-stat-block");
						sidesb.style.paddingLeft = "0.35em";
						sidesb.style.paddingRight = "0.35em";
						sidesb.style.height = `${height}em`;
						for (const stat of block) {
							if (!stat.position) {
								let displayer;
								if (stat.isinput) {
									displayer = document.createElement("input");
									displayer.type = stat.inputtype; 
									displayer.value = stat.text;
									displayer.style.width = "1.5em";
									displayer.style.color = "#ffffff";
									displayer.onchange = () => {stat.changevent(displayer.value)};
								}
								else {
									displayer = document.createElement("span");
									displayer.innerText = ``;
									if (stat.text) {
										displayer.innerText = displayer.innerText + stat.text;
									}
									if (stat.icon) {
										let icon = document.createElement("i");
										icon.classList.add(...stat.icon);
										displayer.appendChild(icon);
									}
								}
								if (stat.tooltip) {
									displayer.setAttribute("data-tooltip", stat.tooltip);
								}
								if (stat.color) {
									displayer.style.color = stat.color;
								}
								displayer.style.flexGrow = "1";
								displayer.id = stat.id;
								displayer.style.color = stat.color;
								sidesb.appendChild(displayer);
							}
						}
						sb.appendChild(sidesb);
					}
					this.element.appendChild(sb);
				}
			}
			
			if (this.actor.type == "starship") {
				const roleselect = document.createElement("select");
				roleselect.id = "roleselect";
				roleselect.style.width = "30%";
				roleselect.style.color = "white";
				roleselect.style.zIndex = "10";
				
				for (const role of Object.keys(CONFIG.SFRPG.starshipRoleNames)) {
					const roleoption = document.createElement("option");
					roleoption.value = role;
					roleoption.innerHTML = game.i18n.localize(CONFIG.SFRPG.starshipRoleNames[role]);
					roleoption.selected = (role == this.role);
					roleoption.style.boxShadow = "0 0 50vw var(--color-shadow-dark) inset";
					roleoption.style.width = "200px";
					roleoption.style.height = "20px";
					roleoption.style.backgroundColor = "grey";
					
					roleselect.appendChild(roleoption);
				}
				
				roleselect.style.position = "absolute";
				roleselect.style.top = "0";
				roleselect.style.right = "0";
				roleselect.onchange = () => {this.role = roleselect.value};
				
				this.element.appendChild(roleselect);
			}	
		}
	}
	
	class StarfinderDrawerPanel extends ARGON.DRAWER.DrawerPanel {
		constructor(...args) {
			super(...args);
		}

		get categories() {
			let actor;
			
			switch (this.actor.type) {
				case "starship":
					actor = game.user.character;
					break;
				default:
					actor = this.actor;
			}
			
			let returncategories = [];
			
			if (actor) {
				const abilities = actor.system.abilities;
				const saves = Object.fromEntries(["fort", "reflex", "will"].map(key => [key, actor.system.attributes[key]]));
				const skills = actor.system.skills;
				
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
					
					if (actor.system.classes && Object.values(actor.system.classes).find(value => value.keyAbilityScore == ability)) {
						icon = ` <i class="fa-solid fa-star"></i>`;
					}
					
					return new ARGON.DRAWER.DrawerButton([
						{
							label: CONFIG.SFRPG.abilities[ability] + icon,
							onClick: () => {actor.rollAbility(ability)}
						},
						{
							label: valueLabel,
							onClick: () => {actor.rollAbility(ability)},
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
							onClick: () => {actor.rollSave(save)}
						},
						{
							label: valueLabel,
							label: valueLabel,
							onClick: () => {actor.rollSave(save)},
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
							onClick: () => {actor.rollSkill(skill)}
						},
						{
							label: valueLabel,
							onClick: () => {actor.rollSkill(skill)},
							style: "display: flex; justify-content: flex-end;"
						},
					]);
				});

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
		
		get role() {
			return ui.ARGON.components?.portrait.role;
		}

		get label() {
			switch (this.actor.type) {
				case "starship":
					return `${CONFIG.SFRPG.starshipRoleNames[this.role]} ${game.i18n.localize("enhancedcombathud-sfrpg.Titles.Action")}`;
					break;
				default:
					return ModuleName+".Titles.StandardAction";
					break;
			}
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
			let buttons = [];
			let specialActions;
			
			switch(this.actor.type) {
				case "starship":
					specialActions = await starshipactions(this.role, this.actor);
					
					if (this.role == "gunner") {
						for (let i = 1; i <= 10; i++) {
							buttons.push(new StarfinderItemButton({ parent : this, item: null, isWeaponSet : true, slotnumber: i}));
						}
					}
					
					for (let i = 0; i < Math.ceil(specialActions.length/2); i++) {
						let twobuttons = [];
						
						for (let j = 0; j < 2; j++) {
							if (specialActions[i*2 + j]?.flags[ModuleName]?.suboption) {
								twobuttons.push(new StarfinderButtonPanelButton({parent : this, type : "starshipoptions", item: specialActions[i*2 + j]}));
							}
							else {
								twobuttons.push(new StarfinderSpecialActionButton(specialActions[i*2 + j]));
							}
						}
						
						buttons.push(new StarfinderSplitButton(twobuttons[0], twobuttons[1]));
					}
					
					break;
				default:
					const arms = armsof(this.actor);
					
					specialActions = Object.values(StarfinderECHActionItems);
					
					for (let i = 1; i <= arms; i++) {
						buttons.push(new StarfinderItemButton({ parent : this, item: null, isWeaponSet : true, slotnumber: i}));
					}
					
					if (game.settings.get(ModuleName, "Showintegratedweapons")) {
						for (let i = 1; i <= 10; i++) {
							buttons.push(new StarfinderItemButton({ parent : this, item: null, isWeaponSet : true, slotnumber: i, isintegratedweapon: true}));
						}
					}
					
					buttons.push(new StarfinderSplitButton(new StarfinderButtonPanelButton({parent : this, type: "maneuver", item : specialActions[0]}), new StarfinderSpecialActionButton(specialActions[1])));
					
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
					
					buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[2]), new StarfinderSpecialActionButton(specialActions[3])));
					
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
					
					buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[4]), new StarfinderSpecialActionButton(specialActions[5])));
		
					break;
			}
			
			//to solve update bug
			ui.ARGON?.components.weaponSets?.startUpdate();
			
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
			let buttons = [];
			
			switch(this.actor.type) {
				case "starship":
					break;
				default:
					const specialActions = Object.values(StarfinderECHMoveItems);
			
					buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[0]), new StarfinderSpecialActionButton(specialActions[1])));
					
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
					
					buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[2]), new StarfinderSpecialActionButton(specialActions[3])));
					break;
			}
			 
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
			
			switch(this.actor.type) {
				case "starship":
					break;
				default:
					if (game.settings.get(ModuleName, "ShowSwiftActions")) {
						buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
						buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
						buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
						buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
					}
					break;
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
			let buttons = [];
			
			switch(this.actor.type) {
				case "starship":
					break;
				default:
					const arms = armsof(this.actor);
					
					for (let i = 1; i <= arms; i++) {
						buttons.push(new StarfinderItemButton({ parent : this, item: null, isWeaponSet : true, slotnumber: i}));
					}
					
					if (game.settings.get(ModuleName, "Showintegratedweapons")) {
						for (let i = 1; i <= 10; i++) {
							buttons.push(new StarfinderItemButton({ parent : this, item: null, isWeaponSet : true, slotnumber: i, isintegratedweapon: true}));
						}
					}
					
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
					buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
					
					//to solve update bug
					ui.ARGON?.components.weaponSets?.startUpdate();
					break;
			}
			
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
			
			switch(this.actor.type) {
				case "starship":
					break;
				default:
					if (game.settings.get(ModuleName, "ShowFullActions")) {
						const specialActions = Object.values(StarfinderECHFullItems);
						
						buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[0]), new StarfinderSpecialActionButton(specialActions[1])));
						
						buttons.push(new StarfinderButtonPanelButton({parent : this, type: "spell"}));
						buttons.push(new StarfinderButtonPanelButton({parent : this, type: "feat"}));
						buttons.push(new StarfinderButtonPanelButton({parent : this, type: "augmentation"}));
						buttons.push(new StarfinderButtonPanelButton({parent : this, type: "consumable"}));
						
						buttons.push(new StarfinderSplitButton(new StarfinderSpecialActionButton(specialActions[2]), new StarfinderSpecialActionButton(specialActions[3])));
					}
					break;
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
			this.isintegratedweapon = args.isintegratedweapon;
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
				case "equipment":
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
			const arms = armsof(this.actor);
			const activeSet = sets[active];
			
			let item;
	
			switch (this.actor.type) {
				case "starship":
					let items = this.actor.items.filter(item => item?.type == "starshipWeapon").filter(item => item.system.mount.mounted && item.system.mount.arc == sets[active][1].direction);
					
					item = items[this.slotnumber-1];
					break;
				default:
					if (this.isintegratedweapon) {
						let armoritems = this.actor.items.filter(item => item.system.armor?.type && item.system.equipped);
						
						let integratedweapons = [];
						
						for (let i = 0; i < armoritems.length; i++) {
							if (armoritems[i].system.actionType) {
								integratedweapons.push(armoritems[i]);
							}
							
							integratedweapons = integratedweapons.concat(armoritems[i].system.container.contents.map(entry => this.actor.items.get(entry.id)).filter(item => item.type == "weapon"));
						}
						
						item = integratedweapons[this.slotnumber-1];
					}
					else {
						item = activeSet[this.slotnumber];
					}
					break;
			}
			
			for (let i = this.slotnumber - 1; i > 0; i--) {
				//prevent duplicate display
				if (activeSet[i] == item) {
					item = null;
				}
			}
			
			//savety check for item validity
			if (!(item instanceof Object)) {
				item = null;
			}
			
			//only show meele weapons in reactions
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
				switch (item.type) {
					case "spell":
						this.actor.useSpell(item, {configureDialog: !game.settings.get(ModuleName, "OwnSpellSlotConsume")});
						if (game.settings.get(ModuleName, "OwnSpellSlotConsume")) {
							this.consumeSpellSlot(item.system.level);
						}
						
						used = true;
						break;
					default:
						item?.roll();
						
						used = true;
						break;
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
			
			if (specialItem) {
				this.item = new CONFIG.Item.documentClass(specialItem, {
					parent: this.actor,
				});
			}
		}

		get label() {
			return this.item?.name;
		}

		get icon() {
			return this.item?.img;
		}
		
		get isvalid() {
			return true;
		}
		
		get quantity() {
			if (this.item?.system.resolvePointCost) {
				return game.user.character?.system ? game.user.character.system.attributes.rp.value : 0
			}
			
			return null;
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
		
		async getData() {
			if (!this.visible) return {};
			const quantity = this.quantity;
			
			return {
			  ...(await super.getData()),
			  quantity: quantity,
			  hasQuantity: Number.isNumeric(quantity)
			}
		}
		
		get template() {
			return `/modules/${ModuleName}/templates/ActionButton.hbs`;
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
			if (this.replacementItem?.img) {
				return this.replacementItem.img;
			}
			
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
			if (this.replacementItem?.flags[ModuleName]?.suboption) {
				return Object.values(this.replacementItem.flags[ModuleName].suboption);
			}
			
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
			switch (this.actor.type) {
				case "starship":
					return this.actor.system.attributes.speed.value;
					break;
				default:
					return this.actor.system.attributes.speed[this.movementtype].value / canvas.scene.dimensions.distance;
					break;
			}
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
			
			//this.fixoldsets();
		}
		
		get role() {
			return ui.ARGON.components?.portrait.role;
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
			if (this.actor.type == "starship") {
				let shipsets = {};
				
				let vDirections = Object.values(StarfinderShipWeapons);
				
				for (let i = 1; i <= vDirections.length; i++) {
					shipsets[i] = {1 : vDirections[i-1]};
				}
				
				return shipsets;
			}
			
			const arms = armsof(this.actor);
			
			const sets = mergeObject(await this.getDefaultSets(), deepClone(this.actor.getFlag("enhancedcombathud", "weaponSets") || {}));

			for (const [set, slots] of Object.entries(sets)) {
				for (let i = 1; i <= arms; i++) {
					slots[i] = slots[i] ? await fromUuid(slots[i]) : null;
				}
				
				//backwards compatibility
				if (!slots[1] && slots.hasOwnProperty("primary")) {
					slots[1] = slots.primary ? await fromUuid(slots.primary) : null;
				}
				
				if (!slots[2] && slots.hasOwnProperty("secondary")) {
					slots[2] = slots.secondary ? await fromUuid(slots.secondary) : null;
				}
			}
			
			return sets;
		}
		
		async getDefaultSets() {
			const arms = armsof(this.actor);
			
			const activeweapons = this.actor.items.filter((item) => item.type == "weapon");
			
			let defaultsets = {};
			
			for (let i = 1; i <= 3; i++) {
				defaultsets[i] = {};
				
				for (let j = 1; j <= arms; j++) {
					if (j == 1) {
						defaultsets[i][j] = activeweapons[i-1]?.uuid ?? null;
					}
					else {
						defaultsets[i][j] = null;
					}
				}
			}
			
			return defaultsets;
		}

		async _onSetChange({sets, active}) {
			if (this.actor.type == "starship") return;
			
			const updates = [];
			const activeSet = sets[active];
			const activeItems = Object.values(activeSet).filter((item) => item && (item instanceof Object));
			const inactiveSets = Object.values(sets).filter((set) => set !== activeSet);
			const inactiveItems = inactiveSets.flatMap((set) => Object.values(set)).filter((item) => item && (item instanceof Object) &&!activeItems.includes(item));
			inactiveItems.forEach((item) => {
				if(item.system?.equipped) updates.push({_id: item.id, "system.equipped": false});
			});
			activeItems.forEach((item) => {
				if(!item.system?.equipped) updates.push({_id: item.id, "system.equipped": true});
			});
			return await this.actor.updateEmbeddedDocuments("Item", updates);
		}

		async _onDrop(event) {
			event.preventDefault();
			event.stopPropagation();
			if (this.actor.type == "starship") return;
			const data = JSON.parse(event.dataTransfer.getData("text/plain"));
			if(data?.type !== "Item") return;
			const set = event.currentTarget.dataset.set;
			const slot = event.currentTarget.dataset.slot;
			const sets = this.actor.getFlag("enhancedcombathud", "weaponSets") || {};
			sets[set] = sets[set] || {};
			sets[set][slot] = data.uuid;
			await this.setfixedsets(sets, set, slot);
			await this.render();
		}
		
		async setfixedsets(sets, set, slot) {
			const arms = armsof(this.actor);
			const isprimary = (slot%2 == 1);
			const neighborslot = isprimary ? Number(slot)+1 : Number(slot)-1;
			const hasneighborslot = (arms%2 == 0) || (slot < arms-1);
			
			let fixedsets = sets;

			if (game.settings.get(ModuleName, "CheckWeaponSets")) {
				let slots = fixedsets[set];
				let items = {};
				
				for(const key of Object.keys(slots)) {
					items[key] = slots[key] ? await fromUuid(slots[key]) : null
				}
				
				//prevent duplicates
				for (let i = 1; i <= arms; i++) {
					if ((i != slot) && (slots[i] == slots[slot]) && !(items[i]?.system.quantity > 1 || (items[i]?.system.capacity.value > 1 && items[i]?.system.properties?.thrown))) {
						slots[i] = null;
						items[i] = null;
					}
				}

				//handle equipability
				if (!game.settings.get(ModuleName, "allowallItemsinItemslots")) {
					if (!(items[slot]?.system.equippable || items[slot]?.type == "weapon")) {
						items[slot] = null;
						slots[slot] = null;
					}
				}
				
				//handle 2H/1H placement validity
				if (neighborslot) {
					if (items[slot] == items[neighborslot]) {
						if (items[slot] && !items[slot].system.properties?.two) {
							items.secondary = null;
							slots.secondary = null;
						}
					}
					
					if (items[slot]?.system.properties?.two) {
						slots[neighborslot] = slots[slot];
					}
					else {
						if (items[neighborslot]?.system.properties?.two) {
							slots[neighborslot] = null;
						}
					}
				}
				
			
				//handle attached weapons
				if (slot%2 == 1 && items[slot] && hasneighborslot) {
					if ((slots[slot] == slots[neighborslot]) || (slots[neighborslot] == null)) {
						const primaryattachedWeapon = StarfinderWeaponSets.attachedWeapon(items[slot]);
						
						if (primaryattachedWeapon) {
							slots[neighborslot] = primaryattachedWeapon.uuid;
						}
					}
				}
				
				fixedsets[set] = slots;
			}
			
			
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
			if (this.actor.type == "starship" && this.role != "gunner") return;
			
			const sizefactor = 50; //px
			
			const sets = this.actor.type == "starship" ? Object.values(StarfinderShipWeapons).length : 3;
			
			const arms = armsof(this.actor);
			const setdata = await this._getSets();
			
			let maindiv = document.createElement("div");
			
			maindiv.classList.add("weapon-sets");
			
			for (let i = 1; i <= sets; i++) {
				let armscounter = 0;
				
				let setdiv = document.createElement("div");
				setdiv.style.display = "flex";
				setdiv.style.flexDirection = "column";
				setdiv.style.transform = `translate(0px, -${(Math.ceil(arms/2)-1)*sizefactor}px)`;
				setdiv.style.alignItems = "center";
					
				while (armscounter < arms) {
					let rowdiv = document.createElement("div");
					rowdiv.classList.add("weapon-set");
					if (arms == 1) {
						rowdiv.classList.add("weapon-set-singleslotselect");
					}
					else {
						if (armscounter == 0) {
							rowdiv.classList.add("weapon-set-buttoncorrection");
						}
						else {
							rowdiv.classList.add("weapon-set-nobutton");
						}
						
						if (arms - armscounter == 1) {
							rowdiv.style.width = `${sizefactor}px`;
							rowdiv.classList.add("weapon-set-nobutton-single");
						}
					}
					rowdiv.setAttribute("data-type", "switchWeapons");
					rowdiv.setAttribute("data-set", i);
					
					let rowslots = Math.min(arms - armscounter, 2);
					for (let j = 1; j <= rowslots; j++) {
						armscounter = armscounter + 1;
						let slotdiv = document.createElement("div");
						slotdiv.classList.add("set", "set-secondary")
						slotdiv.draggable = true;
						slotdiv.setAttribute("data-set", i);
						slotdiv.setAttribute("data-slot", armscounter);
						slotdiv.style.border = "solid 0.5px";
						slotdiv.style.color = "var(--ech-portrait-base-border)";
						if (setdata[i] && setdata[i][armscounter]) {
							slotdiv.style.backgroundImage = `url(${setdata[i][armscounter]?.img})`;
							if (this.actor.type == "starship") {
								slotdiv.style.rotate = setdata[i][armscounter]?.imgrotation;
							}
						}
						
						rowdiv.appendChild(slotdiv);
					}
					
					setdiv.prepend(rowdiv);
				}
				
				maindiv.appendChild(setdiv);
			}
			
			const tempElement = document.createElement("div");
			tempElement.appendChild(maindiv);
			this.element.innerHTML = tempElement.firstElementChild.innerHTML;
		}
		
		async startUpdate() {
			await this.onSetChange(await this.getSetData())
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
	CoreHUD.defineSupportedActorTypes(["character", "drone", "npc", "npc2", "starship" /*, "starship", "vehicle" */]);
});
