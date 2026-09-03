export const saveState = (key,data) => {
    localStorage.setItem(key , JSON.stringify(data))
}

export const loadState = (key) => {
   const data = localStorage.getItem(key)
   if(data){
       return JSON.parse(data)
   }else{
    return null
   }
}