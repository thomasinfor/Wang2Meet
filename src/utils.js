export function inRange(v, l, r){ return (l <= v && v <= r) || (r <= v && v <= l); }
export function pad(n, digit){ return `0000000000${n}`.slice(-digit); }
export class Time{
  constructor(i, j) {
    this.hour = parseInt(i / 4);
    this.section = i % 4;
    this.minute = this.section * 15;
    this.week = j + 1;
    this.timeStr = `${pad(this.hour, 2)}:${pad(this.minute, 2)}`
  }
}
export const dayOfWeek = "Sun Mon Tue Wed Thu Fri Sat".split(" ");
export function dump(table) { return table.map(r => r.map(e => e ? "1" : "0").join('')).join('\n'); }
export function parse(str) { return str.split('\n').map(r => r.split('').map(e => e === "1")); }
export function colorScale(c, r) { return '#' + [c.slice(1,3), c.slice(3, 5), c.slice(5, 7)].map(
  e => ("0" + parseInt(parseInt(e, 16) * r + 255 * (1-r)).toString(16).toUpperCase()).slice(-2)
).join(''); }