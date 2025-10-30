const express = require('express');

const router = express.Router();
const {getLeaderboard ,getAllLeaderboards} = require('../Controllers/leaderboard.controller');


router.get('/getall/:quizId', getAllLeaderboards);

module.exports = router;