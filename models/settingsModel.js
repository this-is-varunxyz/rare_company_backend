import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  heroImageUrl: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

const SettingsModel =
  mongoose.models.settings || mongoose.model("settings", settingsSchema);

export default SettingsModel;


