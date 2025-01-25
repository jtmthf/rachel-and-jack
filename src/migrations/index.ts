import * as migration_20250124_011200 from './20250124_011200';

export const migrations = [
  {
    up: migration_20250124_011200.up,
    down: migration_20250124_011200.down,
    name: '20250124_011200',
  },
];
