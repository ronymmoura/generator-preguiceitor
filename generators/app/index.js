'use strict';

var yeoman      = require('yeoman-generator'),
    pluralize   = require('pluralize'),
    chalk       = require('chalk'),
    yosay       = require('yosay'),
    path        = require('path'),
    mysql       = require('mysql'),
    fs          = require('fs'),
    database    = require('./database'),
    Generators  = require('./generators');

var PreguiceitorBase = Generators.extend({
    init: function () {
        var questions = [
            {
                type    : 'input',
                name    : 'name',
                message : 'Your project name',
                default : this.appname // Default to current folder name
            },
            {
                type    : 'input',
                name    : 'description',
                message : 'Your project description'
            },
            {
                type: 'list',
                name: 'projectType',
                message: 'Your project type',
                choices: [
                    'api',
                    'mobile',
                    'desktop'
                ]
            },
            {
                type: 'input',
                name: 'port',
                message: 'Your project port',
                default: 8080
            },
            {
                type: 'input',
                name: 'databaseHost',
                message: 'Your database host'
            },
            {
                type: 'input',
                name: 'databaseName',
                message: 'Your database name'
            },
            {
                type: 'input',
                name: 'databaseUsername',
                message: 'Your database username'
            },
            {
                type: 'input',
                name: 'databasePassword',
                message: 'Your database password'
            }
        ];

        this.prompt(questions).then((answers) => {
            this.projectFiles(answers);
            this.typings();
            this.package(answers);
            this.install();
        });
    },

    model: function () {
        if(this.config.default.projectType != 'api') {
            console.error(chalk.red('This project doesn\'t support this operation!'));
            return;
        }

        console.log('Generating models...');

        database.setConfig(this.config);

        database.getTables((tables) => {
            this.model(tables);
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
                    this.dao(table);
                }
            });
        } else {
            console.log('Generating '+ this.name + 'DAO.ts...');
            
            database.getTable(this.name, (table) => {
                this.dao(table);
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
                    this.service(table);
                }
            });
        } else {
            console.log('Generating '+ this.name + 'Service.ts...');
            
            database.getTable(this.name, (table) => {
                this.service(table);
            });
        }
    },

    route: function () {
        if(this.config.default.projectType != 'api') {
            console.error(chalk.red('This project doesn\'t support this operation!'));
            return;
        }

        this.route(this.name);
    },

    page: function () {
        if(this.config.default.projectType != 'mobile' && this.config.default.projectType != 'desktop') {
            console.error(chalk.red('This project doesn\'t support this operation!'));
            return;
        }

        if(this.config.default.projectType == 'desktop') {
            console.log('Generating page...');

            this.angularPage(this.name);
        }
    }
});

module.exports = PreguiceitorBase.extend({
    constructor: function() {
        yeoman.Base.apply(this, arguments);

        this.argument('type', { type: String, required: true });

        if(this.type != 'init' && this.type != 'model')
            this.argument('name', { type: String, required: true });
    },

    writing: function() {
        if(this.type != 'init')
            this.config = require(this.destinationPath('build/Config'));

        switch(this.type) {
            case 'init':
                this.init();
                break;
            case 'model':
                this.model();
                break;
            case 'dao':
                this.dao();
                break;
            case 'service':
                this.service();
                break;
            case 'route':
                this.route();
                break;
            case 'page':
                this.page();
                break;
            default:
                console.error(chalk.red('Type not found!'));
        }
    }
});
