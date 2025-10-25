import {createServer} from "node:http";
import {addUser, checkParams, deleteUser, getAllUsers, getUserById, updateUser, User} from "./model/users.js";
import {parsBody} from "./tools.js";
import {myLogger} from "./events/logger.js";

const myServer = createServer(async (req, res) => {
    myLogger.log('server received request');

    const {url, method} = req;
    const urlObj = new URL(url!, `http://${req.headers.host}`);
    const params = urlObj.searchParams;

    switch (urlObj.pathname + method) {
        case "/api/users" + "GET": {
            if (!params.size) {
                const users = getAllUsers();
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(users));
                myLogger.logfileExist() ? myLogger.saveToFile('all users responsed')
                                        : myLogger.save('all users responsed');
            } else {
                const id = params.get('userId');
                if (!id) {
                    myLogger.log(`user id is not found (get user by id)`)
                    res.writeHead(400, {"Content-Type": "text/plain"})
                    res.end("user id is not found");
                } else {
                    if (checkParams(params, method!)) {
                        const result = getUserById(+id);
                        if (!result) {
                            myLogger.log(`user with id ${id} not found (get user by id)`)
                            res.writeHead(404, {"Content-Type": "text/plain"})
                            res.end(`user with id ${id} not found`)
                        } else {
                            myLogger.logfileExist() ? myLogger.saveToFile(`user with id ${id} is responsed`)
                                                    : myLogger.save(`user with id ${id} is responsed`);
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify(result));
                        }
                    } else {
                        myLogger.log(`user id is incorrect (get user by id)`)
                        res.writeHead(404, {"Content-Type": "text/plain"})
                        res.end(`user id is incorrect`)
                    }
                }
            }
            break;
        }
        case "/api/users" + "POST" : {
            const body = await parsBody(req) as User;
            params.append('userId', body.id + "")
            params.append('userName', body.userName)
            if (checkParams(params, method!)) {
                const result = addUser(body as User);
                if (result) {
                    myLogger.logfileExist() ? myLogger.saveToFile(`user with id ${body.id} is added`)
                                            : myLogger.save(`user with id ${body.id} is added`)
                    res.writeHead(201, {"Content-Type": "text/plain"})
                    res.end("User successfully added")
                } else {
                    myLogger.log(`User with id ${body.id} is already exist`)
                    res.writeHead(409, {"Content-Type": "text/plain"})
                    res.end("User already exists")
                }
            } else {
                myLogger.log(`user id is incorrect (add user)`)
                res.writeHead(404, {"Content-Type": "text/plain"})
                res.end(`user id or user is incorrect`)
            }
            break;
        }
        case "/api/users" + "DELETE": {
            const id = params.get('userId');
            if (!id) {
                myLogger.log(`user id is not found (delete user)`)
                res.writeHead(400, {"Content-Type": "text/plain"})
                res.end("No params found");
            } else {
                if (checkParams(params, method!)) {
                    const result = deleteUser(+id);
                    if (!result) {
                        myLogger.log(`user with id ${id} not found (delete user)`)
                        res.writeHead(404, {"Content-Type": "text/plain"})
                        res.end(`User with id ${id} not found`)
                    } else {
                        myLogger.logfileExist() ? myLogger.saveToFile(`user with id ${id} is deleted`)
                                                : myLogger.save(`user with id ${id} is deleted`);
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify(result));
                    }
                } else {
                    myLogger.log(`user id is incorrect (get user by id)`)
                    res.writeHead(404, {"Content-Type": "text/plain"})
                    res.end(`user id is incorrect`)
                }
            }
            break;
        }
        case "/api/users" + "PATCH": {
            const id = params.get('userId');
            const newName = params.get('newName');
            if (!id || !newName) {
                myLogger.log(`user id or user name not found (update user)`);
                res.writeHead(400, {"Content-Type": "text/plain"})
                res.end("No params found");
            } else {
                if (checkParams(params, method!)) {
                    const result = updateUser(+id, newName);
                    if (!result) {
                        myLogger.log(`user with id ${id} not found (update user)`)
                        res.writeHead(404, {"Content-Type": "text/plain"})
                        res.end(`User with id ${id} not found`)
                    } else {
                        myLogger.logfileExist() ? myLogger.saveToFile(`user with id ${id} is updated`)
                                                : myLogger.save(`user with id ${id} is updated`);
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify(result));
                    }
                } else {
                    myLogger.log(`user id or user name is incorrect (get user by id)`)
                    res.writeHead(404, {"Content-Type": "text/plain"})
                    res.end(`user id or user name is incorrect`)
                }
            }
            break;
        }
        case '/logger' + 'GET': {
            myLogger.logfileExist() ? myLogger.saveToFile('log file is responsed')
                                    : myLogger.save('log file is responsed');
            const allLogs = myLogger.getLogArray()
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(allLogs));
            break;
        }
        default: {
            res.writeHead(404, {"Content-Type": "text/plain"})
            res.end("Not found")
        }

    }
});

myServer.listen(3055, () => {
    console.log("Server runs at http://localhost:3055")
})

myServer.on('listening', () => {
    myLogger.createLogFile().then((message) => {
        myLogger.saveToFile("session starts")
        myLogger.saveToFile("server successfully started")
        myLogger.saveToFile(message + "")
    }).catch((message) => {
        myLogger.save("session starts")
        myLogger.save("server successfully started")
        myLogger.save(message + "")
    })

})

myServer.on('close', () => {
    if(myLogger.logfileExist()) {
        myLogger.saveToFile("server successfully closed");
        myLogger.saveToFile("session finished");
    }
    else{
        myLogger.save("server successfully closed");
        myLogger.save("session finished");
    }
})

//Server close imitation
// setTimeout(() => {
//     myServer.close(() => {
//         console.log('Server closed!');
//     });
// }, 60000);