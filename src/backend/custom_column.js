var { ExtensionCommon } = ChromeUtils.importESModule("resource://gre/modules/ExtensionCommon.sys.mjs");
var { ExtensionSupport } = ChromeUtils.importESModule("resource:///modules/ExtensionSupport.sys.mjs");

let ThreadPaneColumns;
try {
    ThreadPaneColumns = ChromeUtils.importESModule("chrome://messenger/content/thread-pane-columns.mjs").ThreadPaneColumns;
} catch (e) {
    ThreadPaneColumns = ChromeUtils.importESModule("chrome://messenger/content/ThreadPaneColumns.mjs").ThreadPaneColumns; // renamed in TB128
}

const ids = [];
var row_num = 0;
// in milliseconds
var units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: 24 * 60 * 60 * 1000 * 365 / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000
}

var rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

var get_relative_date_time = (d1, d2 = new Date(), preferences) => {
  var elapsed = d1 - d2;
  var absElapsed = Math.abs(elapsed);
  const isInPast = elapsed < 0;
  const suffix = isInPast ? "ago" : "from now";
  
  // Calculate values for different time units
  const years = Math.floor(absElapsed / units.year);
  const months = Math.floor(absElapsed / units.month);
  const days = Math.floor(absElapsed / units.day);
  const hours = Math.floor((absElapsed % units.day) / units.hour);
  const minutes = Math.floor((absElapsed % units.hour) / units.minute);
  
  // Helper function to get singular or plural form
  const getUnitText = (value, singular, plural) => {
    return value === 1 ? singular : plural;
  };
  
  // Using user preferences for formatting
  if (years > 0) {
    // For timeframes > 1 year, just show years
    return rtf.format(Math.round(elapsed / units.year), 'year');
  } else if (months > 0) {
    // For timeframes between 1 month and 1 year
    if (preferences && preferences.display_months_with_days) {
      const remainingDays = Math.floor(absElapsed % units.month / units.day);
      // Only show days when there are actually days to show
      if (remainingDays > 0) {
        const monthText = getUnitText(months, "month", "months");
        const dayText = getUnitText(remainingDays, "day", "days");
        return `${months} ${monthText} ${remainingDays} ${dayText} ${suffix}`;
      }
    }
    // If no days to show or preference is off, just show months
    return rtf.format(Math.round(elapsed / units.month), 'month');
  } else if (days > 0) {
    // For timeframes between 1 day and 1 month
    if (preferences && preferences.display_days_with_hrs && hours > 0) {
      const dayText = getUnitText(days, "day", "days");
      const hourText = getUnitText(hours, "hr", "hrs");
      return `${days} ${dayText} ${hours} ${hourText} ${suffix}`;
    } else {
      return rtf.format(Math.round(elapsed / units.day), 'day');
    }
  } else if (hours > 0) {
    // For timeframes between 1 hour and 1 day
    if (preferences && preferences.display_hrs_with_mins && minutes > 0) {
      const hourText = getUnitText(hours, "hr", "hrs");
      const minuteText = getUnitText(minutes, "min", "mins");
      return `${hours} ${hourText} ${minutes} ${minuteText} ${suffix}`;
    } else {
      const hourText = getUnitText(hours, "hr", "hrs");
      return `${hours} ${hourText} ${suffix}`;
    }
  } else if (minutes > 0) {
    return rtf.format(Math.round(elapsed / units.minute), 'minute');
  } else {
    return rtf.format(Math.round(elapsed / units.second), 'second');
  }
}

var customColumns = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    context.callOnClose(this);
    return {
      customColumns: {
        async add(id, name, field, __date_time_formatter_preferences) {
          ids.push(id);

          function get_addon_provided_relative_date_time(message) {
            // nano seconds to milliseconds
            return get_relative_date_time(new Date(message.date / 1000), new Date(), __date_time_formatter_preferences);
          }

          function getEmpty(message) {
            return "";
          }

          var callback = field == "addon_provided_relative_date_time" ? get_addon_provided_relative_date_time : getEmpty;
          var sort_callback = message => {
            return field == "addon_provided_relative_date_time" ? Math.floor(message.date / 1000000) : 0;
          };

          ThreadPaneColumns.addCustomColumn(id, {
              name: name,
              hidden: false,
              icon: false,
              resizable: true,
              sortable: true,
              textCallback: callback,
              sortCallback: sort_callback,
          });
        }
      },
    };
  }

  close() {
    for (const id of ids) {
      ThreadPaneColumns.removeCustomColumn(id);
    }
  }
};
