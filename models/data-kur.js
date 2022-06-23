const fs = require('fs')
const path = require('path')
const getDb = require('../utils/database').getDb


//const p = path.join(path.dirname(require.main.filename),'data','kur_info.json')

getKurDataFromFile = (cb) => {
   
   
    const db = getDb()

    db.collection('kurlar').findOne({}, function(err, result) {
        if (err) throw err;
        console.log('db.collection.findOne(result): ', result);
        cb(JSON.parse(JSON.stringify(result)))
        
      });

/*        
    fs.readFile(p,(err, fileContent) => {
        if (err) {
            cb({})
        }
        else {
            cb(JSON.parse(fileContent))
        }
    })
*/    
}

module.exports = class Data_kurlar{
    constructor(data_kurlar) {
        this.usdtry_buyRate = data_kurlar.usdtry_buyRate
        this.usdtry_sellRate = data_kurlar.usdtry_sellRate
        this.usdctry_buyRate = data_kurlar.usdctry_buyRate
        this.usdctry_sellRate = data_kurlar.usdctry_sellRate
        this.neg_fark = data_kurlar.neg_fark
        this.pos_fark = data_kurlar.pos_fark
        this.counter = data_kurlar.counter
        this.data_time = data_kurlar.data_time


    }
    
    async save() {
  
        const db = getDb()
        db.collection('kurlar').deleteMany()
        db.collection('kurlar').insertOne(this).then(result => {
            console.log('MongoDB save succesfull')
        }).catch(err => {
            console.log(err)
        })
/*        
        getKurDataFromFile(data_kurlar => {
            data_kurlar = this
 
            fs.writeFileSync(p, JSON.stringify(data_kurlar), (err) => {
                console.log(err)
            })

        })
*/       
    }

    static fetchAll(cb) {
        getKurDataFromFile(cb)

    }
}