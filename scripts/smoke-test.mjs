// Playwright smoke test driving the full guided demo sequence end-to-end
// against a running `npm run dev` server. Run with: node scripts/smoke-test.mjs
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3000";
const SHOT_DIR = "scripts/smoke-shots";
fs.rmSync(SHOT_DIR, { recursive: true, force: true });
fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];
let shotIndex = 0;

async function shot(page, name) {
  shotIndex++;
  const path = `${SHOT_DIR}/${String(shotIndex).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`[shot] ${path}`);
}

function logErrors(page, label) {
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[${label}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    pageErrors.push(`[${label}] ${err.message}`);
  });
}

async function switchRole(page, roleName) {
  await page.click("button[aria-label='Open demo helper']");
  await page.waitForSelector("[role=dialog] button[aria-label='Switch demo role']");
  await page.click("[role=dialog] button[aria-label='Switch demo role']");
  await page.waitForTimeout(200);
  await page.click(`[role=menuitem]:has-text("${roleName}")`);
  await page.waitForTimeout(500);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  logErrors(page, "main");

  const results = [];
  const check = (label, cond) => {
    console.log(`${cond ? "PASS" : "FAIL"} — ${label}`);
    results.push({ label, pass: !!cond });
  };

  // 1. Public home (Bangla default) -> switch to English for predictable text assertions
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  check("home renders institute name (bn default)", await page.locator("text=শেরপুর সরকারি পলিটেকনিক ইনস্টিটিউট").first().isVisible());
  await shot(page, "home-bn");
  await page.click("button:has-text('EN')");
  await page.waitForSelector("text=Sherpur Government Polytechnic Institute");
  await shot(page, "home-en");

  // 2. Departments directory
  await page.goto(BASE + "/departments", { waitUntil: "networkidle" });
  await page.waitForSelector("text=View details");
  check("departments list shows 4 departments", (await page.locator("text=View details").count()) === 4);
  await shot(page, "departments");

  // 3. Login — explore demo
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Principal");
  check("login shows 5 role cards", (await page.locator("button:has-text('Continue as')").count()) === 5);
  await shot(page, "login");

  // 4. Login as Principal
  await page.click("button:has-text('Continue as Principal')");
  await page.waitForURL("**/admin", { timeout: 15000 });
  await page.waitForSelector("text=Active students", { timeout: 15000 });
  check("principal lands on /admin with data loaded", page.url().endsWith("/admin"));
  await shot(page, "admin-overview");

  // 5. Students — add a new student (the record used for the rest of the walkthrough)
  await page.goto(BASE + "/admin/students", { waitUntil: "networkidle" });
  await page.waitForSelector("table");
  const totalBefore = Number((await page.locator("text=/Showing .* of \\d+/").innerText()).match(/of (\d+)/)[1]);
  await page.click("button:has-text('Add new')");
  await page.waitForSelector("text=Register new student");
  await page.fill("input[name='nameEn']", "Smoke Test Student");
  await page.fill("input[name='nameBn']", "স্মোক টেস্ট শিক্ষার্থী");
  await page.fill("input[name='dateOfBirth']", "2006-01-01");
  await page.fill("input[name='phone']", "01700000099");
  await page.click("button:has-text('Academic')");
  await page.waitForSelector("input[name='roll']");
  await page.fill("input[name='roll']", "199");
  await page.fill("input[name='registrationNo']", `RS${Date.now().toString(36)}`);
  await page.click("button:has-text('Guardian')");
  await page.waitForSelector("input[name='fatherNameBn']");
  await page.fill("input[name='fatherNameBn']", "পিতা");
  await page.fill("input[name='fatherNameEn']", "Father");
  await page.fill("input[name='motherNameBn']", "মাতা");
  await page.fill("input[name='motherNameEn']", "Mother");
  await page.fill("input[name='guardianPhone']", "01700000098");
  await page.fill("input[name='presentAddressBn']", "ঠিকানা");
  await page.fill("input[name='presentAddressEn']", "Address");
  await page.fill("input[name='permanentAddressBn']", "ঠিকানা");
  await page.fill("input[name='permanentAddressEn']", "Address");
  await shot(page, "student-form-filled");
  await page.click("button[type=submit]:has-text('Save')");
  await page.waitForSelector("text=Register new student", { state: "hidden", timeout: 10000 });
  await page.waitForTimeout(400);
  const totalAfter = Number((await page.locator("text=/Showing .* of \\d+/").innerText()).match(/of (\d+)/)[1]);
  check("student total count grew by 1 after adding", totalAfter === totalBefore + 1);
  await shot(page, "students-after-add");

  // 6. Duplicate-roll rejection — try adding a student with the hero class's existing roll "01"
  await page.click("button:has-text('Add new')");
  await page.waitForSelector("text=Register new student");
  await page.fill("input[name='nameEn']", "Duplicate Roll Test");
  await page.fill("input[name='nameBn']", "ডুপ্লিকেট রোল টেস্ট");
  await page.fill("input[name='dateOfBirth']", "2006-01-01");
  await page.fill("input[name='phone']", "01700000097");
  await page.click("button:has-text('Academic')");
  await page.fill("input[name='roll']", "01");
  await page.fill("input[name='registrationNo']", `RD${Date.now().toString(36)}`);
  await page.click("button:has-text('Guardian')");
  await page.fill("input[name='fatherNameBn']", "ক");
  await page.fill("input[name='fatherNameEn']", "F");
  await page.fill("input[name='motherNameBn']", "খ");
  await page.fill("input[name='motherNameEn']", "M");
  await page.fill("input[name='guardianPhone']", "01700000096");
  await page.fill("input[name='presentAddressBn']", "ক");
  await page.fill("input[name='presentAddressEn']", "A");
  await page.fill("input[name='permanentAddressBn']", "ক");
  await page.fill("input[name='permanentAddressEn']", "A");
  await page.click("button[type=submit]:has-text('Save')");
  await page.waitForTimeout(1200);
  const dupToastVisible = await page.locator("text=already").first().isVisible().catch(() => false);
  check("duplicate roll shows a rejection toast", dupToastVisible);
  await shot(page, "duplicate-roll-rejected");
  await page.click("[data-slot='dialog-close']");
  await page.waitForSelector("text=Register new student", { state: "hidden", timeout: 5000 });

  // 7. Switch to Teacher, record attendance
  await switchRole(page, "Teacher");
  await page.waitForURL("**/portal/teacher", { timeout: 15000 });
  check("teacher lands on /portal/teacher", page.url().endsWith("/portal/teacher"));
  await shot(page, "teacher-dashboard");

  await page.goto(BASE + "/portal/teacher/attendance", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Mark all present");
  await page.click("button:has-text('Mark all present')");
  await shot(page, "attendance-marked");
  const attSaveBtn = page.locator("button:has-text('Save')").last();
  check("attendance save button enabled after marking all present", await attSaveBtn.isEnabled());
  await attSaveBtn.click();
  await page.waitForTimeout(800);
  await shot(page, "attendance-saved");

  // 8. Marks — enter and submit drafts for the Web App Dev subject (seeded with zero rows)
  await page.goto(BASE + "/portal/teacher/marks", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "marks-initial");
  // Select the class whose subject has no existing marks (Web Application Development)
  const classSelect = page.locator("button[role=combobox]").first();
  await classSelect.click();
  await page.waitForTimeout(200);
  await page.click("[role=option]:has-text('Web Application Development')").catch(async () => {
    await page.keyboard.press("Escape");
  });
  await page.waitForTimeout(600);
  await shot(page, "marks-webappdev-selected");
  const tcInputs = page.locator("table input[type=number]");
  const tcCount = await tcInputs.count();
  console.log("mark input count:", tcCount);
  for (let i = 0; i < tcCount; i++) {
    await tcInputs.nth(i).fill(String(10 + (i % 5)));
  }
  await shot(page, "marks-filled");
  await page.click("button:has-text('Save draft')");
  await page.waitForTimeout(800);
  await shot(page, "marks-draft-saved");
  const submitBtn = page.locator("button:has-text('Submit for verification')");
  const submitEnabled = await submitBtn.isEnabled();
  check("submit-for-verification enabled once all cells filled", submitEnabled);
  if (submitEnabled) {
    await submitBtn.click();
    await page.waitForTimeout(800);
    await shot(page, "marks-submitted");
  }

  // 9. Switch to Department Head, verify marks
  await switchRole(page, "Department Head");
  await page.waitForURL("**/admin", { timeout: 15000 });
  await page.goto(BASE + "/admin/examinations", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "hod-examinations");
  const selectAllCheckbox = page.locator("table thead input[type=checkbox]").first();
  if (await selectAllCheckbox.isVisible().catch(() => false)) {
    await selectAllCheckbox.click();
    await page.click("button:has-text('Verify & approve')");
    await page.waitForTimeout(800);
    await shot(page, "hod-verified");
  }

  // 10. Switch to Principal, publish results
  await switchRole(page, "Principal");
  await page.waitForURL("**/admin", { timeout: 15000 });
  await page.goto(BASE + "/admin/results", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "principal-results");
  const publishBtn = page.locator("button:has-text('Publish')").first();
  if (await publishBtn.isVisible().catch(() => false)) {
    const publishEnabled = await publishBtn.isEnabled();
    check("a publish button is present on results page", true);
    if (publishEnabled) {
      await publishBtn.click();
      await page.waitForTimeout(800);
      await shot(page, "results-published");
    }
  } else {
    check("a publish button is present on results page", false);
  }

  // 11. Switch to Student, view published result
  await switchRole(page, "Student");
  await page.waitForURL("**/portal/student", { timeout: 15000 });
  await shot(page, "student-dashboard");
  await page.goto(BASE + "/portal/student/results", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "student-results");

  // 12. Export a report as Principal
  await switchRole(page, "Principal");
  await page.waitForURL("**/admin", { timeout: 15000 });
  await page.goto(BASE + "/admin/reports", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, "admin-reports");
  check("export CSV button present", await page.locator("button:has-text('Export CSV')").first().isVisible());

  await browser.close();

  const summary = {
    results,
    passCount: results.filter((r) => r.pass).length,
    totalChecks: results.length,
    consoleErrorCount: consoleErrors.length,
    pageErrorCount: pageErrors.length,
    consoleErrors,
    pageErrors,
  };
  fs.writeFileSync("scripts/smoke-summary.json", JSON.stringify(summary, null, 2));
  console.log("\n=== SUMMARY ===");
  console.log(`Checks: ${summary.passCount}/${summary.totalChecks} passed`);
  console.log(`Console errors: ${consoleErrors.length}`);
  console.log(`Page errors: ${pageErrors.length}`);
  if (consoleErrors.length) console.log("CONSOLE ERRORS:\n" + consoleErrors.join("\n"));
  if (pageErrors.length) console.log("PAGE ERRORS:\n" + pageErrors.join("\n"));
}

main().catch((err) => {
  console.error("SMOKE TEST CRASHED:", err);
  fs.writeFileSync(
    "scripts/smoke-summary.json",
    JSON.stringify({ crashed: true, error: String(err), consoleErrors, pageErrors }, null, 2),
  );
  process.exit(1);
});
