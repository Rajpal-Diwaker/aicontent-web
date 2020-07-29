
let util = require('../Utilities/util'),
bcrypt = require('bcrypt'),
jwt = require('jsonwebtoken'),
user_dao = require('../dao/user');

let login = util.errHandler(async (req, res) => {
	let { password, email } = req.body
    
    email = email.replace(/ /g,'').toLowerCase()

    const obj = { password, email }
    let usrObj = await new Promise((resolve, reject) => {
        user_dao.userPassword(obj, (err, result) => {
            if(err) reject(err)
            resolve(result[0])
        })
    })
    
    if(bcrypt.compareSync(password, usrObj.password)) {
        let token = jwt.sign({ roleid: usrObj.roleid, userId: usrObj.id }, util.secret);

        res.status(200).send({code: util.statusCode.OK, message: util.statusMessage.LOGIN_SUCCESSFULLY, result: {userId: usrObj.id, name: usrObj.name, phone: usrObj.phone, email: usrObj.email, token}})
    } else {
        res.status(401).send({code: util.statusCode.FOUR_ZERO_ONE, message: util.statusMessage.PWD_NOT_MATCH})
    }  
})

let signup = util.errHandler(async (req, res) => {
    let { name, phone, email, password, company_name, designation } = req.body

    let hash = bcrypt.hashSync(password, 10);
    const obj = { name, phone, email, password: hash, company: company_name, designation }
    
    user_dao.signup(obj, (err, result) => {
        res.status(200).send({code: util.statusCode.OK, message: util.statusMessage.USER_ADDED})
    })
})

let forgotPassword = util.errHandler(async (req, res) => {
    let { email } = req.body

    util.sendEmail({ email })
    res.status(200).send({code: util.statusCode.OK, message: util.statusMessage.EMAIL_SENT})
})

let contact = util.errHandler(async (req, res) => {
    let { name, email, subject, message } = req.body

    let obj = { name, email, subject, message }
    
    user_dao.contact(obj, (err, result) => {
        res.status(200).send({code: util.statusCode.OK, message: util.statusMessage.GET_BACK_SOON})
    })
})

let userQuery = util.errHandler(async (req, res) => {
    const { topic } = req.body
    runPythonScript(topic, res)
})

function runPythonScript(req, res) { 
    const { exec } = require("child_process");

    exec("conda activate python3.5", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        var spawn = require("child_process").spawn; 
        var process = spawn('python3', ["./rasa-intent-query-predict.py", 
                                req] ); 
      
        process.stdout.on('data', function(data) { 
            res.send(data.toString()); 
        }) 
        process.stderr.on('data', function(data) { 
            res.send(data.toString()); 
        })
        process.on('exit', function(code) {
            console.log("Exited with code " + code);
        });
    });
} 

let articles = util.errHandler(async (req, res) => {
    const { topic, keywords, industry, source, link, introduction, body, conclusion, data_points } = req.body
    
    const obj = { topic, keywords, industry, source, link, introduction, body, conclusion, data_points }
    user_dao.articles(obj, (err, result) => {
        res.status(200).send({code: util.statusCode.OK, message: util.statusMessage.ARTICLE_SAVED_SUCCESS})
    })
})

let getArticles = util.errHandler(async (req, res) => {
    const { topic, userId } = req.body
    
    const obj = { topic, userId }
    user_dao.getArticles(obj, (err, result) => {
        res.status(200).send({code: util.statusCode.OK, message: util.statusMessage.ARTICLE_FETCHED_SUCCESS, result})
    })
})

let language = util.errHandler(async (req, res) => {
    
    user_dao.language((err, result) => {
        res.status(200).send({code: util.statusCode.OK, message: util.statusMessage.LANGUAGE_FETCHED_SUCCESS, result})
    })
})

let userPlan = util.errHandler(async (req, res) => {
    const { userId, planId } = req.body

    const obj = { userId, planIds }
    
    user_dao.userPlan(obj, (err, result) => {
        res.status(200).send({ code: util.statusCode.OK, message: util.statusMessage.SUCCESS })
    })
})

let plan = util.errHandler(async (req, res) => {
    const obj = {}
    
    user_dao.plan(obj, (err, result) => {
        res.status(200).send({ code: util.statusCode.OK, message: util.statusMessage.SUCCESS, result })
    })
})

let user = util.errHandler(async (req, res) => {
    const { userId } = req.user
    const obj = { userId }
    
    user_dao.userPassword(obj, (err, result) => {
        let ob = result[0]
        delete ob.password

        res.status(200).send({ code: util.statusCode.OK, message: util.statusMessage.SUCCESS, result: result[0] })
    })
})

let editProfile = util.errHandler(async (req, res) => {
    const { userId } = req.user
    const { name, email, phone, company, designation, address } = req.body
    let userpic = req.files[0].userpic

    let objj = {
        userpic, userId
    }
    user_dao.upload(objj, (err, result) => {})

    const obj = { userId, name, email, phone, company, designation, address }
    
    user_dao.editProfile(obj, (err, result) => {
        res.status(200).send({ code: util.statusCode.OK, message: util.statusMessage.SUCCESS })
    })
})

let transaction = util.errHandler(async (req, res) => {
    const { userId } = req.user

    const obj = { userId }
    
    user_dao.transaction(obj, (err, result) => {
        res.status(200).send({ code: util.statusCode.OK, message: util.statusMessage.SUCCESS, result })
    })
})

let downloadReceipt = util.errHandler(async (req, res) => {
    const { userId } = req.user
    const { id } = req.body
    const obj = { userId, id }
    
    user_dao.getArticles(obj, (err, result) => {

        let html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title></title>
            <link rel="stylesheet" href="assets/css/pdf.css" media="all" />
          </head>
          <style type="text/css">
            .clearfix:after {
          content: "";
          display: table;
          clear: both;
        }
        
        a {
          color: #5D6975;
          text-decoration: underline;
        }
        
        body {
          position: relative;
          width: 21cm;  
          height: 29.7cm; 
          margin: 0 auto; 
          color: #001028;
          background: #FFFFFF; 
          font-family: Arial, sans-serif; 
          font-size: 12px; 
          font-family: Arial;
        }
        
        header {
          padding: 10px 0;
          margin-bottom: 30px;
        }
        
        #logo {
          text-align: center;
          margin-bottom: 10px;
        }
        
        #logo img {
          width: 90px;
        }
        
        h1 {
          border-top: 1px solid  #5D6975;
          border-bottom: 1px solid  #5D6975;
          color: #5D6975;
          font-size: 2.4em;
          line-height: 1.4em;
          font-weight: normal;
          text-align: center;
          margin: 0 0 20px 0;
          background: url(assets/images/dimension.png);
        }
        
        #project {
          float: left;
        }
        
        #project span {
          color: #5D6975;
          text-align: right;
          width: 80px;
          margin-right: 10px;
          display: inline-block;
          font-size: 0.8em;
        }
        
        #company {
          float: right;
          text-align: right;
        }
        
        #project div,
        #company div {
          white-space: nowrap;        
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          border-spacing: 0;
          margin-bottom: 20px;
        }
        
        table tr:nth-child(2n-1) td {
          background: #F5F5F5;
        }
        
        table th,
        table td {
          text-align: center;
        }
        
        table th {
          padding: 5px 20px;
          color: #5D6975;
          border-bottom: 1px solid #C1CED9;
          white-space: nowrap;        
          font-weight: normal;
        }
        
        table .service,
        table .desc {
          text-align: left;
        }
        
        table td {
          padding: 20px;
          text-align: center;
        }
        
        table td.service,
        table td.desc {
          vertical-align: top;
        }
        
        table td.unit,
        table td.qty,
        table td.total {
          font-size: 1.2em;
        }
        
        table td.grand {
          border-top: 1px solid #5D6975;;
        }
        
        #notices .notice {
          color: #5D6975;
          font-size: 1.2em;
        }
        
        footer {
          color: #5D6975;
          width: 100%;
          height: 30px;
          position: absolute;
          bottom: 0;
          border-top: 1px solid #C1CED9;
          padding: 8px 0;
          text-align: center;
        }
          </style>
          <body>
            <header class="clearfix" style="padding: 10px 0;margin-bottom: 30px;">
              <div id="logo">
                <img src="assets/images/contentwiz.png" alt="logo">
              </div>
              <h1>Article</h1>
              <div id="project">
                <div><span>COMPANY NAME</span> Techugo Pvt. Ltd.</div>
                <div><span>NAME</span> John Doe</div>
                <div><span>DESIGNATION</span> Software Engineer</div>
                <div><span>ADDRESS</span> 796 Silver Harbour, TX 79273, US</div>
                <div><span>EMAIL</span> <a href="mailto:john@example.com">john@example.com</a></div>
              </div>
            </header>
            <main>
              <table>
                <thead>
                  <tr>
                    <th class="service">TOPIC</th>
                    <th class="desc">CONTENT</th>
                    <th>ATTRIBUTES</th>
                    <th>WORD</th>
                    <th>LANGUAGE</th>
                    <th>UNIQUENESS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="service">Growth of  bitcoin</td>
                    <td class="desc">U.S. stock index futures were slightly higher Friday morning as investors digest growth data out of China. China's economic growth cooled to its weakest in nearly 30 years in 2019 amid a bruising trade war with the United States, and more stimulus is expected this year as Beijing tries to boost sluggish investment and demand. World shares rose to record highs on Friday, buoyed by Chinese data that suggested the world's second-biggest economy was stabilizing. Our robot colleague Satoshi Nakaboto writes about Bitcoin every fucking day. Welcome to another edition of Bitcoin Today, where I, Satoshi Nakaboto, tell you what’s been going on with Bitcoin in the past 24 hours. As Faraday used to say: Money makes the world go around! Bitcoin price We closed the day, January 16 2020, […] No, New Hampshire residents won’t be able to pay their taxes in Bitcoin or cryptocurrency. Public records show that a bill filed this time last year, which would allow government agencies to accept digital assets for tax payments, has been shuttered. [Read: This Canadian town is letting residents pay taxes in Bitcoin] Had the plans gone ahead, […]</td>
                    <td class="unit"> 187</td>
                    <td class="qty"> 187</td>
                    <td class="total">English</td>
                    <td>88%</td>
                  </tr>
                </tbody>
              </table>
            </main>
          </body>
        </html>`
        
        util.htmlPdf({html})
        .then(success => {
          res.status(200).send({ code: util.statusCode.OK, message: util.statusMessage.SUCCESS, result: success })
        })
        .catch(errr =>{
          res.status(401).send({ code: util.statusCode.FOUR_ZERO_ONE, message: util.statusMessage.ERROR })
        })
        
    })
})

let cnfrmPassword = util.errHandler(async (req, res) => {
    let { userId, password } = req.user

    password = bcrypt.hashSync(password, 10);

    const obj = { userId, password }
    
    user_dao.cnfrmPassword(obj, (err, result) => {
        res.status(200).send({ code: util.statusCode.OK, message: util.statusMessage.SUCCESS })
    })
})

let reviewNGenerate = util.errHandler(async (req, res) => {
    let { userId } = req.user
    let { articleId, article, topic, industry } = req.body
    let { introduction, body, conclusion } = article
    body = body.replace(/(<([^>]+)>)/ig,"")
    const obj = { industry, articleId, introduction: (introduction || ''), body, conclusion: (conclusion || ''), topic, userId }

    user_dao.reviewNGenerate(obj, (err, result) => {
        res.status(200).send({ code: util.statusCode.OK, message: util.statusMessage.SUCCESS, result: result })
    })
})

let industry = util.errHandler(async (req, res) => {
  user_dao.industry({}, (err, result) => {
      res.status(200).send({ code: util.statusCode.OK, message: util.statusMessage.SUCCESS, result })
  })
})

module.exports = {
    userQuery: userQuery,
    login: login,
    signup: signup,
    contact: contact,
    forgotPassword: forgotPassword,
    articles: articles,
    getArticles: getArticles,
    language: language,
    userPlan: userPlan,
    plan: plan,
    user: user,
    editProfile: editProfile,
    transaction: transaction,
    downloadReceipt: downloadReceipt,
    cnfrmPassword: cnfrmPassword,
    reviewNGenerate: reviewNGenerate,
    industry: industry
};
