# Frog Empire — Website Migration & Transition Guide

This guide covers three things:
1. Transferring your domain (frogempire607.com) away from Wix
2. Cancelling your Wix account safely
3. Taking ownership of Google Workspace from your partner

---

## PART 1: Transfer Your Domain From Wix

Your domain `frogempire607.com` is currently registered through Wix. You need to
transfer it to a new registrar (e.g. Namecheap, GoDaddy, Cloudflare Registrar,
or Google Domains) BEFORE cancelling Wix, or you could lose the domain.

### Step-by-step: Domain Transfer

**Step 1 — Choose a new registrar**
We recommend Namecheap or Cloudflare Registrar (cheapest, no markup). Create an
account there first.

**Step 2 — Unlock your domain in Wix**
1. Go to: manage.wix.com → Your Account → Domains
2. Click on `frogempire607.com`
3. Click "Advanced" or "Transfer Domain"
4. Look for "Unlock Domain" — toggle it ON (domains are locked by default)

**Step 3 — Get your EPP / Authorization Code**
1. In the same Wix Domain Settings panel, click "Get transfer code"
   (also called Auth Code, EPP Code, or Authorization Code)
2. Wix will email this code to the email address on your Wix account
3. Copy and save this code — you'll need it in the next step

**Step 4 — Initiate transfer at your new registrar**
1. Log into Namecheap (or your chosen registrar)
2. Go to "Transfer a Domain" and enter: frogempire607.com
3. Enter the EPP Code when prompted
4. Pay the transfer fee (usually $8–12/year, covers 1 year of registration)

**Step 5 — Approve the transfer**
1. You'll receive an email from your current registrar (Wix) asking to confirm
2. APPROVE the transfer (don't ignore it)
3. Transfer typically takes 5–7 business days

**Step 6 — Point domain to your new hosting**
Once transferred, you'll update the DNS records to point to your new web host
(see hosting setup below).

> ⚠️ IMPORTANT: Transfer the domain BEFORE cancelling Wix. If you cancel
> first and the domain registration lapses, someone else can buy it.

---

## PART 2: Set Up Web Hosting (Where to Publish This Site)

This is a static HTML site — it's very easy and cheap to host.

### Option A: Netlify (Recommended — Free Tier Available)
1. Create an account at netlify.com
2. Drag and drop the entire `frog-empire` folder onto the Netlify dashboard
3. Netlify gives you a free URL (e.g. frogempire.netlify.app)
4. Go to Site Settings → Custom Domains → Add your domain (frogempire607.com)
5. Update DNS at your registrar to point to Netlify's nameservers

### Option B: GitHub Pages (Free)
1. Create a GitHub account at github.com
2. Create a new public repository named `frogempire607`
3. Upload all site files
4. Enable GitHub Pages in Settings → Pages
5. Add your custom domain

### Option C: Bluehost / SiteGround (Paid, ~$5/month)
Traditional web hosting. Good if you want phone support.

---

## PART 3: Cancel Your Wix Account

> ⚠️ Do NOT cancel until AFTER:
> - Domain transfer is complete (confirmed at new registrar)
> - New site is live on new hosting
> - You have downloaded all images/files from your current Wix site

### Steps to Cancel Wix Premium Plan:
1. Log into manage.wix.com
2. Click your account name (top right) → Subscriptions
3. Find your Premium plan for Frog Empire
4. Click "Cancel Plan"
5. Follow the cancellation prompts — Wix will try to offer discounts; you can
   decline if you're moving off platform
6. Note: You typically get a refund for unused months (check Wix's policy)

### After cancelling Premium:
Your Wix site will revert to a free plan (with a Wix subdomain) and eventually
be deactivated. That's fine — your new site will be live by then.

### Delete your Wix account entirely (optional):
1. manage.wix.com → Account Settings → Delete Account
2. Only do this after domain transfer is fully complete

---

## PART 4: Google Workspace — Transfer Ownership

This is critical. If your partner currently owns the Google Workspace account
(e.g. @frogempire607.com email), you need to become the Super Admin.

### Scenario A: You are ALREADY a Super Admin (just not the owner)
1. Log in to admin.google.com with your account
2. Go to Account → Admin Roles
3. Check if you have the "Super Admin" role
4. If yes, you can manage everything yourself

### Scenario B: Your partner is the Super Admin, you are a regular user
This requires cooperation from your partner. Here's the process:

**Your partner (current Super Admin) must:**
1. Log into admin.google.com
2. Go to Directory → Users
3. Click on YOUR user account
4. Click "Admin Roles and Privileges"
5. Assign the "Super Admin" role to your account
6. Click Save

**Once you are Super Admin, you can:**
- Remove or demote your partner's admin access if needed
- Change the billing contact to your name/payment method
- Add/remove users
- Change the primary admin email

### Scenario C: Partner is uncooperative / no longer reachable
This is more complex. You have two options:

**Option 1 — Google Account Recovery**
If the Google Workspace is tied to frogempire607.com (a domain YOU own/control):
1. Go to admin.google.com
2. Click "Forgot password" or "Need help signing in"
3. Google will send a recovery code to the domain's registered email or ask
   you to verify domain ownership via DNS
4. Since you own the domain, you can prove ownership and regain access

**Option 2 — Contact Google Workspace Support**
1. Go to support.google.com/a
2. Start a chat with Google Workspace support
3. Explain you are the domain owner and need admin access restored
4. You'll need to verify domain ownership (they'll ask you to add a DNS TXT record)
5. This typically resolves in 1–3 business days

### Change Google Workspace Billing to Your Name
Once you are Super Admin:
1. admin.google.com → Billing → Subscriptions
2. Click "Manage" on your Google Workspace plan
3. Update payment method and billing contact to YOUR information

---

## QUICK CHECKLIST

Before you cancel anything:
- [ ] Domain transfer initiated and CONFIRMED at new registrar
- [ ] New website live on new hosting (test on desktop AND mobile)
- [ ] All photos/images downloaded from current Wix site
- [ ] Google Workspace Super Admin access confirmed under YOUR account
- [ ] Google Workspace billing updated to your payment method
- [ ] Wix premium subscription cancelled

After transition:
- [ ] Update any business cards / social bios with same domain (no change needed)
- [ ] Confirm email still works (test sending/receiving @frogempire607.com)
- [ ] Update Google Business Profile if you have one

---

## NEED HELP?

You can bring this file back to Claude and ask for help with any specific step.
For example:
- "Help me write the correct DNS records for Netlify"
- "Walk me through the Google Workspace admin transfer step by step"
- "My new site isn't loading, help me troubleshoot"

Good luck! 🐸
