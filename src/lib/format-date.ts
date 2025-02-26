const plurals = new Intl.PluralRules('en-US', { type: 'ordinal' });
const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
});

const suffixes = new Map([
  ['one', 'st'],
  ['two', 'nd'],
  ['few', 'rd'],
  ['other', 'th'],
]);

export function formatDateWithOrdinal(date: Date) {
  const day = date.getDate();
  const suffix = suffixes.get(plurals.select(day));

  return `${formatter.format(date)}${suffix}`;
}
