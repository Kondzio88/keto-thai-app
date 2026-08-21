import { html } from "../utils/template.js";
import { getBase } from "../utils/env.js";

export const renderCamp = () => {
    return html` <section class="camp-hero">
        <div class="camp-hero__container page-container">
            <div class="camp-hero__layout">
                <!-- LEWA KOLUMNA -->
                <div class="camp-hero__content">
                    <span class="camp-hero__kicker">12-Tygodniowy Program Hybrydowy</span>
                    <h1 class="camp-hero__title">Zbuduj Formę Wojownika Na Ketogenicznym Paliwie</h1>

                    <p class="camp-hero__desc">
                        12-tygodniowy, bezkompromisowy reżim łączący dietę ketogeniczną z dyscypliną i wydolnością Muay
                        Thai. Otrzymujesz indywidualne prowadzenie, precyzyjną strategię makro oraz stałe wsparcie
                        trenera.
                    </p>

                    <div class="camp-hero__badges">
                        <span class="camp-hero__badge"><i data-lucide="users" class="badge-icon"></i> Limit: 5 miejsc</span>
                        <span class="camp-hero__badge"><i data-lucide="shield-check" class="badge-icon"></i> Prowadzenie 1 na 1</span>
                        <span class="camp-hero__badge"><i data-lucide="flame" class="badge-icon"></i> Protokół Lamai Muay Thai</span>
                    </div>

                    <div class="camp-hero__actions">
                        <a href="#apply" class="btn btn--primary">Aplikuj do Campu</a>
                        <a href="#phases" class="btn btn--secondary">Zobacz Fazy Programu</a>
                    </div>
                </div>

                <!-- PRAWA KOLUMNA (KARTA VIP) -->
                <div class="camp-hero__visual">
                    <div class="fighter-card">
                        <div class="fighter-card__header">
                            <span class="fighter-card__tag">VIP ACCESS</span>
                            <i data-lucide="zap" class="fighter-card__icon"></i>
                        </div>

                        <div class="fighter-card__body">
                            <h3 class="fighter-card__title">KETO THAI // ELITE FIGHTER</h3>
                            <p class="fighter-card__edition">BATCH #04 &bull; SEZON 2026</p>
                        </div>

                        <div class="fighter-card__footer">
                            <span class="fighter-card__protocol">LAMAI CAMP PROTOCOL</span>
                            <span class="fighter-card__code">#KT-8842-PRO</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
};

export const initCamp = () => {};
