const http = require("http");
const url = require("url");
const mysql = require("mysql");

let con = mysql.createConnection({
    host: "sql11.freemysqlhosting.net",
    port: 3306,
    user: "sql11472526",
    password: "cYB1XGTcYe",
    database: "sql11472526"
});

const port = process.env.PORT || 4000;

http.createServer(
    (req, res) => {
        /*let origin = url.parse(req.url , true).host;
        console.log(origin)*/
      /*  if (origin == "http://localhost:5500" || "https://udezueoluomachi.github.io" || "https://amabolearn.github.io") {
            res.writeHead(200,{
                "Access-Control-Allow-Origin"       : `${origin}`,
                "Acess-Control-Allow-Methods"       : "OPTIONS, POST, GET",
                "Access-Control-Max-Age"            : 2592000,
                "Access-Control-Request-Headers"    : "Content-Type"
            });
        } else {*/
            res.writeHead(200,{
                "Access-Control-Allow-Origin"       : `https://udezueoluomachi.github.io`,
                "Acess-Control-Allow-Methods"       : "OPTIONS, POST, GET",
                "Access-Control-Max-Age"            : 2592000,
                "Access-Control-Request-Headers"    : "Content-Type"
            });
       // }


        if(req.method == "POST") {
            let  reqBody = "" , reqUrl = "" , q , qData , subject , topic , name , password , email , formType;
            

            req.on("data", data => {

                reqBody += data;

            });

            req.on("end", () => {

                reqUrl      = req.url + "?" + reqBody;
                q           = url.parse(reqUrl , true);
                qData       = q.query;
                subject     = qData.subject;
                topic       = qData.topic;
                name        = qData.name;
                password    = qData.password;
                email       = qData.email;
                formType    = qData.formtype;
                topic       = qData.topic;
                content     = qData.content;
                writer      = qData.writer;
                writerId    = qData.writerId;

                if(subject != "undefined" && subject != "" && !topic && subject && !formType) {
                    sendAvailableTopics(subject)
                }
                else if(subject && topic && !formType) {
                    sendTopicContent(subject , topic)
                }
                else if(formType === "signup"  && email && password && name && (email && password && name) !== "") {
                    addAdmin( name , email , password)
                }
                else if(formType === "login"  && email && password && (email && password) !== "") {
                    logAdmin( email , password)
                }
                //xmlHttp.send(`formtype=article&topic=${topic.val().trim()}&subject=${subject.val().trim()}&content=${content.val().trim()}&writer=${info[0].name}&writerId=${info[0].id}`);
                else if(formType === "itemPost" && topic && subject && content && writer && writerId && (topic && subject && content && writer && writerId) != "" ) {
                    postItem(topic , subject , content , writer , writerId);
                }
                else {
                    res.write(`${JSON.stringify({
                        text : "Hello world"
                    })}`);
                    res.end();
                }
            });
        }
        else {
            res.write("Hello world");
            res.end();
        }
        //functions

        async function postItem(a, b , c , d , e) {
            //check if topic has been discussed
            let sql = `SELECT * FROM ${b} WHERE topic = '${a}'`;
            await con.query(sql , (err , result) => {
                if(err) throw err;
                if(result.length > 0) {
                    endCon();
                    res.write("topic discussed");
                    res.end();
                }
                else {
                    endCon();
                    async function insertion() {
                        let sql = `INSERT INTO ${b} (topic , content , writerName , writerId) VALUES (? , ? , ? , ?)`;
                        await con.query(sql , [a , c , d , e] , (err , result) => {
                            if(err) throw err;
                            endCon();
                            res.write("posted");
                            res.end();
                        })
                    }
                    insertion();
                }
            })
        }

        async function logAdmin(a , b) {
            //checking if account exists
            let sql = `SELECT * FROM admin WHERE email = '${a}' AND password = '${b}'`;
            await con.query(sql , (err , result) => {
                if(err) throw err;
                if(result.length > 0 ) {
                    endCon();
                    res.write(`${JSON.stringify(
                        [
                            {
                                name : result[0].name,
                                id : result[0].id
                            }
                        ]
                    )}`);
                    res.end();

                }
                else {
                    endCon();
                    res.write("wrong info");
                    res.end();
                }
            })
        }
        async function addAdmin(a , b , c) {
            //checking if account exists
            let sql = `SELECT * FROM admin WHERE name = '${a}' AND email = '${b}' AND password = '${c}'`;
            await con.query(sql , (err , result) => {
                if(err) throw err;
                if(result.length > 0 ) {
                    endCon();
                    res.write(`${JSON.stringify(
                        [
                            {
                                name : a,
                                id : result[0].id,
                            }
                        ]
                    )}`);
                    res.end();

                }
                else {
                    endCon();
                    let sql = `INSERT INTO admin (name , email , password) VALUES (? , ? , ?)`;
                    let values = [a,b,c]
                    async function add() {
                        await con.query(sql, values , ((err , result) => {
                            if(err) throw err;
                            endCon();
                            res.write(`${JSON.stringify(
                                [
                                    {
                                        name : a,
                                        id : result.insertId,
                                    }
                                ]
                            )}`);
                            res.end();
                        }))
                    }
                    add();
                }
            })
        }
        async function sendTopicContent(a , b) {
            let sql = `
            SELECT TABLE_NAME,
            CASE
              WHEN EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = "${a}") THEN "table exists"
              ELSE "table does not exist"
            END AS existence
            FROM INFORMATION_SCHEMA.TABLES;
            `;
            await con.query(sql, function (err, result) {
                if (err) throw err;

                if (result[0].existence === "table exists") {
                    let sql = `SELECT content , writerName FROM ${a} WHERE topic = '${b}'`;
                    endCon();
                    async function select() {
                        await con.query(sql, (err, result) => {
                            if (err) throw err;
    
                            if(result.length > 0) {
                                endCon();
                                res.write(`${JSON.stringify(
                                    [
                                        {
                                            content : result[0].content,
                                            writerName : result[0].writerName
                                        }
                                    ]
                                )}`);
                                res.end();
                            }
                            else {
                                endCon();
                                res.write(`no such content available`);
                                res.end();
                            }
                        });
                    }
                    select();
                }
                else {
                    endCon();
                    res.write("table does not exist");
                    res.end();
                }
            });
        }

        async function sendAvailableTopics(requestSubject) {
            let sql = `
                SELECT TABLE_NAME,
                CASE
                  WHEN EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = "${requestSubject}") THEN "table exists"
                  ELSE "table does not exist"
                END AS existence
                FROM INFORMATION_SCHEMA.TABLES;
                `;
            await con.query(sql, function (err, result) {
                if (err) throw err;

                if (result[0].existence === "table exists") {
                    let sql = `SELECT topic FROM ${requestSubject}`;
                    endCon();
                    async function select() {
                        await con.query(sql, (err, result) => {
                            if (err) throw err;
    
                            if(result.length > 0) {
                                endCon();
                                res.write(`${JSON.stringify(result)}`);
                                res.end();
                            }
                            else {
                                endCon();
                                res.write(`no topics`);
                                res.end();
                            }
                        });
                    }
                    select();
                }
                else {
                    endCon();
                    res.write("table does not exist");
                    res.end();
                }
            });
        }
    }
)
.listen(port , () => console.log("server is running on port " + port));


function endCon() {

    con.end();

    con = mysql.createConnection({
        host: "sql11.freemysqlhosting.net",
        port: 3306,
        user: "sql11472526",
        password: "cYB1XGTcYe",
        database: "sql11472526"
    });
}