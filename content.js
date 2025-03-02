chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "findLinks") {
        const pdfLinks = findPdfLinks(); // Récupérez les PDF
        const imgLinks = findImageLinks(); // Récupérez les images
        const emailLinks = findEmailLinks(); // Récupérez les adresses emails

        // Envoyer les résultats au popup
        sendResponse({ pdfFiles: pdfLinks, imgFiles: imgLinks, emails: emailLinks });
    }
});


function findPdfLinks() {
    const links = document.querySelectorAll('a');
    const pdfFiles = [];

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.toLowerCase().endsWith('.pdf')) {
            const fileName = href.split('/').pop();
            // Vérifier si le fichier n'est pas déjà présent dans le tableau
            const exists = pdfFiles.some(file => file.link === href);
            if (!exists) {
                pdfFiles.push({ name: fileName, link: href });
            }
        }
    });

    return pdfFiles; 
}

function findImageLinks() {
    const images = document.querySelectorAll('img');
    const imageFiles = [];
    const baseUrl = window.location.origin;

    images.forEach(img => {
        let src = img.getAttribute('src');
        if (src && !src.startsWith('http')) {
            // Construire l'URL complète si l'attribut src est relatif
            src = baseUrl + '/' + src.replace(/^\//, '');
        }

        // Extraire le nom de fichier à partir de l'URL
        const fileName = src.split('/').pop();
        
        // Vérifier si le fichier n'est pas déjà présent dans le tableau
        const exists = imageFiles.some(file => file.link === src);
        if (!exists) {
            imageFiles.push({ name: fileName, link: src });
        }
    });

    return imageFiles; 
}


function findEmailLinks() {
    const emailsSet = new Set(); 
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Rechercher dans <a>
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.toLowerCase().startsWith('mailto:')) {
            const email = href.substring(7).trim();
            if (emailPattern.test(email)) {
                emailsSet.add(email);
            }
        }
    });

    // Rechercher dans <input> et <textarea>
    const inputs = document.querySelectorAll('input[type="email"], input[type="text"], textarea');
    inputs.forEach(input => {
        const value = input.value.trim();
        if (emailPattern.test(value)) {
            emailsSet.add(value);
        }
    });

    // Rechercher dans <script>
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        const scriptContent = script.textContent || script.innerHTML;
        const matches = scriptContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (matches) {
            matches.forEach(email => {
                emailsSet.add(email.trim());
            });
        }
    });

    // Rechercher dans balises textuelles
    const textElements = document.querySelectorAll('p, div, span');
    textElements.forEach(element => {
        const textContent = element.textContent;
        const matches = textContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (matches) {
            matches.forEach(email => {
                emailsSet.add(email.trim());
            });
        }
    });

    // Rechercher dans <img> avec alt ou title
    const images = document.querySelectorAll('img[alt], img[title]');
    images.forEach(img => {
        const alt = img.getAttribute('alt');
        const title = img.getAttribute('title');
        if (emailPattern.test(alt)) {
            emailsSet.add(alt.trim());
        }
        if (emailPattern.test(title)) {
            emailsSet.add(title.trim());
        }
    });

    // Conversion du Set en tableau d'objets
    const emails = Array.from(emailsSet).map(email => {
        return { name: `${email}`, link: email };
    });

    return emails; 
}

