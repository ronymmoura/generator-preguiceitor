(function() {
    'use strict';

    var yeoman  = require('yeoman-generator'),
        mysql   = require('mysql'),
        config  = {},
	    tables	= [],
        conn;

    module.exports = yeoman.Base.extend({
        model: function(tables) {
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

        route: function(name) {
            this.fs.copyTpl(
                this.templatePath('Route.tt'),
                this.destinationPath('src/routes/' + name + 'Routes.ts'),
                {
                    name: name
                }
            );
        },

        ionicPage: function () {
            
        },

        angularPage: function (name) {
            this.fs.copyTpl(
                this.templatePath('AngularHtml.tt'),
                this.destinationPath('src/app/pages/' + name + '/' + name + '.html'),
                {
                    name: name
                }
            );

            this.fs.copyTpl(
                this.templatePath('AngularComponent.tt'),
                this.destinationPath('src/app/pages/' + name + '/' + name + '.ts'),
                {
                    name: name
                }
            );

            this.fs.copyTpl(
                this.templatePath('SCSS.tt'),
                this.destinationPath('src/app/pages/' + name + '/' + name + '.scss'),
                {
                    name: name
                }
            );
        },

        dao: function (table) {
            this.fs.copyTpl(
                this.templatePath('DAO.tt'),
                this.destinationPath('src/data/dataAccess/' + table.name + 'DAO.ts'), 
                {
                    table: table
                }
            );
        },

        service: function (table) {
            this.fs.copyTpl(
                this.templatePath('Service.tt'),
                this.destinationPath('src/data/services/' + table.name + 'Service.ts'), 
                {
                    table: table
                }
            );
        },

        projectFiles: function (answers) {
            this.fs.copyTpl(
                this.templatePath('Config.tt'),
                this.destinationPath('src/Config.ts'),
                {
                    params: answers
                }
            );

            this.fs.copyTpl(
                this.templatePath('Server.tt'),
                this.destinationPath('src/Server.ts'),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('SequelizeUtils.tt'),
                this.destinationPath('src/lib/SequelizeUtils.ts'),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('ApiRoute.tt'),
                this.destinationPath('src/lib/ApiRoute.ts'),
                {}
            );
        },

        typings: function () {
            var tps = {
                "globalDependencies": {
                    "node": "registry:dt/node#6.0.0+20161014191813"
                },
                "dependencies": {
                    "body-parser": "registry:npm/body-parser#1.15.2+20160815132839",
                    "cors": "registry:npm/cors#2.7.0+20160902012746",
                    "express": "registry:npm/express#4.14.0+20160925001530",
                    "jsonwebtoken": "registry:npm/jsonwebtoken#7.1.8+20160811031426",
                    "lodash": "registry:npm/lodash#4.0.0+20161015015725",
                    "sequelize": "registry:npm/sequelize#3.0.0+20161019115811"
                }
            }
            this.write('typings.json', JSON.stringify(tps, null, 4));
        },

        package: function (answers) {
            var pkg = {
                "name": answers.name,
                "description": answers.description,
                "version": "0.0.1",
                "main": "www.js",
                "scripts": {
                    "start": "gulp && node .",
                    "postinstall": "typings install",
                    "watch": "concurrently --kill-others \"gulp watch\" \"yarn start\" --max_old_space_size=2048"
                },
                "devDependencies": {
                    "gulp": "^3.9.1",
                    "gulp-sourcemaps": "^1.9.1",
                    "gulp-typescript": "^3.0.2",
                    "typescript": "^2.0.3",
                    "typings": "^1.4.0"
                },
                "dependencies": {
                    "body-parser": "^1.15.2",
                    "cors": "^2.8.1",
                    "debug": "^2.2.0",
                    "express": "^4.14.0",
                    "jsonwebtoken": "^7.2.0",
                    "lodash": "^4.16.4",
                    "mysql": "^2.12.0",
                    "sequelize": "^3.27.0",
                    "sha256": "^0.2.0"
                }
            };
            this.write('package.json', JSON.stringify(pkg, null, 4));
        },

        install: function() {
            this.spawnCommand('yarn');
        }
    });
})();