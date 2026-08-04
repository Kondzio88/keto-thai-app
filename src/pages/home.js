import { html } from "../utils/template.js";

export const renderHome = () => {
  return html`
    <main>
      <section
        class="hero"
        style="background-image: url('https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=1920'); background-size: cover; background-position: center; min-height: 100vh;"
      >
        <div class="hero__content">
          <h1 class="hero__title">Forma zycia czeka na Ciebie</h1>
          <p class="hero__desc">Nowy ty w zdrowym metabolicznym stylu keto.</p>
          <div class="hero__actions">
            <a href="/dashboard" class="btn btn--primary" data-link
              >Policz swoje kalorie</a
            >
            <a href="/recipes" class="btn btn--secondary" data-link
              >Przepisy Keto</a
            >
          </div>
        </div>
      </section>
    </main>
  `;
};
