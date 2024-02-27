require("dotenv").config();
const express = require('express');
const { randomUUID } = require('crypto');
const { Schema, model, connect } = require('mongoose');
const bodyparser = require("body-parser");
const cors = require('cors');
const { v4: uuid } = require('uuid');

const port = process.env.PORT || 4000;

const isInt = e => parseInt(e) === e;
const checkTable = (table, i=96, j=7) => RegExp(`^([01]{${j}}\\n){${i}}$`).test(table + '\n');
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true, validate: { validator: e => e.length > 0 } },
  table: String,
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
  duration: { type: Number, required: true, validate: { validator: e => isInt(e) && e >= 1 } },
  title: { type: String, required: true, validate: { validator: e => e.length > 0 } },
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
  statics: {
    async parse(o) {
      try {
        o = {
          ...o,
          _id: undefined,
          date: new Date(`${o.date[0]}-${o.date[1]}-${o.date[2]}`),
          tables: [],
        };
        if (o.creator) {
          const user = await model("User").findOne({ email: String(o.creator) });
          if (!user) return null;
          o.creator = user._id;
        }
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
      return res;
    },
    set(user, table) {
      try {
        if (!checkTable(table, this.time[1] - this.time[0], this.duration))
          return false;
        for (let i = 0; i < this.tables.length; i++)
          if (this.tables[i].user === user._id) {
            this.tables[i].table = table;
            return true;
          }
        this.tables.push({ user: user._id, table });
        return true;
      } catch(e) {
        console.error(e);
        return false;
      }
    }
  }
}); model("Meet", meetSchema);

const App = express();

App.use(cors({}));
App.use(bodyparser.json({ limit: 33 * 1024 * 1024 }));
App.use(bodyparser.urlencoded({ extended: true, limit: 33 * 1024 * 1024 }));

function errorHandle(f) {
  return async (req, res) => {
    try {
      await f(req, res);
    } catch(e) {
      if (e.kind === "UUID")
        return res.sendStatus(404);
      console.error(e); res.sendStatus(500);
    }
  }
}

App.post('/create-event', errorHandle(async (req, res) => {
  const meet = await model("Meet").parse(req.body);
  if (meet === null)
    res.sendStatus(400);
  else{
    await meet.save();
    res.status(200).json(await meet.dump());
  }
}));

// App.get('/me', errorHandle(async (req, res) => {
//   const user = await model("User").findOne({ email: String(req.body?.email) }).exec();
//   if (user) {
//     res.status(200).json(user);
//   } else {
//     res.sendStatus(404);
//   }
// }));

App.post('/me', errorHandle(async (req, res) => {
  let { name, email, table } = req.body || {};
  email = String(email);
  if (!email) {
    res.sendStatus(400);
  } else {
    const user = await model("User").findOne({ email: email }).exec();
    if (!user)
      res.sendStatus(404);
    else {
      if (name)
        user.name = String(name);
      if (table && checkTable(String(table))) {
        user.table = String(table);
      }
      await user.save();
      res.status(200).json(user);
    }
  }
}));

App.get('/:id', errorHandle(async (req, res) => {
  const id = req.params.id;
  const meet = await model("Meet").findById(id).exec();
  if (meet) {
    res.status(200).json(await meet.dump());
  } else {
    res.sendStatus(404);
  }
}));

App.post('/:id', errorHandle(async (req, res) => {
  const id = req.params.id;
  const meet = await model("Meet").findById(id).exec();
  if (meet) {
    const { name, time, email } = req.body || {};
    let user = await model("User").findOne({ email: String(email) }).exec();
    if (!user) {
      user = new model("User")({ email: String(email), name: name ? String(name) : String(email) });
      await user.save();
    } 
    if (user.name != name) {
      user.name = String(name);
      await user.save();
    }
    meet.set(user, time);
    await meet.save();
    res.status(200).json(await meet.dump());
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
