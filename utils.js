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
  [`SELECT n.oid,n.*,d.description FROM pg_catalog.pg_namespace n LEFT OUTER JOIN pg_catalog.pg_description d ON d.objoid=n.oid AND d.objsubid=0 AND d.classoid='pg_namespace' WHERE nspname=$1 ORDER BY nspname`.toLowerCase()]:{
    fields:[
      { name: '_oid', tableID: 0, columnID: 0, dataTypeID: 23 , dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'oid', tableID: 0, columnID: 0, dataTypeID: 23 , dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'nspname', tableID: 0, columnID: 0, dataTypeID: 25 , dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'nspowner', tableID: 0, columnID: 0, dataTypeID: 23 , dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'nspacl', tableID: 0, columnID: 0, dataTypeID: 25 , dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'description', tableID: 0, columnID: 0, dataTypeID: 25 , dataTypeSize: -1, dataTypeModifier: -1, mode: 0 }
    ],
    data:[
      ['2200','2200','public','10', '{test=UC/test,=U/test}', null]
    ]
  },
  //returns list of schema
  [`SELECT n.oid,n.*,d.description FROM pg_catalog.pg_namespace n LEFT OUTER JOIN pg_catalog.pg_description d ON d.objoid=n.oid AND d.objsubid=0 AND d.classoid='pg_namespace' ORDER BY nspname`.toLowerCase()]:{
    fields:[
      { name: '_oid', tableID: 0, columnID: 0, dataTypeID: 23 , dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'oid', tableID: 0, columnID: 0, dataTypeID: 23 , dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'nspname', tableID: 0, columnID: 0, dataTypeID: 25 , dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'nspowner', tableID: 0, columnID: 0, dataTypeID: 23 , dataTypeSize: 4, dataTypeModifier: -1, mode: 0 },
      { name: 'nspacl', tableID: 0, columnID: 0, dataTypeID: 25 , dataTypeSize: -1, dataTypeModifier: -1, mode: 0 },
      { name: 'description', tableID: 0, columnID: 0, dataTypeID: 25 , dataTypeSize: -1, dataTypeModifier: -1, mode: 0 }
    ],
    data:[
      ['13000','13000','information_schema','10', '{test=UC/test,=U/test}', null],
      ['11','11','pg_catalog','10', '{test=UC/test,=U/test}', null],
      ['2200','2200','public','10', '{test=UC/test,=U/test}', null]
    ]
  },
  [`SHOW search_path`.toLowerCase()]:{
    fields:[{ name: 'setting', tableID: 0, columnID: 0, dataTypeID: 25 , dataTypeSize: -1, dataTypeModifier: -1, mode: 0 }],
    data:[]
  },
  [`SELECT db.oid,db.* FROM pg_catalog.pg_database db WHERE datname=$1`.toLowerCase()]:{
    fields:[],
    data:[]
  },
  [`SELECT 1 FROM pg_catalog.pg_attribute s JOIN pg_catalog.pg_class p ON s.attrelid = p.oid JOIN pg_catalog.pg_namespace n ON p.relnamespace = n.oid WHERE p.relname = 'pg_type' AND n.nspname = 'pg_catalog' AND s.attname = 'typcategory'`.toLowerCase()]:{
    fields:[{ name: 'Int64(1)', tableID: 0, columnID: 0, dataTypeID: 20 , dataTypeSize: 8, dataTypeModifier: -1, mode: 0 }],
    data:[]
  },
  [`SELECT version()`.toLowerCase()]:{
    fields:[{ name: 'version()', tableID: 0, columnID: 0, dataTypeID: 25 , dataTypeSize: -1, dataTypeModifier: -1, mode: 0 }],
    data:[
      ['Monitor Backend 1.0']
    ]
  },
  [`SELECT t.oid,t.*,c.relkind,NULL as base_type_name, d.description FROM pg_catalog.pg_type t LEFT OUTER JOIN pg_catalog.pg_class c ON c.oid=t.typrelid LEFT OUTER JOIN pg_catalog.pg_description d ON t.oid=d.objoid WHERE t.typname IS NOT NULL AND (c.relkind IS NULL OR c.relkind = 'c')`.toLowerCase()]:{
    fields:[],
    data:[]
  },
  //returns list of tables
  [`SELECT c.oid,c.*,d.description FROM pg_catalog.pg_class c LEFT OUTER JOIN pg_catalog.pg_description d ON d.objoid=c.oid AND d.objsubid=0 AND d.classoid='pg_class'WHERE c.relnamespace=$1 AND c.relkind not in ('i','I','c')`.toLowerCase()]:{
    fields:[],
    data:[]
  }
}

function properQuery(query) {
  return query.replace(/\n/ig,' ').replace(/\r/ig,' ').replace(/::regclass /ig,'')
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
    throw new Error(`Unknown query "${rawQuery}"`);
  }
  // return parsedQuery.columns.map(f => {
  //   return {
  //     name: f.as || (f.expr.name + ((f.expr.type === 'function') && ('(' + f.expr.args.value.join(',') + ')')) || ''),
  //     tableID: 0,//(f.expr.type === 'column_ref' && f.expr.table) || null,
  //     columnID: 0,
  //     dataTypeID: 25,
  //     dataTypeSize: -1,
  //     dataTypeModifier: -1,
  //     mode: 0
  //   }
  // });
}

function getData(rawQuery, parsedQuery) {
  if (fixedFieldsAndData[rawQuery.toLowerCase()]) {
    if (fixedFieldsAndData[rawQuery.toLowerCase()].data) {
      return fixedFieldsAndData[rawQuery.toLowerCase()].data;
    } else {
      throw new Error(`data details not defined for query "${rawQuery}"`);
    }
  } else {
    throw new Error(`Unknown query "${rawQuery}"`);
  }
}

module.exports = {
  readStringFromBuffer,
  readStringFromBufferLength,
  getFieldDetails,
  getData,
  properQuery
}