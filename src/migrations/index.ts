import * as migration_20250124_011200 from './20250124_011200';
import * as migration_20250125_183659 from './20250125_183659';

export const migrations = [
  {
    up: migration_20250124_011200.up,
    down: migration_20250124_011200.down,
    name: '20250124_011200',
  },
  {
    up: migration_20250125_183659.up,
    down: migration_20250125_183659.down,
    name: '20250125_183659',
  },
];
