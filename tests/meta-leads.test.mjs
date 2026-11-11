import test from "node:test";
import assert from "node:assert/strict";
import { normalizeMetaLead } from "../src/lib/meta-leads.mjs";

const common = {
  id: "l:123456",
  created_time: "2026-11-10T06:23:28-05:00",
  first_name: " Asha ",
  phone_number: "p:+91 98765 43210",
  campaign_name: "Bengaluru campaign",
  ad_name: "Gold buyers",
  adset_id: "set-1",
};

test("English Meta leads map to contacts with an English language value", () => {
  const lead = normalizeMetaLead({ ...common, select_type: "Sell Gold", "approx._gold_weight_(grams)?": "25.5 grams", "which_area?": "Jayanagar" }, {
    name: "English Leads", language: "english", service: "select_type", weight: "approx._gold_weight_(grams)?", area: "which_area?",
  });
  assert.equal(lead.language, "english");
  assert.equal(lead.mobile, "9876543210");
  assert.equal(lead.area, "Jayanagar");
  assert.equal(lead.weight, 25.5);
  assert.equal(lead.createdAt, "2026-11-10 11:23:28");
});

test("Kannada Meta leads map localized question columns and set Kannada", () => {
  const lead = normalizeMetaLead({ ...common, "ಸೇವೆಯನ್ನು_ಆಯ್ಕೆಮಾಡಿ?": "ಚಿನ್ನ ಮಾರಾಟ", "ಚಿನ್ನದ_ಅಂದಾಜು_ತೂಕ_(ಗ್ರಾಂ)?": "10", "ನೀವು_ಯಾವ_ಪ್ರದೇಶದಲ್ಲಿದ್ದೀರಿ?": "ಜಯನಗರ" }, {
    name: "Kannada Leads", language: "kannada", service: "ಸೇವೆಯನ್ನು_ಆಯ್ಕೆಮಾಡಿ?", weight: "ಚಿನ್ನದ_ಅಂದಾಜು_ತೂಕ_(ಗ್ರಾಂ)?", area: "ನೀವು_ಯಾವ_ಪ್ರದೇಶದಲ್ಲಿದ್ದೀರಿ?",
  });
  assert.equal(lead.language, "kannada");
  assert.equal(lead.services, "ಚಿನ್ನ ಮಾರಾಟ");
  assert.equal(lead.area, "ಜಯನಗರ");
});

test("Meta test rows without a real mobile number are skipped", () => {
  const lead = normalizeMetaLead({ ...common, phone_number: "p:<test lead: dummy data>" }, {
    name: "English Leads", language: "english", service: "select_type", weight: "approx._gold_weight_(grams)?", area: "which_area?",
  });
  assert.equal(lead, null);
});
