import { v2 as cloudinary } from "cloudinary";
import SettingsModel from "../models/settingsModel.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await SettingsModel.findOne();
    return res.json({ success: true, data: settings || {} });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const updateHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "Image file is required" });
    }

    const uploadRes = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "hero",
    });

    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = new SettingsModel({ heroImageUrl: uploadRes.secure_url });
    } else {
      settings.heroImageUrl = uploadRes.secure_url;
      settings.updatedAt = new Date();
    }
    await settings.save();

    return res.json({ success: true, message: "Hero image updated", data: settings });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


