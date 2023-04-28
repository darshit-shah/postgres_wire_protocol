const fixedFieldsAndData = {
  [`SELECT current_schema(),session_user`.toLowerCase()]: {
    fields: [
      { name: 'current_schema()', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'session_user()', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 }
    ],
    data: [
      ['public', 'system_user']
    ]
  },
  //returns current schema
  [`SELECT n.oid,n.*,d.description FROM pg_catalog.pg_namespace n LEFT OUTER JOIN pg_catalog.pg_description d ON d.objoid=n.oid AND d.objsubid=0 AND d.classoid='pg_namespace' WHERE nspname=$1 ORDER BY nspname`.toLowerCase()]: {
    fields: [
      { name: '_oid', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'oid', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'nspname', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'nspowner', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'nspacl', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'description', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 }
    ],
    data: [
      ['2200', '2200', 'public', '10', '{test=UC/test,=U/test}', null]
    ]
  },
  //returns list of schema
  [`SELECT n.oid,n.*,d.description FROM pg_catalog.pg_namespace n LEFT OUTER JOIN pg_catalog.pg_description d ON d.objoid=n.oid AND d.objsubid=0 AND d.classoid='pg_namespace' ORDER BY nspname`.toLowerCase()]: {
    fields: [
      { name: '_oid', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'oid', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'nspname', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'nspowner', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'nspacl', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'description', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 }
    ],
    data: [
      ['13000', '13000', 'information_schema', '10', '{test=UC/test,=U/test}', null],
      ['11', '11', 'pg_catalog', '10', '{test=UC/test,=U/test}', null],
      ['2200', '2200', 'public', '10', '{test=UC/test,=U/test}', null]
    ]
  },
  [`SHOW search_path`.toLowerCase()]: {
    fields: [{ name: 'setting', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 }],
    data: []
  },
  [`SELECT db.oid,db.* FROM pg_catalog.pg_database db WHERE datname=$1`.toLowerCase()]: {
    fields: [],
    data: []
  },
  [`SELECT 1 FROM pg_catalog.pg_attribute s JOIN pg_catalog.pg_class p ON s.attrelid = p.oid JOIN pg_catalog.pg_namespace n ON p.relnamespace = n.oid WHERE p.relname = 'pg_type' AND n.nspname = 'pg_catalog' AND s.attname = 'typcategory'`.toLowerCase()]: {
    fields: [{ name: 'Int64(1)', tableID: 0, columnID: 0, dataTypeID: 20, dataTypeSize: 8, dataTypeModifier: -1, mode: 0 }],
    data: []
  },
  [`SELECT version()`.toLowerCase()]: {
    fields: [{ name: 'version()', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 }],
    data: [
      ['Monitor Backend 1.0']
    ]
  },
  [`SELECT t.oid,t.*,c.relkind,NULL as base_type_name, d.description FROM pg_catalog.pg_type t LEFT OUTER JOIN pg_catalog.pg_class c ON c.oid=t.typrelid LEFT OUTER JOIN pg_catalog.pg_description d ON t.oid=d.objoid WHERE t.typname IS NOT NULL AND (c.relkind IS NULL OR c.relkind = 'c')`.toLowerCase()]: {
    fields: [],
    data: []
  },
  [`SELECT c.oid,c.*,d.description FROM pg_catalog.pg_class c LEFT OUTER JOIN pg_catalog.pg_description d ON d.objoid=c.oid AND d.objsubid=0 AND d.classoid='pg_class'WHERE c.relnamespace=$1 AND c.relkind not in ('i','I','c')`.toLowerCase()]: {
    fields: [],
    data: []
  },
  [`/*** Load all supported types ***/ SELECT ns.nspname, a.typname, a.oid, a.typrelid, a.typbasetype, CASE WHEN pg_proc.proname='array_recv' THEN 'a' ELSE a.typtype END AS type, CASE WHEN pg_proc.proname='array_recv' THEN a.typelem ELSE 0 END AS elemoid, CASE WHEN pg_proc.proname IN ('array_recv','oidvectorrecv') THEN 3 /* Arrays last */ WHEN a.typtype='r' THEN 2 /* Ranges before */ WHEN a.typtype='d' THEN 1 /* Domains before */ ELSE 0 /* Base types first */ END AS ord FROM pg_type AS a JOIN pg_namespace AS ns ON (ns.oid = a.typnamespace) JOIN pg_proc ON pg_proc.oid = a.typreceive LEFT OUTER JOIN pg_class AS cls ON (cls.oid = a.typrelid) LEFT OUTER JOIN pg_type AS b ON (b.oid = a.typelem) LEFT OUTER JOIN pg_class AS elemcls ON (elemcls.oid = b.typrelid) WHERE a.typtype IN ('b', 'r', 'e', 'd') OR /* Base, range, enum, domain */ (a.typtype = 'c' AND cls.relkind='c') OR /* User-defined free-standing composites (not table composites) by default */ (pg_proc.proname='array_recv' AND ( b.typtype IN ('b', 'r', 'e', 'd') OR /* Array of base, range, enum, domain */ (b.typtype = 'p' AND b.typname IN ('record', 'void')) OR /* Arrays of special supported pseudo-types */ (b.typtype = 'c' AND elemcls.relkind='c') /* Array of user-defined free-standing composites (not table composites) */ )) OR (a.typtype = 'p' AND a.typname IN ('record', 'void')) /* Some special supported pseudo-types */ ORDER BY ord`.toLowerCase()]: {
    fields: [
      { name: 'nspname', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'typname', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'oid', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'typrelid', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'typbasetype', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'type', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'elemoid', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'ord', tableID: 0, columnID: 0, dataTypeID: 20, dataTypeSize: 8, dataTypeModifier: -1, mode: 0 }
    ],
    data: [
      ['pg_catalog', 'float8', '701', '0', '0', 'b', '0', '0'],
      ['pg_catalog', 'int8', '20', '0', '0', 'b', '0', '0'],
      ['pg_catalog', 'int4', '23', '0', '0', 'b', '0', '0'],
      ['pg_catalog', 'timestamp', '1114', '0', '0', 'b', '0', '0'],
      ['pg_catalog', 'varchar', '1043', '0', '0', 'b', '0', '0'],
      ['pg_catalog', 'float4', '700', '0', '0', 'b', '0', '0'],
      ['pg_catalog', 'text', '25', '0', '0', 'b', '0', '0'],
      ['pg_catalog', 'numeric', '1700', '0', '0', 'b', '0', '0'],
      ['pg_catalog', 'bool', '16', '0', '0', 'b', '0', '0']
    ]
  },
  [`/*** Load field definitions for (free-standing) composite types ***/ SELECT typ.oid, att.attname, att.atttypid FROM pg_type AS typ JOIN pg_namespace AS ns ON (ns.oid = typ.typnamespace) JOIN pg_class AS cls ON (cls.oid = typ.typrelid) JOIN pg_attribute AS att ON (att.attrelid = typ.typrelid) WHERE (typ.typtype = 'c' AND cls.relkind='c') AND attnum > 0 AND /* Don't load system attributes */ NOT attisdropped ORDER BY typ.oid, att.attnum`.toLowerCase()]: {
    fields: [
      { name: 'oid', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'attname', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'atttypid', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 0 }
    ],
    data: []
  },
  [`select character_set_name from INFORMATION_SCHEMA.character_sets`.toLowerCase()]: {
    fields: [
      { name: 'character_set_name', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
    ],
    data: [
      ['UTF8']
    ]
  }
}

const cubes = [{
  schema: 'BASE_CUBES',
  name: 'base_cube_1',
  dimensions: [
    { type: 'dimension', name: 'dimension_11' },
    { type: 'dimension', name: 'dimension_12' },
    { type: 'dimension', name: 'dimension_13' }
  ],
  kpis: [
    { type: 'kpi', name: 'kpi_11' },
    { type: 'kpi', name: 'kpi_12' },
    { type: 'kpi', name: 'kpi_13' }
  ]
}, {
  schema: 'BASE_CUBES',
  name: 'base_cube_2',
  dimensions: [
    { type: 'dimension', name: 'dimension_21' },
    { type: 'dimension', name: 'dimension_22' },
    { type: 'dimension', name: 'dimension_23' }
  ],
  kpis: [
    { type: 'kpi', name: 'kpi_21' },
    { type: 'kpi', name: 'kpi_22' },
    { type: 'kpi', name: 'kpi_23' }
  ]
}, {
  schema: 'DERIVED_CUBES',
  name: 'derived_cube_3',
  dimensions: [
    { type: 'dimension', name: 'dimension_31' },
    { type: 'dimension', name: 'dimension_32' },
    { type: 'dimension', name: 'dimension_33' }
  ],
  kpis: [
    { type: 'kpi', name: 'kpi_31' },
    { type: 'kpi', name: 'kpi_32' },
    { type: 'kpi', name: 'kpi_33' }
  ]
}];

fixedFieldsAndData[`select TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE from INFORMATION_SCHEMA.tables where TABLE_SCHEMA not in ('information_schema', 'pg_catalog') order by TABLE_SCHEMA, TABLE_NAME`.toLowerCase()] = {
  fields: [
    { name: 'table_schema', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
    { name: 'table_name', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
    { name: 'table_type', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 }
  ],
  data: cubes.map(c => [c.schema, c.name, 'BASE TABLE'])
}

cubes.forEach(c => {
  fixedFieldsAndData[`select COLUMN_NAME, ORDINAL_POSITION, IS_NULLABLE, case when (data_type like '%unsigned%') then DATA_TYPE || ' unsigned' else DATA_TYPE end as DATA_TYPE from INFORMATION_SCHEMA.columns where TABLE_SCHEMA = '${c.schema}' and TABLE_NAME = '${c.name}' order by TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION`.toLowerCase()] = {
    fields: [
      { name: 'column_name', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'ordinal_position', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 1 },
      { name: 'is_nullable', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'DATA_TYPE', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 }
    ],
    data: [...c.dimensions, ...c.kpis].map((d, i) => [d.name, 2 + i, 'YES', d.type === 'dimension' ? 'text' : 'numeric'])
  };
  fixedFieldsAndData[`select pkcol.COLUMN_NAME as PK_COLUMN_NAME, fkcol.TABLE_SCHEMA AS FK_TABLE_SCHEMA, fkcol.TABLE_NAME AS FK_TABLE_NAME, fkcol.COLUMN_NAME as FK_COLUMN_NAME, fkcol.ORDINAL_POSITION as ORDINAL, fkcon.CONSTRAINT_SCHEMA || '_' || fkcol.TABLE_NAME || '_' || '${c.name}' || '_' || fkcon.CONSTRAINT_NAME as FK_NAME from (select distinct constraint_catalog, constraint_schema, unique_constraint_schema, constraint_name, unique_constraint_name from INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS) fkcon inner join INFORMATION_SCHEMA.KEY_COLUMN_USAGE fkcol on fkcon.CONSTRAINT_SCHEMA = fkcol.CONSTRAINT_SCHEMA and fkcon.CONSTRAINT_NAME = fkcol.CONSTRAINT_NAME inner join INFORMATION_SCHEMA.KEY_COLUMN_USAGE pkcol on fkcon.UNIQUE_CONSTRAINT_SCHEMA = pkcol.CONSTRAINT_SCHEMA and fkcon.UNIQUE_CONSTRAINT_NAME = pkcol.CONSTRAINT_NAME where pkcol.TABLE_SCHEMA = '${c.schema}' and pkcol.TABLE_NAME = '${c.name}' and pkcol.ORDINAL_POSITION = fkcol.ORDINAL_POSITION order by FK_NAME, fkcol.ORDINAL_POSITION`.toLowerCase()] = {
    fields: [
      { name: 'PK_COLUMN_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'FK_TABLE_SCHEMA', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'FK_TABLE_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'FK_COLUMN_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'ORDINAL', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 1 },
      { name: 'FK_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 }
    ],
    data: []
  };
  fixedFieldsAndData[`select pkcol.TABLE_SCHEMA AS PK_TABLE_SCHEMA, pkcol.TABLE_NAME AS PK_TABLE_NAME, pkcol.COLUMN_NAME as PK_COLUMN_NAME, fkcol.COLUMN_NAME as FK_COLUMN_NAME, fkcol.ORDINAL_POSITION as ORDINAL, fkcon.CONSTRAINT_SCHEMA || '_' || '${c.name}' || '_' || pkcol.TABLE_NAME || '_' || fkcon.CONSTRAINT_NAME as FK_NAME from (select distinct constraint_catalog, constraint_schema, unique_constraint_schema, constraint_name, unique_constraint_name from INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS) fkcon inner join INFORMATION_SCHEMA.KEY_COLUMN_USAGE fkcol on fkcon.CONSTRAINT_SCHEMA = fkcol.CONSTRAINT_SCHEMA and fkcon.CONSTRAINT_NAME = fkcol.CONSTRAINT_NAME inner join INFORMATION_SCHEMA.KEY_COLUMN_USAGE pkcol on fkcon.UNIQUE_CONSTRAINT_SCHEMA = pkcol.CONSTRAINT_SCHEMA and fkcon.UNIQUE_CONSTRAINT_NAME = pkcol.CONSTRAINT_NAME where fkcol.TABLE_SCHEMA = '${c.schema}' and fkcol.TABLE_NAME = '${c.name}' and pkcol.ORDINAL_POSITION = fkcol.ORDINAL_POSITION order by FK_NAME, fkcol.ORDINAL_POSITION`.toLowerCase()] = {
    fields: [
      { name: 'PK_TABLE_SCHEMA', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'PK_TABLE_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'PK_COLUMN_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'FK_COLUMN_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'ORDINAL', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 1 },
      { name: 'FK_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 }
    ],
    data: []
  };
  fixedFieldsAndData[`select i.CONSTRAINT_SCHEMA || '_' || i.CONSTRAINT_NAME as INDEX_NAME, ii.COLUMN_NAME, ii.ORDINAL_POSITION, case when i.CONSTRAINT_TYPE = 'PRIMARY KEY' then 'Y' else 'N' end as PRIMARY_KEY from INFORMATION_SCHEMA.table_constraints i inner join INFORMATION_SCHEMA.key_column_usage ii on i.CONSTRAINT_SCHEMA = ii.CONSTRAINT_SCHEMA and i.CONSTRAINT_NAME = ii.CONSTRAINT_NAME and i.TABLE_SCHEMA = ii.TABLE_SCHEMA and i.TABLE_NAME = ii.TABLE_NAME where i.TABLE_SCHEMA = '${c.schema}' and i.TABLE_NAME = '${c.name}' and i.CONSTRAINT_TYPE in ('PRIMARY KEY', 'UNIQUE') order by i.CONSTRAINT_SCHEMA || '_' || i.CONSTRAINT_NAME, ii.TABLE_SCHEMA, ii.TABLE_NAME, ii.ORDINAL_POSITION`.toLowerCase()] = {
    fields: [
      { name: 'INDEX_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'COLUMN_NAME', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 },
      { name: 'ORDINAL_POSITION', tableID: 0, columnID: 0, dataTypeID: 23, dataTypeSize: 4, dataTypeModifier: -1, mode: 1 },
      { name: 'PRIMARY_KEY', tableID: 0, columnID: 0, dataTypeID: 25, dataTypeSize: -1, dataTypeModifier: -1, mode: 1 }
    ],
    data: []
  }
});

function properQuery(query) {
  return query.replace(/\n/ig, ' ')
    .replace(/\r/ig, ' ')
    .replace(/\t/ig, ' ')
    .replace(/::regclass /ig, '')
    .replace(/"\$Table"./ig, '')
    .replace(/"_"./ig, '')
    .replace(/  +/ig, ' ')
    .replace(/ \) where /ig, ' ) "_alias_where" where ')
    .replace(/ \) order /ig, ' ) "_alias_order" order ')
    .trim();
}

function readStringFromBuffer(data, start) {
  let end = start;
  while (data[end] !== 0 && end < data.length) {
    end++;
  }
  return data.toString("UTF8", start, end);
}

function readStringFromBufferLength(data, start, len) {
  return data.toString("UTF8", start, start + len);
}

function getFieldDetails(rawQuery, parsedQuery) {
  if (fixedFieldsAndData[rawQuery.toLowerCase()]) {
    if (fixedFieldsAndData[rawQuery.toLowerCase()].data) {
      return fixedFieldsAndData[rawQuery.toLowerCase()].fields
    } else {
      throw new Error(`Field details not defined for query "${rawQuery}"`)
    }
  } else {
    if (parsedQuery.from && parsedQuery.from.length === 1 && parsedQuery.from[0]) {
      const parsedQueryStack = [];
      while (parsedQuery.from && parsedQuery.from.length === 1 && parsedQuery.from[0] && parsedQuery.from[0].expr) {
        parsedQueryStack.push(parsedQuery);
        parsedQuery = parsedQuery.from[0].expr.ast;
      }
      if (parsedQuery.from[0].db != null) {
        const filteredSchema = cubes.filter(c => c.schema.toLowerCase() === parsedQuery.from[0].db.toLowerCase());
        if (filteredSchema.length > 0) {
          if (parsedQuery.from[0].table != null) {
            const filteredCube = filteredSchema.filter(c => c.name.toLowerCase() === parsedQuery.from[0].table.toLowerCase())[0];
            if (filteredCube) {
              let columns = parsedQuery.columns.map((c, ci) => {
                let expr = c.expr;
                let alias = c.as;
                while (expr.expr || expr.args && expr.args.expr) {
                  if (expr.expr) {
                    expr = expr.expr;
                  } else if (expr.args.expr) {
                    expr = expr.args.expr;
                  }
                }
                const fieldName = expr.column || expr.value;
                const filteredField = [...filteredCube.dimensions, ...filteredCube.kpis].filter(f => f.name === fieldName)[0];
                if (filteredField) {
                  return {
                    name: alias || fieldName,
                    tableID: 0,
                    columnID: 0,
                    dataTypeID: filteredField.type === 'dimension' ? 25 : 701,
                    dataTypeSize: filteredField.type === 'dimension' ? -1 : 8,
                    dataTypeModifier: -1,
                    mode: 1
                  }
                } else {
                  throw new Error(`Column "${fieldName}" is not available within Cube "${parsedQuery.from[0].db}"."${parsedQuery.from[0].table}".`);
                }
              });
              while (parsedQueryStack.length > 0) {
                const latestParseQuery = parsedQueryStack.pop();
                columns = columns.filter(c => {
                  let matchingLatestColumn = null;
                  latestParseQuery.columns.some(pc => {
                    let expr = pc.expr;
                    while (expr.expr || expr.args && expr.args.expr) {
                      if (expr.expr) {
                        expr = expr.expr;
                      } else if (expr.args.expr) {
                        expr = expr.args.expr;
                      }
                    }
                    if (expr.column === c.name) {
                      matchingLatestColumn = pc;
                      return true;
                    } else {
                      return false;
                    }
                  })
                  if (matchingLatestColumn) {
                    c.originalName=c.name;
                    c.name = matchingLatestColumn.as || matchingLatestColumn.expr.column;
                    return true;
                  } else {
                    return false;
                  }
                })
                console.log(latestParseQuery)
              }
              return columns;
            } else {
              throw new Error(`Cube "${parsedQuery.from[0].table}" is not available within Schema "${parsedQuery.from[0].db}"`);
            }
          } else {
            throw new Error(`Cube name not provided for query "${rawQuery}"`);
          }
        } else {
          throw new Error(`Schema "${parsedQuery.from[0].db}" is not available`);
        }
      } else {
        throw new Error(`Schema not provided for query "${rawQuery}"`);
      }
    }
    throw new Error(`Unknown query "${rawQuery}"`);
  }
}

function getData(fieldDetails, rawQuery, parsedQuery) {
  if (fixedFieldsAndData[rawQuery.toLowerCase()]) {
    if (fixedFieldsAndData[rawQuery.toLowerCase()].data) {
      return fixedFieldsAndData[rawQuery.toLowerCase()].data;
    } else {
      throw new Error(`data details not defined for query "${rawQuery}"`);
    }
  } else {
    return (new Array(Math.floor(5 + Math.random() * 10)).fill([])).map(record => {
      return fieldDetails.map((f,i)=>{
        return f.dataTypeID === 25 ? `${f.originalName || f.name}_${Math.floor(10000 + (1000 * i) + Math.random() * 900)}` : 10000 + (1000 * i) + Math.random() * 900;
      });
    });
  }
}

module.exports = {
  readStringFromBuffer,
  readStringFromBufferLength,
  getFieldDetails,
  getData,
  properQuery
}