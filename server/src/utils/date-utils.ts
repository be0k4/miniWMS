/**
 * Date拡張
 */

/**
 * 日付を日本語形式の文字列に変換する
 * @param date 日付オブジェクト
 * @param millisecond ミリ秒まで表示するかどうか
 * @returns 日本語形式の文字列
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

/**
 * 日付を日本時間に変換する
 * @param date 日付オブジェクト
 * @returns 日本時間の日付オブジェクト
 */
export function toJTC(date: Date): Date {
  return new Date(date.getTime() + 1000 * 60 * 60 * 9);
}

/**
 * 日付をHHMMSS形式の文字列に変換する
 * @param date 日付オブジェクト
 * @param millisecond ミリ秒まで表示するかどうか
 * @returns HHMMSS形式の文字列
 */
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

/**
 * 日付をYYYYMMDD形式の文字列に変換する
 * @param date 日付オブジェクト
 * @returns YYYYMMDD形式の文字列
 */
export function toYYYYMMDD(date: Date): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString();
  const d = date.getDate().toString();
  return year + month.padStart(2, '0') + d.padStart(2, '0');
}
