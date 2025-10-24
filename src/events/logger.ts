import {EventEmitter} from "node:events";
import fs from 'fs';

class Logger extends EventEmitter {
    private filePath: string = "";
    private logArray: Array<{ date: string, message: string }> = [];

    createLogFile() {
            const start = new Date().toISOString();
            const directory = './logs/';
            this.filePath = './logs/log_' + start.replace(/:/g, '-') + '.txt';
            fs.mkdir(directory, (err) => {
                if (err && err.code !== 'EEXIST') this.save("log directory not created")
                else {
                    fs.writeFile(this.filePath, "=============Server log file=============\n", err => {
                        if (err) this.save("log file cannot be created")
                        else {
                            this.saveToFile("session starts");
                            this.saveToFile("server successfully started");
                        }
                    })
                }
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
        if (err) myLogger.save("error - log file not found");
        else {
            fs.appendFile(filePath, new Date().toISOString() + ' ' + message + '\n', (err: any) => {
                if (err) myLogger.save("error - logs can't be saved to file");
            })
        }
    });
})

