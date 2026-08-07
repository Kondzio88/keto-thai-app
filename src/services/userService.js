const userProfile = {
    gender: 'male',
    age:33,
    height: 180,
    weight: 90,
    activityLevel: 'high',
    goal: "reduction"
}

export const saveUser = (userData) => {
    localStorage.setItem('keto_user',JSON.stringify(userData))
}

const getUser = () => { 
    const saveData = localStorage.getItem('keto_user')
    if(saveData){   
        return JSON.parse(saveData)
    }else{
        return null
    }
    
}