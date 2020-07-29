export function hashTagArr(str=''){
    if(!str) return []
    return str.split("#").filter(elem => elem !='')
}