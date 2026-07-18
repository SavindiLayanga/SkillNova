import { UserSettings } from "../models/UserSettings.js";

export const getPreferences = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user.uid });

    if (!settings) {
      settings = new UserSettings({ userId: req.user.uid });
      await settings.save();
    }

    // Migration logic for legacy language setting
    if (settings.language && (!settings.preferences || Object.keys(settings.preferences).length === 0)) {
      settings.preferences = { language: settings.language };
      await settings.save();
    }

    const defaultPrefs = {
      language: "en",
      timezone: "",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "12h",
      theme: "system"
    };

    res.json({ ...defaultPrefs, ...(settings.preferences || {}) });
  } catch (error) {
    console.error("Preferences fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const updates = req.body;
    let settings = await UserSettings.findOne({ userId: req.user.uid });

    if (!settings) {
      settings = new UserSettings({ userId: req.user.uid, preferences: updates });
    } else {
      // Ensure we merge properly, accounting for mongoose document structure
      const currentPrefs = settings.preferences ? settings.preferences.toObject ? settings.preferences.toObject() : settings.preferences : {};
      settings.preferences = { ...currentPrefs, ...updates };
    }

    await settings.save();
    res.json(settings.preferences);
  } catch (error) {
    console.error("Preferences update error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
