import * as ics from 'ics';

export function STORAGE_KEY(x) { return "Wang2Meet_" + x; }
export function inRange(v, l, r){ return (l <= v && v <= r) || (r <= v && v <= l); }
export function pad(n, digit){ const res = `${n}`; return "0".repeat(Math.max(0, digit-res.length)) + res; }
export class Time{
  constructor(i) {
    this.hour = parseInt(i / 4);
    this.section = i % 4;
    this.minute = this.section * 15;
    this.timeStr = `${pad(this.hour, 2)}:${pad(this.minute, 2)}`
  }
}
export const dayOfWeek = "Sun Mon Tue Wed Thu Fri Sat".split(" ");
export const defaultTime = [0, 96], defaultDate = [2003, 6, 1], defaultDuration = 7;
export function dump(table) { return table.map(r => r.map(e => e ? "1" : "0").join('')).join('\n'); }
export function parse(str) { return str.split('\n').map(r => r.split('').map(e => e === "1")); }
export function colorScale(c, r) { return '#' + [c.slice(1,3), c.slice(3, 5), c.slice(5, 7)].map(
  e => ("0" + parseInt(parseInt(e, 16) * r + 255 * (1-r)).toString(16).toUpperCase()).slice(-2)
).join(''); }
export function tableMap(t, f) { return t.map((row, i) => row.map((e, j) => f(e, i, j))); }
export function mkTable(r, c, f=null) { return new Array(r).fill(0).map(() => new Array(c).fill(f)); }
class InterpretedTime {
  constructor(date, time, [i, j]=[0, 0]) {
    if (!Array.isArray(time))
      time = [time, time];
    this.primitive = [date, time];
    this.dateObj = new Date(new Date(date).getTime() + 86400000*j);
    this.time = (time[0] + i) * 15;
    this.i = i; this.j = j; this.idx = i + j * (time[1] - time[0]);
    this.year = this.dateObj.getFullYear();
    this.month = this.dateObj.getMonth()+1;
    this.date = this.dateObj.getDate();
    this.day = this.dateObj.getDay();
    this.dow = dayOfWeek[this.day];
    this.hour = parseInt(this.time / 60);
    this.minute = this.time % 60;
  }
  next() {
    return new InterpretedTime(...this.primitive, [
      (this.i + 1) % 96,
      this.j + parseInt((this.i+1) / 96)
    ]);
  }
  get yearPad() { return pad(this.year, 4); }
  get monthPad() { return pad(this.month, 2); }
  get datePad() { return pad(this.date, 2); }
  get hourPad() { return pad(this.hour, 2); }
  get minutePad() { return pad(this.minute, 2); }
}
export function interpret(...args) {
  return new InterpretedTime(...args);
}
export function cast(table, d1, t1, d2, t2, duration) {
  if (table[0].length === 7 && new Date(d1).getDay() === 0 && t1[0] === defaultTime[0] && t1[1] === defaultTime[1]) {
    const day0 = new Date(d2).getDay();
    table = table.slice(t2[0] - t1[0], t2[1] - t1[1] || undefined);
    table = table.map(row => new Array(duration).fill(day0).map((e, i) => row[(e+i) % 7]));
    return table;
  }
}
export function getHighlightLink(meet, start, end) {
  const index = meet.index;
  return `${window.location.origin}/${meet.id}/view?range=${
    index[start.i][start.j]
  },${
    index[end.i][end.j]
  }`;
}
export function getCalendarLink(meet, start, end, timezone) {
  // https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/blob/main/services/google.md
  const end2 = end.next();
  const params = new URLSearchParams;
  params.append("action", "TEMPLATE");
  params.append("text", meet.title);
  params.append("dates", `${
    start.yearPad}${start.monthPad}${start.datePad
  }T${
    start.hourPad}${start.minutePad
  }00/${
    end2.yearPad}${end2.monthPad}${end2.datePad
  }T${
    end2.hourPad}${end2.minutePad
  }00`);
  params.append("ctz", timezone);
  const link = getHighlightLink(meet, start, end);
  params.append("details", `<h3>Wang2Meet</h3><a href="${link}">${link}</a>${
    !meet.description ? "" :
    "<h3>Description</h3>" + meet.description.slice(0, 1500)
  }`);
  params.append("add", Object.keys(meet.collection).join(","));
  return "https://www.google.com/calendar/render?" + params;
}
export function getICSLink(meet, start, end, timezone) {
  const link = getHighlightLink(meet, start, end);
  start = new Date(start.year, start.month-1, start.date, start.hour, start.minute);
  end = end.next();
  end = new Date(end.year, end.month-1, end.date, end.hour, end.minute);

  const tmp = new Date()
  const localDate = new Date(tmp.toLocaleString('en-US'));
  const tzDate = new Date(tmp.toLocaleString('en-US', { timeZone: timezone }));

  start = new Date(start.getTime() + (localDate.getTime() - tzDate.getTime()));
  end = new Date(end.getTime() + (localDate.getTime() - tzDate.getTime()));

  const event = {
    start: start.getTime(),
    startInputType: 'utc',
    end: end.getTime(),
    endInputType: 'utc',
    title: meet.title,
    description: "Wang2Meet\n" + link + "\n\n" + (meet.description ? ("Description:\n" + meet.description) : ""),
    url: link,
    // organizer:
    attendees: Object.keys(meet.collection).filter(e => !e.endsWith("@TEMP")).map(e => ({ email: e })),
    created: new Date().getTime(),
    htmlContent: `<h3>Wang2Meet</h3><a href="${link}">${link}</a>${
      !meet.description ? "" :
      "<h3>Description</h3>" + meet.description.slice(0, 1500)
    }`
  };

  const { value, error } = ics.createEvent(event);
  if (error) console.error(error);
  return 'data:text/plain;charset=utf-8,' + encodeURIComponent(value);
}
export function slotBefore(a, b) { return a[1] === b[1] ? a[0] <= b[0] : a[1] <= b[1]; }
export function sum(x) { return x.reduce((a, b) => a + b, 0); }
export const timezones = Intl.supportedValuesOf('timeZone');
export function getTimezoneHere() { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
class TimeAdapter {
  constructor(date, dateDuration, timeDuration, timezone) {
    const localTimeStr = new Date(date).toLocaleString("en-US", { hour12: false, timeZone: timezone });
    const matches = localTimeStr.match(/(\d+)\/(\d+)\/(\d+),\s(\d+)/);
    const [m, d, y, h] = matches.slice(1).map(e => parseInt(e));

    this.dD = dateDuration;
    this.tD = timeDuration;
    this.m = m;
    this.d = d;
    this.y = y;
    this.h = h;
    this.wrap = h + timeDuration > 24;
    this.mask = !this.wrap ? null : tableMap(mkTable(96, this.getDuration()), (_, i, j) => {
      const [_i, _j] = this.idx_tablize(i, j);
      return !(0 <= _j && _j < this.dD && 0 <= _i && _i < this.tD * 4);
    });
  }
  getDate() { return [this.y, this.m, this.d]; }
  getTime() { return (this.wrap ? [0, 24] : [this.h, this.h + this.tD]).map(e => e * 4); }
  getDuration() { return this.wrap ? this.dD + 1 : this.dD; }
  idx_tablize(i, j) { return !this.wrap ? [i, j] : [
    i - this.h * 4 + (i < this.h * 4 ? 96 : 0),
    i < this.h * 4 ? j-1 : j
  ]; }
  idx_localize(i, j) { return !this.wrap ? [i, j] : [
    i + this.h * 4 - (i + this.h * 4 >= 96 ? 96 : 0),
    i + this.h * 4 >= 96 ? j+1 : j
  ]; }
  getMask() { return this.mask; }
  tbl_localize(tbl) { return !this.wrap ? tbl : tableMap(this.getMask(), (m, i, j) =>
    !m && tbl[this.idx_tablize(i, j)[0]][this.idx_tablize(i, j)[1]]
  ); }
  tbl_tablize(tbl) { return !this.wrap ? tbl : tableMap(mkTable(this.tD * 4, this.dD), (_, i, j) =>
    tbl[this.idx_localize(i, j)[0]][this.idx_localize(i, j)[1]]
  ); }
  getIndex() { return this.tbl_localize(tableMap(mkTable(this.tD * 4, this.dD), (_, i, j) => i + j * this.tD * 4)); }
}
export function wrapConfig(cfg, tz) {
  cfg = { ...cfg };
  // console.log(cfg, tz);
  cfg.startTime = cfg.date;
  const TA = new TimeAdapter(cfg.startTime, cfg.dateDuration, cfg.timeDuration, tz);
  cfg.date = TA.getDate();
  cfg.time = TA.getTime();
  cfg.duration = TA.getDuration();
  cfg.mask = TA.getMask();
  cfg.index = TA.getIndex();
  cfg.collection = { ...cfg.collection };
  for (let idx in cfg.collection) {
    cfg.collection[idx] = { ...cfg.collection[idx] };
    cfg.collection[idx].table = TA.tbl_localize(parse(cfg.collection[idx].table));
  }
  // console.log(cfg)
  return cfg;
}
export function unwrapTable(tbl, cfg, tz) {
  return tbl && new TimeAdapter(cfg.startTime, cfg.dateDuration, cfg.timeDuration, tz).tbl_tablize(tbl);
}