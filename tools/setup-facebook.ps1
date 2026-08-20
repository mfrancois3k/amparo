# Facebook Page setup — double-click tools/setup-facebook.cmd to run this.
#
# WHY THIS FILE EXISTS: the working parts of this flow are all automatable, but
# one value cannot be — the Facebook token itself. Three tokens were burned
# getting it from Meta's screen into GitHub, not through carelessness but
# because the documented flow asks a human to carry a live credential by hand
# across four windows. This removes every step of that except the paste.
#
# The token is read straight into memory, used once, and never written to disk,
# never echoed to the console, and never passed as a command-line argument
# (process arguments are readable by anything that can list processes).

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

Write-Host ''
Write-Host '  Amparo — Facebook Page setup' -ForegroundColor Cyan
Write-Host '  ----------------------------' -ForegroundColor Cyan
Write-Host ''

# --- Preflight, so a missing tool fails here with a plain sentence rather
# --- than deep inside the node script with a stack trace.
foreach ($tool in @('node', 'gh')) {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
    Write-Host "  Missing required tool: $tool" -ForegroundColor Red
    Write-Host '  Install it, then run this again.'
    Read-Host '  Press Enter to close'
    exit 1
  }
}

try { gh auth status 2>&1 | Out-Null } catch {
  Write-Host '  GitHub CLI is not signed in.' -ForegroundColor Red
  Write-Host '  Run:  gh auth login'
  Read-Host '  Press Enter to close'
  exit 1
}

Write-Host '  STEP 1 — Revoke any old tokens (skip if already done)' -ForegroundColor Yellow
Write-Host '    Facebook > Settings & Privacy > Settings > Apps and Websites'
Write-Host '    Find "Amparo Poster" and click Remove.'
Write-Host ''
Read-Host '  Press Enter when that is done (or to skip)' | Out-Null

Write-Host ''
Write-Host '  STEP 2 — Generate a fresh token' -ForegroundColor Yellow
Write-Host '    Opening the Graph API Explorer in your browser...'
Start-Process 'https://developers.facebook.com/tools/explorer/'
Write-Host ''
Write-Host '    In that page:'
Write-Host '      1. Meta App        -> Amparo Poster'
Write-Host '      2. Click           -> Generate Access Token'
Write-Host '      3. Approve the popup, and TICK the page "What To Say to Police"'
Write-Host '      4. Copy the long string from the "Access Token" box at the top'
Write-Host ''
Write-Host '    Permissions must include pages_show_list, pages_read_engagement'
Write-Host '    and pages_manage_posts, or the Page will not be able to post.'
Write-Host ''

# Read-Host -AsSecureString keeps the value off the screen while it is typed,
# so it never appears in a screenshot or a shoulder-surf.
$secure = Read-Host '  STEP 3 — Paste the token here, then press Enter' -AsSecureString
if (-not $secure -or $secure.Length -eq 0) {
  Write-Host '  Nothing pasted. Run this again when you have the token.' -ForegroundColor Red
  Read-Host '  Press Enter to close'
  exit 1
}

$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
  # Zero the unmanaged copy immediately; it is not garbage collected.
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ($plain -notmatch '^EA[A-Za-z0-9]') {
  Write-Host ''
  Write-Host '  That does not look like a Facebook token.' -ForegroundColor Red
  Write-Host '  A real one is a long single line starting with "EAA".'
  Write-Host '  You may have copied example code instead of the Access Token box.'
  Read-Host '  Press Enter to close'
  exit 1
}

Write-Host ''
Write-Host '  Working...' -ForegroundColor Cyan
Write-Host ''

# App ID is public; the diagnostic already read it off the stored token.
$env:FB_APP_ID = '1062143259849090'

Write-Host ''
Write-Host '  STEP 4 - App Secret (this is what makes the token permanent)' -ForegroundColor Yellow
Write-Host '    Opening your app settings...'
Start-Process 'https://developers.facebook.com/apps/1062143259849090/settings/basic/'
Write-Host ''
Write-Host '    On that page find "App Secret", click Show, and copy it.'
Write-Host '    Without it the token expires in about an hour and posting stops.'
Write-Host ''
$secureSecret = Read-Host '    Paste the App Secret here, then press Enter' -AsSecureString
if ($secureSecret -and $secureSecret.Length -gt 0) {
  $sbstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSecret)
  try { $env:FB_APP_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($sbstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($sbstr) }
} else {
  Write-Host '    Skipped - the token will be used as-is and may expire.' -ForegroundColor Yellow
}

$env:FB_USER_TOKEN = $plain
try {
  node tools/fb-setup-secrets.mjs --page 'What To Say to Police'
  $code = $LASTEXITCODE
} finally {
  # Clear it from this process's environment either way, so a later command in
  # the same window cannot pick it up.
  Remove-Item Env:FB_USER_TOKEN -ErrorAction SilentlyContinue
  Remove-Item Env:FB_APP_SECRET -ErrorAction SilentlyContinue
  Remove-Item Env:FB_APP_ID -ErrorAction SilentlyContinue
  $plain = $null
  [GC]::Collect()
}

Write-Host ''
if ($code -eq 0) {
  Write-Host '  Done. Both secrets are saved to GitHub.' -ForegroundColor Green
  Write-Host '  The daily post workflow will start publishing on its next run.'
} else {
  Write-Host '  Did not finish — read the message above.' -ForegroundColor Red
  Write-Host '  Copy that output back to Claude; it contains no token and is safe to share.'
}
Write-Host ''
Read-Host '  Press Enter to close'
