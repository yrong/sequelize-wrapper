"use strict";

const fs        = require("fs")
const path      = require("path")
const Sequelize = require("sequelize-fulltext-search")

let models  = {}

const init = (pg_config) => {
    let sequelize = new Sequelize(pg_config.database, pg_config.user, pg_config.password, {
        host: pg_config.host,
        port: pg_config.port,
        dialect: 'postgres',
        pool: {
            max: pg_config.max || 50,
            min: 0,
            idle: pg_config.idleTimeoutMillis || 3000
        },
        regconfig: pg_config.zhparser||'chinese'
    });
    fs.readdirSync('./models')
        .filter(function (fileName) {
            return (fileName.indexOf(".") !== 0) && (fileName !== "index.js");
        })
        .forEach(function (fileName) {
            let model = sequelize.import(`${process.cwd()}/models/${fileName}`)
            models[model.name] = model
        });
    models.sequelize = sequelize;
}


const postinit = async function(){
    for(let key in models){
        if (models[key].initsql) {
            await models.sequelize.query(models[key].initsql);
        }
    }
}

module.exports = {init,postinit,models};
