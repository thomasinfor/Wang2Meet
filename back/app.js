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
App.post('/create-event', async (req, res) => {
  try {
    const id = uuid();
    events[id] = JSON.parse(JSON.stringify(req.body));
    events[id].collection = {};
    res.status(200).json({ id });
  } catch(e) { console.error(e); }
});

App.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (id in events) {
      res.status(200).json(events[id]);
    } else {
      res.sendStatus(404);
    }
  } catch(e) { console.error(e); }
});

App.post('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (id in events) {
      const { name, time } = req.body || {};
      if (!name || !time) {
        res.sendStatus(400);
      } else {
        events[id].collection[name] = time;
        res.status(200).json(events[id]);
      }
    } else {
      res.sendStatus(404);
    }
  } catch(e) { console.error(e); }
});

App.listen(port, () => {
  console.log(`Start listening at port ${port}`);
});
