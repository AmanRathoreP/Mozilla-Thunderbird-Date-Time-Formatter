// Select the checkbox inputs from the DOM
const display_hrs_with_mins_input = document.querySelector("#display_hrs_with_mins");
const display_days_with_hrs_input = document.querySelector("#display_days_with_hrs");
const display_months_with_days_input = document.querySelector("#display_months_with_days");

/**
 * Stores the current settings to Thunderbird's local storage.
 * The settings include whether to display hours with minutes,
 * days with hours, and months with days.
 */
function store_settings_to_TB() {
  const updated_settings = {
    display_hrs_with_mins: display_hrs_with_mins_input.checked, // Boolean value of the "display hours with minutes" checkbox
    display_days_with_hrs: display_days_with_hrs_input.checked, // Boolean value of the "display days with hours" checkbox
    display_months_with_days: display_months_with_days_input.checked, // Boolean value of the "display months with days" checkbox
  };
  
  // Store the new settings in the local storage under the key 'date_time_formatter_preferences'
  browser.storage.local.set({
    date_time_formatter_preferences: updated_settings,
  });

  // Get the background page and call its repaint function to apply the new settings
  browser.extension.getBackgroundPage().repaint(updated_settings);
}

/**
 * Fetches the previously stored settings from local storage
 * and updates the UI to reflect these settings.
 * 
 * @param {Object} restoredSettings - The settings object retrieved from local storage.
 */
function fetch_from_previous_settings_and_update_ui(restoredSettings) {
  // Update the checkboxes to match the restored settings
  display_hrs_with_mins_input.checked = restoredSettings.date_time_formatter_preferences.display_hrs_with_mins;
  display_days_with_hrs_input.checked = restoredSettings.date_time_formatter_preferences.display_days_with_hrs;
  display_months_with_days_input.checked = restoredSettings.date_time_formatter_preferences.display_months_with_days;
}

// Retrieve the stored settings from local storage and, update the ui
browser.storage.local.get().then(fetch_from_previous_settings_and_update_ui, console.error);

// Add event listeners to the checkboxes to store settings when they are changed
display_hrs_with_mins_input.addEventListener("change", store_settings_to_TB);
display_days_with_hrs_input.addEventListener("change", store_settings_to_TB);
display_months_with_days_input.addEventListener("change", store_settings_to_TB);
