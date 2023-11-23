const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    personId: { type: String, default: null },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    idCode: { type: String, default: null },
    dateOfBirth: { type: String, default: null },
    gender: { type: String, default: null },
    nationality: { type: String, default: null },
    
    placeOfBirth: { type: String, default: null },


    citizenships: { type: Array, default: null },
    pepSanctionMatches: { type: Array, default: null },
    

});

module.exports = mongoose.model("person", Schema);