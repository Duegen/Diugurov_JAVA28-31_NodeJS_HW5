
import {createServer} from "node:http";
import {addUser, deleteUser, getAllUsers, getUserById, updateUser, User} from "./model/users.js";
import {parsBody} from "./tools.js";
import {emitter} from "./events/emitter.js";
import {myLogger} from "./events/logger.js";



const myServer = createServer(async (req, res) => {
    myLogger.log('Server received request');

    const {url, method} = req;
    const urlObj = new URL(url!, `http://${req.headers.host}`);
    const params = urlObj.searchParams;

    //(/api/usersGET
    switch (urlObj.pathname + method) {
        case "/api/users" + "GET" : {
            const users = getAllUsers();
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(users));
            myLogger.log('All users responsed');
            break;
        }
        case "/api/users" + "POST" : {
            const body = await parsBody(req) as User;
            //must be validation
            const result = addUser(body as User);
            if(result){
                myLogger.save(`User with id ${body.id} was successfully added`)
                res.writeHead(201, {"Content-Type": "text/plain"})
                res.end("User successfully added")
            }
            else{
                myLogger.log(`User with id ${body.id} is already exist`)
                res.writeHead(409, {"Content-Type": "text/plain"})
                res.end("User already exists")
            }
            break;
        }
        case "/api/users" + "DELETE": {
            const id = params.get('userId');
            if(!id){
                res.writeHead(400, {"Content-Type": "text/plain"})
                res.end("No params found");
            }
            else{
                const result = deleteUser(+id);
                if(!result){
                    myLogger.log(`User with id ${id} not found`)
                    res.writeHead(404, {"Content-Type": "text/plain"})
                    res.end(`User with id ${id} not found`)
                }
                else {
                    //emitter.emit('user_removed');
                    myLogger.save(`User with id ${id} has been deleted`)
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify(result));
                }
            }
            break;
        }
        case "/api/user" + "GET": {
            const id = params.get('userId');
            if(!id){
                res.writeHead(400, {"Content-Type": "text/plain"})
                res.end("No params found");
            }
            else{
                const result = getUserById(+id);
                if(!result){
                    res.writeHead(404, {"Content-Type": "text/plain"})
                    res.end(`User with id ${id} not found`)
                }
                else {
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify(result));
                }
            }
            break;
        }
        case "/api/user" + "PATCH": {
            const id = params.get('userId');
            const newName = params.get('newName');
            if(!id || !newName){
                res.writeHead(400, {"Content-Type": "text/plain"})
                res.end("No params found");
            }
            else{
                const result = updateUser(+id, newName);
                if(!result){
                    res.writeHead(404, {"Content-Type": "text/plain"})
                    res.end(`User with id ${id} not found`)
                }
                else {
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify(result));
                }
            }
            break;
        }
        case '/logger' + 'GET':{
            const allLogs = myLogger.getLogArray()
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(allLogs));
            break;
        }
        default:{
            res.writeHead(404, {"Content-Type": "text/plain"})
            res.end("Not found")
        }

    }
});

myServer.listen(3055, () => {
    console.log("Server runs at http://localhost:3055")
})