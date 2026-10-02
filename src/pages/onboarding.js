import { html } from "../utils/template.js";
import { saveUser, WEIGHT_LIMITS } from "../services/userService.js";
import { generateDietPlan } from "../services/calculatorService.js";
import { navigateTo } from "../router.js";
import { getDateKey } from "../utils/date.js";

// Teksty poziomów aktywności — liczby (PAL, białko) są w calculatorService.js,
// tu tylko to, co widzi użytkownik. Przedziały rozłączne: kto trenuje 3×,
// ma dokładnie jedną pasującą odpowiedź.
const ACTIVITY_OPTIONS = [
    {
        value: "sedentary",
        label: "Siedzący",
        description: "Praca przy biurku, treningi rzadziej niż raz w tygodniu.",
    },
    {
        value: "light",
        label: "Lekki",
        description: "1–2 treningi w tygodniu albo dużo chodzenia na co dzień.",
    },
    {
        value: "moderate",
        label: "Umiarkowany",
        description: "3–4 treningi w tygodniu, około 60 minut każdy.",
    },
    {
        value: "active",
        label: "Wysoki",
        description: "5–6 treningów w tygodniu albo praca fizyczna i 3 treningi.",
    },
    {
        value: "very_active",
        label: "Bardzo wysoki",
        description:
            "Trening codziennie lub dwa razy dziennie (obóz, przygotowanie do walki) albo ciężka praca fizyczna i treningi.",
    },
];

const ACTIVITY_HINT = "Liczy się to, co robisz w typowym tygodniu, nie w najlepszym.";

export const renderOnboarding = () => {
    return html` <div class="page-container">
        <header class="page-header">
            <h1 class="page-header__title">Kalkulator Keto</h1>
            <p class="page-header__desc">30 sekund, zero rejestracji — wynik od razu.</p>
        </header>

        <form class="form" id="onboarding-form">
            <div class="form__group">
                <label for="gender" class="form__label ">Płeć</label>
                <select class="form__input" name="gender" id="gender" required>
                    <option value="male">Mężczyzna</option>
                    <option value="female">Kobieta</option>
                </select>
            </div>
            <div class="form__group">
                <label for="age" class="form__label ">Wiek</label>
                <input
                    type="number"
                    name="age"
                    id="age"
                    class="form__input"
                    min="18"
                    max="99"
                    required
                    aria-describedby="age-note"
                />
                <p class="form__note" id="age-note">Kalkulator jest dla osób pełnoletnich.</p>
            </div>
            <div class="form__group">
                <label for="height" class="form__label ">Wzrost (cm)</label>
                <input type="number" name="height" id="height" class="form__input" min="130" max="210" required />
            </div>
            <div class="form__group">
                <label for="weight" class="form__label ">Waga (kg)</label>
                <input
                    type="number"
                    name="weight"
                    id="weight"
                    class="form__input"
                    min="${WEIGHT_LIMITS.min}"
                    max="${WEIGHT_LIMITS.max}"
                    step="0.1"
                    required
                />
            </div>

            <div class="form__group">
                <label for="activity" class="form__label ">Aktywność</label>
                <select class="form__input" name="activity" id="activity" aria-describedby="activity-note" required>
                    <option value="" disabled selected>Wybierz poziom...</option>
                    ${ACTIVITY_OPTIONS.map(
                        (option) => `<option value="${option.value}">${option.label}</option>`,
                    ).join("")}
                </select>
                <p class="form__note" id="activity-note">${ACTIVITY_HINT}</p>
            </div>
            <div class="form__group">
                <label for="sport" class="form__label ">Rodzaj sportu</label>
                <select class="form__input" name="sport" id="sport" required>
                    <option value="" disabled selected>Wybierz dyscyplinę...</option>
                    <option value="combat">Sztuki walki / boks / Muay Thai</option>
                    <option value="gym">Trening siłowy / kształtowanie sylwetki</option>
                    <option value="endurance">Bieganie / kolarstwo / wytrzymałość</option>
                    <option value="recreation">Aktywność rekreacyjna / zdrowie</option>
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
            <!-- Przeciwwskazania dotyczą samej ketozy, nie tylko redukcji — blok
                 obowiązuje przy każdym celu. Zaznaczenie NIE trafia do profilu
                 (handleOnboardingSubmit wybiera pola ręcznie) — to potwierdzenie,
                 nie dana o zdrowiu do przechowywania. -->
            <fieldset class="consent">
                <legend class="form__label consent__legend">Zanim policzysz</legend>
                <p class="consent__lead">Ten plan nie jest dla Ciebie, jeśli:</p>
                <ul class="consent__list">
                    <li>masz cukrzycę typu 1 lub LADA albo przyjmujesz flozyny (np. dapagliflozyna, empagliflozyna),</li>
                    <li>jesteś w ciąży lub karmisz piersią,</li>
                    <li>chorujesz na nerki, wątrobę lub serce (w tym zawał albo udar w ostatnim roku),</li>
                    <li>masz lub miałeś(-aś) zaburzenia odżywiania,</li>
                    <li>czeka Cię operacja albo przechodzisz ciężką infekcję.</li>
                </ul>
                <p class="consent__lead">Przyjmujesz insulinę lub inne leki na cukrzycę? Dietę uzgodnij najpierw z lekarzem.</p>
                <label class="consent__check">
                    <input type="checkbox" name="disclaimer" required />
                    <span>
                        <strong>Żadna z tych sytuacji mnie nie dotyczy.</strong> Rozumiem, że kalkulator to narzędzie
                        edukacyjne, a nie porada lekarza ani dietetyka.
                    </span>
                </label>
                <a href="#zastrzezenia" class="consent__link">Pełna lista przeciwwskazań i zasady korzystania</a>
            </fieldset>

            <button type="submit" class="btn btn--primary">Oblicz kaloryczność</button>
        </form>
    </div>`;
};

export const handleOnboardingSubmit = (event) => {
    event.preventDefault();

    const formElement = event.target;

    const formData = new FormData(formElement);

    const today = getDateKey();

    const userProfile = {
        weightHistory: [{ date: today, weight: Number(formData.get("weight")) }],
        gender: formData.get("gender"),
        age: Number(formData.get("age")),
        height: Number(formData.get("height")),
        weight: Number(formData.get("weight")),
        activity: formData.get("activity"),
        goal: formData.get("goal"),
        sport: formData.get("sport"),
    };

    saveUser(userProfile);

    navigateTo("/dashboard");
};

export const initOnboarding = () => {
    const formElement = document.getElementById("onboarding-form");

    if (formElement) {
        formElement.addEventListener("submit", handleOnboardingSubmit);
    }

    // Opis pod polem pokazuje, co dokładnie oznacza wybrany poziom —
    // w <option> się nie zmieści, a bez niego użytkownik wybiera na oko.
    const activitySelect = document.getElementById("activity");
    const activityNote = document.getElementById("activity-note");

    if (activitySelect && activityNote) {
        activitySelect.addEventListener("change", () => {
            const selected = ACTIVITY_OPTIONS.find((option) => option.value === activitySelect.value);
            activityNote.textContent = selected ? selected.description : ACTIVITY_HINT;
        });
    }
};
