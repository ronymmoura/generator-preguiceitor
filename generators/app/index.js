'use strict';

var yeoman      = require('yeoman-generator'),
    pluralize   = require('pluralize'),
    chalk       = require('chalk'),
    yosay       = require('yosay'),
    path        = require('path'),
    mysql       = require('mysql'),
    fs          = require('fs'),
    database    = require('./database');

var PreguiceitorBase = yeoman.Base.extend({
    model: function () {
        if(this.config.default.projectType != 'api') {
            console.error(chalk.red('This project doesn\'t support this operation!'));
            return;
        }

        console.log('Generating models...');

        database.setConfig(this.config);

        database.getTables((tables) => {
            this._generateModel(tables);
        });
    },

    dao: function () {
        if(this.config.default.projectType != 'api') {
            console.error(chalk.red('This project doesn\'t support this operation!'));
            return;
        }

        database.setConfig(this.config);

        if(this.name == 'all') {
            console.log('Getting tables...');

            database.getTables((tables) => {
                for(var table of tables) {
                    console.log('Generating '+ table.name + 'DAO.ts...');
                    this._generateDao(table);
                }
            });
        } else {
            console.log('Generating '+ this.name + 'DAO.ts...');
            
            database.getTable(this.name, (table) => {
                this._generateDao(table);
            });
        }
    },

    service: function () {
        if(this.config.default.projectType != 'api') {
            console.error(chalk.red('This project doesn\'t support this operation!'));
            return;
        }

        database.setConfig(this.config);

        if(this.name == 'all') {
            console.log('Getting tables...');

            database.getTables((tables) => {
                for(var table of tables) {
                    console.log('Generating '+ table.name + 'Service.ts...');
                    this._generateService(table);
                }
            });
        } else {
            console.log('Generating '+ this.name + 'Service.ts...');
            
            database.getTable(this.name, (table) => {
                this._generateService(table);
            });
        }
    },

    page: function () {
        if(this.config.default.projectType != 'mobile' || this.config.default.projectType != 'desktop') {
            console.error(chalk.red('This project doesn\'t support this operation!'));
            return;
        }

        console.log('Generating page...');
    },

    // "Private"" methods

    _generateModel: function(tables) {
        this.fs.copyTpl(
            this.templatePath('Models.tt'),
            this.destinationPath('src/Data/Models.ts'),
            {
                tables: tables,
                belongsToMany: this.config.default.preguiceitor.belongsToMany,
                pluralize: pluralize
            }
        );
    },

    _generateIonicPage: function () {
        
    },

    _generateAngularPage: function () {

    },

    _generateDao: function (table) {
        this.fs.copyTpl(
            this.templatePath('DAO.tt'),
            this.destinationPath('src/data/dataAccess/' + table.name + 'DAO.ts'), 
            {
                table: table
            }
        );
    },

    _generateService: function (table) {
        this.fs.copyTpl(
            this.templatePath('Service.tt'),
            this.destinationPath('src/data/services/' + table.name + 'Service.ts'), 
            {
                table: table
            }
        );
    }
})

module.exports = PreguiceitorBase.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);

        this.argument('type', { type: String, required: true });

        if(this.type != 'model')
            this.argument('name', { type: String, required: true });
    },

    writing: function() {
        this.config = require(this.destinationPath('build/Config'));

        switch(this.type) {
            case 'model':
                this.model();
                break;
            case 'dao':
                this.dao();
                break;
            case 'service':
                this.service();
                break;
            case 'page':
                this.page();
                break;
            default:
                console.error(chalk.red('Type not found!'));
        }
    }
});
