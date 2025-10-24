import {EventEmitter} from "node:events";
import fs from 'fs';
import path from "node:path";

class Logger extends EventEmitter {
    private filePath: string = "";
    private logArray: Array<{ date: string, message: string }> = [];

    createLogFile() {
        const start = new Date().toISOString();

        this.filePath = './logs/log_' + start.replace(/:/g, '-') + '.txt';
        fs.writeFile(this.filePath, "=============Server log file=============\n", err => {
            if (err) myLogger.emit('saved', "log file cannot be created")
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

    saveToFile(message: string) {
        this.emit('saveToFile', this.filePath, message);
    }

    async clearLogDir() {
        const directory = './logs/';
        fs.readdir(directory, (err, files) => {
            if (err) console.log("can't clean log directory")
            else {
                files.forEach(file => {
                    if (file.includes('log')) fs.unlink(path.join(directory, file), (err) => {});
                })
            }
        })
    }
}

export const myLogger = new Logger();

myLogger.on('logged', (message: string) => {
    console.log(new Date().toISOString(), message)
});

myLogger.on('saveToFile', (filePath: string, message: string) => {
    myLogger.addLogToArray(message);
    console.log(new Date().toISOString(), message)

    fs.access(filePath, fs.constants.F_OK, (err: any) => {
        if (err) myLogger.emit('saved', "error - log file not found");
        else {
            fs.appendFile(filePath, new Date().toISOString() + ' ' + message + '\n', (err: any) => {
                if (err) myLogger.emit('saved', "error - logs can't be saved to file");
            })
        }
    });
})

