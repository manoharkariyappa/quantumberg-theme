import frappe


def after_install():
    frappe.clear_cache()
    print("Custom Login installed successfully.")