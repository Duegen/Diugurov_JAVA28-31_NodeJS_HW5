import {EventEmitter} from "node:events";
import fs from 'fs';

class Logger extends EventEmitter {
    private filePath: string = "";
    private logArray: Array<{ date: string, message: string }> = [];
    private flagLogExists = false;

    logfileExist(){
        return this.flagLogExists;
    }

    setLogExist(flag:boolean){
        this.flagLogExists = flag;
    }

    async createLogFile() {
        return new Promise((resolve, reject) => {
            const start = new Date().toISOString();
            const directory = './logs/';
            this.filePath = './logs/log_' + start.replace(/:/g, '-') + '.txt';
            fs.mkdir(directory, (err) => {
                if (err && err.code !== 'EEXIST')
                    reject("log directory not created")
                else {
                    fs.writeFile(this.filePath, "=============Server log file=============\n", err => {
                        if (err) reject("log file not created");
                        else {
                            resolve("log file created");
                            this.flagLogExists = true;
                        }
                    })
                }
            })
        })
    }

    addLogToArray(message: string) {
        this.logArray.push({date: new Date().toISOString(), message});
    }

    getLogArray() {
        return [...this.logArray];
    }

    log(message: string) {
        this.emit('logged', message);
    }

    save(message: string) {
        this.emit('saved', message);
    }

    saveToFile(message: string) {
        this.emit('saveToFile', this.filePath, message);
    }
}

export const myLogger = new Logger();

myLogger.on('logged', (message: string) => {
    console.log(new Date().toISOString(), message)
});

myLogger.on('saved', (message: string) => {
    console.log(new Date().toISOString(), message)
    myLogger.addLogToArray(message);
});

myLogger.on('saveToFile', (filePath: string, message: string) => {
    myLogger.addLogToArray(message);
    console.log(new Date().toISOString(), message)

    fs.access(filePath, fs.constants.F_OK, (err: any) => {
        if (err) {
            myLogger.setLogExist(false)
            myLogger.save("log file not found");
        }
        else {
            fs.appendFile(filePath, new Date().toISOString() + ' ' + message + '\n', (err: any) => {
                if (err) myLogger.save("logs can't be saved to file");
            })
        }
    });
})

