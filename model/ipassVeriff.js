const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    integration: { type: String, default: null },
    fname: { type: String, default: null },
    lname: { type: String, default: null },
    uniq_id: { type: String, default: null },
    update_at:{type: Date, default: Date.now},
    veriff_code: { type: String, default: null },
    url: { type: String, default: null },
    vendorData: { type: String, default: null },
    host: { type: String, default: null },
    status: { type: String, default: null },
    sessionToken: { type: String, default: null },
    urlIpass: { type: String, default: null },
});

module.exports = mongoose.model("Veriff_Ipass", Schema);