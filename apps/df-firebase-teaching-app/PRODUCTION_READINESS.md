# Production Readiness Checklist

Use this checklist to ensure your Firebase Teaching App is ready for production deployment.

## Pre-Deployment Checklist

### 1. Firebase Project Setup
- [ ] Real Firebase project created in [Firebase Console](https://console.firebase.google.com)
- [ ] Project uses free Spark plan or upgraded to Blaze plan (if needed)
- [ ] Web app registered in Firebase project
- [ ] Firebase credentials obtained from Project Settings

### 2. Environment Configuration
- [ ] `.env.production` file created (copy from `.env.production.example`)
- [ ] All `VITE_FIREBASE_*` variables filled with real values from Firebase Console
- [ ] `VITE_USE_EMULATOR=false` set in `.env.production`
- [ ] `.env.production` added to `.gitignore` (verify it's never committed)
- [ ] GitHub Secrets configured for CI/CD (if using GitHub Actions)

### 3. Security Rules
- [ ] Security rules tested locally: `pnpm test:rules`
- [ ] All 64 security tests passing
- [ ] Rules reviewed for production-appropriate permissions
- [ ] Rules deployed to production: `pnpm deploy:rules`

### 4. Cloud Functions
- [ ] Functions tested in emulator
- [ ] Function implementations complete (callable, HTTP, triggers, scheduled)
- [ ] Function dependencies installed in `functions/package.json`
- [ ] Functions deployed to production: `pnpm deploy:functions`

### 5. Application Build
- [ ] Production build succeeds: `pnpm build:prod`
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors or warnings
- [ ] Bundle size reviewed (check `dist/` directory)
- [ ] Production preview tested: `pnpm preview:prod`

### 6. Testing
- [ ] All security rules tests passing: `pnpm test:rules`
- [ ] Integration tests passing: `pnpm test:integration`
- [ ] Manual testing completed with production Firebase project
- [ ] Authentication flows tested (sign-up, sign-in, sign-out)
- [ ] Firestore CRUD operations tested
- [ ] Storage upload/download tested
- [ ] Cloud Functions tested

### 7. Monitoring & Costs
- [ ] Firebase usage dashboard reviewed
- [ ] Cost monitoring enabled in Firebase Console
- [ ] Billing alerts configured (if on Blaze plan)
- [ ] Usage quotas understood (Spark plan limits documented)

### 8. Security
- [ ] Firebase App Check configured (recommended)
- [ ] Custom domain configured (optional)
- [ ] HTTPS enforced on your hosting provider
- [ ] CORS policies reviewed for functions
- [ ] Authentication providers configured correctly

### 9. Documentation
- [ ] README updated with production deployment instructions
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Known limitations acknowledged

### 10. Data Initialization
- [ ] Production database starts EMPTY (no seed data)
- [ ] Admin scripts prepared for essential configuration data (if needed)
- [ ] User-driven data creation workflows tested
- [ ] Migration scripts prepared (if migrating from legacy system)

## Post-Deployment Verification

After deployment, verify the following:

- [ ] Application accessible at your production URL
- [ ] Authentication works (sign-up, sign-in, sign-out)
- [ ] Firestore operations work (create, read, update, delete)
- [ ] Storage operations work (upload, download, delete)
- [ ] Cloud Functions callable from app
- [ ] Security rules enforcing permissions correctly
- [ ] No console errors in browser DevTools
- [ ] Performance is acceptable (check Firebase Performance Monitoring)
- [ ] All interactive features work as expected

## Production Environment Differences

### What Changes in Production:
- ✅ Real Firebase authentication flows
- ✅ Actual security rules enforcement
- ✅ Production Firebase quotas and limits apply
- ✅ Real billing (if on Blaze plan)
- ✅ Data persists permanently (not emulator exports)
- ✅ Use HTTPS on your hosting provider

### What Stays the Same:
- ✅ Application code (identical to emulator development)
- ✅ Component behavior
- ✅ State management patterns
- ✅ UI/UX flows
- ✅ Firebase SDK API calls

### What's Excluded:
- ❌ Seed data (emulator-data/ never deployed)
- ❌ Emulator connection code (when VITE_USE_EMULATOR=false)
- ❌ Development environment variables

## Rollback Procedure

If issues are discovered post-deployment:

1. **Immediate Rollback (Static Host)**
   - Revert to the previous bundle on your hosting provider (Firebase Hosting is not used).

2. **Rules Rollback**
   - Go to Firebase Console > Firestore/Storage > Rules > Rules History
   - Select previous version and restore

3. **Functions Rollback**
   - Redeploy previous version from git:
   ```bash
   git checkout <previous-commit>
   pnpm deploy:functions
   git checkout main
   ```

4. **Complete Rollback**
   - Use git to revert to previous stable commit
   - Redeploy entire app:
   ```bash
   git revert <bad-commit>
   pnpm deploy:prod
   ```

## Cost Monitoring

### Spark Plan (Free Tier) Limits:
- **Firestore**: 50K reads/day, 20K writes/day, 20K deletes/day
- **Storage**: 1GB stored, 10GB bandwidth/month
- **Functions**: 125K invocations/month, 40K GB-seconds, 40K CPU-seconds
- **Hosting**: 10GB storage, 360MB/day bandwidth

### When to Upgrade to Blaze (Pay-as-you-go):
- Exceeding free tier limits
- Need for outbound networking from functions
- Production app with real users
- Custom domain requirements

### Setting Up Billing Alerts:
1. Go to Firebase Console > Project Settings > Usage and Billing
2. Click "Details & Settings" on Blaze plan
3. Set up Cloud Billing budget alerts in Google Cloud Console
4. Recommended: Alert at 50%, 90%, 100% of budget

## Troubleshooting Production Issues

### Authentication Issues:
- Verify Auth domain in Firebase Console matches `.env.production`
- Check authorized domains in Firebase Console > Authentication > Settings
- Ensure HTTPS is used (required for production auth)

### Firestore Connection Issues:
- Verify project ID in `.env.production` matches Firebase project
- Check security rules allow access
- Verify Firestore database is created in Firebase Console

### Storage Upload Failures:
- Check storage bucket name in `.env.production`
- Verify storage rules allow uploads
- Check file size limits (default 10MB in rules)

### Functions Not Responding:
- Check functions deployed successfully: Firebase Console > Functions
- Verify function region matches app configuration
- Check function logs: Firebase Console > Functions > Logs
- Verify CORS configuration for HTTP functions

### Build Failures:
- Ensure all environment variables in `.env.production` are set
- Check for TypeScript errors: `pnpm build:prod`
- Verify all dependencies installed: `pnpm install`
- Check for conflicting package versions

## Success Criteria

Deployment is considered successful when:

✅ Application deploys without errors  
✅ All post-deployment verification steps pass  
✅ No critical errors in Firebase Console logs  
✅ Authentication flows work end-to-end  
✅ CRUD operations work with real security rules  
✅ Storage operations complete successfully  
✅ Cloud Functions callable and executing correctly  
✅ Performance meets expectations (< 3s initial load)  
✅ No excessive Firebase quota usage  
✅ Cost monitoring configured and alerts set  

## Next Steps After Successful Deployment

1. **Set up monitoring**:
   - Enable Firebase Performance Monitoring
   - Configure Cloud Monitoring alerts
   - Set up error tracking (Firebase Crashlytics for web)

2. **Optimize performance**:
   - Review bundle size and code splitting
   - Enable Firestore offline persistence for PWA
   - Configure CDN caching for static assets

3. **Enhance security**:
   - Enable Firebase App Check
   - Review and tighten security rules
   - Configure rate limiting for functions

4. **Plan for scale**:
   - Monitor usage trends
   - Plan capacity upgrades if needed
   - Consider multi-region deployment

5. **Documentation**:
   - Document production deployment process
   - Create runbook for common operations
   - Update team on deployment procedures

---

**Last Updated:** October 16, 2025  
**Version:** 1.0  
**Related:** See `README.md` for detailed deployment instructions
