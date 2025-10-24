import {IncomingMessage} from "node:http";

export const sayHi = (name:string):void => {
    console.log(`Hello ${name}`);
}

export async function parsBody(req: InstanceType<typeof IncomingMessage>) {

    return new Promise((resolve, reject) => {
        let body = "";
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body))
            } catch (e) {
                reject(new Error('Invalid json'))
            }
        })
    })
}