document.getElementById("runTool").addEventListener("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "findLinks" }, function(response) {
            const pdfChecked = document.getElementById("pdfCheckbox").checked;
            const imgChecked = document.getElementById("imgCheckbox").checked;
            const emailChecked = document.getElementById("emailCheckbox").checked;

            updateOutput(response.pdfFiles, response.imgFiles, response.emails, pdfChecked, imgChecked, emailChecked);
        });
    });
});

function updateOutput(pdfFiles, imgFiles, emails, pdfChecked, imgChecked, emailChecked) {
    // Élément de sortie
    const output = document.getElementById("output");

    // Réinitialiser l'affichage
    output.style.display = "none";
    output.innerHTML = "";
    
    let results = [];

    // Gestion des fichiers PDF
    if (pdfChecked && pdfFiles.length > 0) {
        results.push(...pdfFiles.map(pdf => `<a href="${pdf.link}" target="_blank" class="pdf-link" data-href="${pdf.link}">${pdf.name}</a>`));
    }

    // Gestion des fichiers Image
    if (imgChecked && imgFiles.length > 0) {
        results.push(...imgFiles.map(img => `<a href="${img.link}" target="_blank" class="img-link" data-href="${img.link}">${img.name}</a>`));
    }

    // Gestion des emails
    if (emailChecked && emails.length > 0) {
        results.push(...emails.map(email => `<a href="mailto:${email.link}" target="_blank" class="email-link" data-href="${email.link}">${email.name}</a>`));
    }

    // Affichage des résultats
    if (results.length > 0) {
        output.innerHTML = results.join("<br>");
        output.style.display = "block";
        document.getElementById("clear").style.display = "block";
        document.getElementById("download").style.display = "block";
    } else {
        output.innerHTML = `No files found`;
        output.style.display = "block";
        document.getElementById("clear").style.display = "none";
        document.getElementById("download").style.display = "none";
    }
    
    // Ajoutez des événements de survol pour les aperçus
    addHoverEffects();
}

function addHoverEffects() {
    const pdfLinks = document.querySelectorAll('.pdf-link');
    const imgLinks = document.querySelectorAll('.img-link');


    [pdfLinks, imgLinks].forEach(links => {
        links.forEach(link => {
            link.addEventListener('mouseover', function() {
                showPreview(this.dataset.href);
            });
            link.addEventListener('mouseout', hidePreview);
        });
    });
}

function showPreview(link) {
    const previewBox = document.createElement('div');
    previewBox.setAttribute('id', 'preview-box');
    previewBox.style.position = 'absolute';
    previewBox.style.zIndex = '800';
    previewBox.style.backgroundColor = '#fff';
    previewBox.style.border = '1px solid #00FF41';
    previewBox.style.padding = '5px';
    previewBox.style.marginLeft = '40px';
    previewBox.style.borderRadius = '5px';
    document.body.appendChild(previewBox);

    const type = link.startsWith('mailto') ? 'email' : (link.endsWith('.pdf') ? 'pdf' : 'img');
    
    if (type === 'pdf') {
        previewBox.innerHTML = `<iframe src="${link}" width="300" height="250" style="border:none;"></iframe>`;
    } else if (type === 'email') {
        const emailBody = `Subject: PDF File from Website\n\nHi,\n\nPlease find attached the requested file.\n\nBest regards,\nYour Name`;
        previewBox.innerHTML = `<a href="${link}" download target="_blank" style="color:#00FF41;">Download</a><br>${emailBody}`;
    } else {
        const img = document.createElement('img');
        img.src = link;
        img.alt = "Image Preview";
        img.style.width = '200px';
        img.style.height = 'auto';
        previewBox.appendChild(img);
    }

    // Positionner le previewBox au-dessus du lien
    const rect = event.target.getBoundingClientRect();
    previewBox.style.left = `${rect.left + window.scrollX}px`;
    previewBox.style.top = `${rect.top + window.scrollY - 260}px`; // Ajustez selon votre besoin
}

function hidePreview() {
    const previewBox = document.getElementById('preview-box');
    if (previewBox) {
        document.body.removeChild(previewBox);
    }
}

// Gestion des événements pour le bouton Trash
document.getElementById("clear").addEventListener("click", function() {
    document.getElementById("output").innerHTML = "";
    document.getElementById("output").style.display = "none";
    document.getElementById("clear").style.display = "none";
    document.getElementById("download").style.display = "none";
});

// Gestion des événements pour le bouton Download
document.getElementById("download").addEventListener("click", function() {
    // Logique pour le téléchargement (vous devrez décider de la manière dont cela doit être implémenté)
    alert("La fonctionnalité de téléchargement n'est pas implémentée"); // Placeholder
});
