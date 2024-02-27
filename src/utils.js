export function inRange(v, l, r){ return (l <= v && v <= r) || (r <= v && v <= l); }
export function pad(n, digit){ return `0000000000${n}`.slice(-digit); }
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
export function interpret(date, time, [i, j]=[0, 0]) {
  date = new Date(new Date(date).getTime() + 86400000*j);
  time = (time + i) * 15;
  return [date.getFullYear(), date.getMonth()+1, date.getDate(), dayOfWeek[date.getDay()], parseInt(time / 60), time % 60];
}
export function cast(table, d1, t1, d2, t2, duration) {
  if (table[0].length === 7 && new Date(d1).getDay() === 0 && t1[0] === defaultTime[0] && t1[1] === defaultTime[1]) {
    const day0 = new Date(d2).getDay();
    table = table.slice(t2[0] - t1[0], t2[1] - t1[1] || undefined);
    table = table.map(row => new Array(duration).fill(day0).map((e, i) => row[(e+i) % 7]));
    return table;
  }
}