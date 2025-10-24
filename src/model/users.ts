
export type User = {
    id: number,
    userName: string
}

let users:User[] = [
    {id:7, userName: "Bond"}
]

export const addUser = (user:User):boolean => {
    if(users.findIndex(item => item.id === user.id)!==-1)
        return false;
    users.push(user);
    return true;
}

export const getAllUsers = () => [...users]

export const getUserById = (id:number) => {
    const result = users.find(item => item.id === id);
    return result;
}

export const deleteUser = (id:number) => {
    const result = users.find(item => item.id === id);
    users = users.filter(item => item.id !== id);
    return result;
}
export const updateUser = (id:number, newName:string)=> {
    let result = false;
    const temp = users.find(item => item.id === id);
    if(temp) {
        temp.userName = newName;
        result = true;
    }
    return result;
}

const checkID = (id: string):boolean => {
  //  const id = params.get('userId');
    if(Number.isNaN(Number(id))) return false;
    if(+id! <= 0 || !Number.isInteger(+id!)) return false
    return true;
}

const checkUserName = (name:string):boolean => {
    if(!name) return false;
    return true;
}

export const checkParams = (params: URLSearchParams, method:string):boolean => {
    switch(method) {
        case 'GET':{
            if(!checkID(params.get('userId')!)) return false;
            break;
        }
        case 'DELETE':{
            if(!checkID(params.get('userId')!)) return false;
            break;
        }
        case 'POST':{
            if(!checkID(params.get('userId')!)) return false;
            if(!checkUserName(params.get('userName')!)) return false;
            break;
        }
        case 'PATCH':{
            if(!checkID(params.get('userId')!)) return false;
            break;
        }
        default: return false;
    }

    return true;
}