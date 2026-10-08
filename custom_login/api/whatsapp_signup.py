import hashlib
import random
import re
from datetime import timedelta

import frappe
import requests
from frappe import _
from frappe.utils import now_datetime


OTP_EXPIRY_MINUTES = 5
OTP_LENGTH = 6
MAX_OTP_ATTEMPTS = 5


def _normalize_mobile(mobile):
    """Return WhatsApp number as digits only, without +."""
    mobile = (mobile or "").strip()

    if not mobile:
        frappe.throw(_("Mobile number is required."))

    digits = re.sub(r"\D", "", mobile)

    if len(digits) < 10 or len(digits) > 15:
        frappe.throw(_("Enter a valid WhatsApp mobile number with country code."))

    return digits


def _hash_otp(otp):
    return hashlib.sha256(str(otp).encode("utf-8")).hexdigest()


def _find_active_user_by_mobile(mobile):
    """Find an enabled User using the last 10 mobile digits."""
    last10 = mobile[-10:]

    rows = frappe.db.sql(
        """
        SELECT name
        FROM `tabUser`
        WHERE enabled = 1
          AND mobile_no IS NOT NULL
          AND mobile_no != ''
          AND REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(
                            REPLACE(mobile_no, '+', ''),
                            ' ', ''
                        ),
                        '-', ''
                    ),
                    '(', ''
                ),
                ')', ''
            ) LIKE %s
        LIMIT 1
        """,
        (f"%{last10}",),
        as_dict=True,
    )

    return rows[0].name if rows else None


def _get_or_create_otp(mobile, otp, purpose, expires_at):
    """
    Reuse the existing OTP row when the DocType has a unique mobile field.
    This prevents '<mobile> already exists' when requesting a new OTP.
    """
    existing = frappe.db.get_value(
        "WhatsApp OTP",
        {"mobile": mobile},
        "name",
        order_by="creation desc",
    )

    values = {
        "otp_hash": _hash_otp(otp),
        "purpose": purpose,
        "expiry_at": expires_at,
        "attempts": 0,
        "verified": 0,
    }

    if existing:
        frappe.db.set_value(
            "WhatsApp OTP",
            existing,
            values,
            update_modified=False,
        )
        return frappe.get_doc("WhatsApp OTP", existing)

    otp_doc = frappe.get_doc(
        {
            "doctype": "WhatsApp OTP",
            "mobile": mobile,
            **values,
        }
    )
    otp_doc.insert(ignore_permissions=True)
    return otp_doc


def _get_whatsapp_account():
    """Load the existing Frappe WhatsApp account used by this signup flow."""
    account_name = "hrms"

    account = frappe.get_doc("WhatsApp Account", account_name)

    token = account.get_password("token")

    if not token:
        frappe.throw(
            _("WhatsApp access token is not configured in WhatsApp Account {0}.").format(
                account_name
            )
        )

    base_url = (getattr(account, "url", None) or "https://graph.facebook.com").rstrip("/")
    version = getattr(account, "version", None) or "v24.0"
    phone_id = getattr(account, "phone_id", None)

    if not phone_id:
        frappe.throw(
            _("Phone ID is not configured in WhatsApp Account {0}.").format(
                account_name
            )
        )

    return account, token, base_url, version, phone_id


def _send_signup_otp_whatsapp(mobile, otp):
    """
    Send the approved AUTHENTICATION template directly to Meta.

    This intentionally does not create a WhatsApp Message document.
    The existing Frappe Notification path currently sends only the BODY
    component and therefore returns HTTP 400 for the Authentication template.
    """
    account, token, base_url, version, phone_id = _get_whatsapp_account()

    url = f"{base_url}/{version}/{phone_id}/messages"

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": mobile,
        "type": "template",
        "template": {
            "name": "signup_otp",
            "language": {
                "code": "en_US"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": str(otp)
                        }
                    ]
                },
                {
                    "type": "button",
                    "sub_type": "url",
                    "index": "0",
                    "parameters": [
                        {
                            "type": "text",
                            "text": str(otp)
                        }
                    ]
                }
            ]
        }
    }

    response = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    if not response.ok:
        try:
            error_data = response.json()
        except Exception:
            error_data = response.text

        frappe.log_error(
            title="WhatsApp Signup OTP - Meta API Error",
            message=frappe.as_json(
                {
                    "status_code": response.status_code,
                    "response": error_data,
                    "mobile": mobile,
                    "account": account.name,
                }
            ),
        )

        frappe.throw(
            _(
                "Unable to send WhatsApp OTP. Meta returned HTTP {0}."
            ).format(response.status_code)
        )

    return response.json()


@frappe.whitelist(allow_guest=True)
def send_otp(mobile):
    """
    Generate and send a WhatsApp signup OTP.

    The OTP itself is not stored in the database.
    Only its SHA-256 hash is stored in WhatsApp OTP.
    """
    mobile = _normalize_mobile(mobile)

    # Prevent sending another OTP when an account already exists.
    existing_user = _find_active_user_by_mobile(mobile)

    if existing_user:
        frappe.throw(
            _("An account already exists for this mobile number.")
        )

    otp = "".join(
        str(random.randint(0, 9))
        for _ in range(OTP_LENGTH)
    )

    expires_at = now_datetime() + timedelta(minutes=OTP_EXPIRY_MINUTES)

    otp_doc = _get_or_create_otp(
        mobile=mobile,
        otp=otp,
        purpose="Signup",
        expires_at=expires_at,
    )
    frappe.db.commit()

    try:
        _send_signup_otp_whatsapp(mobile, otp)
    except Exception:
        # Do not leave a valid OTP in the database if WhatsApp delivery failed.
        frappe.db.set_value(
            "WhatsApp OTP",
            otp_doc.name,
            "verified",
            1,
            update_modified=False,
        )
        frappe.db.commit()
        raise

    return {
        "success": True,
        "message": "OTP sent successfully",
        "expires_in": OTP_EXPIRY_MINUTES * 60,
    }


@frappe.whitelist(allow_guest=True)
def verify_otp(
    mobile,
    otp,
    first_name,
    last_name=None,
    email=None,
    password=None,
):
    """
    Verify the WhatsApp OTP and create the Frappe User.
    """
    mobile = _normalize_mobile(mobile)
    otp = (otp or "").strip()
    first_name = (first_name or "").strip()
    last_name = (last_name or "").strip()
    email = (email or "").strip().lower()
    password = password or ""

    if not re.fullmatch(r"\d{6}", otp):
        frappe.throw(_("Enter a valid 6-digit OTP."))

    if not first_name:
        frappe.throw(_("First Name is required."))

    if len(password) < 8:
        frappe.throw(_("Password must contain at least 8 characters."))

    # ---------------------------------------------------------
    # OPTIONAL EMAIL
    # ---------------------------------------------------------
    # If the user leaves email empty, create an internal
    # placeholder using FIRST NAME + MOBILE NUMBER.
    #
    # Example:
    #   First Name = Manohar
    #   Mobile     = 916362205899
    #
    # Result:
    #   manohar916362205899@example.com
    #
    # This is used as a placeholder email when the user does not provide one.
    # ---------------------------------------------------------

    generated_email = False

    if not email:
        name_part = re.sub(
            r"[^a-zA-Z0-9]",
            "",
            first_name
        ).lower()

        if not name_part:
            name_part = "user"

        email = f"{name_part}{mobile}@example.com"
        generated_email = True

    else:
        if not frappe.utils.validate_email_address(
            email,
            False
        ):
            frappe.throw(
                _("Enter a valid email address.")
            )

    # Check email before OTP verification.
    if frappe.db.exists("User", email):
        frappe.throw(
            _("A user already exists with this email address.")
        )

    otp_doc_name = frappe.db.get_value(
        "WhatsApp OTP",
        {
            "mobile": mobile,
            "purpose": "Signup",
            "verified": 0,
        },
        "name",
        order_by="creation desc",
    )

    if not otp_doc_name:
        frappe.throw(_("OTP not found. Please request a new OTP."))

    otp_doc = frappe.get_doc("WhatsApp OTP", otp_doc_name)

    if otp_doc.expiry_at and now_datetime() > otp_doc.expiry_at:
        frappe.db.set_value(
            "WhatsApp OTP",
            otp_doc.name,
            "verified",
            1,
            update_modified=False,
        )
        frappe.db.commit()

        frappe.throw(_("OTP has expired. Please request a new OTP."))

    attempts = int(otp_doc.attempts or 0)

    if attempts >= MAX_OTP_ATTEMPTS:
        frappe.throw(
            _("Maximum OTP attempts reached. Please request a new OTP.")
        )

    if _hash_otp(otp) != otp_doc.otp_hash:
        frappe.db.set_value(
            "WhatsApp OTP",
            otp_doc.name,
            "attempts",
            attempts + 1,
            update_modified=False,
        )
        frappe.db.commit()

        remaining = max(MAX_OTP_ATTEMPTS - attempts - 1, 0)

        frappe.throw(
            _(
                "Invalid OTP. {0} attempts remaining."
            ).format(remaining)
        )

    # Check mobile again immediately before user creation.
    if _find_active_user_by_mobile(mobile):
        frappe.throw(
            _("An account already exists for this mobile number.")
        )

    user = frappe.get_doc(
        {
            "doctype": "User",
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "mobile_no": mobile,
            "enabled": 1,
            "send_welcome_email": 0,
            "new_password": password,
            "user_type": "Website User",
        }
    )

    # example.com is a valid email domain, so normal
    # Frappe User validation can be used.
    user.insert(
        ignore_permissions=True,
    )

    # Mark OTP as used.
    frappe.db.set_value(
        "WhatsApp OTP",
        otp_doc.name,
        {
            "verified": 1,
            "attempts": attempts,
        },
        update_modified=False,
    )

    frappe.db.commit()

    # Log the new user in immediately.
    try:
        login_manager = frappe.auth.LoginManager()
        login_manager.authenticate(user=user.name, pwd=password)
        login_manager.post_login()
    except Exception:
        # Account is already created. Let the frontend redirect to login.
        frappe.log_error(
            title="WhatsApp Signup - Auto Login Failed",
            message=frappe.get_traceback(),
        )

        return {
            "success": True,
            "message": "Account created successfully.",
            "redirect": "/login",
            "user": user.name,
            "email": email,
            "mobile": mobile,
        }

    return {
        "success": True,
        "message": "Account created successfully.",
        "redirect": "/app",
        "user": user.name,
        "email": email,
        "mobile": mobile,
    }

@frappe.whitelist(allow_guest=True)
def send_forgot_password_otp(mobile):
    """Send a WhatsApp OTP for password reset."""
    mobile = _normalize_mobile(mobile)

    user_name = _find_active_user_by_mobile(mobile)

    # Do not reveal whether a mobile number has an account.
    if not user_name:
        return {
            "success": True,
            "message": "If an account exists for this mobile number, an OTP has been sent.",
        }

    otp = "".join(str(random.randint(0, 9)) for _ in range(OTP_LENGTH))
    expires_at = now_datetime() + timedelta(minutes=OTP_EXPIRY_MINUTES)

    otp_doc = _get_or_create_otp(
        mobile=mobile,
        otp=otp,
        purpose="Forgot Password",
        expires_at=expires_at,
    )
    frappe.db.commit()

    try:
        _send_signup_otp_whatsapp(mobile, otp)
    except Exception:
        frappe.db.set_value(
            "WhatsApp OTP",
            otp_doc.name,
            "verified",
            1,
            update_modified=False,
        )
        frappe.db.commit()
        raise

    return {
        "success": True,
        "message": "OTP sent successfully to your WhatsApp.",
        "expires_in": OTP_EXPIRY_MINUTES * 60,
    }


@frappe.whitelist(allow_guest=True)
def reset_password_with_otp(mobile, otp, new_password, confirm_password=None):
    """Verify a WhatsApp reset OTP and update the user's password."""
    mobile = _normalize_mobile(mobile)
    otp = (otp or "").strip()
    new_password = new_password or ""
    confirm_password = new_password if confirm_password is None else confirm_password

    if not re.fullmatch(r"\d{6}", otp):
        frappe.throw(_("Enter a valid 6-digit OTP."))

    if len(new_password) < 8:
        frappe.throw(_("Password must contain at least 8 characters."))

    if new_password != confirm_password:
        frappe.throw(_("Passwords do not match."))

    user_name = _find_active_user_by_mobile(mobile)

    if not user_name:
        frappe.throw(_("No active account was found for this mobile number."))

    otp_doc_name = frappe.db.get_value(
        "WhatsApp OTP",
        {
            "mobile": mobile,
            "purpose": "Forgot Password",
            "verified": 0,
        },
        "name",
        order_by="creation desc",
    )

    if not otp_doc_name:
        frappe.throw(_("OTP not found. Please request a new OTP."))

    otp_doc = frappe.get_doc("WhatsApp OTP", otp_doc_name)

    if otp_doc.expiry_at and now_datetime() > otp_doc.expiry_at:
        frappe.db.set_value(
            "WhatsApp OTP", otp_doc.name, "verified", 1, update_modified=False
        )
        frappe.db.commit()
        frappe.throw(_("OTP has expired. Please request a new OTP."))

    attempts = int(otp_doc.attempts or 0)
    if attempts >= MAX_OTP_ATTEMPTS:
        frappe.throw(_("Maximum OTP attempts reached. Please request a new OTP."))

    if _hash_otp(otp) != otp_doc.otp_hash:
        frappe.db.set_value(
            "WhatsApp OTP",
            otp_doc.name,
            "attempts",
            attempts + 1,
            update_modified=False,
        )
        frappe.db.commit()
        remaining = max(MAX_OTP_ATTEMPTS - attempts - 1, 0)
        frappe.throw(_("Invalid OTP. {0} attempts remaining.").format(remaining))

    user = frappe.get_doc("User", user_name)
    user.new_password = new_password
    user.save(ignore_permissions=True)

    frappe.db.set_value(
        "WhatsApp OTP",
        otp_doc.name,
        {"verified": 1, "attempts": attempts},
        update_modified=False,
    )
    frappe.db.commit()

    return {
        "success": True,
        "message": "Password reset successfully. Please log in with your new password.",
        "redirect": "/login",
        "user": user.name,
    }