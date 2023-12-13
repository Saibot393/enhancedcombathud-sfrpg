import { ModuleName } from "./utils.js";

Hooks.once("init", () => {  // game.settings.get(cModuleName, "")
  //Settings
  //client
  
  game.settings.register(ModuleName, "ShowSwiftActions", {
	name: game.i18n.localize(ModuleName+".Settings.ShowSwiftActions.name"),
	hint: game.i18n.localize(ModuleName+".Settings.ShowSwiftActions.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: true,
	onChange: () => {ui.ARGON.render()}
  });
  
  game.settings.register(ModuleName, "ShowFullActions", {
	name: game.i18n.localize(ModuleName+".Settings.ShowFullActions.name"),
	hint: game.i18n.localize(ModuleName+".Settings.ShowFullActions.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: true,
	onChange: () => {ui.ARGON.render()}
  });
  
  game.settings.register(ModuleName, "HealthBarWidthScale", {
	name: game.i18n.localize(ModuleName+".Settings.HealthBarWidthScale.name"),
	hint: game.i18n.localize(ModuleName+".Settings.HealthBarWidthScale.descrp"),
	scope: "client",
	config: true,
	type: Number,
	range: {
		min: 0.1,
		max: 2,
		step: 0.01
	},
	default: 1,
	onChange: () => {ui.ARGON.render()}
  });
  
  game.settings.register(ModuleName, "HealthBarHeightScale", {
	name: game.i18n.localize(ModuleName+".Settings.HealthBarHeightScale.name"),
	hint: game.i18n.localize(ModuleName+".Settings.HealthBarHeightScale.descrp"),
	scope: "client",
	config: true,
	type: Number,
	range: {
		min: 0.1,
		max: 2,
		step: 0.01
	},
	default: 1,
	onChange: () => {ui.ARGON.render()}
  });
  
  game.settings.register(ModuleName, "OwnSpellSlotConsume", {
	name: game.i18n.localize(ModuleName+".Settings.OwnSpellSlotConsume.name"),
	hint: game.i18n.localize(ModuleName+".Settings.OwnSpellSlotConsume.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: true
  });
});