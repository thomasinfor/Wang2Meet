require("dotenv").config();
const express = require('express');
const { randomUUID } = require('crypto');
const { Schema, model, connect, Error } = require('mongoose');
const bodyparser = require("body-parser");
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const firebaseApp = initializeApp({
  credential: cert(require("./firebase-service-account.json"))
});
const auth = getAuth(firebaseApp);

const port = process.env.PORT || 4000;

const isInt = e => parseInt(e) === e;
const checkTable = (table, i=96, j=7) => RegExp(`^([01]{${j}}\\n){${i}}$`).test(table + '\n');
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true, validate: { validator: e => e.length > 0 } },
  table: String,
  theme: { type: String, validate: { validator: e => /#[\da-f]{6}/.test(e) } },
}, {
  methods: {
    async sync(user) {
      if (this.email !== user.email)
        this.email = user.email;
      if (this.name !== user.name)
        this.name = user.name;
      await this.save();
    }
  }
}); model("User", userSchema);
const meetSchema = new Schema({
  _id: { type: "UUID", default: () => randomUUID() },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  date: { type: Date, required: true },
  time: { type: [Number], required: true, validate: {
    validator: e => e.length === 2 && e.every(isInt) && 0 <= e[0] && e[0] <= e[1] && e[1] <= 96
  } },
  duration: { type: Number, required: true, validate: { validator: e => isInt(e) && e >= 1 && e <= 35 } },
  title: { type: String, required: true, validate: { validator: e => e.length > 0 } },
  description: String,
  tables: {
    type: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      table: { type: String, required: true },
    }],
    default: [],
  },
}, {
  optimisticConcurrency: true,
  statics: {
    async parse(o) {
      try {
        o = {
          ...o,
          _id: undefined,
          date: new Date(`${o.date[0]}-${o.date[1]}-${o.date[2]}`),
          tables: [],
        };
        return new model("Meet")(o);
      } catch(e) {
        console.error(e);
        return null;
      }
    }
  },
  methods: {
    async dump() {
      await this.populate('creator tables.user');
      const date = new Date(this.date);
      const res = {
        id: this._id,
        time: this.time,
        date: [date.getFullYear(), date.getMonth()+1, date.getDate()],
        duration: this.duration,
        title: this.title,
        collection: Object.fromEntries(this.tables.map(e => [
          e.user.email, { name: e.user.name, table: e.table }
        ])),
      };
      if (this.creator)
        res.creator = { name: this.creator.name, email: this.creator.email };
      if (this.description)
        res.description = this.description;
      return res;
    },
    async set(user, table, save=false) {
      table = String(table);
      if (!checkTable(table, this.time[1] - this.time[0], this.duration))
        return false;
      for (let i = 0; i < this.tables.length; i++) {
        if (this.tables[i].user.equals(user._id)) {
          if (this.tables[i].table === table)
            return true;
          if (table.search("1") === -1) {
            this.tables.splice(i, 1);
          } else {
            this.tables[i].table = table;
          }
          if (save) await this.save();
          return true;
        }
      }
      if (table.search("1") !== -1) {
        this.tables.push({ user: user._id, table });
        if (save) await this.save();
      }
      return true;
    }
  }
}); model("Meet", meetSchema);

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
      if (e instanceof Error.ValidationError || e instanceof Error.CastError)
        return res.sendStatus(400);
      if (e instanceof Error.VersionError)
        return res.sendStatus(409);
      console.error(e); res.sendStatus(500);
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
      req.user = await model("User").findOne({ email: guser.email }).exec();
      if (!req.user) {
        req.user = new model("User")({ email: guser.email, name: guser.name || guser.email });
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
  const meet = await model("Meet").parse(req.body);
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
  let { table, theme } = req.body;
  if (table && checkTable(String(table))) {
    req.user.table = String(table);
  }
  if (theme) {
    req.user.theme = theme;
  }
  await req.user.save();
  res.status(200).json(req.user);
}));

App.get('/:id', wrapper(async (req, res) => {
  const id = req.params.id;
  const meet = await model("Meet").findById(id).exec();
  if (meet) {
    res.status(200).json(await meet.dump());
  } else {
    res.sendStatus(404);
  }
}));

App.post('/:id/modify', wrapper({ auth: true }, async (req, res) => {
  const id = req.params.id;
  const meet = await model("Meet").findById(id).exec();
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
  const meet = await model("Meet").findById(id).exec();
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

connect(process.env.MONGO_CONNECTION_STRING, {
  dbName: "w2m-test",
}).then(() => {
  console.log("Connected to DB");
  App.listen(port, () => {
    console.log(`Start listening at port ${port}`);
  });
});
