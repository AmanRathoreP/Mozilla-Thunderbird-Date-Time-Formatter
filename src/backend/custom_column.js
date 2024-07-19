var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { ExtensionSupport } = ChromeUtils.import("resource:///modules/ExtensionSupport.jsm");
const { ThreadPaneColumns } = ChromeUtils.importESModule("chrome://messenger/content/thread-pane-columns.mjs");

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

var get_relative_date_time = (d1, d2 = new Date()) => {
  var elapsed = d1 - d2
  for (var u in units)
    if (Math.abs(elapsed) > units[u] || u == 'second')
      return rtf.format(Math.round(elapsed / units[u]), u)
}

var customColumns = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    context.callOnClose(this);
    return {
      customColumns: {
        async add(id, name, field) {
          ids.push(id);

          function get_addon_provided_relative_date_time(message) {
            // nano seconds to milliseconds
            return get_relative_date_time(new Date(message.date / 1000));
          }

          function get_row_number_of_addon_provided_relative_date_time(
              message
          ) {
              // nano seconds to milliseconds
              row_num += 1;
              return row_num;
          }

          function getEmpty(message) {
            return "";
          }

          var callback = field == "addon_provided_relative_date_time" ? get_addon_provided_relative_date_time : getEmpty;
          var sort_callback =
              field == "addon_provided_relative_date_time"
                  ? get_row_number_of_addon_provided_relative_date_time
                  : getEmpty;

          ThreadPaneColumns.addCustomColumn(id, {
              name: name,
              hidden: false,
              icon: false,
              resizable: true,
              sortable: true,
              textCallback: callback,
              sortCallback: sort_callback,
          });
        },

        async remove(id) {
          ThreadPaneColumns.removeCustomColumn(id);
          ids.remove(id);
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
