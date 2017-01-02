(function() {
    'use strict';

    var yeoman  = require('yeoman-generator'),
        pluralize   = require('pluralize'),
        mysql   = require('mysql'),
        config  = {},
	    tables	= [],
        conn;

    module.exports = yeoman.Base.extend({
        apiModel: function(tables) {
            this.fs.copyTpl(
                this.templatePath('api/Models.tt'),
                this.destinationPath('src/Data/Models.ts'),
                {
                    tables: tables,
                    belongsToMany: this.config.default.preguiceitor.belongsToMany,
                    pluralize: pluralize
                }
            );
        },

        apiRoute: function(name) {
            this.fs.copyTpl(
                this.templatePath('api/Route.tt'),
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
                this.templatePath('angular/AngularHtml.tt'),
                this.destinationPath('src/app/pages/' + name + '/' + name + '.html'),
                {
                    name: name
                }
            );

            this.fs.copyTpl(
                this.templatePath('angular/AngularComponent.tt'),
                this.destinationPath('src/app/pages/' + name + '/' + name + '.ts'),
                {
                    name: name
                }
            );

            this.fs.copyTpl(
                this.templatePath('angular/SCSS.tt'),
                this.destinationPath('src/app/pages/' + name + '/' + name + '.scss'),
                {
                    name: name
                }
            );
        },

        apiDao: function (table) {
            this.fs.copyTpl(
                this.templatePath('api/DAO.tt'),
                this.destinationPath('src/data/dataAccess/' + table.name + 'DAO.ts'), 
                {
                    table: table
                }
            );
        },

        apiService: function (table) {
            this.fs.copyTpl(
                this.templatePath('api/Service.tt'),
                this.destinationPath('src/data/services/' + table.name + 'Service.ts'), 
                {
                    table: table
                }
            );
        },

        projectFilesApi: function (answers) {
            // Main api files
            this.fs.copyTpl(
                this.templatePath('api/Server.tt'),
                this.destinationPath('src/Server.ts'),
                {}
            );
            this.fs.copyTpl(
                this.templatePath('api/www.tt'),
                this.destinationPath('www.js'),
                {}
            );
            

            // Config files
            this.fs.copyTpl(
                this.templatePath('api/Config.tt'),
                this.destinationPath('src/Config.ts'),
                {
                    params: answers
                }
            );

            // lib folder
            this.fs.copyTpl(
                this.templatePath('api/SequelizeUtils.tt'),
                this.destinationPath('src/lib/SequelizeUtils.ts'),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('api/ApiRoute.tt'),
                this.destinationPath('src/lib/ApiRoute.ts'),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('api/indexRoutes.tt'),
                this.destinationPath('src/routes/index.ts'),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('api/indexData.tt'),
                this.destinationPath('src/data/index.ts'),
                {}
            );

            // package.json
            this.fs.copyTpl(
                this.templatePath('api/package.tt'),
                this.destinationPath('package.json'),
                {
                    params: answers
                }
            );

            // typings.json
            this.fs.copyTpl(
                this.templatePath('api/typings.tt'),
                this.destinationPath('typings.json'),
                {}
            );

            // Other files
            this.fs.copyTpl(
                this.templatePath('api/gulpfile.tt'),
                this.destinationPath('gulpfile.js'),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('api/gulpfile.tt'),
                this.destinationPath('gulpfile.js'),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('api/tsconfig.tt'),
                this.destinationPath('tsconfig.json'),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('api/_all.d.tt'),
                this.destinationPath('_all.d.ts'),
                {}
            );

            this.fs.copyTpl(
                this.templatePath('api/sha256.tt'),
                this.destinationPath('typings/custom/sha256/index.d.ts'),
                {}
            );
                
            this.install();
        },

        projectFilesWeb: function (answers) {
            // package.json
            this.fs.copyTpl(
                this.templatePath('web/package.tt'),
                this.destinationPath('src/Config.ts'),
                {
                    params: answers
                }
            );
                
            this.install();
        },

        projectFilesDesktop: function (answers) {
            
        },

        projectFilesMobile: function (answers) {
            
        },

        install: function() {
            this.spawnCommand('yarn');
        }
    });
})();
