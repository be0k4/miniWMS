/**
 * Date拡張
 */

export function toJapaneseString(
  date: Date,
  millisecond: boolean = false,
): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString();
  const d = date.getDate().toString();
  const hours = date.getHours().toString();
  const minutes = date.getMinutes().toString();
  const seconds = date.getSeconds().toString();
  const milliseconds = date.getMilliseconds().toString();

  if (millisecond) {
    return (
      year +
      '/' +
      month.padStart(2, '0') +
      '/' +
      d.padStart(2, '0') +
      ' ' +
      hours.padStart(2, '0') +
      ':' +
      minutes.padStart(2, '0') +
      ':' +
      seconds.padStart(2, '0') +
      '.' +
      milliseconds.padStart(3, '0')
    );
  }

  return (
    year +
    '/' +
    month.padStart(2, '0') +
    '/' +
    d.padStart(2, '0') +
    ' ' +
    hours.padStart(2, '0') +
    ':' +
    minutes.padStart(2, '0') +
    ':' +
    seconds.padStart(2, '0')
  );
}

export function toJTC(date: Date): Date {
  return new Date(date.getTime() + 1000 * 60 * 60 * 9);
}

export function toHHMMSS(date: Date, millisecond: boolean = false): string {
  const hours = date.getHours().toString();
  const minutes = date.getMinutes().toString();
  const seconds = date.getSeconds().toString();
  const milliseconds = date.getMilliseconds().toString();
  return (
    hours.padStart(2, '0') +
    minutes.padStart(2, '0') +
    seconds.padStart(2, '0') +
    (millisecond ? milliseconds.padStart(3, '0') : '')
  );
}

export function toYYYYMMDD(date: Date): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString();
  const d = date.getDate().toString();
  return year + month.padStart(2, '0') + d.padStart(2, '0');
}
