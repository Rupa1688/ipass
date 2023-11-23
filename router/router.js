const express = require("express");
const auth = require("../middleware/auth.js");
const router = express.Router();

var veriff_controller = require('../controller/veriffController');

router.post("/ipass/sessions", veriff_controller.sessions);
router.get("/ipass/sessions/:id", veriff_controller.sessionsDetail);
router.get("/ipass/sessions", veriff_controller.sessionsAllData);

router.patch("/ipass/sessions/:id", veriff_controller.sessionsUpdate);
router.delete("/ipass/sessions/:id", veriff_controller.sessionsDelete);
router.get("/ipass/sessions/:id/media", veriff_controller.sessionsMedia);
router.post("/ipass/sessions/:id/media", veriff_controller.sessionsMediaPost);
router.get("/ipass/sessions/:id/person", veriff_controller.sessionsPerson);
router.get("/ipass/sessions/:id/watchlist-screening", veriff_controller.sessionsWatchlist);
router.get("/ipass/sessions/:id/attempts", veriff_controller.sessionsAttempts);
router.get("/ipass/attempts/:id/media", veriff_controller.attemptsMedia);
router.get("/ipass/transportation-registry/:id/", veriff_controller.transportation_registery);
router.get("/ipass/address/:id/media", veriff_controller.address_media);
router.get("/ipass/sessions/:id/decision", veriff_controller.sessionsDecision);
router.get("/ipass/media/:id", veriff_controller.media);
router.get("/ipass/address-media/:id", veriff_controller.addressMedia);

var ceon_controller = require('../controller/ceonController');

router.post("/ipass/seon",ceon_controller.seon);
router.get("/ipass/sAllData",ceon_controller.sAllData)
router.get("/ipass/getoneData/:id",ceon_controller.getoneData);
var user_controller = require('../controller/userController');
router.post("/register", user_controller.add);
router.post("/login", user_controller.login);
// var veriff_controller = require('../controller/veriffController1');
// router.post("/ipass", veriff_controller.verify);

module.exports = router;