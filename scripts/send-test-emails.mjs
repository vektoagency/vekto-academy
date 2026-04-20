import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Vekto Academy <no-reply@vektoacademy.com>";
const TO = "menscarevn@gmail.com";

const SHELL = (title, body) => `
  <div style="font-family:-apple-system,sans-serif;background:#080808;color:#fff;padding:40px 20px;">
    <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
      <div style="margin-bottom:24px;">
        <span style="display:inline-block;background:#c8ff00;color:#000;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">Vekto Academy</span>
      </div>
      <h1 style="font-size:22px;font-weight:900;margin:0 0 16px;color:#fff;">${title}</h1>
      <div style="color:rgba(255,255,255,0.7);line-height:1.6;font-size:14px;">${body}</div>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:rgba(255,255,255,0.3);">
        Vekto Academy · <a href="https://vektoacademy.com/dashboard" style="color:#c8ff00;text-decoration:none;">Към платформата</a>
      </div>
    </div>
  </div>
`;

const paymentFailed = (attempt, daysLeft) => {
  const subj = attempt === 1
    ? "⚠ Плащането не премина — обнови карта"
    : attempt === 2
    ? "Напомняне: плащането все още не е успешно"
    : `Последно напомняне — остават ${daysLeft} дни`;
  const urgency = attempt === 1
    ? "Не успяхме да изтеглим €59 от картата ти. Може картата да е изтекла или да няма достатъчно средства."
    : attempt === 2
    ? "Опитахме пак без успех. Достъпът ти все още е активен, но ще бъде спрян скоро ако не обновиш картата."
    : `Това е последен опит преди достъпът ти да бъде автоматично прекратен. Остават ти <strong>${daysLeft} дни</strong> да обновиш картата.`;
  return SHELL(subj, `
    <p>${urgency}</p>
    <p style="margin-top:16px;">Достъпът ти до платформата <strong>е все още активен</strong> — не си изпуснал нищо. Просто обнови плащането от твоя акаунт.</p>
    <p style="margin-top:20px;text-align:center;">
      <a href="https://vektoacademy.com/dashboard" style="background:#c8ff00;color:#000;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;display:inline-block;">
        Обнови картата →
      </a>
    </p>
    <p style="margin-top:20px;font-size:12px;color:rgba(255,255,255,0.4);">
      След ${daysLeft} дни без успешно плащане абонаментът се отменя автоматично. Винаги можеш да се върнеш по-късно.
    </p>
  `);
};

const emails = [
  {
    subject: "[ТЕСТ 1/6] ⚠ Плащането не премина — обнови карта",
    html: paymentFailed(1, 7),
    note: "Payment failed — attempt 1 (ден 1, urgent)",
  },
  {
    subject: "[ТЕСТ 2/6] Напомняне: остават 3 дни преди прекратяване",
    html: paymentFailed(2, 3),
    note: "Payment failed — attempt 4 (ден 4, reminder)",
  },
  {
    subject: "[ТЕСТ 3/6] Последен опит — абонаментът се прекратява днес",
    html: paymentFailed(3, 0),
    note: "Payment failed — attempt 8 (ден 7, final)",
  },
  {
    subject: "[ТЕСТ 4/6] Абонаментът ти е прекратен",
    html: SHELL("Абонаментът ти е прекратен", `
      <p>Поради неуспешно плащане след няколко опита, абонаментът ти към Vekto Academy беше прекратен.</p>
      <p style="margin-top:16px;">Достъпът до платформата е спрян, но всичкият ти прогрес и проекти в Арена са <strong>запазени</strong>. Ако решиш да се върнеш, просто се абонирай отново.</p>
      <p style="margin-top:20px;text-align:center;">
        <a href="https://vektoacademy.com/#pricing" style="background:#c8ff00;color:#000;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;display:inline-block;">
          Активирай отново →
        </a>
      </p>
    `),
    note: "Subscription cancelled (финал)",
  },
  {
    subject: "[ТЕСТ 5/6] 🏆 Ти спечели!",
    html: SHELL("🏆 Ти спечели!", `
      <p>Проектът ти за <strong>"Създай 15-сек реклама за енергийна напитка"</strong> беше избран за победител!</p>
      <p style="margin-top:12px;"><strong>Награда:</strong> €200 + featured в homepage</p>
      <div style="margin-top:16px;padding:12px;background:rgba(200,255,0,0.08);border-radius:8px;border-left:3px solid #c8ff00;">
        <p style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#c8ff00;margin:0 0 6px;">Обратна връзка</p>
        <p style="margin:0;">Много силен ритъм, перфектен sound design и smooth transitions. Визията на продукта беше ясно комуникирана за 15 секунди. Браво!</p>
      </div>
      <p style="margin-top:16px;">Плащането се извършва в края на месеца по IBAN. Ще се свържем с теб.</p>
    `),
    note: "Winner announcement (Арена)",
  },
  {
    subject: "[ТЕСТ 6/6] Имаш обратна връзка за проект",
    html: SHELL("Имаш обратна връзка за проект", `
      <p>Твоят проект за <strong>"Създай 15-сек реклама за енергийна напитка"</strong> беше прегледан.</p>
      <div style="margin-top:16px;padding:12px;background:rgba(255,255,255,0.04);border-radius:8px;">
        Добра идея и изпълнение, но timing-ът на първия cut е малко off — опитай да синхронизираш по-плътно с бийта. Sound mix-ът също може да е по-балансиран между music и SFX.
      </div>
      <p style="margin-top:16px;">Продължавай да практикуваш — следващата задача идва скоро.</p>
    `),
    note: "Feedback received (reviewed)",
  },
];

async function run() {
  console.log(`→ Sending ${emails.length} test emails to ${TO}...\n`);
  for (const [i, e] of emails.entries()) {
    try {
      const res = await resend.emails.send({
        from: FROM,
        to: TO,
        subject: e.subject,
        html: e.html,
      });
      if (res.error) {
        console.log(`  ${i + 1}. ✗ ${e.note} — ${JSON.stringify(res.error)}`);
      } else {
        console.log(`  ${i + 1}. ✓ ${e.note} — id: ${res.data?.id}`);
      }
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.log(`  ${i + 1}. ✗ ${e.note} — ${err.message}`);
    }
  }
  console.log("\nDone. Check inbox (and spam folder).");
}

run().catch((e) => { console.error(e); process.exit(1); });
