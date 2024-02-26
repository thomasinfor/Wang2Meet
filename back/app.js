require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require("body-parser");
const cors = require('cors');
const { v4: uuid } = require('uuid');

const port = process.env.PORT || 4000;

const App = express();

App.use(cors({}));
App.use(bodyparser.json({ limit: 33 * 1024 * 1024 }));
App.use(bodyparser.urlencoded({ extended: true, limit: 33 * 1024 * 1024 }));

const events = {};
const displayName = {};
App.post('/create-event', async (req, res) => {
  try {
    const id = uuid();
    events[id] = JSON.parse(JSON.stringify(req.body));
    events[id].id = id;
    events[id].collection = {};
    res.status(200).json({ id });
  } catch(e) { console.error(e); res.sendStatus(500); }
});

App.post('/update-name', async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) {
      res.sendStatus(400);
    } else {
      displayName[email] = name;
      res.sendStatus(200);
    }
  } catch(e) { console.error(e); res.sendStatus(500); }
});

function wrap(e) {
  return { ...e, collection: Object.fromEntries(Object.entries(e.collection).map(([k, v]) => [k, {
    name: displayName[k], table: v,
  }])) }
}

App.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (id in events) {
      res.status(200).json(wrap(events[id]));
    } else {
      res.sendStatus(404);
    }
  } catch(e) { console.error(e); res.sendStatus(500); }
});

App.post('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (id in events) {
      const { name, time, email } = req.body || {};
      if (!name || !time || !email) {
        res.sendStatus(400);
      } else {
        displayName[email] = name;
        events[id].collection[email] = time;
        res.status(200).json(wrap(events[id]));
      }
    } else {
      res.sendStatus(404);
    }
  } catch(e) { console.error(e); res.sendStatus(500); }
});

App.listen(port, () => {
  console.log(`Start listening at port ${port}`);
});
