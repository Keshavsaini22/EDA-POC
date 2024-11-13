const express = require('express');
const router = express.Router();

const userRoutes = require('./user-route');

router.get("/", (req, res) => {
    res.send("Event Driven Architecture");
});

router.use('/users', userRoutes);

module.exports = router