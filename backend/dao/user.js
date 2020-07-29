"use strict";

let db = require('../Utilities/db_connection').db;

let signup = async (data, cb) => {
    const { name, phone, email, password, designation } = data

    let sql = `INSERT INTO user(name,phone,email,password,designation) 
    VALUES ('${name}','${phone}','${email}','${password}','${designation}')`
    
    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let userPassword = async (data, cb) => {
    const { email, userId } = data

    let cond =  ` 1 `

    if(userId){
        cond += ` AND id=${userId} `
    }

    if(email){
        cond += ` AND email LIKE '${email}' `
    }
    
    let sql = `SELECT name, phone, email, password, roleid, id, company, designation, address FROM user 
    WHERE ${cond}
    ORDER BY id DESC LIMIT 1`

    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let contact = async (data, cb) => {
    const { name, email, subject, message } = data

    let sql = `INSERT INTO contact(name, email,subject, message) 
    VALUES ('${name}', '${email}', '${subject}', '${message}')`
    
    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let articles = async (data, cb) => {
    const { topic, keywords, industry, source, link, introduction, body, conclusion, data_points } = data

    let sql = `INSERT INTO articles(topic, keywords, industry, source, link, introduction, body, conclusion, data_points) 
    VALUES ('${topic}', '${keywords}', '${industry}', '${source}', '${link}', "${introduction}", "${body}", "${conclusion}", '${data_points}')`
    
    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let getArticles = async (data, cb) => {
    let { topic, userId, id, flag } = data

    let cond = ` WHERE 1 `
    if(userId && !flag){
        cond += ` AND userId='${userId}' `
    }
    if(id){
        cond += ` AND id=${id} `
    }
    if(topic){
        const util = require("../Utilities/util")
        let words = util.tokenize(topic)

        cond += ` AND ( `
        let orCond = ``
        words.forEach((word, idx) => {
            if(idx > 0){
                orCond = ` AND `
            }
            cond += ` ${orCond} LOWER(CONVERT(keywords USING utf8)) LIKE '%${word.toLowerCase()}%'  `  
        })
        cond += ` ) `
    } 

    topic = topic.toLowerCase()
    
    let shuffleCalcQry = `SELECT offset FROM shuffleCalc WHERE userId=${userId} 
    AND LOWER(topic) LIKE '%${topic}%' ORDER BY id DESC`
  

    db.query(shuffleCalcQry, (err1, rows1, fields1) => {
        let offset = 0, limit = 2
        
        if(rows1 && rows1.length>0){
            offset = rows1[0]['offset'] 
        }
        offset += limit
        
        let sql = `SELECT id, topic, keywords, industry, link, introduction, body, 
        conclusion, data_points, createdAt 
        FROM articles ${cond}
        ORDER BY rand(123) LIMIT ${limit} offset ${offset}
        `
        const p1 = new Promise((resolve, reject) => {
            db.query(`DELETE FROM shuffleCalc WHERE topic LIKE '%${topic}%'`, (err3, rows3, fields3) => { 
                if(err3) reject(err3)    
                resolve("success1")
            });
        })

        const p2 = new Promise((resolve, reject) => {
            db.query(`INSERT INTO shuffleCalc(offset, userId, topic) 
                VALUES (${offset}, ${userId}, '${topic}')`, (err2, rows2, fields2) => {  
                    if(err2) reject(err2)  
                    resolve("success2")
                });
        })
           
        // ORDER BY CASE WHEN LOWER(keywords) LIKE "${topic}" then 0 else 1 end
        Promise.all([p1, p2])
        .then(rrr => {
           
        })
        .catch(errxx => {
            console.log(errxx);
            
        })
        .then(() => {
            db.query(sql, (err, rows, fields) => {
                if (err) throw err
                cb(null, rows)
            })
        })
       
    })
}

let language = async (cb) => {
    let sql = `SELECT id, lang, shortLang FROM language`

    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let userPlan = async (data, cb) => {
    const { userId, planId } = data

    let sql = `INSERT INTO userPlan(userId, planId) 
    VALUES (${userId}, ${planId})`
    
    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let plan = async (data, cb) => {
    const {} = data
    
    let sql = `SELECT plan, price, currency, duration FROM plan`

    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let editProfile = async (data, cb) => {
    const { userId, name, email, phone, company, designation, address } = data
    
    let sql = `UPDATE user
    SET name='${name}', email='${email}', phone='${phone}', company='${company}', designation='${designation}', address='${address}'
    WHERE id=${userId};`

    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let transactions = async (data, cb) => {
    const { userId } = data

    let sql = `SELECT plan, price, currency, duration, createdAt FROM userPlan up
                LEFT JOIN plan p 
                ON p.plan=up.planId
                WHERE up.userId=${userId}`
    
    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let cnfrmPassword = async (data, cb) => {
    const { userId, password } = data
    
    let sql = `UPDATE user
    SET password='${password}'
    WHERE id=${userId};`

    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let upload = async (data, cb) => {
    const { userId, userpic } = data
    
    let sql = `INSERT INTO uploads(uri, userId) 
    VALUES ('${userpic}','${userId}')`

    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

let reviewNGenerate = async (data, cb) => {
    const { articleId, introduction, body, conclusion, topic, userId, industry } = data

    let sql_sel = `SELECT count(id) AS cnt FROM articles WHERE topic LIKE '${topic}' `

    const cntRes = await new Promise((resolve, reject) => {
        db.query(sql_sel, (err1, rows1, fields) => {
            if (err1) reject([])
            resolve(rows1)
        })
    })
    const util = require("../Utilities/util")

    let htm = `
    
<!DOCTYPE html>
<html lang="en">


<head>
    <title>Article</title>

    <meta charset="utf-8">
    <style>
        body {
            color: #000;
            font-family: Arial, Helvetica, sans-serif;
            text-align: justify;
            line-height: 30px;
            font-size: 14px;
            max-width: 1920px;
            margin: 0 auto;
            background-color: #f4f1f1;
        }
    </style>
</head>

<body>
    <div style="padding: 0px;">
        <div style="padding: 50px 100px; background-color:#fff; margin: 0 0px;">
            <h2
                style="font-size: 25px;color:#363637; text-align:left; padding: 10px;text-transform: uppercase; margin: 0; padding-left: 0;">
                Introduction</h2>
            <p style="padding: 0; margin:0;font-size: 16px;">${introduction}</p>
        </div>
        <div style="padding:40px 100px;margin: 0 0px;">
            <h2
                style="font-size: 25px;color:#363637; text-align:left; padding: 10px;text-transform: uppercase; margin: 0; padding-left: 0;">
                Body of Content</h2>
            <p style="padding: 0; margin:0;font-size: 16px;">${body}</p>
           
        </div>
        <div style="padding:0px 100px;margin: 0 0px;">
            <h2
                style="font-size: 25px;color:#363637; text-align:left; padding: 10px;text-transform: uppercase; margin: 0; padding-left: 0;">
                Conclusion</h2>
            <p style="padding: 0; margin:0;font-size: 16px;">${conclusion}</p>
            
        </div>
    </div>
</body>

</html>
    `
   
    let fileData = await util.htmlPdf({html: htm})
  
    if(Array.isArray(cntRes) && cntRes.length>0 && cntRes[0].cnt){
        cb(null, {fileData: fileData})
        return
    }
    
    let sql = `INSERT INTO articles(introduction, body, conclusion, topic, userId, industry) VALUES ("${introduction.replace( /(<([^>]+)>)/ig, '').replace(/"/g, '\'')}", "${body.replace( /(<([^>]+)>)/ig, '').replace(/"/g, '\'')}", "${conclusion.replace( /(<([^>]+)>)/ig, '').replace(/"/g, '\'')}", "${topic}", "${userId}", "${industry}" )`

    if(articleId){
        sql = `UPDATE articles
        SET introduction="${introduction}", body="${body}", conclusion="${conclusion}"
        WHERE id=${articleId};`
    }
    
    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, {fileData: fileData})
    })
}

let industry = async (data={}, cb) => {
    let sql = `SELECT id, name
               FROM industry`
    
    db.query(sql, (err, rows, fields) => {
        if (err) throw err
        cb(null, rows)
    })
}

module.exports = {
    signup: signup,
    userPassword: userPassword,
    contact: contact,
    articles: articles,
    getArticles: getArticles,
    language: language,
    userPlan: userPlan,
    plan: plan,
    editProfile: editProfile,
    transactions: transactions,
    cnfrmPassword: cnfrmPassword,
    upload: upload,
    reviewNGenerate: reviewNGenerate,
    industry: industry
}