# omni-channel — CLAUDE.md

## Repository Overview

This repo hosts the **InboxPro** omnichannel customer messaging platform — a Next.js 16 app with real-time inbox, voice/SIP softphone, and integrations for LINE, WhatsApp, Facebook Messenger, Instagram, SMS, and Email.

Main app lives in `respond-platform/`.

---

## Session Summary — 2026-06-11

### งานที่ทำ

1. **คัดลอกโฟลเดอร์ `respond-platform/` ทั้งหมด** จาก repo `metroth/demowebsite-metrocat` (branch `claude/response-io-overview-ISxEk`) มายัง repo นี้ (branch `claude/peaceful-goodall-chm40a`)
   - รวมทั้งหมด **~70 ไฟล์** ใน 9 commits
   - ไฟล์ที่ข้ามโดยเจตนา: `favicon.ico` (binary), `package-lock.json` (ใหญ่เกิน 275KB และอยู่ใน .gitignore อยู่แล้ว)

2. **ลบโฟลเดอร์ต้นฉบับ** `respond-platform/` ออกจาก `demowebsite-metrocat` branch `claude/response-io-overview-ISxEk` ทั้งหมด 57 ไฟล์ หลังจากยืนยันว่าไฟล์เว็บไซต์อื่นไม่ได้รับผลกระทบ

### Decisions

| Decision | เหตุผล |
|---|---|
| Push ไปยัง branch `claude/peaceful-goodall-chm40a` แทน `main` | System prompt กำหนด dev branch นี้ไว้ — ไม่ push ตรง main โดยไม่ผ่าน PR |
| ข้าม `package-lock.json` | ไฟล์ใหญ่ 275KB เกิน token limit และอยู่ใน `.gitignore` อยู่แล้ว — ให้ `npm install` สร้างใหม่เอง |
| ข้าม `favicon.ico` | Binary file — GitHub MCP `push_files` รับแค่ text content ไม่รองรับ base64 binary |
| แบ่ง push เป็น batch ย่อย | แต่ละ batch มีขนาดพอดีไม่เกิน API payload limit |
| ลบไฟล์ต้นฉบับหลังคัดลอกเสร็จ | ผู้ใช้ยืนยันว่าไฟล์เว็บไซต์อื่นใน `demowebsite-metrocat` ไม่ได้อยู่ใน `respond-platform/` จึงลบได้ปลอดภัย |

---

## Stack

- **Framework**: Next.js 16.2.7 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + `@tailwindcss/postcss`
- **Database/Auth**: Supabase (SSR) — PostgreSQL
- **Voice**: Twilio Voice SDK (browser softphone)
- **UI Primitives**: Radix UI, Lucide React

## Key Files

| Path | Description |
|---|---|
| `respond-platform/src/types/index.ts` | App-wide TypeScript interfaces |
| `respond-platform/src/lib/types/database.ts` | Supabase DB type definitions |
| `respond-platform/src/lib/supabase/` | Supabase client/server/middleware helpers |
| `respond-platform/src/lib/channels/` | Webhook parsers & senders (LINE, WhatsApp, Facebook) |
| `respond-platform/src/lib/twilio/` | Twilio signature validation |
| `respond-platform/src/app/api/` | API routes (webhooks, messages, settings, twilio) |
| `respond-platform/src/app/(dashboard)/` | Dashboard pages (inbox, contacts, calls, reports, settings) |
| `respond-platform/src/components/telephony/softphone.tsx` | Twilio browser softphone widget |
| `respond-platform/src/components/layout/sidebar.tsx` | Sidebar with realtime unread badge |

## Database Tables (Supabase)

All tables prefixed `ip_`:
`ip_profiles`, `ip_conversations`, `ip_messages`, `ip_contacts`, `ip_calls`, `ip_channel_configs`, `ip_telephony_config`, `ip_phone_numbers`, `ip_teams`, `ip_team_members`, `ip_automation_rules`

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_TWIML_APP_SID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
META_APP_SECRET=
META_VERIFY_TOKEN=
```
