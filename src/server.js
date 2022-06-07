import path from 'path';
import dotenv from "dotenv";
import fs from "fs";
dotenv.config({
  path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`)
});
import csv from "csv-parser";
import express from "express";
import routes from "./routes";
import { createStore } from './utils';

const app= express();
const store = createStore();

app.use('/', routes);
app.use((err,_, res, __) => {
  res.status(err.status || 400).json({
    success: false,
    message: err.message || 'An error occured.',
    errors: err.error || [],
  });
});
app.use((_, res) => {
  res.status(404).json({ success: false, message: 'Resource not found.' });
});
// Start the server
var forceValue=true
var createSQL=false
store.db.sync({ force: forceValue }).then(() => {
    if (forceValue){
        if(createSQL){
            const dateInitial = new Date(Date.UTC(2000,0,1));
            //const dateEnd = new Date(Date.UTC(2000,4,5));
            const dateEnd = new Date(Date.UTC(2022,4,25));
            var compraJSON=new Array();
            var ventaJSON=new Array();
            fs.createReadStream(__dirname+'/data/data_compra.csv')
            .pipe(csv())
            .on('data', (row) => {
                var date=new Date(row['Fecha']);
                var compra=row['Compra'];
                if(date.toString()==="Invalid Date"){
                    var dia=parseInt(row['Fecha'].slice(0,2));
                    var mes=getNumberMonth(row['Fecha'].slice(2,5));
                    var fecha=parseInt(row['Fecha'].slice(5,7))+2000;
                    date=new Date(Date.UTC(fecha,mes,dia));
                }
                if(date.toString()!=="Invalid Date"){
                    var key=[padTo2Digits(date.getUTCDate()),padTo2Digits(date.getUTCMonth()+1),date.getUTCFullYear()].join('-');
                    compraJSON[key]=compra;
                }
            })
            .on('end', () => {
                console.log('CSV compra file successfully processed');
                fs.createReadStream(__dirname+'/data/data_venta.csv')
                .pipe(csv())
                .on('data', (row) => {
                    var date=new Date(row['Fecha']);
                    var venta=row['Venta'];
                    if(date.toString()==="Invalid Date"){
                        var dia=parseInt(row['Fecha'].slice(0,2));
                        var mes=getNumberMonth(row['Fecha'].slice(2,5));
                        var fecha=parseInt(row['Fecha'].slice(5,7))+2000;
                        date=new Date(Date.UTC(fecha,mes,dia));
                    }
                    if(date.toString()!=="Invalid Date"){
                        var key=[padTo2Digits(date.getUTCDate()),padTo2Digits(date.getUTCMonth()+1),date.getUTCFullYear()].join('-');
                        ventaJSON[key]=venta;
                    }
                })
                .on('end', () => {
                    console.log('CSV venta file successfully processed');
                    const dia_mili = 1000 * 60 * 60 * 24;
                    let sql="INSERT INTO `monedas` (`id`,`local`,`convert`,`localsimbolo`,`convertsimbolo`,`fecha`, `venta`, `compra`) VALUES ";
                    var countID=1;
                    for (let i = dateInitial; i <= dateEnd; i = new Date(i.getTime() + dia_mili)) {
                        var key=[padTo2Digits(i.getUTCDate()),padTo2Digits(i.getUTCMonth()+1),i.getUTCFullYear()].join('-');
                        if (ventaJSON[key]||compraJSON[key]){
                            if(ventaJSON[key]==="n.d."){
                                var complete=false;
                                var countBefore=1;
                                while(!complete){
                                    var dateBefore=new Date(i.getTime() - dia_mili*countBefore);
                                    var keyBefore=[padTo2Digits(dateBefore.getUTCDate()),padTo2Digits(dateBefore.getUTCMonth()+1),dateBefore.getUTCFullYear()].join('-');
                                    if(ventaJSON[keyBefore]){
                                        if(ventaJSON[keyBefore]!=="n.d."){
                                            complete=true;
                                            ventaJSON[key]=ventaJSON[keyBefore];
                                        }
                                    }
                                    countBefore++;
                                }
                            }
                            if(compraJSON[key]==="n.d."){
                                var complete=false;
                                var countBefore=1;
                                while(!complete){
                                    var dateBefore=new Date(i.getTime() - dia_mili*countBefore);
                                    var keyBefore=[padTo2Digits(dateBefore.getUTCDate()),padTo2Digits(dateBefore.getUTCMonth()+1),dateBefore.getUTCFullYear()].join('-');
                                    if(ventaJSON[keyBefore]){
                                        if(compraJSON[keyBefore]!=="n.d."){
                                            complete=true;
                                            compraJSON[key]=compraJSON[keyBefore];
                                        }
                                    }
                                    countBefore++;
                                }
                            }
                            var valueFecha=[i.getUTCFullYear(),padTo2Digits(i.getUTCMonth()+1),padTo2Digits(i.getUTCDate())].join('-');
                            if(countID===1){
                                sql=sql+"("+countID+",'Soles','Dolar','S/.','$','"+valueFecha+"','"+ventaJSON[key]+"','"+compraJSON[key]+"')";
                            }else{
                                sql=sql+",("+countID+",'Soles','Dolar','S/.','$','"+valueFecha+"','"+ventaJSON[key]+"','"+compraJSON[key]+"')";
                            }
                            countID++;
                        }
                    }
                    fs.writeFileSync(__dirname+'/db/init.sql',sql);
                });
            });
        }else{
            var sql_strings = fs.readFileSync(__dirname+'/db/init.sql', 'utf8').toString().split("\r\n");
            let promise=store.db.query(sql_strings[0]);
            for (let index = 1; index < sql_strings.length; index++) {
              let query = sql_strings[index];
              query = query.trim();
              if (query.length !== 0 && !query.match(/\/\*/)) {
                promise = promise.then(() => {
                  return store.db.query(query, {raw: false});
                })
              }
            }
        }
    }
    const port = process.env.PORT || 4000;
    app.listen({ port }, () => {
      console.log(`🚀 Server ready at port=${port}`);
    });
}).catch(e => {
    console.log(e);
});

function getNumberMonth(month){
    switch (month) {
        case "Ene":
            return 0;
        case "Feb":
            return 1;
        case "Mar":
            return 2;
        case "Abr":
            return 3;
        case "May":
            return 4;
        case "Jun":
            return 5;
        case "Jul":
            return 6;
        case "Ago":
            return 7;
        case "Set":
            return 8;
        case "Oct":
            return 9;
        case "Nov":
            return 10;
        case "Dic":
            return 11;
    }
}

function padTo2Digits(num) {
    return num.toString().padStart(2,'0');
}