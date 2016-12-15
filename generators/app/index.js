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
        console.log('Generating model...');

        database.setConfig(this.config);

        database.getTables((tables) => {

            this.fs.copyTpl(
				this.templatePath('Models.tt'),
				this.destinationPath('src/Data/Models.ts'),
				{
					tables: tables,
					belongsToMany: this.config.default.preguiceitor.belongsToMany,
					pluralize: pluralize
				}
			);

        });
    },

    page: function () {
        console.log('Generating page...');
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
            case 'page':
                this.page();
                break;
            default:
                console.error('Type not found!');
        }
    }
});
