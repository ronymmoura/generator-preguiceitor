(function() {
    'use strict';

    var mysql   = require('mysql'),
        config  = {},
	    tables	= [],
        conn;

    var database = {
        setConfig: function(_config) {
            config = _config.default;
            conn = mysql.createConnection({
                host: config.database.host,
                user: config.database.username,
                password: config.database.password,
                database: config.database.name
             });

             conn.connect();
        },

        getTables: function(callback) {
            conn.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" + config.database.name + "' ORDER BY TABLE_NAME", (err, rows, fields) => {
                if(err) throw err;

                rows.forEach((row, index) => {

                    let isLastTable = ((index+1) == rows.length);
                    var tableObj = {
                        name: row.TABLE_NAME,
                        columns: [],
                        fks: []
                    };
                        
                    getColumns(tableObj, (table) => {
                        if(config.preguiceitor.excluded.indexOf(row.TABLE_NAME) == -1)
                            tables.push(table);
                        
                        if(isLastTable) {
                            conn.end();
                            callback(tables);
                        }
                    });
                });
            });
        },

        getTable: function(tableName, callback) {
            conn.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" + config.database.name + "' AND TABLE_NAME = '" + tableName + "' ORDER BY TABLE_NAME", (err, rows, fields) => {
                if(err) throw err;

                rows.forEach((table, index) => {

                    var tableObj = {
                        name: tableName,
                        columns: [],
                        fks: []
                    };

                    if(config.preguiceitor.excluded.indexOf(tableName) == -1) {
                        getColumns(tableObj, (table) => {
                            conn.end();
                            callback(table);
                        });
                    }
                });
            });
        }
    };

    function getColumns(table, callback) {
        conn.query("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + config.database.name + "' " +
                   "AND TABLE_NAME = '" + table.name + "' ORDER BY ORDINAL_POSITION", (err, rows, fields) => {
            if(err) throw err;
                
            for(var column of rows) {
                table.columns.push({
                    name: column.COLUMN_NAME,
                    type: translateType(column.DATA_TYPE),
                    seqType: translateSeqType(column),
                    isNullable: column.IS_NULLABLE === 'YES',
                    defaultValue: column.COLUMN_DEFAULT
                });
            }

            getFKs(table, callback);
        });

    }

    function getFKs(table, callback) {
        conn.query("SELECT TC.CONSTRAINT_NAME, " +
                   "    KCU.COLUMN_NAME, " +
                   "    KCU.REFERENCED_TABLE_NAME AS FOREIGN_TABLE_NAME, " +
                   "    KCU.REFERENCED_COLUMN_NAME AS FOREIGN_COLUMN_NAME " +
                   "FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC " +
                   "INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU ON KCU.CONSTRAINT_NAME = TC.CONSTRAINT_NAME " +
                   "WHERE TC.CONSTRAINT_SCHEMA = '" + config.database.name + "' " +
                   "AND TC.TABLE_NAME = '" + table.name + "' " +
                   "AND TC.CONSTRAINT_TYPE = 'FOREIGN KEY' " +
                   "ORDER BY ORDINAL_POSITION", (err, rows, fields) => {
            if(err) throw err;
            
            for(var fk of rows) {
                table.fks.push({
                    column: fk.COLUMN_NAME,
                    table: fk.FOREIGN_TABLE_NAME
                });
            }

            callback(table);
        });
    }

    function translateType(type) {
        switch(type) {
            case 'varchar': 
            case 'text':
                return 'string';
            case 'date':
            case 'datetime':
                return 'Date';
            case 'int':
            case 'numeric':
            case 'bigint':
            case 'float':
                return 'number';
            case 'bit':
            case 'tinyint':
                return 'boolean';
            default:
                throw 'Type not reconized: ' + type;
        }
    }

    function translateSeqType(column) {
        switch(column.DATA_TYPE) {
            case 'varchar': 
            case 'text':
                return 'Sequelize.STRING';
            case 'date':
            case 'datetime':
                return 'Sequelize.STRING';
            case 'bit':
            case 'tinyint':
                return 'Sequelize.BOOLEAN';
            case 'bigint':
                return 'Sequelize.BIGINT';
            case 'float':
                return 'Sequelize.FLOAT';
            case 'numeric':
            case 'int':
                if(column.COLUMN_NAME.toLowerCase() == 'id')
                    return 'DataDefinitions.ID_DEFINITION';
                else
                    return 'Sequelize.INTEGER';
            default:
                throw 'Type not reconized: ' + column.DATA_TYPE;
        }
    }

    module.exports = database;

})();
