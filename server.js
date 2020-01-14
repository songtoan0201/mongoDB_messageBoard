//require installed modules
let express = require("express");
let mongoose = require("mongoose");
let bodyParser = require("body-parser");
let path = require("path");
let session = require("express-session");
let flash = require("express-flash");

//create express app
const app = express();
// console.log(app);
app.use(
  session({
    secret: "keyboardkitteh",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);

//config (app.set || app.get)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname, "./static")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

mongoose.connect("mongodb://localhost/mongoDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    content: { type: String, required: true, min: 3 }
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true, min: 3 },
    comments: [commentSchema]
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
const Comment = mongoose.model("Comment", commentSchema);

app.get("/", (req, res) => {
  Message.find()
    .then(data => res.render("index", { msgs: data }))
    .catch(err => res.json(err));
});

app.post("/message/new", (req, res) => {
  Message.create(req.body)
    .then(data => {
      console.log(data);
      res.redirect("/");
    })
    .catch(err => {
      console.log("We have an error!", err);
      for (var key in err.errors) {
        req.flash("createError", err.errors[key].message);
      }
      res.redirect("/");
    });
});

app.post("/comment/new/:id", (req, res) => {
  Comment.create(req.body)
    .then(data => {
      console.log(data);
      Message.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comments: data } },
        (err2, data2) => {
          if (err2) {
            console.log(err2);
          } else {
            console.log(data2);
            res.redirect("/");
          }
        }
      );
    })
    .catch(err => {
      console.log("We have an error!", err);
      for (var key in err.errors) {
        req.flash("Error!", err.errors[key].message);
      }
      res.redirect("/");
    });
});

// // show a form to edit an existing animal.
// app.get("/animal/edit/:id", (req, res) => {
//   console.log(req.params.id);
//   Animal.findById(req.params.id)
//     .then(data => {
//       res.render("edit", { animal: data });
//     })
//     .catch(err => res.json(err));
// });

// delete the animal from the database by ID.
app.post("/message/destroy/:id", (req, res) => {
  Message.deleteOne({ _id: req.params.id })
    .then(deletedUser => {
      res.redirect("/");
    })
    .catch(err => res.json(err));
});

// // action attribute for the edit form
// app.post("/animal/:id", (req, res) => {
//   Animal.updateOne(
//     { _id: req.params.id },
//     {
//       name: req.body.name,
//       location: req.body.location,
//       weight: req.body.weight,
//       food: req.body.food
//     }
//   )
//     .then(data => {
//       res.redirect("/");
//     })
//     .catch(err => res.json(err));
// });

//server listen
app.listen(8000, () => {
  console.log("app is running on port 8000");
});
