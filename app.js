const http = require("http");
const url = require("url");
const {Nosqljsondb} = require("nosql-json-db");
const db = new Nosqljsondb("./db.json");

const port = process.env.PORT || 4000;
const adminAccessPin = "7bhvbydg088hkan/T7DGBDUWSSFFHDVY478TGFEN48HE8JEB6F";

http.createServer(
    (req, res) => {

        res.writeHead(200,{
            "Access-Control-Allow-Origin"       : `https://amabolearn.github.io`,
            "Acess-Control-Allow-Methods"       : "OPTIONS, POST, GET",
            "Access-Control-Max-Age"            : 2592000,
            "Access-Control-Request-Headers"    : "Content-Type"
        });

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
                accessPin   = qData.accessPin;

                if(subject != "undefined" && subject != "" && !topic && subject && !formType) {
                    sendAvailableTopics(subject)
                }
                else if(subject && topic && !formType) {
                    sendTopicContent(subject , topic)
                }
                else if(formType === "signup"  && email && password && name && (email && password && name) !== "" && accessPin) {
                    if(accessPin === adminAccessPin) {
                        addAdmin( name , email , password);
                    }
                    else {
                        res.write("Access pin is incorrect");
                        res.end();
                    }
                }
                else if(formType === "login"  && email && password && (email && password) !== "") {
                    logAdmin( email , password)
                }
                //xmlHttp.send(`formtype=article&topic=${topic.val().trim()}&subject=${subject.val().trim()}&content=${content.val().trim()}&writer=${info[0].name}&writerId=${info[0].id}`);
                else if(formType === "itemPost" && topic && subject && content && writer && (topic && subject && content && writer) != "" ) {
                    postItem(topic , subject , content , writer);
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
            res.write("<H1>This only functions on post requests and only for the official site</H1>");
            res.end();
        }
        //functions

        function postItem(a, b , c , d) {
            //check if topic has been discussed
            db.selectFrom(`${b}` ,["topic"] , {
                columns : ["topic"],
                equals : [`${a}`]
            },(result) => {
                if(result.topic.length > 0) {
                    res.write("topic discussed");
                    res.end();
                }
                else {
                    db.insertInto(`${b}`, {
                        topic : `${a}`,
                        content : `${c}`,
                        writerName : `${d}`
                    });
                    res.write("posted");
                    res.end();
                }
            });
        }

        function logAdmin(a , b) {
            //checking if account exists
            db.selectFrom("admin" , ["name"] , {
                columns : ["email","password"],
                equals : [a,b]
            }, (result) => {
                if(result.name.length > 0) {
                    res.write(`${JSON.stringify(
                        [
                            {
                                name : result.name[0]
                            }
                        ]
                    )}`);
                    res.end();
                }
                else {
                    res.write("wrong info");
                    res.end();
                }
            });
        }

        function addAdmin(a , b , c) {
            //checking if account exists
            db.selectFrom("admin" , [] , {
                columns : ["name","email","password"],
                equals : [a,b,c]
            }, (result) => {
                if(result.name.length > 0) {
                    res.write(`${JSON.stringify(
                        [
                            {
                                name : a
                            }
                        ]
                    )}`);
                    res.end();
                }
                else {
                    //insert
                    db.insertInto("admin",{
                        name : `${a}`,
                        email : `${b}`,
                        password : `${c}`
                    })
                    res.write(`${JSON.stringify(
                        [
                            {
                                name : a
                            }
                        ]
                    )}`);
                    res.end();
                }
            });
        }
        function sendTopicContent(a , b) {
            db.checkTable(a , (result) => {
                if(result === true) {
                    db.selectFrom(a , ["content","writerName"] , {
                        columns : ["topic"],
                        equals : [`${b}`]
                    } , (result) => {
                        if(result.content.length > 0) {
                            res.write(`${JSON.stringify(
                                [
                                    {
                                        content : result.content[0],
                                        writerName : result.writerName[0]
                                    }
                                ]
                            )}`);
                            res.end();
                        }
                        else {
                            res.write(`no such content available`);
                            res.end();
                        }
                    })
                }
                else {
                    res.write("table does not exist");
                    res.end();
                }
            })
        }

        function sendAvailableTopics(requestSubject) {
            db.checkTable(requestSubject , (result) => {
                if(result === true) {
                    db.selectFrom(requestSubject , ["topic"] , null , (result) => {
                        if(result.topic.length > 0) {
                            res.write(`${JSON.stringify(result.topic)}`);
                            res.end();
                        }
                        else {
                            res.write(`no topics`);
                            res.end();
                        }
                    })
                }
                else {
                    res.write("table does not exist");
                    res.end();
                }
            })
        }
    }
)
.listen(port , () => console.log("Server is running on port "+ port));