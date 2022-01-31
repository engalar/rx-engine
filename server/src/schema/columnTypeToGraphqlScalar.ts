import { ColumnType } from '../meta/meta-interface/column-type';

export function columnTypeToGraphqlScalar(columnType: ColumnType) {
  switch (columnType) {
    case ColumnType.Number:
      return 'Int';
    case ColumnType.Boolean:
      return 'Boolean';
    case ColumnType.String:
    case ColumnType.Text:
    case ColumnType.MediumText:
    case ColumnType.LongText:
      return 'String';
    case ColumnType.Enum:
      return 'String';
    case ColumnType.Date:
      return 'Date';
    case ColumnType.SimpleJson:
    case ColumnType.SimpleArray:
    case ColumnType.JsonArray:
      return 'JSON';

    default:
      throw new Error('can not find column type:' + columnType);
  }
}
