(() => {

    /*
     * ============================================================
     * CUSTOM MODULE ICONS
     * ============================================================
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
     * GET ICON
     * ============================================================
     */

    function getIcon(name) {
        return customIcons[name] || null;
    }


    /*
     * ============================================================
     * 1. DESKTOP PAGE ICONS
     * ============================================================
     */

    function replaceDesktopIcons() {

        document
            .querySelectorAll(".desktop-icon[data-id]")
            .forEach((desktopIcon) => {

                const name =
                    desktopIcon.getAttribute("data-id");

                const imageUrl =
                    getIcon(name);

                if (!imageUrl) {
                    return;
                }

                const iconContainer =
                    desktopIcon.querySelector(".icon-container");

                if (!iconContainer) {
                    return;
                }

                let image =
                    iconContainer.querySelector(
                        ".custom-desktop-icon"
                    );

                if (image) {
                    image.src = imageUrl;
                    return;
                }

                /*
                 * Remove Frappe default icon
                 */

                iconContainer.innerHTML = "";

                /*
                 * Add custom icon
                 */

                image =
                    document.createElement("img");

                image.className =
                    "custom-desktop-icon";

                image.alt = name;

                image.src = imageUrl;

                iconContainer.appendChild(image);

            });

    }


    /*
     * ============================================================
     * 2. TOP SIDEBAR HEADER ICON
     * ============================================================
     *
     * Example:
     *
     *      [ BUYING ICON ] Buying
     *                     ERPNext
     *
     * This is the icon at the very top of the
     * left sidebar.
     */

    function replaceSidebarHeaderIcon() {

        /*
         * Frappe v16 sidebar header logo
         */

        const headerLogo =
            document.querySelector(".header-logo");

        if (headerLogo) {

            /*
             * Don't replace twice
             */

            if (
                headerLogo.dataset.customIconApplied === "1"
            ) {
                return;
            }

            /*
             * Determine current workspace/module.
             */

            const titleElement =
                document.querySelector(
                    ".sidebar-item-label.header-title"
                );

            let moduleName = "";

            if (titleElement) {
                moduleName =
                    titleElement.textContent.trim();
            }

            /*
             * Fallback:
             * Look for sidebar title.
             */

            if (!moduleName) {

                const sidebarHeader =
                    headerLogo.closest(
                        ".sidebar-header"
                    );

                if (sidebarHeader) {

                    const text =
                        sidebarHeader.textContent
                            .trim();

                    Object.keys(customIcons)
                        .forEach((name) => {

                            if (
                                text.includes(name)
                            ) {
                                moduleName = name;
                            }

                        });

                }

            }

            const imageUrl =
                getIcon(moduleName);

            if (!imageUrl) {
                return;
            }


            /*
             * If header-logo itself is IMG
             */

            if (
                headerLogo.tagName === "IMG"
            ) {

                headerLogo.src =
                    imageUrl;

            }

            /*
             * If Frappe uses SVG/container
             */

            else {

                headerLogo.innerHTML = "";

                const image =
                    document.createElement("img");

                image.src =
                    imageUrl;

                image.alt =
                    moduleName;

                headerLogo.appendChild(
                    image
                );

            }


            headerLogo.dataset.customIconApplied =
                "1";

            return;
        }


        /*
         * Some Frappe builds use icon-container
         * instead of .header-logo.
         */

        const headerContainer =
            document.querySelector(
                ".sidebar-header .icon-container"
            );

        if (!headerContainer) {
            return;
        }


        /*
         * Get workspace title
         */

        const titleElement =
            document.querySelector(
                ".sidebar-item-label.header-title"
            );

        if (!titleElement) {
            return;
        }


        const moduleName =
            titleElement.textContent.trim();

        const imageUrl =
            getIcon(moduleName);

        if (!imageUrl) {
            return;
        }


        /*
         * Remove default SVG
         */

        headerContainer.innerHTML = "";


        /*
         * Add custom image
         */

        const image =
            document.createElement("img");

        image.src =
            imageUrl;

        image.alt =
            moduleName;

        headerContainer.appendChild(
            image
        );

    }


    /*
     * ============================================================
     * 3. GETTING STARTED POPUP ICON
     * ============================================================
     *
     * Example:
     *
     *       Getting Started
     *
     *            [ BUYING ICON ]
     *
     *          Buying Setup
     *
     */

    // function replaceGettingStartedIcon() {

    //     /*
    //      * Find "Getting Started"
    //      */

    //     const allElements =
    //         document.querySelectorAll(
    //             "div, section, article"
    //         );


    //     allElements.forEach((element) => {

    //         const text =
    //             element.textContent
    //                 .trim()
    //                 .replace(/\s+/g, " ");


    //         /*
    //          * We specifically need the popup
    //          * containing Buying Setup.
    //          */

    //         if (
    //             !text.includes("Getting Started") ||
    //             !text.includes("Setup")
    //         ) {
    //             return;
    //         }


    //         /*
    //          * Avoid selecting the entire page.
    //          */

    //         if (
    //             element.children.length > 30
    //         ) {
    //             return;
    //         }


    //         /*
    //          * Determine module name.
    //          *
    //          * Example:
    //          * Buying Setup
    //          */

    //         let moduleName = null;


    //         Object.keys(customIcons)
    //             .forEach((name) => {

    //                 if (
    //                     text.includes(
    //                         name + " Setup"
    //                     )
    //                 ) {

    //                     moduleName = name;

    //                 }

    //             });


    //         if (!moduleName) {
    //             return;
    //         }


    //         const imageUrl =
    //             getIcon(moduleName);

    //         if (!imageUrl) {
    //             return;
    //         }


    //         /*
    //          * Find SVG inside popup.
    //          */

    //         const svg =
    //             element.querySelector(
    //                 "svg"
    //             );


    //         if (svg) {

    //             /*
    //              * Check whether this SVG is
    //              * actually the large popup icon.
    //              */

    //             const rect =
    //                 svg.getBoundingClientRect();


    //             if (
    //                 rect.width >= 30 &&
    //                 rect.height >= 30
    //             ) {

    //                 /*
    //                  * Don't replace twice
    //                  */

    //                 if (
    //                     svg.dataset.customIconApplied ===
    //                     "1"
    //                 ) {
    //                     return;
    //                 }


    //                 /*
    //                  * Create image
    //                  */

    //                 const image =
    //                     document.createElement("img");

    //                 image.src =
    //                     imageUrl;

    //                 image.alt =
    //                     moduleName;


    //                 /*
    //                  * Replace only the SVG.
    //                  */

    //                 svg.replaceWith(
    //                     image
    //                 );

    //             }

    //         }

    //     });

    // }
function replaceGettingStartedIcon() {

    /*
     * Find all possible dialogs/popups
     */

    const containers = document.querySelectorAll(
        '[role="dialog"], .modal, .drawer'
    );

    containers.forEach((container) => {

        const text = container.textContent
            .replace(/\s+/g, " ")
            .trim();

        /*
         * Must be a Getting Started popup
         */

        if (!text.includes("Getting Started")) {
            return;
        }


        /*
         * Find which module this popup belongs to.
         *
         * Examples:
         *
         * Buying Setup
         * Accounting Setup
         * Assets Setup
         * Selling Setup
         */

        let moduleName = null;

        Object.keys(customIcons).forEach((name) => {

            const setupText = `${name} Setup`;

            if (text.includes(setupText)) {
                moduleName = name;
            }

        });


        /*
         * If module was not found, stop.
         */

        if (!moduleName) {
            return;
        }


        /*
         * Get corresponding image
         */

        const imageUrl =
            customIcons[moduleName];

        if (!imageUrl) {
            return;
        }


        /*
         * If our custom icon is already present,
         * update it if necessary.
         */

        const existingImage =
            container.querySelector(
                ".custom-getting-started-icon"
            );

        if (existingImage) {

            if (
                existingImage.getAttribute("src") !==
                imageUrl
            ) {

                existingImage.setAttribute(
                    "src",
                    imageUrl
                );

            }

            return;
        }


        /*
         * Find SVG icons in the popup.
         */

        const svgs =
            container.querySelectorAll("svg");


        let targetIcon = null;


        svgs.forEach((svg) => {

            if (targetIcon) {
                return;
            }


            const rect =
                svg.getBoundingClientRect();


            /*
             * Getting Started module icon
             * is normally much larger than
             * close / expand / check icons.
             */

            if (
                rect.width >= 40 &&
                rect.height >= 40 &&
                rect.width <= 120 &&
                rect.height <= 120
            ) {

                targetIcon = svg;

            }

        });


        /*
         * If SVG wasn't found, look for
         * existing image.
         */

        if (!targetIcon) {

            const images =
                container.querySelectorAll("img");


            images.forEach((img) => {

                if (targetIcon) {
                    return;
                }


                const rect =
                    img.getBoundingClientRect();


                if (
                    rect.width >= 40 &&
                    rect.height >= 40 &&
                    rect.width <= 120 &&
                    rect.height <= 120
                ) {

                    /*
                     * Don't replace our own image.
                     */

                    if (
                        !img.classList.contains(
                            "custom-getting-started-icon"
                        )
                    ) {

                        targetIcon = img;

                    }

                }

            });

        }


        if (!targetIcon) {
            return;
        }


        /*
         * Create custom image
         */

        const image =
            document.createElement("img");

        image.className =
            "custom-getting-started-icon";

        image.src =
            imageUrl;

        image.alt =
            moduleName;


        /*
         * Replace the original Frappe icon
         */

        targetIcon.replaceWith(image);

    });
}

    /*
     * ============================================================
     * RUN EVERYTHING
     * ============================================================
     */

    function replaceAllIcons() {

        replaceDesktopIcons();

        replaceSidebarHeaderIcon();

        replaceGettingStartedIcon();

    }


    /*
     * ============================================================
     * START
     * ============================================================
     */

    function start() {

        replaceAllIcons();


        /*
         * Frappe is a SPA and dynamically
         * creates the sidebar and popup.
         */

        const observer =
            new MutationObserver(() => {

                replaceAllIcons();

            });


        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );


        /*
         * Extra runs after page rendering.
         */

        setTimeout(
            replaceAllIcons,
            500
        );

        setTimeout(
            replaceAllIcons,
            1000
        );

        setTimeout(
            replaceAllIcons,
            2000
        );

        setTimeout(
            replaceAllIcons,
            4000
        );

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    } else {

        start();

    }

})();