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
// export const ROW = new Array(12 * 4).fill(0).map((e, i) => i);
// export const COL = new Array(7).fill(0).map((e, i) => i);
export const dayOfWeek = "Sun Mon Tue Wed Thu Fri Sat".split(" ");