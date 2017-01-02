'use strict';

var yeoman      = require('yeoman-generator'),
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
                default : process.cwd().split(path.sep).pop() // Default to current folder name
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
                    'web',
                    'api',
                    'mobile',
                    'desktop'
                ]
            }
        ];

        this.prompt(questions).then((answers) => {
            // Only api and web project types have the options port and database info.
            // The mobile and desktop types can't access the database directly, and
            // they can't start a server by themselves. That's why they don't have a port.
            if(answers.projectType == 'api' || answers.projectType == 'web') {
                var questions2 = [
                    {
                        type: 'input',
                        name: 'port',
                        message: 'Your project port',
                        default: 8080
                    }
                ];

                this.prompt(questions2).then((answers2) => {
                    // Join the answers
                    for(var i in answers2) {
                        answers[i] = answers2[i];
                    }

                    if(answers.projectType == 'api') {
                        var questions3 = [
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

                        this.prompt(questions3).then((answers3) => {
                            // Join the answers
                            for(var i in answers3) {
                                answers[i] = answers3[i];
                            }

                            this.projectFilesApi(answers);
                        });
                    }
                    // If project type is different from api (web in this case)
                    else {
                        this.projectFilesWeb(answers);
                    }
                });
            }
            // If project type is different from api and web
            else {
                switch(answers.projectType) {
                    case 'desktop':
                        this.projectFilesDesktop(answers);
                        break;
                    case 'mobile':
                        this.projectFilesMobile(answers);
                        break;
                }
            }
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
            this.apiModel(tables);
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
                    this.apiDao(table);
                }
            });
        } else {
            console.log('Generating '+ this.name + 'DAO.ts...');
            
            database.getTable(this.name, (table) => {
                this.apiDao(table);
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
                    this.apiService(table);
                }
            });
        } else {
            console.log('Generating '+ this.name + 'Service.ts...');
            
            database.getTable(this.name, (table) => {
                this.apiService(table);
            });
        }
    },

    route: function () {
        if(this.config.default.projectType != 'api') {
            console.error(chalk.red('This project doesn\'t support this operation!'));
            return;
        }

        this.apiRoute(this.name);
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
