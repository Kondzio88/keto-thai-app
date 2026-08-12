const calculateBMR = (weight, height, age, gender) => {
    if (gender === "male") {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    }

    if (gender === "female") {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
};

const calculateTDEE = (bmr, activity) => {
    if (activity === "low") {
        return bmr * 1.2;
    }
    if (activity === "medium") {
        return bmr * 1.55;
    }
    if (activity === "high") {
        return bmr * 1.725;
    }
};

const calculateTargetCalories = (tdee, goal) => {
    if (goal === "reduction") {
        return tdee - 500;
    }
    if (goal === "mass") {
        return tdee + 500;
    }
    if (goal === "still") {
        return tdee;
    }
};

const calculateKetoMacros = (calories, weight) => {
    const carbs = 25;
    const proteins = Math.round(weight * 2);

    const usedCalories = carbs * 4 + proteins * 4;
    const fats = Math.round((calories - usedCalories) / 9);

    return {
        carbs,
        proteins,
        fats,
    };
};

export const generateDietPlan = (userProfile) => {
    const { age,gender,height,weight,activity,goal} = userProfile
   
    const bmrResult = calculateBMR(weight,height,age,gender)
    
    const tdeeResult = calculateTDEE(bmrResult,activity)

    const goalResult = Math.round(calculateTargetCalories(tdeeResult,goal))

    const macrosResult = calculateKetoMacros(goalResult,weight)

    return {
        calories:goalResult,
        ...macrosResult
    }

    
}


const mockUserProfile = {
    gender: "male",
    age: 38,
    height: 180,
    weight: 73,
    activity: "high",
    goal: "reduction",
};

