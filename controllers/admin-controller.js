const { redirect } = require('statuses')

const https = require('https');
//const rp = require('request-promise');
const res = require('express/lib/response');






const Model_data_kur=require('../models/data-kur')

let data_kurlar = {usdtry_buyRate: 999, usdctry_buyRate: 999, usdtry_sellRate: 999, usdctry_sellRate: 999, neg_fark: 999, pos_fark: 999, counter: 0, data_time : '0'}

const btcturk_url = 'https://api.btcturk.com/api/v2/ticker?pairSymbol=USDC_TRY'
//const yapikredi_url = 'https://api.btcturk.com/api/v2/ticker?pairSymbol=USDT_TRY'

                     
const yapikredi_client_id = 'l7xxb5e9917c0ca84942af020ff534d19b70'
const yapikredi_client_secretkey = 'ccf496c34db14f65ab277c398024920e'
const merkezbank_api_key = 'cNhmIpVsAI'





exports.getDataFromBTCTurkAPI = () => {
    
    const promise = new Promise((resolve, reject) => {

        https.get(btcturk_url ,(response) => {
            let body = "";
        
            response.on("data", (chunk) => {
                body += chunk;
            });
        
            response.on("end", () => {
                try {
                    let btcturk_data = JSON.parse(body);
        
                    let usdctry_buyRate = btcturk_data.data[0].bid
                    let usdctry_sellRate = btcturk_data.data[0].ask
//                    data_kurlar.usdctry = usdctry
    
                    

//                    resolve(data_kurlar)
                    resolve([usdctry_buyRate, usdctry_sellRate])
    
                } catch (error) {
                    console.log(error.message);
                };
            });
        
        }).on("error", (error) => {
            console.log(error.message);
        })
    })
    return promise

}
//*********************************

exports.getTokenFromYKAPI = () => {
    const promise = new Promise((resolve, reject) => {
        var yapikredi_getToken_options = {
            host: 'api.yapikredi.com.tr',
            path: '/auth/oauth/v2/token?scope=oob&client_secret=ccf496c34db14f65ab277c398024920e&grant_type=client_credentials&client_id=l7xxb5e9917c0ca84942af020ff534d19b70',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }

        }

        const req = https.request(yapikredi_getToken_options ,(response) => { 
            response.on('data', d => {
                const input_data = JSON.parse(d.toString())

                const yapikredi_token_data = input_data.access_token
                const yapikredi_token_type_data = input_data.token_type
                const yapikredi_token = yapikredi_token_type_data + ' ' + yapikredi_token_data

                console.log('yapikredi_token: ', yapikredi_token)

                resolve(yapikredi_token)
                
            })

        
        }).on("error", (error) => {
            console.log('Yapi kredi https.request error for get token ', error.message);
        })



        req.end()
    })
    return promise
}



//*****************************
//Get Data as if from BTCTürk
exports.getDataFromYKAPI = (yapikredi_token) => {
    const promise = new Promise((resolve, reject) => {

        var yapikredi_options = {
            host: 'api.yapikredi.com.tr',
            path: '/api/investmentrates/v1/currencyRates',
            method: 'GET',
            headers: {'Authorization': yapikredi_token}
        };

        const req = https.request(yapikredi_options ,(response) => {
            let body = "";
        
            response.on("data", (chunk) => {
                body += chunk;
            });
        
            response.on("end", () => {
                try {
                    let temp_yapikredi_data =  JSON.parse(body)
                    let yapikredi_data = temp_yapikredi_data.response.exchangeRateList

                    let yapikredi_data_usdtry = yapikredi_data.filter(it => (it.minorCurrency === 'TL' && it.majorCurrency === 'USD'))
        
                    let usdtry_buyRate = Number(yapikredi_data_usdtry[0].buyRate)
                    let usdtry_sellRate = Number(yapikredi_data_usdtry[0].sellRate)


                    resolve([usdtry_buyRate, usdtry_sellRate])
    
                } catch (error) {
                    console.log('Yapi kredi get data problem: ', error.message);
                };
            });
        
        }).on("error", (error) => {
            console.log('Yapi kredi https.request problem: ',error.message);
        })

        req.end()
    })
    return promise
}





exports.getDataFromAPI = async (io) => {
    


    setInterval(async () => {
        
        this.getDataFromBTCTurkAPI()
        .then(data_BTCTurk => {
            data_kurlar.usdctry_buyRate = data_BTCTurk[0].toFixed(3)
            data_kurlar.usdctry_sellRate = data_BTCTurk[1].toFixed(3)

            return this.getTokenFromYKAPI()
        })        
        .then(data_YK_token => {
            return this.getDataFromYKAPI(data_YK_token)
        })
        .then(async (data_yapikredi) => {
            data_kurlar.usdtry_buyRate = data_yapikredi[0].toFixed(3)
            data_kurlar.usdtry_sellRate = data_yapikredi[1].toFixed(3)
            data_kurlar.counter = data_kurlar.counter + 1
            data_kurlar.pos_fark = (data_kurlar.usdctry_sellRate - data_kurlar.usdtry_sellRate).toFixed(3)
            data_kurlar.neg_fark = (data_kurlar.usdctry_buyRate - data_kurlar.usdtry_buyRate).toFixed(3)

            let date_ob = new Date();
            let date = ("0" + date_ob.getDate()).slice(-2);
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            let hours = date_ob.getHours();
            let minutes = ("0" + date_ob.getMinutes()).slice(-2);
            let seconds = ("0" + date_ob.getSeconds()).slice(-2);

            data_kurlar.data_time = date + '.' + month + '.' + year + '---' + hours + '.' + minutes + '.' + seconds


            const model_data_kur = new Model_data_kur(data_kurlar)
        
            await model_data_kur.save()

            console.log('admin controller - btcturk -- usdctry_buy: ', data_kurlar.usdctry_buyRate, '-- usdctry_sell: ', data_kurlar.usdctry_sellRate )
            console.log('admin controller - yapikredi -- usdtry_buyRate: ', data_kurlar.usdtry_buyRate, '-- usdtry_sellRate: ', data_kurlar.usdtry_sellRate)
            console.log('Sayaç: ', data_kurlar.counter)
            console.log('Zaman: ', data_kurlar.data_time)
            
    //Read from MongoDB database
    //        Model_data_kur.fetchAll(data_kur => {
    //            console.log('admin controller-- usdtry=', data_kurlar.usdtry,'usdctry=', data_kurlar.usdctry,'Fark= ', data_kurlar.fark)
    //            res.render('admin', {prods: data_kur, pageTitle: 'Kur Verileri', path: '/', has_data_kur: (data_kur.neg_fark !== NaN) && (data_kur.pos_fark !== NaN) })  // !!! buradaki kural değişebilir
    //        })
    
            io.emit('posts',{action: 'create', post: data_kurlar})

        })
    
    }, 120000);


    
    
}




