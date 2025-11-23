# Troubleshooting Guide

## Common Issues and Solutions

This guide covers the most common issues you might encounter and how to resolve them.

---

## Upload & File Parsing Issues

### "Failed to parse document"

**Symptoms**: Error message after uploading .docx file

**Possible Causes**:

1. Corrupted document file
2. Unsupported .docx features
3. Password-protected document
4. Macro-enabled .docm file

**Solutions**:

1. **Try re-saving the document**:

   - Open in Microsoft Word
   - File → Save As → .docx (not .docm)
   - Ensure "Maintain compatibility" is unchecked

2. **Remove password protection**:

   - File → Info → Protect Document → Encrypt with Password
   - Clear password field

3. **Copy content to new document**:

   - Select all content (Ctrl/Cmd+A)
   - Copy and paste into fresh .docx file
   - Save and re-upload

4. **Use text paste instead**:
   - Copy text from Word
   - Paste directly into text area
   - Click "Analyze Chapter"

### "File too large"

**Symptoms**: Upload fails with size error

**Limits by tier**:

- Free: 200 pages (~500KB)
- Premium: 650 pages (~1.6MB)
- Professional: 1000 pages (~2.5MB)

**Solutions**:

1. **Split into smaller documents**
2. **Remove images** (use simplified version)
3. **Compress document**:
   - Word: File → Save As → Tools → Compress Pictures
4. **Upgrade tier** for larger limits

### "Images not displaying"

**Symptoms**: Document uploads but images are missing/broken

**Possible Causes**:

- WMF/EMF image formats (equations, charts from Excel)
- Large embedded images
- Linked images (not embedded)

**Solutions**:

1. **Check image format**:

   - Supported: PNG, JPG, GIF, SVG
   - Not fully supported: WMF, EMF

2. **Re-insert images**:

   - Copy image from source
   - Paste as picture (not link)
   - Save document

3. **For equations**:
   - Equations may show as placeholder
   - This doesn't affect text analysis
   - Re-add after export if needed

### "PDF upload not working"

**Symptoms**: PDF upload fails or extracts garbled text

**Possible Causes**:

- Scanned PDF (image-based, no text layer)
- Complex formatting
- Encrypted PDF

**Solutions**:

1. **Verify text-based PDF**:

   - Open PDF, try to select/copy text
   - If can't select, it's an image-based scan

2. **Use OCR for scanned PDFs**:

   - Adobe Acrobat: Tools → Recognize Text
   - Online tools: ocr.space, smallpdf.com
   - Export as Word document first

3. **Copy/paste text**:
   - Select text from PDF
   - Paste into text area
   - Preserves content, loses formatting

---

## Analysis Issues

### "Analysis stuck at 'Processing...'"

**Symptoms**: Progress bar frozen, no completion

**Solutions**:

1. **Wait longer** (large documents take 30-60 seconds)
2. **Refresh page** and try again
3. **Check browser console** (F12) for errors
4. **Reduce document size** and retry
5. **Try different browser** (Chrome recommended)

### "Not enough concepts detected"

**Symptoms**: Warning that fewer than 40 concepts matched

**Possible Causes**:

- Wrong domain selected
- Document is too general/not technical
- Custom domain has too few concepts

**Solutions**:

1. **Try different domain**:

   - Auto-detect often works best
   - Manual override if needed

2. **Use "None / General Content"**:

   - For non-technical writing
   - Meditation guides, essays, creative writing
   - Uses general concept extraction instead

3. **For custom domains**:
   - Add more concepts (aim for 50+)
   - Check concept spelling matches document
   - Verify importance levels

### "Analysis scores seem wrong"

**Symptoms**: Scores don't match your expectations

**Common Misunderstandings**:

1. **Spacing scores** evaluate paragraph length consistency, not quality
2. **Dual-coding** only checks for visual indicators, not actual diagrams
3. **Scores are relative** to best practices, not absolute

**What to check**:

- Read the "Findings" section for each principle
- Check specific examples in recommendations
- Compare to similar content you've analyzed
- Verify domain selection is appropriate

### "Analysis crashes browser"

**Symptoms**: Browser tab freezes or crashes

**Solutions**:

1. **Document too large** - split into smaller sections
2. **Close other tabs** - free up memory
3. **Use Chrome** - best performance
4. **Disable browser extensions** temporarily
5. **Update browser** to latest version

---

## Authentication & Account Issues

### "Can't sign in"

**Symptoms**: Login fails with error message

**Common Causes**:

1. **Incorrect credentials**

   - Double-check email and password
   - Password is case-sensitive
   - Try password reset

2. **Email not confirmed**

   - Check inbox for confirmation email
   - Check spam folder
   - Resend confirmation (link in error message)

3. **Account doesn't exist**
   - Try "Sign Up" instead
   - Or use "Forgot Password" to check

**Solutions**:

```
1. Click "Forgot Password"
2. Enter your email
3. Check for reset email
4. Create new password
5. Sign in with new password
```

### "Email confirmation not received"

**Symptoms**: No confirmation email after signup

**Solutions**:

1. **Check spam/junk folder**
2. **Wait 5-10 minutes** (sometimes delayed)
3. **Verify email spelling** when signing up
4. **Resend confirmation**:

   - Sign out
   - Try signing in
   - Click "Resend confirmation" link

5. **Contact support** if still missing after 1 hour

### "Signed out unexpectedly"

**Symptoms**: Session expires, forced to sign in again

**Causes**:

- Session timeout (24 hours)
- Browser cookies cleared
- Multiple tabs/windows

**Solutions**:

- Sign in again (sessions are secure)
- Enable "Remember me" if available
- Don't clear cookies while using app

---

## Subscription & Payment Issues

### "Payment failed"

**Symptoms**: Error during Stripe checkout

**Common Causes**:

1. **Card declined** - contact your bank
2. **Insufficient funds**
3. **Incorrect card details**
4. **International card restrictions**

**Solutions**:

1. **Verify card details**:

   - Card number
   - Expiry date
   - CVC/CVV code
   - Billing ZIP code

2. **Try different card**
3. **Contact your bank** - they may have blocked the charge
4. **Use PayPal** if available

### "Upgraded but features still locked"

**Symptoms**: Paid for upgrade but still see free tier

**Solutions**:

1. **Sign out and back in** - refresh your session
2. **Wait 1-2 minutes** - webhook processing delay
3. **Check Stripe receipt** - verify payment went through
4. **Clear browser cache** and reload
5. **Contact support** with:
   - Email used for account
   - Stripe receipt/transaction ID
   - Screenshot of locked feature

### "Can't cancel subscription"

**Symptoms**: Can't find cancel option

**How to Cancel**:

1. Click your profile icon (top right)
2. Select "Manage Subscription"
3. You'll be redirected to Stripe Customer Portal
4. Click "Cancel Subscription"
5. Confirm cancellation

**Note**: Access continues until end of billing period

### "Want refund"

**Process**:

- Refunds within 7 days of purchase
- Contact support with:
  - Email address
  - Reason for refund request
  - Stripe transaction ID
- Most refunds processed within 5-7 business days

---

## Export Issues

### "HTML export has no styling"

**Symptoms**: Exported HTML looks plain/unstyled

**Cause**: Styles are embedded in the HTML file

**Solutions**:

1. **Open in web browser** (not text editor)

   - Chrome, Firefox, Safari, Edge
   - Right-click file → Open With → Browser

2. **If still unstyled**:
   - Check file extension is `.html` (not `.txt`)
   - Re-export and try again

### "DOCX export formatting issues"

**Symptoms**: Colors, spacing, or structure different than expected

**Known Limitations**:

- Complex nested structures may simplify
- Some fonts may substitute
- Image positioning may shift

**Solutions**:

1. **Post-process in Word**:

   - Open exported .docx
   - Adjust formatting as needed
   - Colors and highlights are preserved

2. **Use HTML export** for exact styling:
   - HTML maintains exact appearance
   - Can convert HTML → DOCX with Pandoc if needed

### "Export button disabled"

**Symptoms**: Can't click export buttons

**Causes**:

1. **No analysis completed** - run analysis first
2. **Free tier** - export requires Premium/Professional
3. **Empty document** - add content first

**Solutions**:

- Complete analysis before exporting
- Upgrade to Premium or Professional
- Ensure document has content

---

## Performance Issues

### "App running slowly"

**Symptoms**: Lag, delayed responses, freezing

**Solutions**:

1. **Close other browser tabs**
2. **Clear browser cache**:
   ```
   Chrome: Ctrl/Cmd+Shift+Delete
   Select "Cached images and files"
   Time range: All time
   ```
3. **Reduce document size** - analyze sections separately
4. **Disable browser extensions** temporarily
5. **Update browser** to latest version
6. **Use recommended browser**: Chrome or Edge

### "Analysis takes too long"

**Expected Times**:

- Small (1-5 pages): 5-10 seconds
- Medium (10-20 pages): 15-30 seconds
- Large (50+ pages): 45-90 seconds

**If longer than expected**:

1. **Check document size** - may be hitting limits
2. **Verify internet connection** - needed for cloud features
3. **Try different time** - server may be busy
4. **Split document** if very large

### "Auto-save filling storage"

**Symptoms**: "Storage quota exceeded" error

**Solutions**:

1. **Clear old auto-saves**:

   ```javascript
   // In browser console (F12)
   localStorage.removeItem("tomeiq_autosave");
   ```

2. **Export important work** before clearing

3. **Check storage usage**:
   ```javascript
   // In browser console
   console.log(
     Object.keys(localStorage).map(
       (key) => `${key}: ${localStorage[key].length} bytes`
     )
   );
   ```

---

## Browser-Specific Issues

### Chrome Issues

**Problem**: "Aw, snap!" crash

- **Solution**: Reduce document size, close other tabs

**Problem**: Extensions interfering

- **Solution**: Try Incognito mode (Ctrl/Cmd+Shift+N)

### Firefox Issues

**Problem**: Slow performance

- **Solution**: Firefox may be slower - use Chrome for large documents

### Safari Issues

**Problem**: Upload button not working

- **Solution**: Update Safari to latest version

**Problem**: Styling differences

- **Solution**: Known issue - use Chrome for most consistent experience

---

## Data & Privacy Issues

### "Is my data private?"

**Yes**:

- Documents processed client-side (your browser)
- Only analysis results sent to server (if saving)
- No documents stored on our servers
- See Privacy Policy for details

### "Where is my data stored?"

**Local Storage**:

- Auto-save snapshots: Browser localStorage
- Custom domains: Browser localStorage
- Cleared when you clear browser data

**Supabase (if signed in)**:

- User profile
- Saved analyses (if you click "Save")
- Subscription status
- Encrypted and secure

### "How do I delete my data?"

**Local data**:

```javascript
// In browser console (F12)
localStorage.clear();
```

**Account data**:

1. Sign in
2. Profile → Settings
3. Click "Delete Account"
4. Confirm deletion
5. All data permanently removed within 30 days

---

## Template & AI Issues

### "Claude API key not working"

**Symptoms**: "Invalid API key" error

**Solutions**:

1. **Verify key format**: Should start with `sk-ant-`
2. **Check for spaces**: Copy/paste error
3. **Verify billing**: Anthropic account must have payment method
4. **Generate new key**: Old key may be revoked

### "AI-generated content is wrong"

**This is expected**:

- AI is not perfect
- Always review and edit AI output
- Verify facts, especially technical/scientific content

**Best practices**:

1. Use specific prompts
2. Provide context in `[CLAUDE]` prompts
3. Edit and refine output
4. Don't rely solely on AI

### "Template not loading"

**Symptoms**: Template appears blank or errors

**Solutions**:

1. **Refresh page**
2. **Try different template**
3. **Clear cache** and retry
4. **Report template name** if consistent issue

---

## Custom Domain Issues

### "Concepts not being detected"

**Solutions**:

1. **Check spelling** - must match exactly
2. **Add variations** - e.g., "analyze" and "analysis"
3. **Use lowercase** - matching is case-insensitive but save lowercase
4. **Avoid special characters**

### "Can't save custom domain"

**Causes**:

- Not signed in - sign in first
- Free tier - upgrade to Premium/Professional
- Storage full - delete old domains

### "Lost custom domain"

**Recovery**:

- Check if you're signed in to correct account
- Domains tied to account, not browser
- Contact support with domain name

---

## Getting Help

### Check Browser Console

Press `F12` (or `Cmd+Option+I` on Mac) to open developer tools.

Look for errors (red text) in Console tab. Include in support request.

### Report an Issue

Include this information:

1. **What happened** - detailed description
2. **What you expected** - what should have happened
3. **Browser** - name and version
4. **Account tier** - Free/Premium/Professional
5. **Document type** - .docx, PDF, or text input
6. **Document size** - approximate page count
7. **Screenshots** - if applicable
8. **Error messages** - exact text or console errors

### Contact Support

- **Email**: support@tomeiq.com (when available)
- **GitHub Issues**: https://github.com/londailey6937/Chapter-Analysis/issues
- **Documentation**: Check docs/ folder first

---

## Prevention Tips

### Best Practices

1. **Save work regularly** - don't rely only on auto-save
2. **Export important analyses** - auto-save is temporary
3. **Test with small documents first** - especially new domains
4. **Use recommended browser** - Chrome for best experience
5. **Keep browser updated** - latest version
6. **Don't clear cache mid-session** - can lose data
7. **One tab at a time** - multiple tabs can cause issues
8. **Stable internet** - needed for auth and saves

### Before Reporting Bug

1. ✅ Refresh page and try again
2. ✅ Sign out and back in
3. ✅ Clear browser cache
4. ✅ Try different browser
5. ✅ Check this troubleshooting guide
6. ✅ Review other documentation

---

## Quick Reference

| Issue            | Quick Fix                      |
| ---------------- | ------------------------------ |
| Upload fails     | Try copy/paste text instead    |
| Analysis stuck   | Refresh page, reduce size      |
| Wrong domain     | Use auto-detect or "General"   |
| Login issues     | Reset password                 |
| Features locked  | Verify tier, sign out/in       |
| Export problems  | Complete analysis first        |
| Slow performance | Close tabs, clear cache        |
| Storage full     | Clear auto-save localStorage   |
| AI not working   | Verify API key, check billing  |
| Concepts missing | Check spelling, add variations |

---

## Still Having Issues?

If none of these solutions work:

1. Check GitHub Issues for similar problems
2. Review recent changes in `docs/RECENT_CHANGES.md`
3. Verify your environment matches requirements
4. Contact support with detailed information above
