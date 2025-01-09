const express = require("express");
// Al usar { mergeParams: true } en express.Router permitimos que los req.params de nivel superior 
// (la ruta original sin usar router) esten disponibles en este controlador
const router = express.Router({ mergeParams: true });

// Import any models here
const User = require("../models/user");

router.get('/', async (req, res) => {
    // If we have req.session.user then we are signed in
    if (req.session.user) {
        const currentUser = await User.findById(req.session.user._id);
        const applications = currentUser.applications;
        res.render(`applications/index.ejs`, { applications });
    }
    else {
        res.render("index.ejs");
    }
    // res.send(req.params.userId); // User ID is being prefixed on the route before using the router
});

router.get("/new", (req, res) => {
    res.render("applications/new.ejs");
});

router.post('/', async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user._id);
        currentUser.applications.push(req.body);

        // Save updated user with new application to database
        await currentUser.save();

        res.redirect(`/users/${req.session.user._id}/applications`);
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// Show
router.get("/:applicationId", async (req, res) => {
    const currentUser = await User.findById(req.session.user._id);
    const application = currentUser.applications.id(req.params.applicationId);

    res.render("applications/show.ejs", { application });
})

router.delete("/:applicationId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user._id);
        currentUser.applications.id(req.params.applicationId).deleteOne();

        // Save updated user with deleted application to database
        await currentUser.save();

        res.redirect(`/users/${req.session.user._id}/applications`);
    }
    catch (error) {
        console.error(error);
        res.redirect('/');
    }
})

// Edit
router.get("/:applicationId/edit", async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user._id);
        const application = currentUser.applications.id(req.params.applicationId);
        res.render("applications/edit.ejs", { application });
    } catch (error) {
        console.error(error);
    }
})

// Edit
router.put("/:applicationId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user._id);
        const application = currentUser.applications.id(req.params.applicationId);
        application.set(req.body);
        await currentUser.save();

        res.redirect(`/users/${req.session.user._id}/applications`);
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
})

module.exports = router;