require("dotenv").config();
const express = require('express');
const bodyparser = require("body-parser");
const cors = require('cors');
const { User, Meet, connectDB, getErrorCode, checkTable } = require("./db");
const { auth, messaging } = require("./firebase");

const port = process.env.PORT || 4000;

const App = express();

App.use(cors({}));
App.use(bodyparser.json({ limit: 33 * 1024 * 1024 }));
App.use(bodyparser.urlencoded({ extended: true, limit: 33 * 1024 * 1024 }));

function wrapper(options={}, f=null) {
  if (f === null) {
    f = options;
    options = {};
  }
  const { auth=false } = options;
  return async (req, res, next) => {
    try {
      if (auth && !(req.user && req.guser))
        res.sendStatus(401);
      else
        await f(req, res, next);
    } catch(e) {
      const errorCode = getErrorCode(e);
      if (errorCode) res.sendStatus(errorCode);
      else {
        console.error(e);
        res.sendStatus(500);
      }
    }
  }
}

App.use(wrapper(async (req, res, next) => {
  req.body = req.body || {};
  try {
    const token = req.headers.authorization;
    if (token === undefined || !token.startsWith('Bearer ')) {
      next();
    } else {
      const guser = await auth.verifyIdToken(token.slice(7));
      req.guser = guser;
      req.user = await User.findOne({ email: guser.email }).exec();
      if (!req.user) {
        req.user = new User({ email: guser.email, name: guser.name || guser.email });
      }
      await req.user.sync(req.guser);
      next();
    }
  } catch(e) {
    console.error(e);
    next();
  }
}));

App.post('/create-event', wrapper(async (req, res) => {
  if (req.user) req.body.creator = req.user._id;
  const meet = await Meet.parse(req.body);
  if (meet === null)
    res.sendStatus(400);
  else{
    await meet.save();
    res.status(200).json(await meet.dump());
  }
}));

App.get('/me', wrapper({ auth: true }, async (req, res) => {
  res.status(200).json(req.user);
}));

App.post('/me', wrapper({ auth: true }, async (req, res) => {
  let { table, theme, FCMToken } = req.body;
  if (table && checkTable(String(table))) {
    req.user.table = String(table);
  }
  if (theme) {
    req.user.theme = theme;
  }
  if (FCMToken) {
    req.user.FCMToken.set(FCMToken, new Date);
  }
  await req.user.save();
  res.status(200).json(req.user);
}));

App.get('/:id', wrapper(async (req, res) => {
  const id = req.params.id;
  const projection = ("metadata" in req.query) ? "-tables" : "";
  const meet = await Meet.findById(id, projection).exec();
  if (meet) {
    res.status(200).json(await meet.dump());
  } else {
    res.sendStatus(404);
  }
}));

App.post('/:id/modify', wrapper({ auth: true }, async (req, res) => {
  const id = req.params.id;
  const meet = await Meet.findById(id).exec();
  if (meet) {
    if (!req.user._id.equals(meet.creator))
      return res.sendStatus(403);
    const { title, description } = req.body;
    if (title)
      meet.title = title;
    if (description || description === "")
      meet.description = description;
    await meet.save();
    res.status(200).json(await meet.dump());
  } else {
    res.sendStatus(404);
  }
}));

App.post('/:id', wrapper({ auth: true }, async (req, res) => {
  const id = req.params.id;
  const meet = await Meet.findById(id).exec();
  if (meet) {
    const { time } = req.body;
    if (await meet.set(req.user, time, true)) {
      res.status(200).json(await meet.dump());
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(404);
  }
}));

connectDB().then(() => {
  console.log("Connected to DB");
  App.listen(port, () => {
    console.log(`Start listening at port ${port}`);
  });
});
