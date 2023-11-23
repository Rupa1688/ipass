const mongoose = require("mongoose");

const url = process.env.MONGO_URI;
mongoose.connect(url, {
    useNewUrlParser: true,
})
    .then(() => {
        console.log("Successfully connected to database");
    })
    .catch((error) => {
        console.log("database connection failed. exiting now...");
        console.error(error);

    });


