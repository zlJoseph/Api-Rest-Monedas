import Sequelize from 'sequelize';
import config from './db/config';

const createStore = () => {
    const Op = Sequelize.Op;
    const db = new Sequelize(process.env.DB_BDNAME, process.env.DB_USER, process.env.DB_PASSWORD,{
        host: `${process.env.DB_HOST}`,
        dialect: config.dialect,
        dialectOptions: process.env.NODE_ENV==="development"?null:{//solo para produccion en GCP
            socketPath: `${process.env.DB_HOST}`
        },
        operatorsAliases: 0,
        pool: {
          max: config.pool.max,
          min: config.pool.min,
          acquire: config.pool.acquire,
          idle: config.pool.idle
        }
    });
    const moneda = db.define('moneda',{
        id:{
            allowNull:false,
            type:Sequelize.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        local:{
            type:Sequelize.STRING
        },
        convert:{
            type:Sequelize.STRING
        },
        localsimbolo:{
            type:Sequelize.STRING
        },
        convertsimbolo:{
            type:Sequelize.STRING
        },
        fecha:{
            type:Sequelize.DATEONLY
        },
        venta:{
            type:Sequelize.STRING
        },
        compra:{
            type:Sequelize.STRING
        }
    },{
        timestamps:false,
    });

    return { Op, db, moneda};
}

export { createStore };