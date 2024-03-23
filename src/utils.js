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
class InterpretedTime {
  constructor(date, time, [i, j]=[0, 0]) {
    this.primitive = [date, time];
    this.dateObj = new Date(new Date(date).getTime() + 86400000*j);
    this.time = (time + i) * 15;
    this.i = i; this.j = j;
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
export function getCalendarLink(meet, start, end) {
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
  // params.append("ctz", "Asia/Taipei");
  const link = `${window.location.origin}/${meet.id}/view?range=${start.i},${start.j},${end.i},${end.j}`;
  params.append("details", `<h3>Wang2Meet</h3><a href="${link}">${link}</a>${
    !meet.description ? "" :
    "<h3>Description</h3>" + meet.description.slice(0, 1500)
  }`);
  params.append("add", Object.keys(meet.collection).join(","));
  return "https://www.google.com/calendar/render?" + params;
}
export function slotBefore(a, b) { return a[1] === b[1] ? a[0] <= b[0] : a[1] <= b[1]; }
export function sum(x) { return x.reduce((a, b) => a + b, 0); }
