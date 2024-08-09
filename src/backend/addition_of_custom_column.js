/**
 * @typedef {Object} DateTimeFormatterPreferences
 * @property {boolean} display_hrs_with_mins - If true, display hours along with minutes for emails less than 1 day old. 
 * For example: "11 hours 47 mins" instead of "12 hours".
 * @property {boolean} display_days_with_hrs - If true, display days along with hours for emails less than 1 month old. 
 * For example: "16 days 11 hours" instead of "16 days".
 * @property {boolean} display_months_with_days - If true, display months along with days for emails less than 1 year old. 
 * For example: "1 month 13 days" instead of "1 month".
 */

/**
 * This object stores the user preferences for date and time display in the email client.
 * Each property represents a different level of detail for displaying timestamps in the UI.
 * The boolean values determine whether or not to display specific time units.
 * @type {DateTimeFormatterPreferences}
 */
var date_time_formatter_preferences = {
    display_hrs_with_mins: false,
    display_days_with_hrs: false,
    display_months_with_days: false,
};

/**
 * Checks if old stored settings are available in the browser's local storage.
 * If no previous settings are found, the current default preferences are saved.
 * If settings are found, they are loaded into the `date_time_formatter_preferences` object.
 *
 * @param {Object} old_stored_settings - The settings previously saved in local storage.
 */
function check_old_stored_settings(old_stored_settings) {
    if (!old_stored_settings.date_time_formatter_preferences) {
        // Save the default preferences if none exist in storage.
        browser.storage.local.set({ date_time_formatter_preferences: date_time_formatter_preferences });
    } else {
        // Load the stored preferences into the current object.
        date_time_formatter_preferences = old_stored_settings.date_time_formatter_preferences;
    }
}

// Retrieve any existing settings from local storage and pass them to the check_old_stored_settings function.
// If an error occurs during the retrieval process, it will be logged to the console.
browser.storage.local.get().then(check_old_stored_settings, console.error);

/**
 * Adds a custom column to the Thunderbird UI for displaying relative date and time information.
 * The new column will use the settings specified in the date_time_formatter_preferences object.
 *
 * @param {string} id - The identifier for the custom column.
 * @param {string} title - The display name for the column in the UI.
 * @param {string} provider - The function or data source that provides the relative date/time values.
 * @param {DateTimeFormatterPreferences} options - The user preferences that determine the format of the date/time display.
 */

browser.customColumns.add("relative_date_time", "Relative Date/Time", "addon_provided_relative_date_time", date_time_formatter_preferences);
