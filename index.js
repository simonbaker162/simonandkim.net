const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

// Heroku HTTPS redirect
app.use((req, res, next) => {
  if (req.header("x-forwarded-proto") !== "https") {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
});

// Username and password deleted for public repo!
mongoose.connect(
  // "mongodb+srv://USERNAME:PASSWORD@wedding-rsvp-form-ai0sv.mongodb.net/rsvpDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const RSVPSchema = new mongoose.Schema({
  guestFirstName: String,
  guestLastName: String,
  guestSelectAttending: String,
  guestDietaryRequirements: String,
});

const RSVP = mongoose.model("RSVP", RSVPSchema);

let numGuests = 0;

app.get("/", function (req, res) {
  res.render("index");
  numGuests = 0;
});

app.get("/form", function (req, res) {
  res.render("form", {
    numberOfGuests: numGuests,
  });
});

app.get("/success", function (req, res) {
  res.render("success");
});

app.get("/error", function (req, res) {
  res.render("error");
});

app.post("/numguests", function (req, res) {
  numGuests = req.body.numguests;
  res.redirect("/form");
});

app.post("/form", function (req, res) {
  let numberOfGuests = Number(numGuests);
  if (numberOfGuests === 1) {
    const rsvp = new RSVP({
      guestFirstName: req.body.firstname,
      guestLastName: req.body.lastname,
      guestSelectAttending: req.body.selectattending,
      guestDietaryRequirements: req.body.dietreqs,
    });
    rsvp.save(function (err) {
      if (err) {
        res.redirect("/error");
      }
    });
  } else if (numberOfGuests > 1) {
    for (let i = 0; i < numberOfGuests; i++) {
      const rsvp = new RSVP({
        guestFirstName: req.body.firstname[i],
        guestLastName: req.body.lastname[i],
        guestSelectAttending: req.body.selectattending[i],
        guestDietaryRequirements: req.body.dietreqs[i],
      });
      rsvp.save(function (err) {
        if (err) {
          res.redirect("/error");
        }
      });
    }
  }
  res.redirect("/success");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000.");
});
