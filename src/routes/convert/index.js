import {Router} from 'express';
import { createStore } from '../../utils';
const router=Router();
router.route('/').get(async (req,res)=>{
    const store = createStore();
    let date=req.query.date;
    let type=req.query.type;//1: recupera el día, 2: recupera el mes, 3: recupera el año
    if (date) {
        switch (type) {
            case '1':
                const moneda=await store.moneda.findOne({where: {fecha:date}});
                if (moneda) {
                    res.json(moneda);
                }else{
                    res.status(404).json({success:false,message:'Resource not found'});
                }
                break;
            case '2':
                var dateTemp=date.split('-');
                var dateInitial=new Date(Date.UTC(parseInt(dateTemp[0]),parseInt(dateTemp[1])-1,1));
                var dateEnd=new Date(Date.UTC(parseInt(dateTemp[0]),parseInt(dateTemp[1]),0));
                var initValue=[dateInitial.getUTCFullYear(),padTo2Digits(dateInitial.getUTCMonth()+1),padTo2Digits(dateInitial.getUTCDate())].join('-');
                var endValue=[dateEnd.getUTCFullYear(),padTo2Digits(dateEnd.getUTCMonth()+1),padTo2Digits(dateEnd.getUTCDate())].join('-');
                const monedasMonths=await store.moneda.findAll({where: {fecha:{[store.Op.between]:[initValue,endValue]}}});
                res.json(monedasMonths);
                break;
            case '3':
                var dateTemp=date.split('-');
                var dateInitial=new Date(Date.UTC(parseInt(dateTemp[0]),0,1));
                var dateEnd=new Date(Date.UTC(parseInt(dateTemp[0])+1,0,0));
                var initValue=[dateInitial.getUTCFullYear(),padTo2Digits(dateInitial.getUTCMonth()+1),padTo2Digits(dateInitial.getUTCDate())].join('-');
                var endValue=[dateEnd.getUTCFullYear(),padTo2Digits(dateEnd.getUTCMonth()+1),padTo2Digits(dateEnd.getUTCDate())].join('-');
                const monedasYears=await store.moneda.findAll({where: {fecha:{[store.Op.between]:[initValue,endValue]}}});
                res.json(monedasYears);
                break;
            default:
                res.status(404).json({success:false,message:'Resource not found'});
        }
    }else{
        res.status(400).json({success:false,message:'Invalid parameters'});
    }
});

function padTo2Digits(num) {
    return num.toString().padStart(2,'0');
}

export default router;