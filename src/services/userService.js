import { saveState, loadState } from '../state/store.js';

const userProfile = {
    gender: "male",
    age: 33,
    height: 180,
    weight: 90,
    activityLevel: "high",
    goal: "reduction",
};

export const saveUser = (userData) => {
    saveState("keto_user", userData);
};

export const getUser = () => {
    return loadState("keto_user");
};

export const clearUser = () => {
    localStorage.removeItem('keto_user')
}