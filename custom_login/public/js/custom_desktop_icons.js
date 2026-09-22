(() => {


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


    function getIcon(name) {
        return customIcons[name] || null;
    }


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


                image =
                    document.createElement("img");

                image.className =
                    "custom-desktop-icon";

                image.alt = name;

                image.src = imageUrl;

                iconContainer.appendChild(image);

            });

    }


   

    function replaceSidebarHeaderIcon() {


        const headerLogo =
            document.querySelector(".header-logo");

        if (headerLogo) {

            if (
                headerLogo.dataset.customIconApplied === "1"
            ) {
                return;
            }


            const titleElement =
                document.querySelector(
                    ".sidebar-item-label.header-title"
                );

            let moduleName = "";

            if (titleElement) {
                moduleName =
                    titleElement.textContent.trim();
            }

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


            if (
                headerLogo.tagName === "IMG"
            ) {

                headerLogo.src =
                    imageUrl;

            }

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



        const headerContainer =
            document.querySelector(
                ".sidebar-header .icon-container"
            );

        if (!headerContainer) {
            return;
        }


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



        headerContainer.innerHTML = "";

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

   
    const containers = document.querySelectorAll(
        '[role="dialog"], .modal, .drawer'
    );

    containers.forEach((container) => {

        const text = container.textContent
            .replace(/\s+/g, " ")
            .trim();

       
        if (!text.includes("Getting Started")) {
            return;
        }


        let moduleName = null;

        Object.keys(customIcons).forEach((name) => {

            const setupText = `${name} Setup`;

            if (text.includes(setupText)) {
                moduleName = name;
            }

        });



        if (!moduleName) {
            return;
        }



        const imageUrl =
            customIcons[moduleName];

        if (!imageUrl) {
            return;
        }


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


        const svgs =
            container.querySelectorAll("svg");


        let targetIcon = null;


        svgs.forEach((svg) => {

            if (targetIcon) {
                return;
            }


            const rect =
                svg.getBoundingClientRect();

            if (
                rect.width >= 40 &&
                rect.height >= 40 &&
                rect.width <= 120 &&
                rect.height <= 120
            ) {

                targetIcon = svg;

            }

        });


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



        const image =
            document.createElement("img");

        image.className =
            "custom-getting-started-icon";

        image.src =
            imageUrl;

        image.alt =
            moduleName;


        targetIcon.replaceWith(image);

    });
}

   
    function replaceAllIcons() {

        replaceDesktopIcons();

        replaceSidebarHeaderIcon();

        replaceGettingStartedIcon();

    }


    function start() {

        replaceAllIcons();


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