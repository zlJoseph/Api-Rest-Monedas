# Api Rest Monedas

Api Rest desarrollada con express y sequilize

## Instalación

Requerimientos

 - npm
 - node 
 - xampp

1) Clonar e instalar las dependencias del proyecto
```bash
git clone https://github.com/zlJoseph/Api-Rest-Monedas.git
cd Api-Rest-Monedas
npm install
```
2) Necesario ejecutar mysql en xampp y crear la base de datos **apimoneda**.

3) Ejecutar
```bash
npm run dev
```
- Si es la primera ejecución, en el archivo src/server.js la variable **forceValue** debe ser **true** para poder importar la base de datos.
```javascript
var forceValue=true
```
- Posterior a la segunda ejecución debe ser **false**

4) El servidor escucha en el puerto 4000: [http://localhost:4000/](http://localhost:4000/)

## Api response
1. Para obtener el precio del día 2021-01-01: [http://localhost:4000/convert?date=2021-01-01&type=1](http://localhost:4000/convert?date=2021-01-01&type=1)
```json
{
"id":5480,
"local":"Soles",
"convert":"Dolar",
"localsimbolo":"S/.",
"convertsimbolo":"$",
"fecha":"2021-01-01",
"venta":"3.624",
"compra":"3.618"
}
```

2. Para obtener los precios del mes 2021-01-01: [http://localhost:4000/convert?date=2021-01-01&type=2](http://localhost:4000/convert?date=2021-01-01&type=2)

3. Para obtener los precios del año 2021-01-01: [http://localhost:4000/convert?date=2021-01-01&type=3](http://localhost:4000/convert?date=2021-01-01&type=3)

- Nota: el parámetro date debe tener el formato: AAAA-MM-DD 