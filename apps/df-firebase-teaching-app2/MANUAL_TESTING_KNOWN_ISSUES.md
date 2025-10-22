# Known Console Warnings - DO NOT REPORT

Quick reference for manual testers to avoid reporting known, harmless browser warnings.

---

## Google Sign-In: "Cross-Origin-Opener-Policy would block window.close"

**Status:** ✅ **EXPECTED BEHAVIOR** - Do not report

### What You'll See

When testing Google Sign-In in production, Chrome/Edge console shows:

```
Cross-Origin-Opener-Policy policy would block the window.close call.
```

### Why It Happens

- Google's OAuth popup tries to close itself after successful authentication
- Chrome/Edge browsers block this due to security policies
- **This is Google's code, not ours** - happens to every Firebase app

### Verification

1. ✅ User clicks "Sign in with Google"
2. ✅ Google OAuth popup opens
3. ✅ User selects account and authorizes
4. ⚠️ Console warning appears (THIS IS NORMAL)
5. ✅ User is successfully signed in
6. ✅ User profile displays correctly

**If steps 1-3 and 5-6 work, the warning is harmless.**

### Browser Compatibility

- ⚠️ **Chrome/Edge:** Warning appears (normal)
- ✅ **Firefox:** No warning (handles COOP differently)
- ✅ **Safari:** No warning

### Why We Can't Fix It

1. Warning comes from `accounts.google.com` (Google's domain)
2. We don't control Google's OAuth popup code
3. Headers on our domain can't affect Google's domain
4. Firebase SDK acknowledged limitation

### Action Required

**NONE** - Do not report this to coding agents.

---

## How to Identify "Real" Errors

**Report these:**
- ❌ Sign-in fails (popup doesn't open)
- ❌ Authorization doesn't complete
- ❌ User data not displayed after sign-in
- ❌ Errors that prevent functionality
- ❌ Red console errors that cause crashes

**Don't report these:**
- ✅ COOP warnings during Google Sign-In
- ✅ Warnings in Firefox DevTools about deprecated APIs
- ✅ Third-party script warnings (Google Analytics, etc.)
- ✅ Console messages that don't affect functionality

---

## Testing Checklist

When testing Google Sign-In:

- [ ] Button appears on sign-in page
- [ ] Clicking button opens Google OAuth popup
- [ ] User can select Google account
- [ ] User can authorize the app
- [ ] User successfully signs in (profile appears)
- [ ] User can sign out
- [ ] **Ignore COOP warning in console** ✅

If all checklist items pass, Google Sign-In is working correctly!

---

## Questions?

**Q: Should I test in Firefox instead?**
A: Test in both! Chrome is most common, so test there first. Firefox won't show the COOP warning, which confirms it's browser-specific.

**Q: Will users see this warning?**
A: No! Only developers with browser DevTools open see console warnings. Regular users never see it.

**Q: Does this affect mobile?**
A: Popup-based OAuth can be problematic on mobile for other reasons (small screens, popup blockers). The COOP warning is desktop Chrome/Edge specific.

**Q: Should we switch to redirect mode?**
A: Not necessary. The redirect flow is more complex and doesn't provide enough benefit for this cosmetic issue.

---

## Related Documentation

- [GOOGLE_SIGNIN_SETUP.md](./GOOGLE_SIGNIN_SETUP.md) - Complete setup guide
- [GOOGLE_SIGNIN_PRODUCTION_CHECKLIST.md](./GOOGLE_SIGNIN_PRODUCTION_CHECKLIST.md) - Deployment checklist
- [Firebase Documentation](https://firebase.google.com/docs/auth/web/google-signin) - Official Google Sign-In docs

---

**Last Updated:** 2025-01-16
**Applies To:** All Firebase apps using Google Sign-In with popup mode
