
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

