import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Политика за бисквитки · Vekto Academy",
  description: "Какви бисквитки използва Vekto Academy и как да управлявате предпочитанията си.",
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Политика за бисквитки" updated="21 април 2026 г.">
      <section>
        <h2>1. Какво са бисквитките</h2>
        <p>
          Бисквитките („cookies“) са малки текстови файлове, които се записват на Вашето устройство, когато
          посещавате уеб сайт. Те позволяват на сайта да „запомни“ определена информация за Вашето посещение —
          напр. дали сте влезли в акаунта си.
        </p>
      </section>

      <section>
        <h2>2. Какви бисквитки използваме</h2>
        <p>
          Използваме само технически необходими бисквитки — такива, без които Платформата не може да
          функционира. Те не изискват Вашето предварително съгласие съгласно чл. 4а от Закона за електронните
          съобщения.
        </p>

        <table>
          <thead>
            <tr>
              <th>Бисквитка</th>
              <th>Цел</th>
              <th>Срок</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>__session</code> (Clerk)</td>
              <td>Поддържа Вашата сесия след вход в акаунта</td>
              <td>До излизане или 7 дни</td>
            </tr>
            <tr>
              <td><code>__client_uat</code> (Clerk)</td>
              <td>Синхронизира статуса на сесията между раздели в браузъра</td>
              <td>До излизане</td>
            </tr>
            <tr>
              <td><code>__stripe_mid</code>, <code>__stripe_sid</code></td>
              <td>Откриване и превенция на измамни плащания (зареждат се само при checkout)</td>
              <td>30 мин. – 1 година</td>
            </tr>
          </tbody>
        </table>

        <p>
          <strong>Не използваме</strong> аналитични, маркетингови или проследяващи бисквитки на трети страни
          (Google Analytics, Meta Pixel и т.н.) на момента. Ако добавим такива в бъдеще, ще актуализираме тази
          политика и ще поискаме Вашето изрично съгласие чрез банер за бисквитки.
        </p>
      </section>

      <section>
        <h2>3. Как да управлявате бисквитките</h2>
        <p>
          Повечето браузъри позволяват да блокирате или изтриете бисквитки през настройките си. Имайте
          предвид, че блокирането на технически необходими бисквитки ще попречи на нормалното функциониране на
          Платформата — например, няма да можете да влезете в акаунта си.
        </p>
        <ul>
          <li>
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
              Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">
              Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/" target="_blank" rel="noopener noreferrer">
              Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/microsoft-edge" target="_blank" rel="noopener noreferrer">
              Edge
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Промени</h2>
        <p>
          Ако добавим нови бисквитки (напр. аналитични) ще актуализираме тази политика и ще Ви уведомим чрез
          банер при следващото посещение.
        </p>
      </section>

      <section>
        <h2>5. Контакт</h2>
        <p>
          Въпроси: <a href="mailto:support@vektoacademy.com">support@vektoacademy.com</a>
        </p>
      </section>
    </LegalPage>
  );
}
