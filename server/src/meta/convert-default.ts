import { ColumnMeta } from './meta-interface/column-meta';
import { ColumnType } from './meta-interface/column-type';

export function convertDefault(column: ColumnMeta) {
  if (column.type === ColumnType.Boolean) {
    if (column.default === 'false') {
      return false;
    }

    if (column.default === 'true') {
      return true;
    }
  }

  return column.default;
}
