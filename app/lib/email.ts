import { Resend } from "resend";
import { clerkClient } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "Vekto Academy <no-reply@vektoacademy.com>";

export async function sendEmail(to: string | string[], subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

export async function getAdminEmails(): Promise<string[]> {
  try {
    const client = await clerkClient();
    const list = await client.users.getUserList({ limit: 100 });
    const admins = list.data.filter(
      (u) => (u.publicMetadata as Record<string, string>)?.role === "admin"
    );
    return admins
      .map((u) => u.emailAddresses[0]?.emailAddress)
      .filter((e): e is string => !!e);
  } catch (err) {
    console.error("[email] failed to fetch admin emails", err);
    return [];
  }
}

export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const u = await client.users.getUser(userId);
    return u.emailAddresses[0]?.emailAddress ?? null;
  } catch {
    return null;
  }
}

const SHELL = (title: string, body: string) => `
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

export const templates = {
  newSubmission: (challengeTitle: string, userName: string, notes: string) =>
    SHELL("Ново предаване в Арена", `
      <p><strong>${userName}</strong> току-що предаде проект за задача <strong>"${challengeTitle}"</strong>.</p>
      ${notes ? `<div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.04);border-radius:8px;white-space:pre-line;font-size:13px;color:rgba(255,255,255,0.6);">${escapeHtml(notes)}</div>` : ""}
      <p style="margin-top:16px;"><a href="https://vektoacademy.com/admin/arena" style="background:#c8ff00;color:#000;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:800;font-size:13px;">Прегледай проекта →</a></p>
    `),

  winnerAnnouncement: (challengeTitle: string, prize: string, feedback: string | null) =>
    SHELL("🏆 Ти спечели!", `
      <p>Проектът ти за <strong>"${challengeTitle}"</strong> беше избран за победител!</p>
      <p style="margin-top:12px;"><strong>Награда:</strong> ${prize}</p>
      ${feedback ? `<div style="margin-top:16px;padding:12px;background:rgba(200,255,0,0.08);border-radius:8px;border-left:3px solid #c8ff00;"><p style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#c8ff00;margin:0 0 6px;">Обратна връзка</p><p style="margin:0;white-space:pre-line;">${escapeHtml(feedback)}</p></div>` : ""}
      <p style="margin-top:16px;">Плащането се извършва в края на месеца по IBAN. Ще се свържем с теб.</p>
    `),

  feedbackReceived: (challengeTitle: string, status: string, feedback: string | null) =>
    SHELL("Имаш обратна връзка за проект", `
      <p>Твоят проект за <strong>"${challengeTitle}"</strong> беше ${status === "rejected" ? "отхвърлен" : "прегледан"}.</p>
      ${feedback ? `<div style="margin-top:16px;padding:12px;background:rgba(255,255,255,0.04);border-radius:8px;white-space:pre-line;">${escapeHtml(feedback)}</div>` : ""}
      <p style="margin-top:16px;">Продължавай да практикуваш — следващата задача идва скоро.</p>
    `),

  paymentFailed: (attempt: number, daysLeft: number) => {
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
  },

  subscriptionCancelled: () => SHELL("Абонаментът ти е прекратен", `
    <p>Поради неуспешно плащане след няколко опита, абонаментът ти към Vekto Academy беше прекратен.</p>
    <p style="margin-top:16px;">Достъпът до платформата е спрян, но всичкият ти прогрес и проекти в Арена са <strong>запазени</strong>. Ако решиш да се върнеш, просто се абонирай отново.</p>
    <p style="margin-top:20px;text-align:center;">
      <a href="https://vektoacademy.com/#pricing" style="background:#c8ff00;color:#000;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;display:inline-block;">
        Активирай отново →
      </a>
    </p>
  `),
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
