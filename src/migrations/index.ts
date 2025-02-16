import * as migration_20250124_011200 from './20250124_011200';
import * as migration_20250125_183659 from './20250125_183659';
import * as migration_20250125_210350 from './20250125_210350';
import * as migration_20250125_225743 from './20250125_225743';
import * as migration_20250126_004825 from './20250126_004825';
import * as migration_20250129_034745 from './20250129_034745';
import * as migration_20250130_012223 from './20250130_012223';
import * as migration_20250216_212026 from './20250216_212026';

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
  {
    up: migration_20250125_210350.up,
    down: migration_20250125_210350.down,
    name: '20250125_210350',
  },
  {
    up: migration_20250125_225743.up,
    down: migration_20250125_225743.down,
    name: '20250125_225743',
  },
  {
    up: migration_20250126_004825.up,
    down: migration_20250126_004825.down,
    name: '20250126_004825',
  },
  {
    up: migration_20250129_034745.up,
    down: migration_20250129_034745.down,
    name: '20250129_034745',
  },
  {
    up: migration_20250130_012223.up,
    down: migration_20250130_012223.down,
    name: '20250130_012223',
  },
  {
    up: migration_20250216_212026.up,
    down: migration_20250216_212026.down,
    name: '20250216_212026',
  },
];
