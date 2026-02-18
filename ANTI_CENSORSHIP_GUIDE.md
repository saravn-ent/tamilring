# Anti-Censorship & Anti-Blocking Strategy

This guide outlines technical measures to prevent **ISP Blocking**, **DNS Poisoning**, and **SNI Filtering**. These techniques maximize the availability of TamilRing for users worldwide.

## 1. Network Layer Protection (Cloudflare)

The most effective way to avoid ISP blocking is to hide your Origin IP and encrypt the handshake so ISPs cannot easily inspect the traffic.

### ✅ Encrypted Client Hello (ECH) - *CRITICAL*

ISPs often block sites by inspecting the **SNI (Server Name Indication)** in the TLS handshake (which is usually unencrypted). ECH encrypts this.

> **Note:** On many Cloudflare **Free Plans**, ECH is now **Enabled by Default** and the toggle may be hidden from the dashboard.
>
> **If you do not see the ECH setting:**
>
> 1. It is likely already active for your specific zone.
> 2. You can verify this by checking if your site works on networks that typically filter by SNI.
> 3. Ensure **TLS 1.3** is enabled (required for ECH).

**If the setting is visible:**

1. Go to **Cloudflare Dashboard** > **SSL/TLS** > **Edge Certificates**.
2. Scroll to **Encrypted Client Hello (ECH)**.
3. Set to **On**.

### ✅ HTTP/3 (QUIC)

HTTP/3 uses QUIC (UDP) instead of TCP. Many legacy deep-packet inspection (DPI) boxes cannot easily parse QUIC packets or block them without blocking all UDP traffic (which breaks gaming/VoIP).

1. Go to **Speed** > **Optimization** (or **Settings**).
2. Scroll to **Protocol Optimization**.
3. Toggle **HTTP/3 (QUIC)** to **On**.
4. Toggle **0-RTT Connection Resumption** to **On** (Faster, harder to interrupt).

### ✅ TLS 1.3 Only (Optional)

TLS 1.3 encrypts more of the handshake than 1.2.

1. Go to **SSL/TLS** > **Edge Certificates**.
2. Set **Minimum TLS Version** to **TLS 1.3**.
   * *Note: This may drop support for very old Android devices (Android 9 and below), so test first.*

## 2. DNS Resilience

### ✅ DNSSEC

Prevents DNS poisoning attacks where an ISP injects fake IP addresses for your domain.

1. Go to **DNS** in the left sidebar.
2. Click on **Settings** (Look for the **Enable DNSSEC** button).
3. Click **Enable DNSSEC**.
4. **CRITICAL:** Cloudflare will give you a **DS Record** (Key Tag, Algorithm, Digest Type, Digest). You must log in to your **Domain Registrar** (where you bought the domain, e.g., GoDaddy, Namecheap) and add this record there.
   * *Without adding the DS record at your registrar, DNSSEC is **NOT** active.*

### ✅ CNAME Flattening

Ensure you are using CNAME flattening at the root (Cloudflare default) to hide your origin structure.

## 3. Origin Server Protection

If an ISP or attacker finds your **Real Origin IP**, they can ban that IP directly, bypassing Cloudflare.

### ✅ Authenticated Origin Pulls

Ensures your server *only* accepts traffic from Cloudflare.

1. Go to **SSL/TLS** > **Origin Server**.
2. Toggle **Authenticated Origin Pulls** to **On**.
3. You may need to install the Cloudflare Origin CA certificate on your web server (Vercel/Supabase usually handle this automatically, but for VPS/DigitalOcean, you must configure Nginx).

### ✅ Rotate Origin IP (If compromised)

If your site is suddenly blocked in a specific region but Cloudflare status is normal, your Origin IP might be leaked.

* **Action:** Request a new static IP from your hosting provider or rotate the droplet/server.

## 4. Alternate Domains (Mirrors)

ISPs typically block by **Domain Name**. Having a "warm" backup domain is the ultimate insurance.

1. **Register a backup domain** (e.g., `tamilring-mirror.com`).
2. Add it to Cloudflare.
3. **Do NOT** redirect it to the main site (as the redirect destination would be blocked).
4. Point it to the same backend/hosting.
5. If the main domain is blocked, notify users via social media/Telegram to use the mirror.

## 5. User Education (Unblock Page)

Add a generic "Help" page explaining how to bypass blocks if they occur.

* **DNS Recovers:** Recommend **1.1.1.1** (Cloudflare) or **8.8.8.8** (Google).
* **Encrypted DNS:** Recommend **DNS-over-HTTPS (DoH)** in Chrome/Edge settings.
* **VPN:** Recommend usage of trusted VPNs.

---

### Summary Checklist

* [ ] Enable **ECH** (SSL/TLS > Edge Certificates)
* [ ] Enable **HTTP/3** (Network)
* [ ] Enable **DNSSEC** (DNS)
* [ ] Verify **HSTS** is active (SSL/TLS > Edge Certificates)
* [ ] Keep a backup domain registered
