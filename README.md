### Custom Login

Branded login page with WhatsApp-based signup and password reset, plus desk theme
customizations for Frappe/ERPNext.

### Features

**Login page**

- Sign in with email and password, with a "remember me" option
- Sign up through two methods, switchable from the same screen:
  - **Email** — standard Frappe signup
  - **WhatsApp** — verify an OTP sent to your WhatsApp number, then create the account
- Forgot password through two methods, switchable from the same screen:
  - **Email** — standard reset link
  - **WhatsApp** — verify an OTP sent to your WhatsApp number, then set a new password
- Email login link section for passwordless entry
- Branded layout and copy for the workspace

**WhatsApp OTP**

- Guest-accessible API for sending and verifying OTPs
- OTPs are 6-digit, stored only as SHA-256 hashes, expire in 5 minutes, and allow a
  maximum of 5 verification attempts
- Signup OTP delivery goes directly to the Meta WhatsApp Cloud API (no WhatsApp Message
  record is created, by design)
- Duplicate-account protection: signup is blocked when the mobile number already has an
  active user; forgot-password responses never reveal whether an account exists
- Password reset enforces a minimum password length
- If a user signs up without an email address, a placeholder email is generated from
  their first name and mobile number so Frappe user validation still passes

**Desk theming**

- Custom sidebar, workspace, button, and misc style overrides
- Custom workspace app icons

### Requirements

- Frappe/ERPNext bench (v16 site)
- [frappe-whatsapp](https://github.com/shridarpatil/frappe_whatsapp) installed — it
  provides the WhatsApp Account doctype and the Meta WhatsApp Cloud API integration that
  the OTP flows build on

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app https://github.com/manoharkariyappa/quantumberg-theme
bench install-app custom_login
```

Then install the WhatsApp dependency:

```bash
bench get-app https://github.com/shridarpatil/frappe_whatsapp
bench install-app frappe_whatsapp
```

### WhatsApp OTP setup

1. **Set up frappe-whatsapp** and register your WhatsApp Business number with Meta to
   obtain an Access Token and Phone Number ID.
2. **Create a WhatsApp Account named exactly `hrms`.** The account name is currently
   hardcoded — an account with any other name will not be picked up.
3. **Fill in the credentials:** Access Token and Phone Number ID are required. The API
   URL and version default to Meta's Graph API and `v24.0` when left blank.
4. **Create and get approval for an AUTHENTICATION template named `signup_otp`**
   (language `en_US`). The template must accept the OTP in **both** the message body
   and its URL button — the code passes the OTP to both components.
5. **Test a signup.** The OTP is sent directly to Meta's API, so no WhatsApp Message
   document is created; this is intentional, because the standard notification path
   only sends the body component and Meta rejects the request for Authentication
   templates.

**Troubleshooting**

| Symptom | Likely cause |
| --- | --- |
| "WhatsApp access token is not configured" | Account exists but the token field is empty |
| "Phone ID is not configured" | Phone Number ID missing on the account |
| `DoesNotExistError` for the account | Account name is not exactly `hrms` |
| Meta returns HTTP 400 | Template missing/not approved, wrong name, or the URL button doesn't receive the OTP |
| OTP never arrives | Check Error Log for an entry titled `WhatsApp Signup OTP - Meta API Error` — the status code and Meta response are logged there |

### Configuration notes

The following values are currently hardcoded in the app:

| Value | Current setting |
| --- | --- |
| WhatsApp Account name | `hrms` |
| Meta template name | `signup_otp` |
| Template language | `en_US` |
| OTP length | 6 digits |
| OTP expiry | 5 minutes |
| Max verification attempts | 5 |
| Minimum password length | 8 characters |
| API defaults | `https://graph.facebook.com`, `v24.0` |

To change any of these, update the corresponding constant or lookup in the app source
and restart the server.

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/custom_login
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### CI

This app can use GitHub Actions for CI. The following workflows are configured:

- CI: Installs this app and runs unit tests on every push to `develop` branch.
- Linters: Runs [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules) and [pip-audit](https://pypi.org/project/pip-audit/) on every pull request.

### License

mit
