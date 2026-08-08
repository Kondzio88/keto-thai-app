import { html } from "../utils/template.js";
import { saveUser } from "../services/userService.js";
import { generateDietPlan } from "../services/calculatorService.js";

export const renderOnboarding = () => {
    return html` <form class="form" id="onboarding-form">
        <div class="form__group">
            <label for="gender" class="form__label ">Płeć</label>
            <select class="form__input" name="gender" id="gender" required>
                <option value="male">Mężczyzna</option>
                <option value="female">Kobieta</option>
            </select>
        </div>
        <div class="form__group">
            <label for="age" class="form__label ">Wiek</label>
            <input type="number" name="age" id="age" class="form__input" required />
        </div>
        <div class="form__group">
            <label for="height" class="form__label ">Wzrost</label>
            <input type="number" name="height" id="height" class="form__input" required />
        </div>
        <div class="form__group">
            <label for="weight" class="form__label ">Waga</label>
            <input type="number" name="weight" id="weight" class="form__input" required />
        </div>

        <div class="form__group">
            <label for="activity" class="form__label ">Aktywność</label>
            <select class="form__input" name="activity" id="activity" required>
                <option value="high">Wysoka aktywność</option>
                <option value="medium">Średnia aktywność</option>
                <option value="low">Niska aktywność</option>
            </select>
        </div>
        <div class="form__group">
            <label for="goal" class="form__label ">Twój cel</label>
            <select class="form__input" name="goal" id="goal" required>
                <option value="reduction">Redukcja</option>
                <option value="still">Utrzymanie wagi</option>
                <option value="mass">Przybranie wagi</option>
            </select>
        </div>
        <button type="submit" class="btn btn--primary">Oblicz kaloryczność</button>
    </form>`;
};

export const handleOnboardingSubmit = (event) => {
    event.preventDefault();

    const formElement = event.target;

    const formData = new FormData(formElement);

    const userProfile = {
        gender: formData.get("gender"),
        age: Number(formData.get("age")),
        height: Number(formData.get("height")),
        weight: Number(formData.get("weight")),
        activity: formData.get("activity"),
        goal: formData.get("goal"),
    };

    saveUser(userProfile);

    const dietPlan = generateDietPlan(userProfile);
    console.log(dietPlan);
};

export const initOnboarding = () => {
    const formElement = document.getElementById("onboarding-form");

    if (formElement) {
        formElement.addEventListener("submit", handleOnboardingSubmit);
    }
};
