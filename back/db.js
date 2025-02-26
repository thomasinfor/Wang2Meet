require("dotenv").config();
const { randomUUID } = require('crypto');
const Moment = require('moment-timezone');
const { Schema, model, connect, Error } = require('mongoose');
const { getHash, checkHash } = require('./passwd');

const isInt = e => parseInt(e) === e;
const checkTable = (table, i=96, j=7) => RegExp(`^([01]{${j}}\\n){${i}}$`).test(table + '\n');
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true, validate: { validator: e => e.length > 0 } },
  table: String,
  theme: { type: String, validate: { validator: e => /#[\da-f]{6}/.test(e) } },
  FCMToken: { type: Map, of: Date, default: {}, required: true },
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
});
const User = model("User", userSchema);
const meetSchema = new Schema({
  _id: { type: "UUID", default: () => randomUUID() },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  date: { type: Date, required: true },
  weekly: { type: Boolean, default: false },
  timeDuration: { type: Number, required: true, validate: { validator: e => isInt(e) && 0 < e && e <= 24 } },
  dateDuration: { type: Number, required: true, validate: { validator: e => isInt(e) && 1 <= e && e <= 35 } },
  title: { type: String, required: true, validate: { validator: e => e.length > 0 } },
  description: String,
  tables: {
    type: [{
      temp: { type: Boolean, default: false },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      tempUser: {
        name: String,
        passwdHash: String,
      },
      table: { type: String, required: true },
    }],
    default: [],
    required: true,
  },
}, {
  optimisticConcurrency: true,
  statics: {
    async parse(o) {
      try {
        o = {
          ...o,
          _id: undefined,
          date: new Date(Moment.tz([o.date[0], o.date[1]-1, o.date[2], o.time[0]], o.timezone)),
          timeDuration: o.time[1] - o.time[0],
          dateDuration: o.duration,
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
      const res = {
        id: this._id,
        date: this.date,
        weekly: this.weekly,
        timeDuration: this.timeDuration,
        dateDuration: this.dateDuration,
        title: this.title,
        collection: Object.fromEntries((this.tables || []).map(e => e.temp ? [
          e.tempUser.name + "@TEMP", { name: e.tempUser.name, table: e.table, temp: true }
        ] : [
          e.user.email, { name: e.user.name, table: e.table, temp: false }
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
      if (!checkTable(table, this.timeDuration * 4, this.dateDuration))
        return false;
      if (user.temp && !this.check_user(user.name, user.passwd))
        return false;
      for (let i = 0; i < this.tables.length; i++) {
        if (Boolean(this.tables[i].temp) !== Boolean(user.temp))
          continue;
        if (user.temp ? (
          this.tables[i].tempUser.name !== user.name
        ) : !this.tables[i]?.user?.equals?.(user._id))
          continue;

        // user matched
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
      // user not found
      if (table.search("1") !== -1) {
        if (user.temp)
          this.tables.push({
            temp: true,
            tempUser: {
              name: user.name,
              passwdHash: getHash(user.passwd)
            },
            table
          });
        else
          this.tables.push({ user: user._id, table });
        if (save) await this.save();
      }
      return true;
    },
    check_user(name, passwd) {
      for (let t of this.tables) {
        if (t.temp && t.tempUser.name === name)
          return checkHash(t.tempUser.passwdHash, passwd);
      }
      return true;
    }
  }
});
const Meet = model("Meet", meetSchema);

const connectDB = (config=null) => {
  config = config || process.env;
  return connect(
    config.MONGO_CONNECTION_STRING,
    { dbName: config.MONGO_DB_NAME }
  );
}

const getErrorCode = e => {
  if (e instanceof Error.ValidationError || e instanceof Error.CastError)
    return 400;
  if (e instanceof Error.VersionError)
    return 409;
  return null;
}

module.exports = {
  User, Meet,
  connectDB,
  getErrorCode,
  checkTable,
};