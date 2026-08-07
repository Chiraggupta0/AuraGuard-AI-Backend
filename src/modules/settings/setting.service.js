const Setting = require('./setting.model');
const ApiError = require('../../utils/ApiError');

// Default platform settings, seeded lazily on first read if not present.
const DEFAULT_SETTINGS = {
  moderation_confidence_threshold: 0.6,
  auto_kick_on_critical_violation: true,
  max_violations_before_ban: 5,
};

const getAllSettings = async () => {
  const settings = await Setting.find();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return { ...DEFAULT_SETTINGS, ...map };
};

const getSetting = async (key) => {
  const setting = await Setting.findOne({ key });
  if (setting) return setting.value;
  if (key in DEFAULT_SETTINGS) return DEFAULT_SETTINGS[key];
  throw ApiError.notFound(`Setting "${key}" not found`);
};

const upsertSetting = async (key, value, description, updatedBy) =>
  Setting.findOneAndUpdate(
    { key },
    { value, description, updatedBy },
    { new: true, upsert: true, runValidators: true }
  );

module.exports = { getAllSettings, getSetting, upsertSetting };
