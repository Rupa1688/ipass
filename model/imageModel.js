const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    media_id: { type: String, default: null },
    name: { type: String, default: null },
    context: { type: String, default: null },
    timestamp: { type: String, default: null },
    size: { type: Number, default: null },
    mimetype: { type: String, default: null },
    url: { type: String, default: null },
    sessionId: { type: String, default: null },
});

module.exports = mongoose.model("image", Schema);