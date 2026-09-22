(() => {

    /*
     * ============================================================
     * CUSTOM DESKTOP ICONS
     * ============================================================
     *
     * Images are bundled inside:
     *
     * custom_login/custom_login/public/images/
     *
     * Browser path:
     *
     * /assets/custom_login/images/<filename>
     */

    const customIcons = {

        "ERPNext Settings":
            "/assets/custom_login/images/erpnext_settings.png",

        "Framework":
            "/assets/custom_login/images/framework.png",

        "Frappe Framework":
            "/assets/custom_login/images/frappe_framework.png",

        "Organization":
            "/assets/custom_login/images/organization.png",

        "Accounting":
            "/assets/custom_login/images/accounting.png",

        "Assets":
            "/assets/custom_login/images/assets.png",

        "Buying":
            "/assets/custom_login/images/buying.png",

        "Manufacturing":
            "/assets/custom_login/images/manufacturing.png",

        "Projects":
            "/assets/custom_login/images/projects.png",

        "Quality":
            "/assets/custom_login/images/quality.png",

        "Selling":
            "/assets/custom_login/images/selling.png",

        "Stock":
            "/assets/custom_login/images/stock.png",

        "Subcontracting":
            "/assets/custom_login/images/subcontracting.png",

        "HR":
            "/assets/custom_login/images/hrm.png",

        "HRMS":
            "/assets/custom_login/images/hrm.png"
    };


    /*
     * ============================================================
     * REPLACE ICON
     * ============================================================
     */

    function replaceIcon(desktopIcon) {

        const name =
            desktopIcon.getAttribute("data-id");

        if (!name) {
            return;
        }


        const imageUrl =
            customIcons[name];

        if (!imageUrl) {
            return;
        }


        /*
         * Find Frappe's icon container
         */

        const iconContainer =
            desktopIcon.querySelector(".icon-container");

        if (!iconContainer) {
            return;
        }


        /*
         * If our custom image already exists,
         * don't create another one.
         */

        const existingCustomImage =
            iconContainer.querySelector(
                "img.custom-desktop-icon"
            );

        if (existingCustomImage) {

            if (
                existingCustomImage.getAttribute("src") !==
                imageUrl
            ) {

                existingCustomImage.setAttribute(
                    "src",
                    imageUrl
                );
            }

            return;
        }


        /*
         * ========================================================
         * REMOVE FRAPPE DEFAULT ICON
         * ========================================================
         *
         * The previous code was APPENDING the image.
         *
         * That is why you were seeing:
         *
         * DEFAULT ICON + CUSTOM ICON
         *
         * Now we completely clear the visual icon container.
         */

        iconContainer.innerHTML = "";


        /*
         * ========================================================
         * CREATE CUSTOM IMAGE
         * ========================================================
         */

        const image =
            document.createElement("img");

        image.className =
            "custom-desktop-icon";

        image.alt =
            name;

        image.src =
            imageUrl;


        /*
         * Add only our image
         */

        iconContainer.appendChild(image);

    }


    /*
     * ============================================================
     * REPLACE ALL DESKTOP ICONS
     * ============================================================
     */

    function replaceIcons() {

        const desktopIcons =
            document.querySelectorAll(
                ".desktop-icon[data-id]"
            );

        desktopIcons.forEach((desktopIcon) => {

            replaceIcon(desktopIcon);

        });

    }


    /*
     * ============================================================
     * START
     * ============================================================
     */

    function start() {

        /*
         * Initial replacement
         */

        replaceIcons();


        /*
         * Frappe creates desktop icons dynamically.
         *
         * Watch the desktop for newly created icons.
         */

        const observer =
            new MutationObserver(() => {

                replaceIcons();

            });


        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );


        /*
         * Additional attempts after Frappe loads.
         */

        setTimeout(() => {
            replaceIcons();
        }, 500);

        setTimeout(() => {
            replaceIcons();
        }, 1500);

        setTimeout(() => {
            replaceIcons();
        }, 3000);

    }


    /*
     * ============================================================
     * DOM READY
     * ============================================================
     */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    } else {

        start();

    }

})();