// Ścieżka do Twojego pliku CSV na serwerze
const CSV_URL = 'https://clpgenerator.brzezinski.studio/clp-generator/nowa-wersja/zapachy-ufiready.csv';

const fragranceSelect = document.getElementById("fragranceSelect");
const concentrationSelect = document.getElementById("concentrationSelect");
const labelProduct = document.getElementById("label-product");
const labelWarning = document.getElementById("label-warning");
const labelWarning2 = document.getElementById('label-warning-2');
const fixedWarning = document.getElementById("fixedWarning");
const labelCompany = document.getElementById("label-company");
const labelBatch = document.getElementById("label-batch");
const labelWeight = document.getElementById("label-weight");






let fragranceData = {};

fetch(CSV_URL)
    .then(res => res.text())
    .then(csvText => {
        const parsed = Papa.parse(csvText, {
            header: false,
            delimiter: ";",
            skipEmptyLines: true
        });

        parsed.data.slice(1).forEach(row => {
            const zapach = row[0]?.trim();
            const stezenie = row[1]?.trim();
            const tekst = row[2]?.trim();
            const tekst2 = row[3]?.trim();
            const wykrzyknik = row[4]?.trim().toLowerCase();
            const srodowisko = row[5]?.trim().toLowerCase();
            const ufi = row[6]?.trim();

            if (!zapach || !stezenie) return;

            if (!fragranceData[zapach]) fragranceData[zapach] = {};
            fragranceData[zapach][stezenie] = {
                tekst,
                tekst2,
                wykrzyknik,
                srodowisko,
                ufi
            };
        });

        updateFragranceOptions();
    });

function updateFragranceOptions() {
    fragranceSelect.innerHTML = '';
    Object.keys(fragranceData).forEach(fragrance => {
        const option = document.createElement('option');
        option.value = fragrance;
        option.textContent = fragrance;
        fragranceSelect.appendChild(option);
    });

    fragranceSelect.addEventListener('change', updateConcentrationOptions);
    updateConcentrationOptions();
}

function updateConcentrationOptions() {
    const zapach = fragranceSelect.value;
    const available = fragranceData[zapach];

    concentrationSelect.innerHTML = '';
    Object.keys(available).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        concentrationSelect.appendChild(option);
    });

    updatePreview();
}

function getWarningText() {
    const zapach = fragranceSelect.value;
    const stezenie = concentrationSelect.value;

    const options = fragranceData[zapach];
    return (options && options[stezenie] && options[stezenie].tekst) || ' ';
}

function getWarningText2() {
    const zapach = fragranceSelect.value;
    const stezenie = concentrationSelect.value;

    const options = fragranceData[zapach];
    return (options && options[stezenie] && options[stezenie].tekst2) || ' ';
}


function splitHyphenatedWord(word) {
    if (!word.includes('-')) return word;
    const parts = word.split(/(?<=-)/g); 
    return parts.map(part => `<span>${part}</span>`).join('');
}

function formatWarningTextToGrowingLines(text, baseLimits = [75, 75, 80, 90, 85, 85, 75], widths = ['60', '65', '70', '75', '80', '85', '90']) {
    const words = text.split(/(\s+|(?<=\w)-(?=\w))/g); 
    let lines = [];
    let line = '';
    let lineLength = 0;
    let currentLimitIndex = 0;

    words.forEach((word, index) => {
        const isWhitespace = /^\s+$/.test(word);
        const visualLength = word.replace(/[:,().]/g, '').length;
        const currentLimit = baseLimits[Math.min(currentLimitIndex, baseLimits.length - 1)];

        if (lineLength + visualLength <= currentLimit) {
            line += word;
            lineLength += visualLength;
        } else {
            const width = widths[Math.min(currentLimitIndex, widths.length - 1)];
            lines.push(`<div class="warning-line w${width}">${line.trim()}</div>`);
            line = isWhitespace ? '' : word;
            lineLength = visualLength;
            currentLimitIndex++;
        }
    });

    if (line.trim()) {
        const width = widths[Math.min(currentLimitIndex, widths.length - 1)];
        lines.push(`<div class="warning-line w${width}">${line.trim()}</div>`);
    }

    return lines.join('');
}



function updatePreview() {
    const productName = document.getElementById('productName').value;
    const productNameLine2 = document.getElementById('productNameLine2').value;
    const companyName = document.getElementById('companyName').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const companyEmail = document.getElementById('companyEmail').value;
    const companyBlock = document.getElementById('company-name-block');
    const contactBlock = document.getElementById('company-contact-block');
    const batchNumber = document.getElementById('batchNumber').value;
    const massValue = document.getElementById('massValue').value;
    const massUnit = document.getElementById('massUnit').value;
    const weightText = massValue ? `${massValue}${massUnit}` : '';
    const ufiSelect = document.getElementById('ufiGreenSelect');
    const ufiLogo = document.getElementById('ufiGreenLogo');
    const zapach = fragranceSelect.value;
    const stezenie = concentrationSelect.value;
    const options = fragranceData[zapach][stezenie];

    ufiLogo.style.display = ufiSelect.value === 'yes' ? 'block' : 'none';

    document.getElementById('product-line-1').textContent = productName || 'Nazwa Produktu';
    document.getElementById('product-line-2').textContent = productNameLine2 || '';

    // Treść ostrzeżenia pożarowego. Edytować treść tylko między znakami `
    const staticWarningText = `Nie zostawiaj świecy bez dozoru. Trzymaj świece z dala od dzieci i zwierząt. Zachowaj odstęp pomiędzy świecami minimum 10cm. 
  Nie stawiaj zapalonej świecy na łatwopalnych przedmiotach oraz ich pobliżu. Nie stawiaj świecy w przeciągu. 
  Nie umieszczaj świecy na, oraz w pobliżu źródeł ciepła. Przed zapaleniem świecy skróć knot do długości około 0,5cm. 
  Oczyszczaj warstwę stopionego wosku z resztek zapałek oraz zanieczyszczeń. 
  Nie przesuwaj ani nie przenoś zapalonej świecy. Nie używaj płynów do gaszenia płomienia świecy.`;

    const fixedBaseLimits = [65, 75, 82, 90, 85, 95, 95];
    const fixedWidths = ['60', '65', '70', '75', '80', '85', '90'];
    fixedWarning.innerHTML = formatWarningTextToGrowingLines(staticWarningText, fixedBaseLimits, fixedWidths);

    // Treść klasyfikacji. Nie edytować w tym miejscu tylko w pliku csv!
    const warning = getWarningText();
    const labelBaseLimits = [90, 90, 90, 90, 90, 90, 90];
    const labelWidths = ['90', '85', '80', '75', '70', '65', '60'];
    labelWarning.innerHTML = formatWarningTextToGrowingLines(warning || 'Tutaj pojawi się tekst ostrzeżenia...', labelBaseLimits, labelWidths);

    // Treść klasyfikacji 2. Nie edytować w tym miejscu tylko w pliku csv!
    const warning2 = getWarningText2();
    const labelBaseLimits2 = [105, 100, 95, 95, 90, 90, 85];
    const labelWidths2 = ['90', '85', '80', '75', '70', '65', '60'];
    labelWarning2.innerHTML = formatWarningTextToGrowingLines(warning2 || 'Tutaj pojawi się dodatkowy tekst ostrzeżenia...', labelBaseLimits2, labelWidths2);

    // Piktogramy
    const pictogramWykrzyknik = document.getElementById('piktogramWykrzyknik');
    const pictogramSrodowisko = document.getElementById('piktogramSrodowisko');

    // Piktogram "wykrzyknik"
    if (options.wykrzyknik === 'tak') {
        pictogramWykrzyknik.style.display = 'inline-block';
    } else {
        pictogramWykrzyknik.style.display = 'none';
    }

    // Piktogram "środowisko"
    if (options.srodowisko === 'tak') {
        pictogramSrodowisko.style.display = 'inline-block';
    } else {
        pictogramSrodowisko.style.display = 'none';
    }


    // Numer UFI
    let labelUFI = document.getElementById("label-ufi");
    if (!labelUFI) {
        labelUFI = document.createElement('div');
        labelUFI.id = "label-ufi";
        document.getElementById("label").appendChild(labelUFI);
    }
    labelUFI.textContent = options.ufi ? `UFI: ${options.ufi}` : '';


    companyBlock.innerHTML = `
  ${companyName || ''}<br>
  ${companyAddress || ''}
`;

    contactBlock.innerHTML = `
  ${companyPhone ? 'Tel: ' + companyPhone + '<br>' : ''}
  ${companyEmail || ''}
`;

    labelBatch.textContent = batchNumber ? `Numer partii: ${batchNumber}` : '';
    labelWeight.textContent = weightText;
}


document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', updatePreview);
});

// Przesuwanie ostrzeżenia pożarowego
const moveUpBtn = document.getElementById('moveUp');
const moveDownBtn = document.getElementById('moveDown');
let fixedWarningOffset = 0;

moveUpBtn.addEventListener('click', () => {
    fixedWarningOffset -= 2;
    updateFixedWarningPosition();
});

moveDownBtn.addEventListener('click', () => {
    fixedWarningOffset += 2;
    updateFixedWarningPosition();
});

function updateFixedWarningPosition() {
    fixedWarning.style.top = `${fixedWarningOffset}px`;
}

// Przesuwanie piktogramów
const moveIconsUp = document.getElementById('moveIconsUp');
const moveIconsDown = document.getElementById('moveIconsDown');
const pictogram = document.querySelector('.piktogramy');
let pictogramOffset = 0;

moveIconsUp.addEventListener('click', () => {
    pictogramOffset -= 2;
    updatePictogramPosition();
});

moveIconsDown.addEventListener('click', () => {
    pictogramOffset += 2;
    updatePictogramPosition();
});

function updatePictogramPosition() {
    pictogram.style.top = `${pictogramOffset}px`;
}

// Przesuwanie tekstu klasyfikacji
const moveLabelWarningUp = document.getElementById('moveLabelWarningUp');
const moveLabelWarningDown = document.getElementById('moveLabelWarningDown');
const labelWarningElement = document.getElementById('label-warning');
let labelWarningOffset = 0;

moveLabelWarningUp.addEventListener('click', () => {
    labelWarningOffset -= 2;
    updateLabelWarningPosition();
});

moveLabelWarningDown.addEventListener('click', () => {
    labelWarningOffset += 2;
    updateLabelWarningPosition();
});

function updateLabelWarningPosition() {
    labelWarningElement.style.position = 'relative';
    labelWarningElement.style.top = `${labelWarningOffset}px`;
}

// Przesuwanie tekstu klasyfikacji 2
const moveLabelWarning2Up = document.getElementById('moveLabelWarning2Up');
const moveLabelWarning2Down = document.getElementById('moveLabelWarning2Down');
const labelWarning2Element = document.getElementById('label-warning-2');
let labelWarning2Offset = 0;

moveLabelWarning2Up.addEventListener('click', () => {
    labelWarning2Offset -= 2;
    updateLabelWarning2Position();
});

moveLabelWarning2Down.addEventListener('click', () => {
    labelWarning2Offset += 2;
    updateLabelWarning2Position();
});

function updateLabelWarning2Position() {
    labelWarning2Element.style.position = 'relative';
    labelWarning2Element.style.top = `${labelWarning2Offset}px`;
}

// Przesuwanie nazwy produktu
const moveProductUp = document.getElementById('moveProductUp');
const moveProductDown = document.getElementById('moveProductDown');
const labelProductElement = document.getElementById('label-product');
let productOffset = 0;

moveProductUp.addEventListener('click', () => {
    productOffset -= 2;
    updateProductPosition();
});
moveProductDown.addEventListener('click', () => {
    productOffset += 2;
    updateProductPosition();
});

function updateProductPosition() {
    labelProduct.style.position = 'relative';
    labelProduct.style.top = `${productOffset}px`;
}


// Przesuwanie numeru partii
const moveBatchUp = document.getElementById('moveBatchUp');
const moveBatchDown = document.getElementById('moveBatchDown');
const moveBatchLeft = document.getElementById('moveBatchLeft');
const moveBatchRight = document.getElementById('moveBatchRight');

let batchOffsetTop = 0;
let batchOffsetLeft = 0;

function updateBatchPosition() {
    labelBatch.style.position = 'relative';
    labelBatch.style.top = `${batchOffsetTop}px`;
    labelBatch.style.left = `${batchOffsetLeft}px`;
}

moveBatchUp.addEventListener('click', () => {
    batchOffsetTop -= 3;
    updateBatchPosition();
});
moveBatchDown.addEventListener('click', () => {
    batchOffsetTop += 3;
    updateBatchPosition();
});
moveBatchLeft.addEventListener('click', () => {
    batchOffsetLeft -= 3;
    updateBatchPosition();
});
moveBatchRight.addEventListener('click', () => {
    batchOffsetLeft += 3;
    updateBatchPosition();
});

// Przesuwanie danych firmy
const moveCompanyNameUp = document.getElementById('moveCompanyNameUp');
const moveCompanyNameDown = document.getElementById('moveCompanyNameDown');
const moveCompanyNameLeft = document.getElementById('moveCompanyNameLeft');
const moveCompanyNameRight = document.getElementById('moveCompanyNameRight');
const companyNameBlock = document.getElementById('company-name-block');

let companyNameOffsetTop = 0;
let companyNameOffsetLeft = 0;

function updateCompanyNamePosition() {
    companyNameBlock.style.position = 'relative';
    companyNameBlock.style.top = `${companyNameOffsetTop}px`;
    companyNameBlock.style.left = `${companyNameOffsetLeft}px`;
}

moveCompanyNameUp.addEventListener('click', () => {
    companyNameOffsetTop -= 1;
    updateCompanyNamePosition();
});
moveCompanyNameDown.addEventListener('click', () => {
    companyNameOffsetTop += 1;
    updateCompanyNamePosition();
});
moveCompanyNameLeft.addEventListener('click', () => {
    companyNameOffsetLeft -= 1;
    updateCompanyNamePosition();
});
moveCompanyNameRight.addEventListener('click', () => {
    companyNameOffsetLeft += 1;
    updateCompanyNamePosition();
});

// Przesuwanie danych kontaktowych
const moveCompanyContactUp = document.getElementById('moveCompanyContactUp');
const moveCompanyContactDown = document.getElementById('moveCompanyContactDown');
const moveCompanyContactLeft = document.getElementById('moveCompanyContactLeft');
const moveCompanyContactRight = document.getElementById('moveCompanyContactRight');
const companyContactBlock = document.getElementById('company-contact-block');

let companyContactOffsetTop = 0;
let companyContactOffsetLeft = 0;

function updateCompanyContactPosition() {
    companyContactBlock.style.position = 'relative';
    companyContactBlock.style.top = `${companyContactOffsetTop}px`;
    companyContactBlock.style.left = `${companyContactOffsetLeft}px`;
}

moveCompanyContactUp.addEventListener('click', () => {
    companyContactOffsetTop -= 1;
    updateCompanyContactPosition();
});
moveCompanyContactDown.addEventListener('click', () => {
    companyContactOffsetTop += 1;
    updateCompanyContactPosition();
});
moveCompanyContactLeft.addEventListener('click', () => {
    companyContactOffsetLeft -= 1;
    updateCompanyContactPosition();
});
moveCompanyContactRight.addEventListener('click', () => {
    companyContactOffsetLeft += 1;
    updateCompanyContactPosition();
});

// Przesuwanie wagi świecy
const moveWeightUp = document.getElementById('moveWeightUp');
const moveWeightDown = document.getElementById('moveWeightDown');
const moveWeightLeft = document.getElementById('moveWeightLeft');
const moveWeightRight = document.getElementById('moveWeightRight');

let weightOffsetTop = 0;
let weightOffsetLeft = 0;

function updateWeightPosition() {
    labelWeight.style.position = 'relative';
    labelWeight.style.top = `${weightOffsetTop}px`;
    labelWeight.style.left = `${weightOffsetLeft}px`;
}

moveWeightUp.addEventListener('click', () => {
    weightOffsetTop -= 6;
    updateWeightPosition();
});
moveWeightDown.addEventListener('click', () => {
    weightOffsetTop += 6;
    updateWeightPosition();
});
moveWeightLeft.addEventListener('click', () => {
    weightOffsetLeft -= 6;
    updateWeightPosition();
});
moveWeightRight.addEventListener('click', () => {
    weightOffsetLeft += 6;
    updateWeightPosition();
});

// Justowanie company-name-block
document.getElementById('justifyCompanyLeft').addEventListener('click', () => {
    companyNameBlock.style.textAlign = 'left';
});
document.getElementById('justifyCompanyCenter').addEventListener('click', () => {
    companyNameBlock.style.textAlign = 'center';
});
document.getElementById('justifyCompanyRight').addEventListener('click', () => {
    companyNameBlock.style.textAlign = 'right';
});

// Justowanie company-contact-block
document.getElementById('justifyContactLeft').addEventListener('click', () => {
    companyContactBlock.style.textAlign = 'left';
});
document.getElementById('justifyContactCenter').addEventListener('click', () => {
    companyContactBlock.style.textAlign = 'center';
});
document.getElementById('justifyContactRight').addEventListener('click', () => {
    companyContactBlock.style.textAlign = 'right';
});


window.addEventListener('DOMContentLoaded', () => {
    const downloadPDF = document.getElementById('downloadPDF');
    const downloadSVG = document.getElementById('downloadSVG');
    const label = document.getElementById('label');

    // EKSPORT PDF
    downloadPDF.addEventListener('click', () => {

        const downloadButton = document.getElementById("downloadPDF");

        downloadButton.textContent = "Ładowanie pliku...";
        downloadButton.disabled = true;
        downloadButton.style.backgroundColor = "#ccc";
        downloadButton.style.cursor = "wait";

        const label = document.getElementById('label');

        const cloned = label.cloneNode(true);

        const styles = `
  body {
    font-family: 'Roboto Condensed', sans-serif;
    background-color: #fff;
    color: #333;
    margin: 0;
    padding: 30px;
  }

  @font-face {
  font-family: 'Roboto Condensed';
  font-style: normal;
  font-weight: 400;
  src: url(data:font/woff2;base64,d09GMgABAAAAAN/oABIAAAACrEgAAN99AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0ZGVE0cGiobg+kqHIUWBmAAiTYIOgmEZREICoXVEIWQGguQLAABNgIkA6BUBCAFhAEHyh0MghtbY4CSC7XJ/lQHOrZWQakbAwic+tm+9wp8hDHGQM3Pa1uHUyXPm9gN4QX0tl1E3Dagwm4/nN4U/f///////y9OJqHO070t6d/vFSfbkEkYs0ALpK1Qae5wohFqSasostdNSsLa1EYZYV2FiCRSjEocsZ8M03omNDRDZatzNIaoSIuly5VcN5t+DBzYFXKdpPNrujW6c2PWOzPsaWzIAQcfRukuDkfhjpNwc8UNzhuPg1U9jtuqyeixjrCAvMHttsUaSVSKhroGTLiyOzdm4nAvHoIHmYo+B8Vgky616C2UP0bxpOI82S8XYtoloWLqdKa0p84nYc/spVV0sl6yjRWd0TDHnNd4fbMGeTevYKJt2RSGNdHgjMhUHOVM3FZYdQqrf4n1q+jYu/LElY4hhw8Wa9mJsaU5FeW1MYPOiR0Cajkozk/CWlEXNjTGGmS2+gw4/H7+8yXGA+1LaOM5qXiIzVOTcirwSqkq39P9B1rxnL9j03WTapOxa6fyLX6xhQ1UjWrFpmPQkXxgnC1egn74hWpxPwHvpe2K+NbAEdfqO2EY1Au6DFA5zyxFU6G4V2FCoQpVcVK6hcJV1MexjnhsFbvLfGfCxd79Gyqim0zXqJZCWUJGdenyp0hplqpUyPbmTtwtsSqznwKtTA0msq6rar0SR/7ClaqW4zwp1Iq7oaerkcwRS9z/pf+oafmMq9L/ZXkLiHIYZYN/iGmJEq1tccRV/ZRP/FpUU6vumV0RxDLgOsxyAEjiEGuDJgURXwfMYTzvAM5tD86J/qlTIiUt9ImUCokS+pRE1imJbFEpOf1TaaACYiAGKaIOwNwcDAYYCS0WYKGogMSIdbNoWBRjydjGYCPSgcSIQVuUgVG3Loqx2dxHpr6g/zj4/e6e8SApgsQTbjytAOlz85t3eYj2I/TNzuz+hC9JgQhsfR0rUmUFrMoKSSHf7UAUa/sH9oakViFViGISqmi2KBYLlShWAgmo2sTnd49Exvh0qlyNVB1gSJdVVSpkEXRLTYa1Z7yE9wxBFt99lnN07/+XW/9/TiVBzk6R5mNfbSg2mPg8lUqopnO9hW9CqAl0z+QNVSXAXev+8ZsWlGyIsA0luss2B6HNChCtSUrEtk3qsKaSE7cH4cwsp9bJ393acMtisRqyJRVjGtw2vgHzz2/za5GIjLE1tPaPVuZ+ub9ka5eJy0A3WQbfg2vMrT+iO9szFpiE9rOfAY9671He8REZg4LN/ekgIpVrY3P5fF/gManNLbkrDOiSukf2P+FqP7Uj9WTBEqypNRtP6GZlC3ZZK5oE6jveFyQvpKI24dOLZYF/R6wimukvt8O/Z6t5ODhoHf7/X+fn04dYNksGlu2PIA8pXLRTVN3Z912HqrQpmpTpkTwrk2qO3paJYeT23FvxlOJ0U5aBYUr6sLClFbe05vbfowhFiCCEEDqdz2dK22LmMic66VuTvLbjUBZAg2B47ah04TT2BaagPIIHCW3sUamEWKzlblsiAEbSadSKKEcRySZdsIUixDljsdJNuJUbSIgHt9PcGp0LIWdY9FqOhsYyDsl+ADcWHfuVvcFHCaVgnKTptE3GrL6MOQJhjDw2dLd/Ke1lzWD3R9qf+pkphOvkxDyna8Y/gRpgU7dMUuvVYSY0Kt9HY+bHP/CH7O9rb0s0oYQLNOGFBVxYlGB/gX4a6534D4EWCAAY6Pcufy+ExgkUToAwIByh1F3qhED/P29fubOvJDeZkx3dNFPYtmDk9su5ckosUxK3I/v4yqPKFbLc8d38zjndWAn1MMyEja2SvV+N5H0x/nfOCMN00vrWjaqeUifUfOt2KlDqLMRKIFtii5/OGadPyD+wbXuT1brozESOYsBywaa0Kwlf9a3xU4ZxtFPHWcN4/zfXP07uYDJ4J7ibLNB7/Of/SSklUpqEqfBVqlVIaRXqVa6nqg0QIDCQ8MeelZ5W6vsmGTsUQRN1VVPUXKdorsMn8CPICzrw+SlrZzSOnPoJGRuV3E3BTXiOyTelm97F64l+zp4QDSb54GDSDgsPOaGvn7N8Yt/90PjUeGRXGVKuqGyUy7QABgijC8lO0F5DE1hvKWC5KbyZ9fgZh1svfQhPNqqXHWehSZq43wsyG+M8kvv8VcbvIlgsjuln1IS6dAN7sOKKQA+Q0zRtNy4Mf6YKTtyfC0hAo1AxbAzAGIMV2M3/c9rUt6m0mSP/kEjAhm3DckLiE59Ayi0/7un4oZQHxj2s9DMX3QpLKgn4Mv/7OAQoZqf/Z6pVWgUSS4DjSHEMR5NIO4/7pDX2TMq17ny+2QVR9++qrq5qNEw3QIMmRAigdkSC0oikLDgG3Q2SAAi9R0q6eSRnZo31hMbQnJFfa312xrjQ2DT1JghtlF8a3bsgutjyPLQ0pfPOdeEB5mERywKaArm0bvq3aXZX5I4y6YrTNr3iOAzJQa3AUgnG4f+he2iAqb+DQ3PxA37AlSAMaXfFEkwow3j++3t83c8G2svyAAPWUlWbk2knzz7mYuGmvbq9c+DdEqDKWXKuhkYaeDDwAEx+Ck+r0pbX6FBKSxhSbEDCP/H3LNCwG50En1tjE/aB0sW1BdAl+v5EvlnJ+5ZQROtYrWVi/1mpHI1jAeP/v6Va6b3/F4j/i/Kxyd4kuT1btAexQYqSZl3jSRLwVRU+UAtIVhVICpAtCpQXQrJHFr213Oc0CqAkgGr7SOpdsy7RTJB5ma23JZwgmSTbsmSSsJesowln/lc1XQHi/2dQFJ8PvMp0nosspw+bx8vmNVuWUQIBUxbxT77CKBdccSt9craMmUbXvqURxO+3KrKDL3hIXd9H9EzqlU6O5z9blnY5Pte6FB+smvs8tjC7nbmeVl1tko1i1qnEx7ioEDS3/MFdksVqrYb5woQF0QVjchvz5RsQEid9lypEQIj+scbO95tJYL2PUzdfpYxYQykhllDCLPolpDMQexK0nz02zBDBGBNizq9XJPe6c5jgPsyymMUYIQYhVCXp9Vm2F1HTESp81acQSfUsyxCOYMtIxi/KK+qQOqQIEmQ5RBZfo7nIsgJFXm/3e9XvV6lyyvXuvuZs4iLbUkcC0WZgAHHu1zv2ur7TbW47v17rpqhJTCEQCGUGBlDzLP5Nyz91j+9QsaIiKiqqaq1a8aFYW6jggFwxmZ7y8GNKCzf7uvUvnNmEBNMEOPOWYU6/nA6ABvDTY68ceeU7f6n7Zj9+YEG2wu0Gl1+bIUAiUVtPL2AxrhBAkEB77N+KXIJA7R+gZwrAIYzFsk3i+QE+AFwGTbBdswTy2NDzw01f/G+Kh+TrXYl1veaXMB17Ensbq4LAXW8DbXgPfk7xHMLexh/FvzYtwNvMGfMG8yXmajxlucvysqVi+YmgLC8TTYRELOIyDE9+EqtCB9IFSKXj8bZva67Gu+orJxFUUrK83FlqMTKeJPz2nNVYAVWvYARK1EQHQb2aRBM2mhaAFWZJ24CmSUPCAZqKO6Fqu1QHp0xiBSM1yViSbcQkc7KQArUuyUR7g0nbKrhLLOlJhESWyEvsY84QIbmmeraT2+GeOsUxJSfBo772mlhhNzrtl1fNehLvqb8Jd2FS/V9KAe+XGb2E9WxkCLgHsCcllbTA2WS/bDskblNDwHJXw8ONF/k9fp+lQizyZ7Ss6fe5uOWiWcKsFfwFL0mavOaypIJTmpCm/bLvgkkEZc4QEoNUW9GSTNR8yZME3nMXLj3ii8KHXO9wsMmEqtODCvgL2oH6m9RX6Nro94A4g7vMGw4ox+0VVIoGNuViwCKoO2yFGMXeNo77v7koNAlzhGXCGmGfcJvwuPCm8LVoFAnRJwpij7hM3IMkSAppIhsIwlRXi3OpmCr33KqXpK8JA3Pf96Qx7Sa6hx1q3ltxsLrX8c8rZtZ+WQ9ssYWVuDYx165yzVW1/51z12wA2WA5rs6iemXEA3tGrn3mxR7JCD9um0+n/hm/3izlU8drxV4/+blncetfg7ub/5g+SH+PUWENM9V2ShgATLqw6Hnrn4GyazhGYjTGYjwmYuEsnqWzfFbO6nFw8fAJ2GWPfQ44JJxo4klMqiqqKmpOXTScpmg5EAgYBBQMHAISChoZchQQTDqZZMNDOeAUTNGUTNloSo9h3oy3zv74Pn6KowHRMDD2clUTKG6ap2M66Rq03UzzCl3sEpdspCjRH8AfZ7JChKRkJUcBiAkzljoVp8+ZOHus2IBw4KQRpNDCyosPPwHu5C496aUv/QxkkKEMM5JRxjLORCaZyjQzmWUu8yxkkaUEwRdeZPncw+AR8GzwHHj9eAN4g3hf8L7iC/jHFwTfEPiGwTcCvlHwjYGPBB8ZNgpsVNhosE2EbTJsU2GbzjwG81jM4zAvHm0QtCHQhkSbw0f8vrc4PmlxQQ5tO0O7oOXTV0BXMRTnbuBIpXxSrEKZQnu06oAKoShCYzGqE5C1XUXnoSloK6SthKZS9qUyT8y4q0xDmaBIydnJpMUaYGLOXdU/lHOu+P3RMfeyDdze4EwI4rGYHnuLS6luHzKo9FQdda/od1Il20EwMhQFgQahCZEHNhzsrwjjIPIhJkNMg3gRohwsBLYeHAsaB9oCcKvArYG0DtImcBWIqhCpEJsGGR0yJmRsyE7Ggop6Q0oV5fkuQzimBbTcYCJTsdfeovK2VNPt8IGLPrRNmUdmEZrtmTkOmWu9Srl2xPkNai+ZOoc1OKNDoSdF7xl9JxorpRCni5BRjI740kqQ0VwpCRS0jKztRO0kapd7Ce3uPGOvJKdwp0KveudUxXG9uV2p/p3031JBE4N2FTQUtM8lczk34JzHCgHLQtcJRekoJC06FC5V+8Tad1X7UO0QsHBcRxOFU4jdDc1SWSZmEsTg0ldGnWZvcfgva4g8Nb1mMZnDYC6bysTxIYuO1gQ1erumdmlJCNq1msqP6SUat1TqP2CkhYOo0018KNzVcZ2YDiOqjThs+pdiZa8x1GCS0fKJiY+K1XsD5i02b6v0Toy3LKZr8QGzDxUp6x54zaIx++fn6DBX1f7UtJNeLFXNxDS7WtDqAhvY4rHjJ8XgunhaotddDCsc8fUEwO+OQjiLARKE4qsLWSrRhM8n2KE3dGz6RhMgKnnjnLqoxSDN0XVMp00EMwOAyRoWTztxxeMLQAhGUAwnSIqWyUvRxaNvRlCFwEC5hSSQqEJ3AHIKIBMzKxuIk5ePXwAuLCIqJo4oZHcmFjZuVfFHFCrNQ8Fn+YVcUIhvldWFcBTDmQCegkvQbW70OOIJpQhoI+NBuw+iKqYs+ubqIjg53Pwfz62oPaRco/z/Q8ZMyZwltUQxMU+xTd5y09tCvJvmeIDuyDSEzCyzpjWyrTJn+syd7aG0xI68flNqrznqJqXBOH/aqYfk33H+O7xtpHaFthO/PV7GN75i/PBIXRK2zJy2G9OVMV2bmWY6O+9jr6Z9KHzXORt6Z1SveXvzbdfAoE4AjgAYwAL4ABAACsAAOIAASAEkoAX0gBGgADNgBexAMiAFkApIA0wEFAAKAY8AigClMT4DagHrgEhADCAeUDhQJFA0UCzQcqAkIAlQOpAUCAJygzwgL8gH8vvBAoEFAxsKbDiwkcBGAxsLjAu0CHzs2fEMn1lnH0YYZYxxJljKJGtZz0am2MxWthOZKEQlGiWSgIR0hEQkdiSNCtJSHUhggIdwRCIasViOJEiQDikguPHgxYf/80AezIfy4XwkH83Hci6zMfcbWTs2zwcYYoQxJphiX76A9diIcI/wtGgZUTyAthGNGN4jFst7Jkqg1yyJgUEyk9w0N8sA5gwugGNcTBpyUIASiCBBFerQhDZ0oQ9DHPGjfrlf6bMVrsq1dhka0JBGNKYJTWmB1tNGSkstU4DapmjKYpYgsJyRC5ImOVIgJSISiVRJnTRJm3RJn6B66bvmXb27d//wEJsn/1r8rIcxAJh0THBC0T0R+mvg2MeBCw8+AuyYntgT++JAHIpQRSpWSaWnciAIDIHC4AgkCk1GTiEWJFAMaaibMlN24knZwFbQilpJK2uaSy9Dg6jOOtVgwku7FLL1j5e5shp1zY9dRZsCd/VX9DbuuoHJ5rrtHp9s9cM2Wzs+tZPY1Za4IQ2+46GIqEc1RnwsnsRNS0qSsuqJdc+9DDU3+r+2wQGCFbbNsGnKoVMikoTIqsppCmDKFQPe80FMU8zEcpdDciQnFCuxAcpFXKoOkjONCXIf1LC0knZ0xkt88Avk/gQXFhFNDHEEsj4lPfeyUN0YACmVSetY2OEQblqaq2VIlhy5tthW+dKExEXa4212G+7VEmIATFa/nzFAseOIGw++oIaMSCypqVKpkCAYQTGcIClaJi9FJ68qmaACRUqUNQ1VvzM0o43QqSGwY9+mDtUrRbrUEDvROW7B1s0sStORdFVClpAMqVAqdBdQObQmIYu8RwGQiTmWmZUNxBlkCkowxwsffwLAhUVExcQRhezGxMLGrWlsGbLkyLXFtsqnExKTVpXN1LR0KlQWQ48X7Aa0/WakX2NAwK4aakRiSVKVymGVpwRRoEiJsmg2hmo02BB7XzvgLxiX+ogq5rHNrcXGjqSralKIQ0LGAoEWbGZp2jJkyZFri22VL0xITFpVhoIfUag0DwX3eFgzACaLw+XxBSAEIyiGEyRFy+Sl6OLRg8DDngVV3BKSQKIK3QHIKYBMzKxsIE5ePn5bSgAuLCIqJo4oZDcmFnbh3hZneMIzo9+bSyF6d68hIdKSofbbVkN6N+nLwNCoWpTufSmKli5mIjs8LmuiMA4p9qlZlK48bJcsP1kdQ5pnZEpIiUXi1klUyJQTxUiRJIRXb1slX7REmVSH5Eyjg2xxFc97WSsbPe30HC8L1Y0BkPKmkgmn4zZ+ZLJAkCpMKSIhJaOCfr3R+LR2nqtXw7O3atYXCRnheak7cZUi21lhp92txRTXcoWuvT7xg7rS3aOUgd4E08t60HQf74CeAPB5QUxgH9HX2hiQDMyxqHiqawIjt3mcWopi0DaCASHrcAWkJpo94ejGRT8VgeJY0edHAwDAXbGPpooUFQkpGVVBe35Zv9DXYFQDvz+Phala4reALCjhaRJLc5kMd7oTa2l7JoDEwsGtfL60If3XYsj/dWF/Hcv9fS347Z453RZhzcxLVqsRUuRNfCe/n9PfhiihDddtbDd7ZL8cOnLidEp3BVDwTkhYxGW5PoUBAAt7OweAViAB7CDBa9kWBJ4+bOSEqq/2sGt5Kaj7y/vkUhUaZXGrLvVzaxw0V3omvdHcR6foFVPyboaz+DC1SxzACRc3z+jNOELmZPTN2HpWYMO3zVPrPEKHJG1TE+FJSbYUEBjShPqLioSUjKqg//GI8eEq+gX2rFm1R7PEvJ11RwiygyC35D7MYRV7Jj5XWsRnzLBmpmcVvu2ULjoWIE41UAInPLZn21I7WFTOXtUbLmjta44zruI5xpWLsyfq1JMFKsg/PmncdRKVOBbN2nTcjo8uYjce10y6ZxL/yMw97inin2pZa/uv48ekUyui9YTkIEymU9m0HEnXNTfiQ2lEdEaCTs/aC9YbMrNlVY2QI6f4zO9n+22M8tdvq9GvBSuIQtweGnlfq/HyKU8q51RXajd16lvjqJn0THqjP72DN7vMKe54Z6PGnjlLzUunsC0Ir0+gT5I+gVnYW/dvcuxtx4JZ1b3O70eXxQERJrQ+bATFcEKa6k2tN2ae0kpvpMzWsneRUVDRKk8Lr3ESP4m0uVEQ2wiTPGevcgBHHCeSlovV5JoCbwOdeZ+qzFAVrVJXqecoJe4yYHM9Xcu23VXDE8lQgxHWFI7DI+ElUrTYLJgtl5RVZ1sj1imbGFwgW2Ob7YTtYDrkwQlyYqop6fT0vJvEpIt0MH6y9mm+KHB6cxOIFPda6sEQySQlBSEYQZ1jOEFSdL3gp9/+lv/dr7ruJsgd9zyoyO8oOeVSre/ZuYU515hvx8bFvkozaUZY8DMEKMwx758r/NaCTuGsY5bfR+jKRNLYsodt726GGKtO6qYHr828B39d7zh+2kwWS7ENPtncJi/xk2hKcuNIPyryonzO3pcZvtTDpQsFpqARJjTfTdCX8Y2OoM5VtWk51AnYDk2Y3h4lNuF1KRinuF4l9pqpGtUIOuoah4u60n3589t2o8rxo6wP9RXoSgYmCqLiMlkOcuBWSz1X7rFOSzSPlYA5O9V2g54c5ezMhfpcmIqFLY6dM665uVVeXfbHVVa3pJJ6S9pyCkpEkqq6praufhmePhJWCxkgL8rb7tRFmZPzUpwzk6aEBScEI6VDyHnCbwmeCWsa85YRvVaESpmIU6SzjX0g90nJoDDWSZjOrMwHJDvK7h2umbwssMXV4yfRe8lpyneEo5AX5cu26yLmlhZzxkcLChwIf+BArGhEHWugkTwoijmZdeYDZEfZ3XFvsRyGxTBti13nBbighfvpsi4GYOHgwn20MZyFltt3Xbv27Dt05MRp6BtBIWERl+X6FIYBWNhrUDuMRHA2eYEaJk9B6qb0VjTQMcFjsQ8GMkRGnLEZUcjJdgNsNDU5LcMqdpd4WcjhzIez3iG6FTiFAxBseSVTxQKBwsr1bnxCYtKqMk9NS6dCZTH8RK4Y9LY84LbBnkWYXKuuKtVqHOMp17HvkT500ZnIpASX58xjQrjlNtvQySwglg6bNFJgxTtPHCLzisoEFRfB5Z4zT+GUA1N0OlHH8aTUWGYMDFbksnoRp+t54+qXePWYznDUPyIlwADSPuWuY5Y4hLR3WSxLlq2Mq58CAPDJ4Yr80dAKvA0qGEExnCApWiYvBWU3XfjRDd/yRmMu5IAw+II+4EZhMEIWmb+rQW8MXV4WfXEAADCvL9lIR2Es5panpkhVpsCYzDwoIwdeHjuNnf1wALD7OFgD5sVff4/+TMDttthd602/DBo2atykabPmLY7B7QEAAIBPA4sAHMDdgXPOOb/3PgaWO8GQIhuBrtX6VffSZKvCqlEzpL8cSzwq16mBFDfNFVXAFBD1RHBC0AKcACWGEMUGcgXBxeoBKi2EzNfiZIsR8AA0AIveKnfUXy1XU/zADT8WRwEsuGdyoAAI8Ou6WLd7oKlDN9BsGW5JuF8qvU5p+9ND4LS2mv0d+9Pcv89UoTMUO0mrVDo17FzrIAu6tsxN9qw8jxu/Q7PqSYps3Ps19wd7SOWAxzrW9bGH0vQ2H1+fsIiLtMftnTbv/LGfTzJ7qnpttXrCoMG4/KzUrb9xzc3anR0vGRHYE9yaB6Nc+Ll5ynjH+RJo+HmbVFY7rg3GlDtt/E1mrSxYIbzGDjZMqNshxuvVMDG7yZVR6GZlATw1FHR7j56yxKgebr1HfzpcPBobTNdNfDn382L14C2iZv7vsx+EUZxkeVFWddN2/TQv67YfPwZPYLLYfKGoAUExnKBohuV4QZRkRdV0w3Rczw/iJM3yom7abjqbL5aHcqVaqw9go2atTjrtfWd96GOfYn2O9yXR12TfUn3vd3/7z1M9+yjFtGzHBUAIRggKjS8US+VKtVZvNFusNocLiSJJZHKFUqXV6Q1Gk9litdkdTpfb6/MDAEFgKAyDwxMpNAaTxeHxhSK5Vqc3MDYxNTO3sLS2sbWz94lSmXIVKlVTUdPQqlWnXoMmzVq0atOhU5duPXr10dFDmRFsHAiDSSgXjtLGwj4wHEwOphaKiomFjYOLb4YEM/0FhiFQGByNwWJzeHyNVmd1uj1enx8IDIUjkCQynclic7g8vkgsVygdlFXUNLR0dPX0DQyNjE0ABnFEkJSpmbmFpZW1Dc2wnK2dvYOjkw+fvhAGi1DGhSOVfpCDgCEQCBRCDqGC0Gzapo8+xphjjT3OuPttceNvxhL2z/Cd+/YfOmzU/mf2vz2ZzuaL5w30/QAHEOIoRNvvWzTFQtua+M/qamb6DsmFSD7aFKOvFvdrtBcX/fGjv+RwaeEuBqwQOCGsCdYFFU1UNaFqsmnRjx79mNGPHf3GtmGIp7qq0rrNtNuuS2QIyFSXrO55d/96oLJ7OBrRqMY0roleOC1qScta0Wo75MqTr0C72tO+DnTY4RQpVtKpqtJV6ZrrunTDdVO65RoitLCIqJi4hKSUtLKVoziBlq5MZYvXyglUgYpUorLWtPXasH4z/db1/uj79ZOONqQb1rC2V65uIlTubp46hLiTu9bQ3UzP69BTbEp0sk1K1EAD0Jw5Ky3SkiaZ5ZIigcmUzLbUp+LT5zPx2bPVZEtQciRnajTShCbMXsmX/CngO/ku9+Re7sv9PJAHeSgP80ge5bE8zhN5kqfyNM/kWZ7L87yQF3kpBxkfkMKKKIkxEbLJoX4NaFBf8PW0AAVpiIZphEZpjEhNhokiqmiaqMma2tOZxRBLnI5HE2QhhEyHj695C4JbhraCaA2C5rM8sML7V0THQcRXstJ08ZaDF/Sj/mdL8jNxegFYq3oNROt6E7grEKqC6qPB+TXRxRQ7T8b+k9UgOTIrmnqalf4ZeeSGJ+4MH8nSXKxycqFSPxOLNU4WkFXUNepbt9zE4U07NTqYhd2D74wNpKqmrlE+OqMV5+vyFSpWWv7unlrSRb7uK81FN1v7OtQYGQIyZfWb9G6TK0++AkGhhUVExcQlJKWkla0cxSme9LcRdIVgoXKv0EosUtSgA0BLLoVAmWSWddkEySmvfPIrIFxhRRRVTHERIE9niiW2uK3ihaRIlaYH4O5yUWHPAJgsDpfHF4AQjKAYTpAULZNXLB49CAzlFpJAoqIHIKcAMjGzsoE4efn47aEAXFhEVEwcEbkxsbDjXgCJR1a+Myu79u+vjyRJkiTJn9LJ73VHbWr2Xh2FZekjIiomLqFUUu3qNUppXiv2k2RRRBVNiRJIqCMStbTuZ+/SjrpTpMUQT+GKVLRitVxJkihdUkFyyyOvfPCfFqhgDdVwjdRojQX3tczs0VFYlj4iomLiEkol1a5eo5TmtWI/RRZFVNGUKIGEOiJRix0tza1gaUfdCWkxxFO4IhWtWC1XkiRKl1SQ3PLIKx/8JxsFJIiIRCwSkYkC3P99gWCDAzVIkaZMl5FHHCIyYoGWvguAAsgDFDWcwK9x/FI/sdVn+ozQq+GX2ze039DhjX+cKun8Jm9WskWVZYtWfLgytHbq+mt80Bs2be85vKzOtfkWt9tfTw6uGGjH2vMGCEViibS/vAPUY3wOdxGthZab4g2wtkU3w/sRa5b3M3EncL9mQ3oG0yTrSa7pnmUCfQZdNMfk6jSUU0EliZJUVV1NtdVVH8OPturXhEoO5et1FS5VWrchgVAklkgV1GM8pdWywNoW3RbzStAJrDNdKK2cCipJlKSqiDWhKc1oTgtYer7mabV22v96jEV9SYaAzO6Ygh1Kd68jur89cLLbQa48+Qp6x7on2tO+DnTYoSpSrKTTU6UhoYVFRMXEJSSlpJWtHMVzLJAolu5ulKns5mllBapARSpRmc2sOevZUEO4znyqhjElYpd8EfyLP77M7VD8q9EuyVfRTcSIv0ZpchuT3ezKHp/c6ofbbN3hyp3EXa56iXeIdphPD6fIFJ0edYz0Yz7FO0E7KTVJe5VPT6b16fn00hQd6Mc20N4Arc2ifWKnTc2hU4tISyTyl6zlVAqBXc5l0Hv6oE1U5rZIfYjriE60lS6boL7IdakdpJ20G0kjklBh3crVrs72UvnkV6Dv88apwoooqpjiIkT2U6LnegnqNIYApTSTVrHEbg4tzaW101wpQ1nKUa62aFvzJQklhvR1u7Pb6F6XUIaATFndz3qAym4H5cqTr6BDpkixkk5VlYYUWlhEVExcQlJKWtnKUZzktZIJVIGKVKKy1tDWYxvYbbRpCLuBNYxtp+1Q+0pRu2gjdo2i3I3Rbmbt8bc7mLruEK7EnaQ3iaIGHQH0zaF1SSRrOUohUCaZ20LbissmSM5GqFBh7UX55FdAuMKKKKqY4iJAnsYUS2xxO40pQ1nKUa62aFvzqYQSS9oqG6mllU4VqoThtfzsBqlvxu7XekCQ3aGmSLGSTgMqzyo1gSpQkUpU1hqhDdptNHSD1nYhHfD9m5E/uwSNqI153M1at9h0h6auKylEHHpJJJNFiFBgz0vTlKEs5ShXW7St+YKEEkvaKoMKj6RIlaYH4NedYskQkClLjlx58hUICi0sIiomLiEpJa1s5ShO8aQXBPj77P5nNHKv0EosUtSgA0BLLoVAmWSWddkEySmvfPJr6wwIV1gRRRVTXATI05hiiQ3u677MCHqm8mvDpXpiN+TSkLBbc3kyQL1+ky7vCerTgIY00hYF3bVs9eXpgjIh224EpprQ0xLcyRi5PWiL0q7QdpFIjGki5lgiR6TdWPyJTQ/RbDBOSfBvNM6cKNQpUksCeOu3IlNL8GlKpg5htyfzRqGRIBd4LlUb83XCtx30nF4CtTUGAZDi1wzNOXehuXef5gclE0SIFiYSkYSkJCMVodpo6Kelz1PXK41Tr/av1wQd4XB5t1WVguyWFbSTdusWs8ZVYWWrvfQJ/UB10H23ywGA/EY4Uz30DHOGMP2FYcmYoD4NaAijqzm0GIMyIdt2pFcZwx4ZPID1vCOMm2zCmEHB3OPQLUV60NadMAYDd2jyHwicRIjlh/28RvdCokeIpYbzzm4wLSboOb0EamsMAijFUQhbrgokIglJSUYqQFs8SKXXrAo77Ya3Mnt94gd1dYeaWH4Toa5nN+5dhP4Kt53Cu+mNBPgyehuhUt9F8Df7BrebCBX7HoLl+zuTrs9aLtGGUQ68ZYGqtjdC/wT0OlIwhZ2E02QGe5y7hC0E+zqAJFbiJK75fEjbm6hHMdjbqV+FvbWF+k6b9LbF7owTNoM/EluhZ/hptQmpSa19fPul/qn1b0NTQm+Q3sbeJdPetD8dTkfTyXTadNcBdJAdkik8RabL4RoYJmBiJXZzwKBVQ0LDYEQwD5xtYQHxw2Y5jYrV3ti18yQVsNzvTepjFbzTrr5vXEfXezcOqdk9zb20RpLO+sEm8TvNONpC0gfbJTvATskusFuyB+w1eICkoTTiUc1j6FnBcybPU6/zJnQkyd46PyaCvYl+TAZ7O/0MAcPejICF+iRKkiRNsqQK6NPrBDknmTLJCvZ1fC6lWYzJnKw9w02rk68pXdOxAgQOg1LDmHjOtrXaGYsud66i653b13ZgcgXP/ks+Emaun4gpOUEBebrYIFimVpk16nRlk17Hh5RmEU2S1Jme+QXzG9ozMK02ITfJ2gftl/sn69/GpqC31aZfK1h/30v/W0L80CyvVsPYs8vhSk3VrjXXVdfDjWNqdo+5t1o/+h0zrtouJ2dy22v0KPOY6lnqecnrQMJrBZ+fQNU3p4sJ9mv5Td72pqOwrHav8ju6dByhSCyR9sNERMXEJZR2JV0H1Gvs2dSuXqOU5rViP0UWRVTRmqcK7zgRX5QTzXNjgXlbLDQni/dmOuAj5uOxyJwm6WLLtRXWb9OQ9vu0MqNVgdbaVFf1upVRn9W69LYEytVHw2OSmVreDGuWJo55lsJTZIpOsV6gXm4pyavUaySt4ybdi5HjVrWXJeftykKXDyYc2p1PKKcknfZ5tyWW0oN0LzfOWcr54gKn38SQuVhc6vGHENJHUTGpoJCwiKjOxcQlJKWk+4J+6rf+4v/pV3VdNwXpju7pQSM/oZJLmern9f4tzHaN9m2FHemontMMYY13EaLAyPPOeem+a97ooNNho2LW6/PQt+DoslGi9fJc9EsfIx4pdlIl0gYjGT2ph+m94j/OG/aa/rjj2Gv1s8mSLMG219Fntyl57XccNZl0ro/0hCZ5UD5dP1O2l10bu1J71dASJkqcJKm/qkNZ6sP4j8q4TSKsTVo2pRpk2k60GdWPYlad+ApmKf9+lk60zlR1tXQQlrLwZ5GWSqsqX/tu23pU2T/K+kP11SPoSpbgVtSkIlnvlIv3t90mTXO23ikS75OXPF6WXvEYVNrxbkxLH3l8lnRhLjZVsiSbHdJOj12xW01e+vNOgXl/czJOleFSWjkVVJIoSVXV1VRbXfUxfD5ShUoO5ev9uijtZHvg+5ymCGscEaLECPIjaRbNKx2UHVY65u2M6NdyErqstOhtSdbYB9B/k9IGJRk9iTTtWel5xUCmHe/6zEmbvMmSbHbJ5HcUTkqmfNdHSGiSB+XTe3ZBh+s0kTA/QvOig6iw2H7wn3/9GpNQZbH5xDSqsQbQf5OwQSSjZ+F5YYC0412NHP7nD/seyZ+STGlpub62y+8Rb61iJk0LC36GAIXBVl4rXModA2OdtEwv5zl85NRRyIvSAa8XMb8CVFDhTpfs4ilALHHEFa6Pa+PelO9t5d7Ftbf21+E6Wifr9KbzHSx3iCu8IutyXAeGBSyW2A1qna22AFteGqUw5amg64p6W0PpZGpcaQvqgwY0pJEeU5pAkK/XCDDRnZyUkQX7lPgutDabZL3pdgWmwCFwwVpmyVQlixChwnD9NL6EEkvaKrPU0kqnClXC8Jvnq7Q+uQnTWDtVpWrV6Jg8uN7CwR3sFu59GjcVNS2dCpUZpPlX/jGu3LMCKGQsP5q8/IqdSzmQ7LnqJuZDeoIIlk3KkCFhc11Mc/jXWgqz4+MezdUv9qhvmqd8lhr6dQlzgYsZpks14Hsa60ncxoR7xHz0aUWfN+p6hfCXX2MYTtJH1CUgg4Buz+UdeobiQhgjbxEt0hIt0wqtagfIJY98CM5joC7/EzWopSEIlTARosSIkyBJijRlpRwKz3G7EHrEoN/C2phrCAiW9hgjRwG47dG6eR7VQW/qEFTLojVytwPLHogq0CKArjbScYXRuxh0nqoVoJVJg0AmMmtL6AOiPo10VluhZAOoZ1gvhNXEUC755O/fQ392APq22HdRverXoIY1qnFNalqzmteigo2DwoooqpjiIkAy4kyGCWMgFrB7hLCa2JGatKSjCqoEw/kK1zVeu4MxE/gprVWvutfuaORViKqpRh8o1seQPHRd3u7R77X/v86RCazl/yNcymxt5mMzCw/JuUOyavMVoZFDn3rwtHPnRMjapjWZQw59YgR2hjxSIFBWuRuTF/NqGdXoAwV5THZhZ8PUI4dbvrNzW35dDnm7B6eWY/yywwE37uRdhW6/UchtHaVQ2VJDdnJVQdZ+fzAvc1VSf3wb8LEV+DFqDt1LEpDZJ/nUohtzVk8PcPa5PEd0hAJmn8HT29zt8XUSkhikLb2zICGEEEIICeZzC5fJOz+sa3aNqyt2u1tH23f0f+PWuDsejIklur45+cv//+rE9tzn58sFAAAbPP+4loJwrL5v726nzRztq72biFxnv/z7fMV3+kj5CPfssk5F6neL4V2Y225RQN+XlgqPhj43o4caBzUPhWr6NG3sYOI4Xux7ZzFLaczCdsYg6zccO604aaTm3p3oUkdaLg/h4GVeOXw8DOTjwKP9XsFNPMk57uZdexh95w7emAu50lPtv/ECbt5dAAAwIMGcJ77HJ3xs9sM1XPSFKRttiAmPmzdBU/yyPWa+VmFxYw8+YqNTQ3w49R2Nqw88rN1sL75QuIEOW6ngTO3kGZlH4ej1Pa4zVgJcY96/YRjOHlQtrjF2hVX+hjEdNxudEhrbVn3XEGeKGnufbMehSRv9ztCfzKf9IiRoPx1i4j33GuZiHKxlOe21nePeXqXUK/63uXNWBMedr1jKmUo9VyNk3NwjirdZxYlI3cdyxTOGCBKTat5KLo7ZVFpdvnsdBNkbt1GjbROxX8AW+XTzlf6G0ry5wljheQLM3iiJWx0b6vXj5KVZjzjZ7niQyo9GamgNB5PuXXwaITQVsY/fMvH2aALcu8uO7kUyjnM4KN9Fn05i0+ipPpnzeXMn9/eK2jeYtx2uhr+g3ClW0bTVQVdyP2vkke9vWm/eV6D4gnYvSPwnUUIJB04k8kQj6f5JmljigZMIkmRkyQYLHXlyUSQfdQpRphhVStGkkaZZSCtLJ6T/E3sI60R5m1LKrJBFq9mUs61kV86+tTL/47K2pNw9quBTVeHrrOj0d+V1r1rOYQ33WvtpdbyiwTM29JZ6WW6yEK7cdNps2nzaQhw+ixC3mLUSt5q1VtVGVVtJ26GdpN3QXtKr0OukN6G3SfuhT1Gfi51EnUb9CPoVdB50nemmsr9V/b8/BxoHAUGWGAD44ACGGzmOFETaaBBZ5CCKJSPI0YjxKEN0Ny7qUUPe+J2EmG+KmG+amI8n2PEJdvyCnaDIT1jkdirVHaofYjUMiRqH1DYF6kBDRc1gCnmoqAU0oQhLKA0ph3IqoZJqqK4u0IXbhWhj+ReYxgKEElDRBEA0EWKaDBEVQhNBgKkYCJUAptILyQ7zG/ALIDQTMpoNjOZARfOgpIWAaRFUtBSGyIEpnsAQpTBFOYxRCTJaYIwuiKiM2MEFBVeCaciDHEoQczsouT2ooQkJd4GEu0HCPSBRvgxFLMQsZVapwUZDj5St05C9BhxU7FS0R8RHA74qjopEiESJxEidkTorkSS4JLisgQwVElUKlGQouafgviYeKHs4Z4+4PeYl4282ampQS4taWjXQpkIpVSYypahCI1UaUWlEK1UrVT/UaFwzqAXWhuog6zKt27xey3TWq0fiUGAY+shm4vpkm8WuL/bhDp04ZnXq1Ed2n/0wcqJ+4QUIXAhcibrWwCPqRgOvqNshn+yfuvsxANJzgRBQYAi4YAgkKAS6YwAwLgRAPhqRj1VUYxPT6EMcY8QcM86xYo8d1zjL5QqyYP0TK4n4SJBNWP9gBYJJtGU4DdwKi+5yGIw3uvHY41NYjmTX/MpHm4EUKhywwIsSKe04U/cdOpD84OnA4QAczvqgtIEBpALDjv2WThP2EBvCAxoUKA0VDKd1BmyI64WMwAHDb+tmAE/zYF5BBB/VdLhR0Yce0rHgDZMdSUeDsWfYDO79Z2dAAScFv/XCVdhgbQsAJ/i0FOQF5rENPCAM0RiHPeLBb0iBU09h2eacMHZGvKXhG1+33UvYFQKUw2YD8/XbdJTczL8R3oqUFRamvVPc4kvKAUaxDNVrsGeZ24u+X27FMQLQw6QA0X2Y9KK6IIb2EuQg2EiYms1NilLfLOx4Bj9UoF438BUdyIjtd3MAg0q5csmQM+jpxqBXUMaPvhkAfKxUa6YGH22ZaScD37YTvFuKD9Pn8ACElzOpLEhYr4WR0PEgpZ9QGf+0O6+1SP7zU0JNgxaGhw+Yg2ozLA8ZcOTOM3uckqTjlqmMgEq15B4IRPlZNw2DntP10iJjK9bYZfc43vc5+eQzr/zNhy8DIxMzC6tPpUneHZgS1IEUl6GlSJUmXYZMWbCy5ciVl/yp6smpI0rFD6Mq3L676vApDR2hOd3qSW/H68u1GehUg4nWU8Oeee6FEaPGXm8MxECYGFxewmWq1U1nWbPmzFv44M8GcSD8NlvLp7W0mo32tZlQ7WR3xtk7KUTZ3zK8Px2mz3ycNY7fHE61tvnR085So+vr74EfZ16lsSXufhNKFfPToPqDGlRITO6QzEMjFEcoV6ihgAPNrUGfVNrXMmD9xW6OAGXhy539AMQFgyyucyYgje7e1UTc+PlCD4dLetJVU+sWEBQSFhEVE5eUiuvzQ1T4/Hz89/xMRXu6ka7O9rbWFri5qbFBV19XW6PVqFVH7lZe3ydiddvLP+XKKH3ywdafUmsrSwtzMxNjI0MD/W5nq1GrlAq5TCoRi4QCPo/ryzCL6cddOo1KIZOIu4J6xOXKkV32vhUYXjyUAOjIHrOv7JPYh97VUc9w23PmRr3kCvfx+LcfCPHRZxlOnOtw7W/9/gYU24KY7NjnDTe3BmOo6jZz2wOCt5j52XlGpdCB0RMIhG4g0kyrQQBl6xQHUF59MOJLrgP4cM1/AN97FMLxVBDUPN0T3xwQCCgDDN8EygBgHjVMrgWAdj2SAciC2bMNgRMQJZQdVzE+3nR6/ocZlFcDkKSMCE0BcGBmxEZ+1EZP/Ij/QRlDeoyM+fFmnCVEWIRLVMiMzMraXMqtSpl01yC2e+Yu8P7YfysZx+W1XK2y1kBrrrVf7degNXbtYLlzhfzK+bXzB55gnJeWzy1fo3znE+ZY+Drg8mt/w7/+f3b+A4AFmprIj5rojh9xMxgPbp4ZO34AJy2enfW5WoBcfA2F7R65s73nzxYAx4mWpv3traP5Cdc3X5Zf/irjJzDnxZxX8TtgFJ+ivT4bhjN1+jq3M3pVL+pfe8ouBpS9Y3sUUPbE/XArrf315fpifV7A/x876/zt6+j5z1Df8Qcf63kHvgMWAADg73M+/EnXoasPAP56FAIAf930/RmAvss/7/y+HgB+/WBKV7cA5CRH2WsJCo71DUB3c4dbK8aVD7anZbqEMxfKVuDfjLfj3YZsVzMFwmxVYdiG3UgaFO3Rga+VTqRyqqSqGqJdqueD1AA4aGtqp84I0S2N0rhr9wXUXL80TfPnqXBaDkktSDtqmpT224jB6ZhO21PD0pUOZ1S6p1d6p0/6pn8GgLF1T2VkvxKafTfwwaBU1KzC9GPXAitssMMBJ1xwo0GLDgISPQaMmDBDYcGKDTsOd3C6iwv3iWgmF3w+lzSZc9E8P5SpUKVG3QMaNGnRpkOXHn0GDBkx/rroM2/KjDkLlqxYs/GILTv2HDhy4gw4Rc3rNlahMjUaNWjSolmrdp06dOnWq0effoOeGjLsuWfGjBo3kcqCuHLzOFVFqBfAOy2F8UpXGSrSWbD4r5c8hKddOqR9VKQLHzGRrM2IRBh+6RTqiQl/vmJTnYskqUqDPhhSMqVSIRVTNtFepAdcyKdemqZ26ig6WkVkyqVSasC4KVmOrJPg6LmnwLEBbHx2+JUuwjSsBYZ5WISlqLAJqzDbDh72+tWtTIw8VRoMm0TQrNMLL5Fy7ZRyNU6nusyrU+520ycQARB7HviLMuhUKgBwvR4w8nK3cul5vl9h3gfUHvCIgArMp0DwItQI+SE5ySmsCJiw2sNAjCqzEOOKYBAmhXcelmP3yF/Qbyi0Li3/l/2WSJUoTLo4AzQqFen96feIMEmYPG+OCEZB9aGnihzgODVPQAOiiIALasOrBuXaJoGqY9qDIpgFZr+WhZ+n31AYwBqzHAMGfw6A/oESps1x883INpplFbr0VD8EGkMW57pImswlm7UKzLv+aERyBEHA+Xkyw6S51OI1jMwsWyID2MRkw7KLMqVrVNK4wypx+gQnPQbKGFNoiYtCPpaf6LWG5u3+0MOyNPNhKU+X501ZBpBR13T2ty6bwDWpdkksJOeHaRZQRS71GPxZ7oY0alkUiwdkChdpFWQaMCXqPMDU9aJEaahxsWxRIDDusgtMyyydjNuWuWVcCQcm/L67i366saxDKCMxNCZJaP5haqQReYcvm6McmGeIwy1hAOEk2iFUU0CL1ebTAAZ5uFTSQAxqtgeOpcC0fJpWt1OAajcHyEcNUREAAhl+T1ipPt9X0VwdwD8Cap0PoM2tACD7GwjgvR2AXZ/9wdL5+PYTFAhQKWfM6wXYmBgDZIiTB/j5+hOTsHdaMBxTM0YlstLChh9LT0iwsdPC++QtmCVEbToo7d7a8YrV8wSWxiy9PrRvPFHmlgCBp2PXv74WjQXTL8q4WwiZG4ypSnRmwtDOajmNyUOZxZBAqZD7ZFUmcbZSXTWCjp6FQzklrLv78M4UEtgIDkKwdpppOsHwVzV0uOBhj02FZnZgiVgNsmN0qAHndd16zTBrkCY2UQc50M1GRZY5M7XO0HMr/tJMVIi946xaKmb5YPrNw34DcQ7rOJ0g0lyi+q4udHXVWoxcmZxuIWGBuJCloPxvkyQCwBlh1uJ5jHnZ/hqc361BxLBXzBC7c+2J/VY6pVgQHkrMMbyF4fvBiex4T4K8piyl9CZA9lYu7W3qzlvOi9mWIxA3fPOAPuo9Rot3Q83iRiat3PRDKNEZY0CI6O6p8F44heXICjgyXlSysNA/LDU6p3jCqQHX290W4FsBzI6XJDDb1Dz1hu1tNyW4kBscpDWzrK8+pHDJACBaaZ/axoodmbaed7sy+NnvCxduR1d1dI2qEDMXgJBvF0MQr4chF9V2P/TjZDPfXipV/fpxKbwNDNOqL45vN7vPS/Drq1mfabWs/cP01nxiNc+aFEmvE6kX9qry6U7Z3cIxnKsl9qXguZrvzl36d/u/PosLvnlhMKmocni6AfBRAKLv9VWTw0D3aSKB1P27CPcPO/231VqrQSTEV75OEyN/cqBnvkLESIpPo12878kl+KW/+FCqV7iDPoZDmOdlmcO+15p01dvw/v1V3rquxyOmW3sL4xMF2iiaeWofiIT6Nuny7ghyz0Yw+KRjDhmmGL23ViVCFnC5uAB6ibLAIKCDfxmt6u/yA7yTPuoRReiCBw4nYfLsGJvurna6I1C8KiyUaUmu2PIWE4l559S93cw6jMBLgtanJimvPOCT6pxux2DQuImGtwEoheW93zGc8HHIjyNpFMft1QJuhAUzJxyXaNdoBBdKrxhInqZjgBaXbYsFMAkH7l3UnFATLSCOyhlixvu18mZ2fqi5K1vXuFQkDk0vjp7cRog7MZLVi67tSz/NtBPqm7Wfct6nyDsG5SUfHRSmpoAOhaSy3jc2KiyuJa3FavfMbllKa8ZQ1qQmzdLMlqwDKE2xkqCQYmoC6SiMx6wMlsqcCFALomNpbX3wdTyfr8T79bYXEtri6caiMgDNJuEb8iEy5FHiJtUWXjuPBkiUBB2ro+HP7votDObjzCfUyV/lutEj2ognwZGDM9hq+oFFX0p0uKiMEL8nXbo8DUj4aOGi69RehgKlJ/dh7zvSWVyz748FZ6FehpRtMcf/pjMpmbPkOKF/8Xtg+e9/5D/8jf9J4KQ/AxBfovOaFYPclUP0KnNQh0TzG9som5M+tmsdO1+xkVN9cNlE7Tm2zUdAp/bjw2dteZMs76nTMRiPSsZxXuodgdehxc/pku2TmKFZF+BiG/914qyP35AKeUsMFsDCV1eEVfKkTECHmjKcKHyG5AB8lzo4mREmdJ8ug6Xr8VJ21d1BzDqsayBMIlQSdUJXGS6SbbTgzwTWniXLKEyxV8UHMgYtpq6OedIezmTeb72NjtoA9yT9q0ygDvV064pSjUEfxWHkfyfF7ECk5jT7yFOIRk6jxohRklcQI5YIm4jwaALOwNmS+gTYO0dciXdNNPjgBtydx6MysB4zESEcW2cylwFMD7APQ2BfrD1/f4izUCKw73CXZgkVXpNUoJw/0wZeWFdxOcVExt+X7+bo0pYfoRC35AZIG5YOl6BlEIeQm3vtlTuw0EjiyhiKhRtFXAT0ulObulVdinIZKylvKxFqstLxUeFCpssykjRGaw0coZNFndf2vvlMyNBdzWJENFcbTO+Jq98OJA1pKg3ZUunALRq2e83oN6AGkWMQSqR0eE8DbbTmVW2mvTpWcpm6Z7DXaGAXF/blkqilvOlGQgWRMwdffyuzotFjlN45axAZ21B4dhbdbzsXRo9HenwEijj9qn+Cmvugj8XT7Bi44UZY4RDVOJiHAAok4STz3mzuiuNWGLkIYX5STbT+LSM9Jga2RKY9QXmUoGVHtlcUcMmx5GxQssAVrzcBm6cW7GNOUGqVHJxU04yiBEhlS7oebdXwqIrNgLyJW9vvMXTMYbllGvTXw9RN5hP2C6ey0cmBZk0wnFlhp0DSz5w8YYxfw8yYjYWm2Axixk4F8Gw8s/ZA04QuuxShr0RLoBokobtciF8E4annmLx0klB+Mlai5DjzxqKJxnyZGpYWpiIvBzN2M3Vk9Ygsc/Lnu88/3GWeaTe9JwuK/f3Ml0cuepUJDnXk1LpDY05ceGTpWDcacK5FfTWLhWt/XTZcl1eVlxueMo/hka847IQTJYG9L6qt+F3TfFkr78/QhjTJDXrxRBUMeE7Id8nLnjrQhdirxuzh10sHmjq8+6XtR+iZjcsxXEATNPYPaSdICw/eOwzywguw7zVzShnttK4k8sABI8hYfPftm0RW88O67/l8QyKIppmrqH6ZrUINXJMG1KmNM2wfLvomCXWs7uZhyYgsZm8cTV5h3V2q271kL+6aCxfTSxdQS3LTQhQsdYgr7FQsF2Q7B/6VDnRMnjdM0czQ21AoHBPegXYpQcjsesbs88+aHenuQqDleKFn9kuuhOtX+KMyRJZiXiwSHxrZmEt1S3K0FqSYfgHHbBCbMgKarr0OPbHUw7r0DwbpW6IQ42x0qETxRYaKlZje015R3B1D7OuqEKrJ2RK41+KnmSpRK5D8c7kyecsKEXUYSlSiaEGS7aVtEu7Mr6uoVLspbRsis65sBY4/gpJthNBSGia0FX3rkAikGAvNiGsmMnopMBrOc2orlDdmCr0DoqxlAlClf9CLshXqctpSOo/uxsfwewWNhJRNPa8wgpLBYhqUcTvNw+wAbWucaOX93WtTDLU+G5M6htBGCV/Y4wzwGRtB6MNKaOVpNB2oKUGDGq1wUTLLRU+BdCa4YcM8DP3OFoYkSz3HrAWlesapMPfEUF8ohwoob2bFiKHPoouSzSSazX3nSVVmmEiZccitUtoXMTVZ//bo07BAkm0GuMT/EYq+OBTyF5B4iw7GyMaw0TIKNozOEyoa7mYK1lQN8GM/uEtztv7DGF2qNflOFZseDKM7+7SXULl0NjNrYKGNpLDWZ9QoGtY/rgYbC2T1/fRGZeR9Dfg2QKwkMKikG5wKA6CYN/JHLVCrEIolTQGYEQ2W3af3pLmrypsb+jl6Ahi5u2J3dUtFL7uMDJnYSgLL/7jC6BwnFPcvik8RlrjHgA6cy9+T0AVVD71BtZV9aITkFZoqcbKbaklbXr39YoACTvFVuMb3XNL4TAENRGPZvQ32PMlqxQavLm5O74o2rf1Z43663eMdt4UTkrosomewoqdJ2EQNjOKGNIsmhl1jajShohfn+mMsofCE1g2IRJeXXBRNMrXQMrTE5DAf19JiJeCwPYBAYDsJD607MSA84kmYBtfIfc8AYeDkIRUrNogTb3pXlNZoM8nFj9n0IF9qZQDFh3KT4wcJ40XgAa0+SYp+xYqjln5hXWFclzqJbDd1BptECSuSJH4aoB/J+b2JXmmFs6xD24vV02ve6HhY2g4l2nlivGVinj1THLVvCpdci7bXMagXEmgdp3qAAxPGyarrocwHhyfnHMzWFPNkmfU0vfEkRZJRw7RZubIburzb+zi/TOT9Xup6s9O9UScsqUWQF1MJC7LSEO95ywxojTj59MbwuZt022B3UmGquaVkN2nHeU3G+61G5MNjuVslkr3wD8pXWOElMtHWgBVnXx2UtNHRxLHvbRCcg+6GQuiu6qz55FX3AgAnFKJBuRT2hv6X8ytUn8KaZWXVdLkOmFcPPI/TwRlq1RtyYMZWT5P2Z4VgzX0fQpZwSjvo0/kliNXc9itdj5DU9rz08pFS6ybR3SSDN6OHOR3toE84Yzl7G4p2QnHD1jPOJY0JWK6jZFdHktZgppdQAAHh4A0a30MkkDx0B+NE7Uc7mKIl0XAPJiXBP/mslbSkGatDIrQDOsqFA9ty0A8vjukg7wpiJUX3MupIF+PbhKXqoVbm3mYjhG9CRqS8HOiyfyrAUYw2GroJJjC+QcMrWxI8Rc/Dv0pbX43G4wkKU5oVHA9COaeeV39m9DyusnWzxqzXDIUh1INyS+kmlJCyonjGz34nWsskygIHrgB2DwSgWcqA1m2S7401xatXdeYKxipk+cJ+EPSRnZZt5O/OYPFAmkwrPFhlMIezV9MXgoaK7ZuqHpYReyR7cY4b1aG59VFJ4IDpxv/N+8Zma3F5ysRERJgQJuluaIfncLdT4RwbEZPVotUyyC+dIcf03TZIQjaYZMhagrCs43uXw1iB06kNfbRfXKz+rwRpmobyeI+o3RtE4M7NPOjt6WzRV7QwfRlfOAQykuNubrYt4bMrlASIzJHrwv2zw13auw94O3ys240L9wOcy/QDO3CqBnDed1iw1XSN2HsCbvLGvwm+D3yncvwoIC/vxjhMV/pWWR1eN1f9zKEd3Ii3BkUJpHRsodG3gANg7lCg+hkS73cB1IyLDgXySZvPDRX+5tH0AUw+kWSQ4GOF5fVtUcCAvgKGYr1LkElgGcs7Gm21yQrWvNEsqKqpbqrAmVkedsnc/rhcEQZHgRFDgknA+HN2BeAOQT3kMMoe3H3xwXjMYCrFFsu/DtJXcCiwWThZEX9Vsh0p8nScYu1FTkhEJ0QH0vM0CPTMemtcxmciN2n2JMV51pmhmDw/4ZuR8q55vNRLWqrR/dg63BpQofJdKoJMvl8vf712d6c6f7389SqWLPks9XNrvnrG2yIdVo7jF/a5Qy5nR+fNfb6ZHRRpyaOzpM7YObU4qTnxSoHcXYUtUioaqpjwwREh7qfV1l+64saOEREaNEHIThtnK4OEYhUn7qEqMS5BHBXomJLY0UMlrJexHriealQJDMIfCkeUKHPG4kKd0v4xEtL2EtyJ5ySswv25AIHEpYmAkwl14k8EcUDfReNTXiqGPQSXWcUik/0ft/fKgOS1ZNqfqCPfh/EkM0nCQ9ZDCJz4aeyB6gb0Yi+OHi021eQegIhPHKSQOxluL5lqOJLghN4CnB5AKLaG3EmCUfbaaYLhu3wVIUQ79HhEp01alAQaazX4uFxx92Nb9NWF+KPvpZEhr/EsYTnl/6rJRqkoU+Ib9YXV1N70FWO0ChXZz0jBctJkoUuQLNIBiy7HB2NVchd9b7GRvcrNVQMm69Sq3TmUdnDsDrsd7poLad9iz20yU2FE42yQ7GLYraXGKHIExEXEARTroI5QxeHTLh3FXj0mEO9V/NZ74xqoU4Hh11SrZpdhexcuE9Whkr4bqjB4neo5QcluaoDTpk7xqNp4Wyi87Agr/JnzuXfBJmOfhWhWyQtwqYZab4AHFAcuFUbdsV3XMtmMQ0/Asr8FmOXh6OtqPcKalA/20lpMTyTgBs/r13GsaPbO9BNbwiaLBFTV4DQFn5iUjoYqFZin4dW63jxDW3ZOajgK4IBzW2zICfxdiLmo/9rKs0NO+Rul5rMOho+ggNtzNlg34+8kqlJWxjLGJfdk6uyTlfbS91jV8rPfRNlDsxDArZlXYND/KvLvUuvNzE8RgoSEY4tgWDZhFMkuw57QMTJhlxBGxmiKi1JKxkXYaiFRBaqqf8YvSfiaLOOMxfQZxM5Qe8+4eUoVVe/TZffhz/hslgByTmLUse8cDtS24Jsvjfq1ID8FN4ON9kbPODYouCzDfTpiTQchNF1rdOtipE5WhRIM88G+KpdOmeoq9gkRVMCZSR28cV3pTjrmLtiVCVIwvrUhtG+pecpslZwImlFkHexhx0URShZ0FlWbFq/DGb1/XYk+dxAH1ss9/U8UNeDks99lsmp1GogrbWFJcHTmerN+x9rFLIwDlck1xZuRjmSK/T3ZKX6OX7rxL+Rn7V7rKwCXbBCAXtOcH/oAjrZyAVjFYXGTQeN/PUwDTUKTeU0egTChQS5gz9CzOA1Gf+azdUgOFlnKEtQq6Z4J1aA/LWpRxPw8yj4YKqYG1glX7S/GoNJXs/kAd07MyWg+z0j9A7CMjG/Y6vkD10fo/21NX7JUXGqhoYKKNQawBqNMztvyuxsOfJeydzOW/X8YMTeye2h/T8LplqC5nR7HO2JudC/mWVVM2KjUumbVOzoGblfEh1zLqCYlWoVUwVdWz02m663bWVirend7hDoKBUmR2W27iQYjKFzQ93CdQiSUUzgpOe83+FxuDFSjJlrfq3WOWNF5bS6bz5pKWXnFOH+RL2NwZShEbQraetjCjEmz54Ckc0+kN0SKaNl2KB8pFBc1ggVHHY+WvfhlmEUohY2sgkDH5+zSssjYGcigSsfo1jWbz5ffyHdvpHjbLljewJs6uiCUhsgnwXgFHChn7h3V9/CDPCyv7S7wBP6KrSTYhuVLZrpg6Qq7b4uc2ZLmRgd4mriJBPsKRajfLCPN9oFe3XQxrafUdMbQ1oBOvq9afJB91BSm6AcZkdd3xefQxDc+F9hKathliYJro0uKjPwKDxriKh7s2LSUFYRMN5U5tS91nzi8cQEUchifnJBqTzJLnClZVEIV8MRHqMUgLTNCblBX5pd6NJcHypc8rHXfan7pCvcsJ1Tz853ZnEpaYVdiS+1U1MzB7ygy32UO9TXgCg2X2sDDEnQLYYlAOMQT8OJwuqfQC0j/jfm/i9A/f/tuzP5BZQYT3qB9t5NOVMbaVccWVcfaVMYuJS3K+s4k7CkPHhzQImrrHo2fKb32/W/3OpZ6uyKqUVyqqVVJxE5rzmW1cwudDd3LJbRLiZuFyKmPY/gE5xGukOtWlfIrq/Mvqp9d6GgZwldSv574soL6/mYLjEtX393dEVvbMxeXPMm2GHdPW04sAaGEFlnpalECUl0MgXsQwnGfeNQDVMVzV+pRg2644oqzcQaeHtT+T0bg0eoimLKcTCYilBAIwo3YB69xui5WSxES2Ah9+uxQBbazL96JfpAC03O3Nxq9THliOteg+p4q68y33w1U+KIpJfHk0dvFZz7WQxqoM0OoegKKweyvxsxl7i5fdqVsT2VLwrT5MAS+ohXU/xRK8n3ig3nsLovCGidcrNwaxPXYX370U+NoWuPH/tpUOazCOkKALrbUTz71xcNocsc3XsptcliF1UqpMOpqcpFKaxCd2p9daa/NQ0mxNEuW6a2v9BuXAliNH8XvBdHa3r2rYnFSePpuj91J0eLszMP8VXJCl+cm4nnSWliH/pRztuEX8ffgUWzHhK6xHRPCOYfXXx/fxeE+c/6uv/nEMYn7zEF40xh8Q6MxXT/2ujHomkZjvnYUvbzgV/GxHBA+JQCwHGyKGjJ09Bf3YnVnKLLmi4QmVLe2H9c8xCzLJJ9lVkjqRRrDhOuut8wTc8fH3YtRO7urWm2N1oODWT7KJpNe1SoX2lu1i0ho8+mHwbG3qzh39bRgj5rf2OuZ+fVuvBO6U6d8l7P+08Z4a3mr+UPz9Ftl7sdoJ+B19uibkIjAepG+fGYsz29WIxbio3E9a8Lq+eabYbyDwfp9WFAfaOHv/qt10s3OE8KzgC0iELXaol77lmreXrQWhQ0f+Hg4gNyP4c9c/7exd0w6OnElgv/zInHbXW6+0lUQPK2hW0jJcO9wJGI4cvgzzl4iveqH1TpLnNPESpbZ1e1XQnfL+S0dxuufLAx17S2M+RvnxLsMgi0vIu/9ejU6c/tqkRDV2v241N0TWVXf76Bu6+dNNwQ08+iqZoNW00jjG9w14c5rOyfMA7gfDH+HL6H0iw86Nn3AkY/1TcAGdd7ozBJAJeCIl54TLb4p8L4kp1vYG1HtU+Fn1CLbgnfhe8WrwTevfylTwJQprr9PAJPGms81n2prPtcwGy2vrbg8gZ2S/xr5GDwA0JoZuH0V19i/sDqYEL7kIl+XILAKAvMcs50AyyN0luoFjhKczCC7TZVkuLg648t5n7qlAWZhrfuKohm+TZDFa5Rx19H4WdFMut39IzUO8W9NotjRkoWR2houpEwccJ/JV5HwNfEgZSjqsEAsfZo8iNoocomZXLfTeEfz7LIwx9b5S6E/KRY9qpovUkylwyhJ79E7hDboQt5+zpHE6rmDQp5ed684q6roW8NppoB6MgH8yeoX3JSrfISXWoNomUmd/7iGZyxl0oc2VFdZOtVAMmT+sWOoT1hFld1Wec9ZtqIATHTnzVugH1hVsURMjMRVpOanpeTNjRSPFc6nJyXm1uCQxLDFULOz8u13JGx2mQC88oTflu4xgp9/slq6VtQPW14l9MOK1kQzAZy8QuWN0/JTUo0yTDsA5xg2++Xf8r+pyoqQnr8UyHdvQo3m8msRMOR4YlJubOvw2FDf87rJLDcH5JrJioIdFnH6h9izn9EjbZkAHP8E3YMHcHwCuk5pBMDxAH4nt4d7AevZLGaox1tBBNDyq/PO5146lfIOvMXl8TElPtcfH7ZzMKDgmmyXzvwfnx8A0C/b3QjgJMipBhhyowEK4AtMRojPmDOR2buo94zFkLvqIlThIGoE8bwUo4miHVflgmnufvmVkROYC2Hg+PYTDcd98ETldH5x7dTLJ2N1U8X5FVNj6Fs/W7vLX37NzH75uUypuEcZEj7ucFYdtq1SreETwSvrjAhi8F5K0NmFeiwn7W6Bh21/MXjtXDvcnAvQzJRlVHCXdtfFIhLMVAyr1IgmLafD4JX9babcibE1OFyWVtsnGN7hmNsFFXlBxtoarczo7pQIKr2ab+n49XZsIdxptZ0FwZC4uNRKX11ls0LscvbmLCo/Xm3uO1+bncD6t5QHiAPAZojhxYoEACMAGNpxgsPjWkvGotzDo204As6Xkpntkw/YZCuahB1qotRko2Ocmij7pz+AF7trJsGH1u/MRtuIWbVtsxqt71s/oB6Ax2zH/lFrQh+7Mnj2l4ff/oPVZrS0/eU5u/DLieqBkUr60RegEnrBGHzhO/2gDGXSsAKPEiNHb2OWiIfy7TyySqc/o1YREDF3HRwA5LCkRDKksGeaY0hoETDclAJyWFrqBoiYuxVnvwVc8/9vtfNe1MPqsS80I6lLqBPDMJ8RX9tJejnwAoNb3RNNvmVsPR1fIia8DtgjiEMcuUrx1MTsSPelIlUQfGmCUg+5i5Kl4nX52/EFuhgunFGrWI+daLVTV7ZbAaBEMNkFC0fTTl6VCUf+GGE/YVlH3kVANnLFJSId8Ljy0sUO5FXnT30wYloSyg0fyXOyKzZXiykvVU+FEyGGvSRNFJPs3WaeGee3Awkyc9nFGBBRvqtMo+q/tyvqYPAqBjoqO6dvR6ZDjQKApBaERxAXT2TOXuW4f9qGueeFFGGSYeSsqvZkuE7xxTNv4v8i8QPR4WcTRG8CCMcqH0ayXNlwFRf7NMH44JB3Kbg2zmHez+coJyWh9a15OZkdTS+K2L7RXtfL5WNCaiil7Wfz+lvxrZb0ll+GJ0zd1HQ8bXOb/JM3HxYeDO/8lKPYx70VHaBtan18vQpCab/GEThtd77rjRShHiNYYHYEhE7+xbOEAMb8Nc93Dym5hNFzdPtdEaGk0KyOiZYhvhPRTwAH0eTT5rcIk8JqdcvLLoppcyEyt4ZAUlf1SDZbJOks0ThhXLoSACU8VhPY9V3nWx/S91zf9X6CJQAkEQBJLBb0a6T5gpSMEgGvvnSzjF+YrZZ6xw+/xAbjWk2aGGiRMoYJokccw8fVmx2kw/mY0Z3GQPAVshohVqaIe2h8/V0ZvrTU1FWCLsN+yGuguxL180B8dvZQ/Cfq14HozPyBKP5np8+7ARX69zpQM74f+Bn0H7ShLdUAlp20HgFsLJE1d102DPljjH3WyFE8R9wwYgtDadWBNuQlzy8fI4X4G9Kl2+Whi5COQrqa744ggNtCCkhv/3DTjnngBeND3xUiPEJBdYqvnrlZwa9RVN9l+opw60FT9D0WYcqmxFgUBK2uEHMN4u4jYNB4dCiEYVqZfUzx6JMg173u2maMWCqoDydCTunz9GRySQm4GK/hyJ2Wm6kMbX7U0jIEtDBlEoAbFA06a83LoSBQtOa1JplmovnXviGJaF/UWLPNGt9Xn2RdcSs0GH6S0kYnqFDJUIEgupNuRICVKuD5jh+ZhkLRG2Pn1KYwGtOR39YQDejzfKFJ6AB2BTa1kj+7A0vfIVBNoVtmR2EvR1tL7+5OSYn5oj0D1pnxhQuZkfLVUDFssJgnRB39wdAUlRaMQo1yn1HiEy6fxJGoBP8QvS/Pebn8A5f1SK4KNCVuU1byV5WrMZvqOVeXCR+I7TanOYxvtmeeNkntMJqloAeatj2p47SdNAFqrXopWfMMM3WHqTHn4Gnbhh/Nta+eApCvXkC+WDZEmHJh+xo3vOjjrB0sXnpN+ZvJWucYqduMlQPt2zs7S7pZdJdhqe0slX6evE+7is3HBWLdaDRqQWfPrixcIKtzfUfBnD/BicDgQrRFdmZjfJm8yLuYzaVN8o1XC4QFHh04z/bTe7OM7zcchW3uJBSMy/Kfp2+4CycCNv/YcNROf5GvQlftPwgnXpz52tw7sQnu4l6IFJnxhBJfM5zYoAwXlmW7b4oQV6bvj+wQuOsZlpthxa/rFSGJXXbTHLghTkkfCbLV+1TzJhW5lpMQhGxjSVDVwXFRstR1D3nmJSFScn9QpaMdBZlS5wuPw5GQqjSEffEtoqbyLWJm6i1dZc1bunDQUc8BQwQMGXHg9PZthPiMeJU4OICWrpKekXbAQqJWUo9RLz+Yuxy75LS8IzBtpexAiMEz5ce+nZ8mHL6FzCFxIY6hcrPRKpBqZMdyn6ss9LTZslsp25BiqEz53DcvZyaJFqB7yElQ7pMET63dIuCZZOP5T5SmBxYGMVrFVEHP/I2LvERFUKmbKNq5hH+QJW6ISrp6tvrsgP/okWLvyAV2LycJ6i4otPZGkgX2KgpWSwe+eyMTSEUu4//mnbT/hqbtxPHNnMyKKnABt8OVIWZyRL6qKqeol8OkC9WOtNDC8srMnOaNVhiuxKvT2ubMw0iSxAuhivkNZEioY64nzNToTUFnRVk863L1JM47QhCuFY4O3YEdORkilT+dEXAcst/c0rlQVUcliuhFSa9alpEEB6JIfcrGt29bpf333/6XGbqph3+1lCREQQoE2TOSGt28XeHKiWvqgoBG/DlEBZRmDyeYosR+UEzWgvIclyM2BZOSku5FTE14tvodxS1+T11zr0NpS2+QtgBhkLkfpl9YCDfal4kwQnMDlZr9F4rRI+jRoSrxxfKlcitQwQbUOb8j0lbvspDZ1aWS6s7oQjs8HE4ayUkSOpABFc3JR8n4HoHogpE+iQ+kZeAKOdATRTd/JVgrvc8ls69JyIcMd3hiM9R0V5bnFfGtFlVEaP2Ao9Y6bO2KUD/sJvnM9RPKn1QNsFwIuMxtYZKl+ATMnQfo50RWGHUeQqqELYRgBzx4vfwWOocEwh0P15l7C5bOtX2xtMXpnJjQWNKarkOllXabW8L8pOD3szIvaIcTicZQ0guOl8mBDkHBBWPPU1NrnhcE+8aGU9JqhnMK7IlmIo5kFlsFZAseT7QIikvAcWHPMYoQ5kfWQVCylNmWj+PjOyR6voONlVUAZFNIUPsqrmFgfoU2SPDu6mxA9O6jPXoj6WuebZQv0ZJIld+Su7cec/99nSmjX7khohKbmAxM77SyagHyutDnI+yRLYG9i85LiapMRr6kXRJStm1k5RYMBwaAaMtY+nd/rRgeXrYgp6FyOxzuPS269Rv1qnX20lu6KPIb8+k6MRYLavLzxkzf3RioNiL0Q3kbVB56Gy610nIcKm9m1p/7OHdXjr+NTRyfrOxKruyGWEdMJut45du6LuibK9+7cl901PiWPXlAjE3yto22tWh0bk/ePiin4c+lmpbSS2LjDlqqlgxYDHUuxWH0kKLNaO/gcutMv1U5tYpIF+qot6iQ0Iylpx22PYgfDbqQ7AsPgFsUHXDUfjfO1JT9s1wiVaeeyXSKl8sQww+W1Q5PdS7kG1EF1MIag/Vf9Tpqy2mhKWxO60GhUHF8QW7x4zHdhH4j5I4E3F1zJhf2rVxJuJUlS+Y7pDT8IMatVn3ZARE26rjK0pjpzUuQzCTuCrGwmJSE89U3fdKL3Y2l8Azu++YQcbtqNuEwbglHfsC7G8L2dhlhE1qJQncE55kBlvlVjuVNC+pTCpUOJbzkoRma+z2+0Di2JRNGneq7P9kA5xLS5b9DmeThOIQLTXWrhgMPwcNdsEgUzRrfZUINHrLbXRkXOPDWBxPlDnZnED+Yi83dQl3zFIIawMnhOwP30JzxSdaH+iSf13jwwiH6CB0ENLyBjbgQHPqG/SYIiF7RhM3genAAfceDDkwbbrn9z++mSRHINWd7X5aZWqxKPYx/9LFB/8cGKaSy+Er9pJJi+/6/CA0x2f0x2e8T0iWa3JEDvk8TCQLUnTWj2ew77pEVnTPQHSjQOeEbGVGasAD7rF0uyMjgs7vSh101I6of83mXSCvO+ehywCrHT0vNXCUIKfJdETtbyL4oOt238pFkavCa9tiVKhnDH1fF1qqOM5RrVnTUGET5k8ruI3REX5dy5wzXnL4fs2drRQ4Kt0/VJSHQD4DuB5XCbSJts5WZCKv3PkCCT41er+MYnM55B7iD3P3YfichUAc7s5qDZO7z6ih2lAfNZHmc0XdA7dPwjtX6LnVUHFpLI70jxDxJWnRIjJAE65x+7YS919z4opjtlSxdLyKIUh82n9cLWH9FoH3sO+SP1vwX1JgHFggaM5HTWN86kPY1Nn1bjF3NzzMsWPAF9VEfOhf6WTHNfbzT76omLRnGMWwBKytZ+1PfRb8RMRrf1Na21PCrDlXlXFU0hGgfcTCNEqUeX92TGtpR+LKSGo3YRnoUT5IVnV8tP0PVfw7lhzccMrw7jvz0E31DdJ+zLx20uU47EOAz+S7QfPY9lSMiuQ05oFZEV4MWM1T9McDgsp6k5LInSpEuX+eO5u6RNN5BPRIhYDwRCs3jwhACHh+5Rc2alL9lS0FSstYA97Yet42fVSLKlmRLbgHsSahl3mBZ1UnIYnkrtkZAb61dPKTMQafdW/YhxMrZBC4uUrHXcXfKHvh9CjHisIVkeY3EEboKXeP+A2lhGThQMjEtKqSbQorpxoVFDGNmUVJMYnwYC1s4I3MMkbuJmMg1e8CJhSLgm2F9oDSVsATedAwPTvL8J+61FShXi2zUSgtJE5cu6fO5I07yZCjv/87Tf1bW4c3Q+JDGHe7f63G/Naal0Fw9XzIwDOsCwk1w42ZUzx12oh65zf4OxNlLGKdzP19YjD+hTGtbkq9nhp/BdURQCwhh2lIkL8v1i72BLEcMzUUOtJTcawXwNaohZnLwR6EIIqZD0UGopQ8JDJuTLIqeMjHU0is4+zLJa8LrRVI4694enHWRZJmwvAInRs3uVWQ/jww1HqQ5w7LHXv8yDgNmj5SXZY+EhRuHhQWmbw/wtscv+66j9QcGjY1rPCtdvEHeq0veJXoT/MNHyDM+LZePvOOX2+3sUtgxlj9tkaiw+m2ovcElxYj61/dt7u/oqI6Xb33/s6AUnEfayr/7cVuymUYO4FNp4iLsRnO7sJso5HfIOJ/QdXTpbsY5wWMxgohoNMOjBz/fcHngBeEqXWGOe80KWax1/eqZX0sbwFPfp59N3atbPY68cfIeLb9tMnFx7bBHvW4Hbt67QC+KdLMMuBzaCYmyDyrhOk1S8cESZoXPVOlwPLN0h3RzhGkFXSLU9nPuAYYIJPg6smwwKmbNShtd88velfUNC+Avf9Vx5O4R2no4G8mcJRGE3qW6wdrXndAM5C0drYgiEIgxBA6LP+VtcShjccjqMpFAr6XcQkKqvrTWDh22lxJJIod++Ig9dvGx34o18hyCHe786MoQv5zZx2nYBByZC81aepAx0bxRE23abmv70VCqZGt0jy0dyRJkSs1qterd/J6okUcYeHPtaMlofSj4Pyt1e1KjgyhTAdi9uMg21lYMdk2GLcq3NzX6Nkq0mZ6oJd2/7O4EKGdINtGRMMKlp6tvp8HKsFUOfQwmLuJ+weEGjizeXlv2kxGF8tNrnqKxrixckoCIS5XKoRRai65XbVX9dyR2DOOLytU214ijb6isLLK210Bp6ImxA8xZx3y2wSILKKbQnFnF/Ds/DjKh/XUl7SUKDR06giPRlMlAnZ1l7Gsw3fd9msHJNfpjq1lDB/jSf28YK19vr7h86SmVvv/kITGS58triammhVXwEPdFX0E9W6/6oIFnKGEmGeGn7/KxhvjkTD3ehk3AkUog+9ESePJ1lk3Kx7orUZ8PeGe+Vp4ZqgufRiW+94Hv5dyB6IIaDWp1rRNez7z/XvB5jQrwoLpcYEhsjFCNtuzZBxznlZNcbdnPp8DJ9yP4k+cFfCRD60Djss/H1880VXOHZF/e95oRTpT8DxRT7fwslZlWHdyCKX/eO+Y/Z1omLJ+xvFOo6TduifWs5oEaso/Cw4xNgS4yjZZJjng/t05jETb2ckl0pWWdUfc+XSw26iW8mOgI4QAJzN3ZbPoNbONqCZFInF/CSNQVZS3rvw/To3xDOJlO3PKNpVUEq4xbE9wn9aBIiZdCcTMibujfSy8O1f5MGCNM7KBO+DWt0iY1QuV8FuSS1SJAyU9Nv7IJgxlAnRrOST+X7nc8Sg2DWUPNjochKWqR6MQFOR/N0DpQv+yCR59hu55XX2hQ3emVdXpnzq+C+sfyP8fUdb+dJ+kle3c5rHN6bj09q3ZpkJKcRO71DqnmvdeDNcOCcOPHmkyNaGae1oMPOHocFUDZBGv3NmYXUWnBqLWyekUaQ8oFCe/KIXpVm5bfAd3cJPE/uH8dTQriIC/iRIPXO7LN1gA6ajaw7tz0BUyAT2O6yrfpeHW55WXzE2hABcdNVrPMxiG1r7TCYDpEjxrOna+fD9gcIYTDNKFqH4dBjpyvszmObzpmNUEKqcanZ0Vl4s9d2MVhcgP1GC8mVZIiadQN9NbEuVlXEtP3sv/7I+QNKX0vYVNDLUlFBrJ19a2sNj4AeredXUGel89Z1IFfhp+zwS06xAVczpwLWv52NTXz7XJ5DcCSgP/dUtAnylQ/KCRyqtrGyUqQk5oXBOz3jJmAlk9PxidOfyyvPkH3iFJrQKGRw5Vm55AN5AId41IWgZ3DDxdHhKMu/47aAOd4TfPE2yUOAo0I23ikLOiCNVLLjIOWT89wM6eXy0SlsNAm//CZtIGMOQf1tQrNqmCW7FcAqPhLcMbLAub/bo14vH6A9J9hoDI6sYw8o/5KLlSpCh8GzrVdNtcyIyj/aRYU+/CF6vhebJk3ZiHI74/wjuWFt3TF5dSX1WckJgQbOryZvj3tPre4ob0kb3DvIJszbrZp5R4rn6vLPUu//36KebM8FcDxAkZ3mYJBACd8uUS0kJ+zymYdQAEulxjPK8EqQf+PC0FvKoIHe/ahS1zeMFpnhY9YNvoka3O7k6V4SDpj52vttZuxxpx4IgtFqMhUDmOLZAXCe/c+PDY5HoOLVPt3Bt/XEtLo0RyORyLn6f9Lc0HE9jGQXx3vajcyD79C+AS2mViN0olL1cb/+EIJoDFm6Jv85Cqze6eBfCqSwQrCnlye+Sml/N3IQ7UmlZ7PquEB7qnahLaEuAIwXv+i/yl7sAASl5DQWo/jhuxew7e2SGyow6hJrLZ2L//GxjLmLN1LAx8PMdB7L+rwKgCyhMMqljKfLNOwZ/70zXp1J15mj17+YwPegEVG9Vnf5FiPcHr5hJUoChjs6v4m6zZJIDREGl4ZDi0bjbwGzIDkFxPlcv33xJD52pvkJzrUZjlv4WeH73v+FYaiye8D/z/8P2wNcoFtT4MFTww4dmqyjL48jd9/s7TnuPjTQzqdSqQxGV/lPDMDMHUJFD5RMFdmBssrBysFYaUcROErMjhdeWpN+L8BZ2lZ0Pgf6e+/yM7h/fz/BjBTNPN+/vduTOLGwrjUx2O30j8NNIFfFhWWFpbkvyxq8Q/E3DLUaoUiZRmZU8oQH+6qt2IzCFieiE9Vi/C3kEQZe531A+t1BbpsB3Erm00YL+z7tG2w/ri1IhAceG+k+5iAJuwb6T5U9K3Qumtx/u1RWk4/92inyXdWxbf+/+4ohlYi8yB+7qvjAQLWIlRBNM6q/6N7543+nzdBy8aPNMyQXvN7RghDl/weKQWil91IBYzspfLve93CHrirzAJLNlfLTsgTwxQi+peXq2sFX1QIPLhih1A6HVcwnA8D/NdQaC4hQPyytYgatYOjtOpgK/LS468fI0WERGi6GRysCRgP1oT9HXDEgHBwMbxYlrVJls6k7EQ8RC+mVZiv4B/DT2tXwwISz8Sjlf7xHLqpV7kNMgedVZef5y11z70oKpkb6y6rJscRLVkwlTQSU8d+ZOzTF5ycslhaPo4kJynQeLRJ/P7VpkozpV30Lm2iyVW3YIXC7UJRuW4XZUS5RXoxJqxoe6Nk+o3EF56vb8RwjYTd2HpwgHBDtfUOPkzEP+Yj7ynI9242cBTg7sXrDvt0xGZbaaWy9/5IVw46UPlirYL1M12ahvzE77ZZiY4fOrUSNRokEPKiura73Z/ZdRBFV/VIDnvePfKiQz7EAXC5Ez7EE9/LSs68vm/UimvhBdLt0qBCl0uauf3eHys4/M6MtHS2mZO31DP7oqhkdqynrPJaRv4I3zUxSckjC2YFjchUsR85mcHBBr8jwctyt363BcUVvgCQGErOIxeAbAHr9Trh5R/snzs0QWIheLHfUNFsZQRnbClu87KfRmOF5Qwx+/shpsj9qpiXC5yzyX+9HooKh8xne+/2tps7RYVMz6Z/ZzlxMS+V4gwkULT4woeh6OovI1IOihvjSaf+TEdEf6Z06rdxI+7+3ofwgqG87MoVTY8Kz2kdYWYP/HkXIKdrpDyJKNPlvFsLKCTtZCygl+ntXCYs72B33mnOOzFdgXv+8p75AEta3o4HwQd/eq+qRQtptesyA0a13YXlLyeZ89uRKjkkaf1IIcHLiXXx6MBqO/nmNuWLhXrPlYqLEblfsV+hpZir2j9e1mM7CJJXba9bOJJ+75lBNfasx5yznb8w6F17bk4fNpwEGqGJXUJP0Z+jl+2zGBJjEnTbrJbJE9uMaA4Mael+uof3wUm75rDTrSOeJw/KX5C8w2PwvQEdCH25FLLb4bFb9n3J4Tu9ybZU6T99jd9mt8zfzslfsfUGf+AT8BnU2x0ifGUw3t9Rbh/Ur5xGHO0c7YRXnlsamu2G/33n+t/HLWS9c8sDhIFiG5s8Oe0aHsfjam3rP0d20IYVo2btN8S+H3EUPOX8Qw3xjYhK0ukRKXS60NR3ebq5H/1HBQxRQ55MUXWk19LUlBwfMeqyGWpMKpPb8NvIOe7LwlMf43H5rkpeV49n+vObcdECnhTMoCQfFmlIaW8k4VMiHX7054kbQntdDbvEPkIyy8yo8HiTXIQlFGQpU/Kz7+fgbgXWgOugpkjYFZHsvjdau/ghbVIwXXakSqhsW1sDlOd9XdVXuusHZP++zsZ01lC7YgZJ+Ydnvfrb9iJnTpu34wSZWDs6mWcU8HVw+Ql5qvdkqUJ7CZgj/rnnpqI6191bYdAIiS9jtu7vwOzeREpalu1zpkyne+Afgul5m9bFaT0bhjAnOzPg60/PcU58TXe9T6yPTBCNpGHS/pY8HS9ji7WfUxnDqI09/0lLi/UIEzQAq58AONFXKcXFzt6nHT4kHJKk1qaSEsnk1ObYJC//tpDdFDNRE3U2Ej5h55dyw6h+WozlyhneEC1e14vZrYoB3IMtJxF5m4ih3rQgt7c9lKltAi3B5mIBSmE8cuF+8TQmLu/aLwsqKOLGGufUf0CX1S8pnfptzXE0+67awygtArRKEo0sBmga9+5MqOy6HZ/fD8z2x6cNnT76N/tkWbBOlI1kiPpycXf1bJeapY44LxkVI+WL0oMCQkh5CMX5eaPUcdsl3dTnfvt8JuyY/RNLgicSX7d4mw1rMr8lixYjt7zgZU4VtNU+6Qi2fywWCLT6o5svfHbCrfxtPOWo1g6vdPLGmIKD9JfRSJGe4XfRYogJMkupJVtT/nqa+p1o6GS6V2OT6j7zmu4XI8sZCq//XCR8+N2d1/nh/fZee5t9iQ4EcRvdFdICckubD/ijHrWMZw1y6qX1DYQFonUs/G3JtUlUnqSDIbzGfuNtBZ6jB/nxGfEF8VGeoCMzjBpus71z8Z+W3LiaxLb4hHwwHraYD06Iu8I7X0p+1wBT4iSvql/cA3ee4VXWRN143P09X5fmjwCXieR5HoxrHrjidqYr9K8ZeeP1TK1Z552K2zalisvp3pA/Z9GGm+nyB903sYCeu9+uAb1cwGU1GhLFzWxASSAZyhKtSbPFQJuXDRXYFpHqvyvq4nVSJbDONKmC9yzD2GSagK6RpMwX3ODvIPoOSgZdogg14OYItgim2wV4mYAffVI/dyMgg0IMgnp0Z4FBgfRWAe5nZoPtye1QIPuOQOxOoKGDvNauKf70Mcn9eqdI0BmPYqDIcgEmtK0wo5AgpxbgV/1UYAbtwC+ttwpw/g8/N5fyoTNng3/7e/ZhKWDdAPCVlUa27WI6PkVC/8g5hHhV9HAeGpUxvUAcXOVcjSiRRVy+1wOBaJuUPo1F5qJBO5nlbE4ngFF7j0D9gt6KeEI8HotP/GOGYCDvad98GvJ9nvA+13kW/PjFs7B0K0H+9I2fwMgHv92nfIxhptLALRxEWX6vUgkEn9AMfkCASytVwjqxmcFxw7pvv8a+7iJ0ma7/EJu6iBkZFP0I++4d4Z0p0dlBSvCpb5Oqmk+3guzTfmPOtaRKGpIYoJWjd+iEWNryFDKJfzGXnNq455SAzSsDaAJEssvQ9fcDinux79D3Tv2l+82vBHw5x0CIDSrOewARadiRcnx5B7bDPPPqow2kYYBJM9iuafz0c+xzuY0ej1lgxiNsGln+MuaaxwQgaEHWqyoysfwGfJVW24awrl/lvOgLIQPYngGVS4696gYB2GNWaN4hPj9IbqAdvYfLkKZIGssHeqvjmtdp2fAjeD9dGs4kxoj/KDySMkEkzHZvocalbQ2QSfh8M7DIZN+BYndNfqq2nzqzl1f4/G2HR8w2/ddjdnvtLLPbBH+1clBSh5FOgXCDCxAJsgrCT5mn1+hJqHGJLjR+t11iJG7OZ31O5EMuQaM+rz6nPdDYfRl759ln5ODsDTdk1DBfBTaijZajUzEC0nXYAZ+5mik76mPAAKHxw57hWY6n7ccGc6nTZ4AW0lOGHa4iVHVjc9xDLxDlNCF4kE05v6ogvDJEssgIDt3yvP7gxNoyR/8JYlfiYlyccPG1H4YDcwspCx4Ox9YPuIQmgjrpll/MieljJO992jvtw/c1hza5tYYTEMjT2iED8j220Cr4urjoHbyVS5i9uEUz+rcpgVWXwawpvkMhFxF1KUW1SsmNdAdx74zsm+7mf6/OaiOKBd+1z8Kky2YZcbundXlO5/tG4cVs6JrTTyaFasX3WVR4av48lzFJc3h1mDXMNi+ETbemmfoq5/oakr+mmTuJT5fxfund06+GExqJq+5hM6Qp4nJAG1uXGxhZPG8V4CGZh3qdLIJo24pDBsSGIDrBwlkUSTG2ANsOuSWDBK/B8YYlC7rToo3+dVZwFTOY3c93KOQCqj4VUqeIk8/s+QBntF24mqs77c9oI6JernDge9MWgmx+ib66yz5RV5gQ4i24cXeYEhjZfjhEs3g0M3u+j2u/3Azix+rq/Q+6crK+IDHYm3mDZYQG4C75qI9u4XBq6vz926VsB+zV1Dq8hhJ3pp2UDNq99X4T+3MrpEQdJGNjXt7L29n6Zi7C6yE72OUrEEYWvp2tEMkHUj4DqyvfLvGzUfapqnAlorDwSbjg5FMTNUwBwvTQcIDMNMNEnUG5svmBEGT27WYNwyO0UO/oi5jkc1ILrwQtU8FxxeBTEEbNUiAD9CuQYaCIus/kPg14q9iugWzAJN9QvR4h+SapPEFmCps/ey3+WhMmhL8vIRf34tgSWvj8x38SpJFuROjNw0VcqGlOl2HilHW4tQAkabEID1DsQHqAMvMDZtdZlhSWeSADBn/mbM8El1TBOjQqNZ2CS8OZyWG1jRazy/UV+BB93D/VUmhMNuNT2EykMA467JpPD2RaFYrVTzrMRJphcWbvAWmAt5YOizPAqb6geH0MhgS/DyqqMaczCFSWtORj37Dgnn9XDzfn/DWzZRkVXNLu+lhEook6/hktXb2O02H0yp4Cm1MxtkZntbnV9mqHK88m8leGHtaA/j/atpWa0OykVDYrMUHCT1/Lcln3zGy5432uKVvIeAtY3bfmltAYPAn3nzSJxRvfxpzKQyk292RMz2pDQK5qKZQB5SuQYafE+0yYGcBXw3oJyEJITlE9peDmfuKpvtD1HRP+H/kVhDZysLTf+EmIehtoPLAUUwD2ALAayDLfZHKYBvzVLLNAHPJ9EzgOgdsGiHFyR8KKoyJXfNtkYMcC0V68oQK+cINl5vvMrm01g6zBgd4S+dZSHKIefx04sBr+lLALwmg0cjpnMLSq9QajdKrJjTreDvwngrf9kT+PCSJjszty6Ns1JXYwLnorNmeaGAefaYXneANs5aHpQIR+HiGZYa2lteoDd6+Ph4/YbIcpEfwfDmVnjKq21HD3RKg2gCt8PyvjHw39NAwLKOKATWUig4MXSTXJPMRC6140FS99k7UCS9KN7Fdm9LnCLWA5oF8BDwMl5vtMbhxIh4Gb9tPnHkZXXU5ezlvMqCOlApxyYLph4nEmygyLB1sPSAu8u3Vc/fKKVvQI6XJHnrTtUAtVtioXoZvvJ0nfQHq5F3x87d4HvVg/a11dZkNZQ15OXFr4WBc2wu8PWkBCCMybuA/0+xl5R47/vNZEqrU+MClUgBXmxUkgrWCJtacrpjm7fKdg+Pex96axO5r2wNwrvbMmGWdAAgu9s6YZhcD18mrVykAIegw9FCjXKvFDgcqV0MLLEjuCBWqVYccDNY51T7TYqgouX6PnYLlqHY+n1mWETemSattPBFd1zsXp13bMhlW2z6bEEIqV8uDi3/lYBVGjC4pPiuhHq3eu6TwRBi0rDDtnDrvZFEt2LxgKl4F/v3BGQ+y5s9hYPGwwi8C/A7KqWClXUGy1kH7yFdRDdg46bVz/R2zWG+mvZyGLTnLeKtoq4q1eEac05wyH3qU0oR5fFRY41epPZADgn1ZH9ZTEWGO8ePhpXnf0x0FUnrhtSw2Tgw3qgIFqrb6R27o970KR7N4vwXIaus8z8qA5WZlp0PwMvCUh+QbtOGCOVhsCZHN3DO6ehfeD0BH+6+6g5iwAV3vy+Wpm/tP1qv++x/4W8zGHw3zUYuQoMiq3LNL4zxZ3Io4POu7X3xx4cSeqbKrqfYd1+yzJ9zuYDoUeOsGvD1FtKTNBmSLqm1QV/9ypJPE3qO8k/2VDl+Ru7Agw1XWAMdxNUjlEsawctS4Jn6uS2H+AJN7EHeoS7/U3N81SrLNMhTQvsmqDLA7bHuk4OBNv4D6YDHrnYr0kViPILwDJ5AK5Ihjqcb7wWLkohyzy1YvijZTA7tMF/GP9KiOljEPMIfkY/SZk6tsGeatFlKkSVQ2Ku+2+m8JFGwQ94DX42je/z43o/3cj10POkD30pzxhPpvrbeto+LQNi8qy3XG5wzyNCgprBoWnViSJ5KheBQeM2lTcQBPLJwiDrvlryWORQq3fqmTgxmMFeIUQN52ccTT9RYTWtsAK20FIIQQaDo18rPrw8zb1uFFb0TGJVdOL38vRkMM/tNjaud+7AElNTpxlIB1sHM5L0/ZJV/BGVJJIZKi4o+f7BpCzZkY9wRXNPyok5Ttu3t68i50fGluuNHhcdlK+L5qVVr5UzpDHL9+pr090wBgiaJm2cwlHe2ombTJFvxEfDoTH0mfn1XrgvYtzGaMfRd6rffJRcDx9el7Vh/AtzqeNHwrMf2jwfeJpHkuOVfLGKarirR7657Ub9xk0VYlmD8OTBrXJimfulUPRCZrHsMkVRYdZGjUA4cOOpheFbK+0t6wE41FyCQKVz1G2SCXbsW2Ix6S88QcbSIJYgW9kZdT6O1HEdXxIT2JuPhKF4KMLw1DjMip9AtN6je0IT+V86hvIgqh7cFR+rjbkiGvvIT2WV4nkowrBWU6/LFw9jTXwCFBizUoKM0NG+76t5ioCFFBzw/1dk1xS/bZtL7TfGtB9S/vFQNiLsRsSGNOLm/FLDMh7f80EUDIyv0jKzXT7kA+03pqX43v59kKvkosNz7JxhFvNDBFZ6XUVV7tGWvGtd1Km0UF0xMMdLx1/SyKlD1r8o4RvHW8l4a+kN5KQ5Kiglum0EafyKh6bX92lBoneweGUOySUCgOymCydCzVAGlAQklR+MUlm9pv/94Asgr4PCkcoXjPikol7MpBZm8p5CfZ49kRIg+L3p2W5ydn04/T3+fgeCHqeFhtmr+bl2565EmJy6v/D+Gn9IWjZkyqonhWVguIJyA6yI/0PTsH3hLWoxtoX7AuWTZ+2Zaz2rQDGv+1/i0L+Ed+Kwl+Jb/6vJSGrbFn8yeH3PWoJK/cx8F3uvRsPZKYT5RBSmVzLkwd0TC8M68juQ0Ux1k4PyRlbV1sXbJYXCoECnkYIFJJENHBy/b3x6juyp7ixpLHXtRCpo8pNteluictJozEidcty9+j1t8TvTJMTNXzh7ivpKunq4/7x8oV/XZh1uIeBK/zvkjiOKCTw1RauJ87LNBIXo171GIy8vGy5ukROpFdlVk3wEJ1/ub5svs6jGVVT17jJYfsXjHu9N0zs8bexa4wD2E1TUJEJKLlGzLcKa4EFt8V0KsMpGBScAu2KAQaWdyUml+UJ6RAPEjfqH0ZCM0ocv/dO/DWf24P1vxisqjTnNdA3KRj0BWUTNxu63xd/MKEJeCxyKSkU/iGtyVrIYXG5JNExpSR4tv6V5Pn49hxkFLkQKbepymznvOc5oefLFHJr7QISMrYzN/L8K4lDvDfsykvy1bW136TPO4o7nRsuYtczkoadT2R4sPgyIDzoHwwDDMA83s0yUqfxofFLtOqX2jXJ1OTOS3Ad8hYIaHuoVeUN57POc5MHAlmK9FM/VvLKn95HLnuM37+Bu8d78cQzxAQs4dvMN5XTwWNZsijI2+4CBRXJtSu2BXk6FvDVXfP9yq3Fzg0Rv/5146h9DET9tP5VUElfPC0RO54qwIwoANE4F/yPbf/n/f+PgxSQEZFYUhFW3MvZNYyl/h6NN3B9CvlpfNkiwtnmT2Ic7hfx5tn2T9gk7gy2sFUaNVdRzu/4g+eFMXPleudsn4wC1HF1wP7y5RHHZcfvA9aXk4es89e9AQFPteFBX1eP/z1PjeF+N5oqEn2LzNyhlM5nO00ajpNKooF/6SOXy8OMzTMjBQQ81LLQnrmBvpHVyfrduiRiyTZkn2Q+XLEIDJfsR4bZFtlq3b7Qd/zlixV5M6YS14KTZ0s6Shz+iy1J8vD6tjCxuQu/nESRQb2zpSh69nXdzOPNHFzor7XlNLO2iVlY2WptRqTFwNqnBVBnCfUjjpz+dCfgpg1Xyudx1fybThGSbUQ2Tyy1NT2WMBukTwIMkyvKh0r2DtKHG2b26CHysLIKeB6x/4fIzVvRbD3ONvukck/Ph0v1vQEW2mpqe2xbFrTJqqLtDqPURMU9NgPBWFG432iUsgHF1299LEhGuHNHxmLm/5BFRHInM5Nx4JBDFaOm4QVmOSeXzLgVUbe84vyaThKscvwrcL0W9u0iiOqt4gh+rDCDTM/Huu4Dwqd4AJaDTtFBBrf/PHu6sr+YlHOVUvnLWcjP58+5dU5ETZU4RL0iqXzMefvx2uyF1lLh1o8OVrmX1VsN5V4ty9CqvY2Edn/ca5t8vznjJp/iZMj5dF3u9drzrERteksvbOVNR3mHTECGcbHM+L5xJdxgj7lOERnpLTMYZkdzgqd0Es/Lp6B7NTRQ+HwznOd5oe9+DGgAjL/Zf7MJ3+r7+bam78ujP5ESgQPc7OLts9EkY8KG3+nMvg/NwLEu3r9+497qwZOjV6z4H+2JCxiN+UxX6WN/ZYm1JJ7gHdqIGJYfHkZMtnt9STi2v/eh5IuSkXHMgq9dKpGrhQSsmFOz46ZEV2Fh3krvwPDiC0gTcsFObBSKBCIcgcNs23lZYr40v+ht+4vRj92RwCdnZQJ+sV8JZzKBuf/gb2Ni2nU6V3tN+v8tevrH66mpn69FwFDsNtVB8gxsgBqYus2wgV0TgqhjX8CfoEBkdKhTZBBGGDyR8QWVKXah9y+s+y8uTYCoi4B+u9QNW+3+pgrFE759Nb43Dqib2P0jdtgR+77Lt7X4dk6U21ZEVkTZtQunOS97QFBexr6993Fg4PXHKYu7e4cDg6+OFqZj1L0Cnrq3hlOt6eHzVT3VeWF331RjNo8sHkoSqaHDCmYXW2p6+1sCqq7U1N76gysZK3HrxYrAdjmWmg5JZlu5C+bk4phbRiIdmSrQMuVMAWu8s8YQLywhU5VEFEdMWkBCs+d7i9um26oesppxqUwOXqZ8fKm/vXi7vUBKxp614xFJblnuF/yXb4RSjhBj6WJZ5967v66HVG0JnDvdx3bri6XRE3UuJ20HcFVz012tW+ttTa9+46ditcdpFJFHomVZeAhJQakbd6Op1B/pmJhLO4qZHo3dI6Y5xWRVxqy8L0eyxiKuYzdud2R0VgbDi+hye77e5zHWVOUcgHA8JR8oU8uQSZfV+QXqMpPN2GdSF8BtWmGJJBdoxbjD4T4eMWzJoSgXZOOUc3LxD7LBlAexuzNhcpnpr4ntvSSYCZVqgQX59rU+CFh7Xr/MRZXIzCNvKfLiG53/Ov1GhI+fxY7WXnRFmLgVqfgepfe2p4qwaWsZrWxoSgF1Kxmz6P8AZ645vKWqcqQrxjk+W5H6EK/KBUP1ixHyWMW9CK4f3JSPiQrgUurofKgCThNVRJPMq1/OhAtMz0YVrLuXoJpg8A2Jx0ZVtx3KCx/TN2NeannGyF0iZEOj5Zhh+z0V6mSxZC/c4TusyvOmeEHaRRbcaD0SI2F8MRbD48ORAj4DnXb6zsZx7m2H2bacpTubOzuCDLw0p/R5OSyortryXkZtfVJyfX3G68y62kTiP5gqM8ywIhgEZ8d63wQvgkIxIkYe8Iy+aetda+3W9ZTJhY+PWxWamC6yd/HI6aCmhh6DQi1Pzz8+urjQ4sqtZxbz5WsNqhWTZKKoS0lBiI1dkjQmlySF0/+kqaZsoanYUtRESRVy6/PEE+/2N3Z+GFhosjRomESVhsPS6Ih0g27DBQOJBANhO5CJXDEEYydwjN6/3D0tK/uUrLD+MuEZWeMj71MF5yfVzReCdsnuWVpMNz5Y6m3dWhoPqJgS79QL1A9F3v+y/3TibB8/F+XudhPZuqur7P1CuaePc5fBu5lNljUZdfIGMkfrtoT1b+2fUo2O/WK9WP3yn93S8m2CsW32jQcnkvwOXqjvEEDGY/F31k/xn2s8JnS8am0cyWPWM+Mms13SebzVg9sbTc1bq0MbpRJLtmW1AnFZvXDJ+sQu6sqgA7gPoBxA6Ce8oAMS+gkM8NwW1DcQ2v988xBDuoR6Iw+P0LkCQH1AuoYfwH1DSY7oKDkJCr1gBHcfUDNfBfjiFHNTXp5PsYoadcur4aIUkG+Be5RfGgAPuQagg6Gwu1IybMI6DQrI/DCcHZMVTo23qbNeHXETzd/2Ar4mYHrE9yDxdxBFyC/kkJ8/1jCaAu2EZVFfAOEIPwhHvQaEXXMkblMskER39SECUUKlhi9KqKfhRxJ5dDhCN+lwX0KrlIdWAB1FOqAjzwAdSSPFRvUozLlGZ6mew1LrskiMdKalf0emPBK7E4cH9NViPVZNMKglmLgOW7NPYU267PQ/4JX5BBS4JbNR63ahC3f9HsREM0nyEoj1Vv0JihcqFISbsNV9pDVh6ju8jaU2w4g7YBo8GkyDx4BpcC1nLQ7fQozWih0ErPuPhDYp/RoQsIt8dXZM8HvBc6hQSGh5tlh4HRi+AwqpjZovQaGH241HxwzAkCi+E5+dMnj2PS0/J1+4lq0aww/W3R5TGQ+HaUQYsstbd/OhoGcRKFLB+7LQvVyGLlag3QRJpPeUJv6xhDnohFchRn4RDzr9+9unVeFgDowx0eO6utGZFlgVjRpS2gaP1TAGOSsJDixqQI/f2zKNkKEYHA090c6Hw9AL1OM/7PUdSCLid1MTZHqQYQgJ9VIzYUP65Hb6nfexXrvXdJH8X8i43CnZszRsXorpftmqUB+IGg2/kja0ZRX9DeIM6uDrJFx2kNCIE9IE1BkwQBj4XrHqohNJYyEb+nV6mPasdpHooMpi95FRVlRln6H7S6UYg5eM4anjMWcahbozTjUMRVpvoFY+CYspbV1XSWcv0VitnakkvtJlqZfOBFGwkbhKWdMBTUpuQuJrId6AyT3PYWlL+9GUIolVVXVhC6bh3WAoUS4uCZjyF1pmPB4wmmxIqgaKpA2WqnbBIpKL0kIbLFLIPYjSIgUsgu+RjGKps9VoKX6hjIgAS34dK2pMD5t2r5oeEMOjIbLBMrgDyRoUcmilnu02kNWv7GVcGhVTm9CFPS8eQhV7FBmh/S0bFtxZo3uXAujIsrPGbc9XG48EXzQbsssYI64RDzgNaMRVga2KBgagIS6EvA+EvXn3CKlvoKiossKC27HVuyqzDdDZvIOkNImSe7Zo738CcmaFFZRGoL1fQQmThQfY929PvHdZsFf3QMDTBLWRjTY7DZLiEnOXgZnh0pvakhLGBBUzkS1zI0j9FUsyc1LGu8ZZ4kd+76xLBVLwoAeCB6edO/JTMbL4nh12xrdD3t6R16aZnhIBEDzTw744OTUNIPizYbsRmISywheAwmITJKJeTIpcEBhTcpmIrSu8Du/Yhi6Vnu//qqiulVpqq6u+BhpqxK9lWoitHlsTJ1sS1sqpoG00zSOnHPZB7UnylWMh1tZ/lr5JbX14+K2fUwK87pRM+el4Fhgr6roNLGjq3RzybIiuPs1qydKfXvYaTZxMP0Tdsdkjv9l3ZB06UxlU7nSdTLQtlwgb2YyiOu/R6iayvur9NmjiBEQSNXF/gvsNte4FzZiBrpr47/Vc3UJ3TLqqdj/u/bp0IAn+9EAOmHIkRqfgIr0/SCoFuU0iAvaccPwNFtCrU/bJAZ8Msx/PuNTOAm/tg+bnoP0CnzlN5gjQkKwL04Z3d+qROXk3mgbWJMBt0M8fTsEN22PmyeV+zT92bzCoLtE4607JPoXcmPTukESlJKazm+Hcbjia8f+hcKIpSk/45MbOkRAnRvGreEN8mqXD8U1aKK+Jk0UUq/QDtxXsUQRaRQr6gWgM28C1ok0uqIzpgq1scl/8eUL5lfyXUdobsMfDzL+2oGePabetLx4UitNHQ6MW9CHNa1fFKv9c+PlHCHH4lf8srP1kpMt43pYTa4xqlr4QzmMNXf9BXnwor/z4eBVYOhA/en2H7znUVEDXci60L5SsdNAl7p3Uuddq7HLWEw/o8XzFdKiWQWiaqIDw5UdsVRcxrKJ+f4OB5fRxA9PQlYS1/rBc+YW88vPzuwrWBqqB83WdNw1UhFmd72y6WEJFr5iu51EyS38Q9kRaNROE1WEXLFzlj674JNn0HVDc67BNQfGXwGhTEpTX6SI4cX7TrRmo6D1hCczN9w7cEMLV5SfjYifTN5e7HboodOoccNrv6XGGSv+Y0vytgKmVz7mrfTz3Xpc7sf6tVJu9NV6DoEsEWkPzbcFKTJ9v/7Vgjf4BBqn+byMSYoPJQUcPiVLE6OQf8lpkVHiEJUbEXCM5RMK6kYxRkFE9hPXQbKQwMj60hAAm78pm0NwYXCLxcPXgfIX6W5ApUsKos/RvQ1kaSRnxYDR5B8jG0pdlMqOlt7naWMIyweGS23x1N4x3rmaze4Mo4qpm/wr5QIuhCR88rjFNbySPTnu62p+vaZNMuPaExnVdYbp4/SkUzONwVehHYgOKZ2DV0KKAVXPJV4D1VlChjl9HA3NgCy/QqW51p2jXhSvohDehQn7hCTrhLaDIL1xBJ7zJNfILV9AJb3KC/Pi4GEDj3lsyjwHC0fgHF7vGUd9y2dBxC0QGpPyg5SQwVjY9WIfprjzrq8wGLw+3VYPzwhrtgOoLDJiGD6NEifD1DoV1OS35KAgvfWnQP630YVe8hAaVU0oe9jV0w9jNzaa4QWhUYDZBD3atKS+Mp5BGyMS4tg5OwoyEUVDIiDYmtMHArnuLmQyrcIrl2NCaVBFzjTQIzQ1YtTeGddIMsN1K2ymBdS3PKtI0rLBhTVpkiQOEG+/gU9gZ++FbiVFTOcZD1KJzRQM/Fk7IET6aDDWVXXtQi1o+DKaXe/oqGPAHVFAUlcKLg3Y+ptfD2PCiYQADNl5c4zHYsDPgVzNzfylUlp0G3DvRQI4/Qkxuqwyqn3/8cn3BUTeEOpDxMr+kfQDuByJ0vAC8EcrvgpL9HbLVH2JIDf0zVRBCRWSum23CG7JjJu1fi8A+A5gaShgzq9LpJgSyJX1z+3W1xU0iPQyH0r72pDslPPd2Xhia59ItUCG6wW/oJa+/x3Hx1wpiw9fZcBVJ7zAR7CAVisT9XgjusDByL5J9jyMgQ9q7Uqdf3kVrea/o4YGuaAzoMxw3kIkQXd0QunnLdE0OV4nzgKLLulOhuGSLvdEy2yCP83Vb+Qc+eE9UbT7Zi3s4SROQ9Ecc3Zxhk4icggJ3RPJrdmx1Jr6PPT2ZeEEacTNQjYiPMKtCsOwOLqDwObCcgmJv4hAXSfD2TPar7a+3Yryc6T9KMCeBu90zptMgR1U6imIIlbRc/Kaj4cQvyjTqOwmQ/Jj89XU+JQUKH0xPGbGDz4PKuV4UppARhb5I3RsOxrM7sI3+QXbC2OBbGlpfJX/7F6Uw6t+WU7Kz6tYqnnRogcJ/9NVJ9K+AjTH9MrbZBJ5LEYiuLNYzsbtEl8LXMlKCIa+8m4kx66lQH/nw/Td4FxV4Fp+IS4IPQNkAmX/Q2awNe1+0JaEH2Rr3wqsT8Vi2utf5czF17YUCtjsDF0wSeCyf9VTdxUsRQT2P1STvErwdIoLH9G7+T+mlrFWiP4DRMvdoIlkHdVgoM0aY5CtfgmLPFE0Cz7hn5TPCmixUOkGXIem/g30GDb3HIm0m0MelJnravQuZfUCH3sVRY6AfDA4mgdsw2q59MJiW/tNR7qyeHqL9ZS2oDdeY2V3zW1xIrh3cwUUYDV7kIvoEL8QIJl1k30G+teAihSy5yYNiS5Frjvaw5D7MQxgo5MMHaLaPIFBO+fdNHn63/uf/osH56/6v//79nb/u/L1fZTBc/Id/APWL+kv8yyQ3oRvUxfUXcD/l/D5n/teMx5//vb/n9+vUaxXEoC96WhErr7y6QF5NvQCAyfB+9p539q+WjKXvQOGS5r1/Bvrnm7UUmfyZI9RFqqW5VoAyaU5V7oTXj1Jrz1kcT8huh54W1EJF1EfSF3nBbGVZ54xMgNj+Zgi1UHGA1NBO0eidVUoukG2QXEm2UnInzU+U/Q99To1rfziyClsmnCbsIhfqhx4tiv+RIhsguxzqdPkjeJFSwN7mbYvMHC9g/D/ayliUAf0F50VGQBzPvy+f734A9ZwX6gGcP3+u18R25Vq3Prj27BcIEDMWGbrfL9QvUgZYNW9bJFNz/Bai5gXhTzw+sh9i6xIwG3L98lfren431NYPI7ko19jO+s6elg+jpAxgtE3Ww7a/YLFgBUzieYtCuAWWMwukT9bqUGM4H7cYda3WtRzuaakfRvGiAkY5t+V2lrNH7tKqDPqgtmWBMcpPEjxMmGxdouYtAyZelCTEbEtuVDynS//5HhU/FAUAxMxDQY+s8aHfBXty5mXjnHVa192W1Z51jWYVDqPW7LYqL+xROLI20uXFAYtRDoCKDkaVjcdizhK2LrwdGa8hxFS3Pz2gqeeOzM2r7X4gZN+jWpYH7TuQEgCsHVaoe9Qzt3gY6KLpbmOJtzA2IC18urD9oY9YYMtVGfRRzYMMWyV6WxAFTjTUAiZelMLh+eOLBEsBstahJRjAu9VC7ntPmN0wm78flUFfqVHds3aBEH970ulhS70xFBeMwUTOW7kV5JyWW6kqAwbL91ggVNr3+DV7sG/2FpmaSIA8lE9ovLvXPduSPu7ukuN1TXV9NKLfBF7xQgrdgdF5LreznD2tbKWq0PY4Qrl3KOJjgZVr/uDQdira/Gu9TxR7Dy2GANF2/iRkxJeoVp5gMM8w39gvPkfifr9EA9RBhxZj/TCjixhDO6+enEKvj2T9giK+kXIJhv+bm62hM3tO3/jjzDvM6CzU7/vCZXwa7Lv9Vb7a/VFQrBl2YZ8SvafMwQzJzOLTxkN/be/dDJ3bncWHskvmAGTd40sab+UVOGZm9mDk8qu2pVnLXubxfJxt+QCWHCt9eP8cp5k5TTw313N29sjYFhORsk3h71ZeLUfQa/wW+8S6rcTPY4HbkYi+a0HjzTPXBO/Ll68g8QDxZaElbwfy9JOEEwrO68uglfcna86+xOzH3vhUmtZZx1IUl1hqJsVCvsN0PTYfb/qmcv+A9UNzeFQPqUDjKh9GspExBfLR7ZMbydU+bqS3VDbis51zRj6s0e4tgpMaR1KI7TvmbxmGCN4O1ErBuLXQ7sbESJzxZc75fX38w/xpRxmRUDoWY1yN6pKtO8wXo+ypj+aPY4wLezT/htG3+Xe3mCNC9Acoiw7VdhZArFo8nLbuLTGn6fG0X05lIHUvhsLUW+Be9P78LXpXLIXZg3lXzPn67berUqxpsd2ILD1pjlXejuKDeQstPkSBwYLamO0hk6YbJZ459x3IxWXNXXYVO5tj22OiiShYFvguxvKkjqewF7o6gACDpSKbQ23nKE9cv81ZrJUB9gixlnL/MMKs++OheTFUgnkdmI+2ONAQGe+X032wtRcn0TrNi3GhYz1imuYpmkOIbxw/e2TcYvUQCAYhQxkyadz0taujhX3KvH7S7n72+yVJHews2krknMUzsa51DdW1Jxykkf5cRfMIw5ViRvt+ovkOhTQhz8HB4MMd7xWbJNY1LqG69oSD1N9fp9ufPs81iDfbV+sAMX4wZVdkpd7BsdOfAlBTQRuCymIu/sZv4BLR0fqOvKxr6XrHsuQSQ2joK3ulR2jeCs8OZqvWiGNjS9dO/s5zPWPPsUNL0A5l44LFA+rRkxa18AGSsnPV7h8nnhodaUJXEZPMPtaPUXDltbE/ONf5lLJdXFXfV36LzyF3+PH1QzGet7hJTxiF6GsLbvHBTdxEB+OEkcZuYdkezWPr9uMExRLqd8nbT+TgY/0YuVZ+V/YH5zpDpCYVjqsFjlcejM8hd4Tj6ofi2PxrJKSv/0sigK4uTzn7WQTNHsF7NKwXI6fdid/E3UabeUbEJB3Hp2PUWHlo+4NvukOkDPqeQ16RqHkoPueOw4+vHSZ5HmfCsaAPpRxjgrWohqT4FGMm1XN8C7n7p5f9uAtKuVZF7q78ofozyuQTmsgrgecnyTq0dtgzf7aohxcwUWxHfXYpd4dcqnL3V4WPV9KyW+fCco+Gs4fRVIXuw0i1PAm0t83Lds4NZ2PljvSSSq46cVI+mKTsxTABMClbQ5COD+Hw4948dO0MgPDCh/Linsf5NETpxBMOoywNIBpwBD/2fKV9JLGa7lG78n32ccinM2VOZEOzmwWn+tg0xGJkqUpCJBKlix8gTi2hWlduhar70XpbmYyqFNR29h9ezdkv1378A4AYtQCu5iYpIqQvHJ5T9Opr2QDFobxi2c7sF3aMP1okNLy/+IGymkNljgx+/TZ8/pPcvO03rreQsWgIyUv6WN1zeAGYc8dbTDtHhEF4wmKqQwuLbWbO9Onadjzm1zSTaDXpPod0LTlUflPcTP99kbYzM38yAygyN8lt51FW2K4qgFXVYeQpqz4H+z+fsUjH3e+3+Yd0szBblci21+dRvFhLsm1l97k6zrK00H1uXiaKVgz6EwvYN1+1qGt9HsWL7IdI7NtZvsJ+AyDNqmNWuaBLtcBy4xzBmEhlcjsULxSSIz0xy+ZJjdx11WzPJWbl1VbOWUTr76Dui2Rumq3wJ15EHRLkVq2qck56wFCt/WZatOIrUthZMNlS2Hawzol/IbBqvq+Gql+Qn4FfgALIMQd/RGLJ4ZwwPTwJPAnc68qA3o0DpFCV6Ol4REHh6VnwPGDFIRQEHoXvgAzTTHXJf23f5TJmZHPhhcdU9O3FZwcVlCmJ5nvQN8C72LIRsF2knWFy8OCALEgZC7XoZP28lc1s+37BGJVLXMuv2UHR1ZBihYvl2XgL4NzcT+Zyv3TCPp1GoViRnKJlhd9sEtak/u6dgemI1AXqgrw8vb2VrkHxl+LqFLlpp3WyMEYpZ/CZ2mW43FCooDlhe1t9tf3q509/f3dleNtIlj/39/69Qh9ita2524hmpKL3chSb1KBekl0T5THTtoroBzowByy6QZe0Qui7g5qFUU3bcWZUy+jw3m8Ogecmi83ftVgWq4fdQL/0IPNxva4zhLGMeZDm8SG3kLx2LnPww2hC829LwkuSvTtrBhy/zajC95oDoSDP+OncofTbfTsH8AO1mf3G528yrwVhic0FF2aI0OaG7xQVnzdn44pdFT/PaQkM3OYOCtWfobjJp13eOW1hmqC9bt9cb48Q+c1i0AiDSz+gGZYTLHPKn8C5eq945Ud6SyR+7JOdLctsWW19fDidmq63xV7gm0/2IxgPVUWLwkx7cYpDbott5mBKtL9O+pe+s+ILetJceg4p8eKZk7lmarSFZkH99fl9Qbycs1xo0Qe6OJxf99YtacLTS1SQMMaPrKO6JXCMvRg/8mvcASHH6yfXIls0a5JHc8/HcqQje6zZRAQw0s2mV0ANpm8IaA6XV3cJnOAvQaB7fkGBJDYDFUOygaJEDIh9g+TWQBQQPpf3CrElQmj2+aKygvmyNBJIA4gUPsArHxBmWH2IfhoCGR93L2EZg1a11IT6asTdyI8SskFajq2BgfSSqvnzOzoGBWBBVG4LqX36x/PPnS+eBhgEVqogtH4AtAslyZjqaQJDp9iWjDKN1bDMhutsQhlI9yqncFwJ3QTBrL9+BHCDAudISxSQLIZkAyABQnhjo5VSIZQi5ee8jMCjv9zdaanJu8Siw1Dt02io7lsUtybiFkPz7eOQ5aBqrwLSQi5beNeMkqZCOm9Bi/DJkyUwHs0y+3kyebjZjXm/aBMmCDwBrP8SIZB1ml8uQnsGieaVtIYtDmofTbWYoBEOFs0+01bozSlilquBOE6o9wC3qqDMpjKV3cFB8sC5s6Dv4FKLBElo/tYR7vzYJPgkfkebqzhMpVXVYbAIouxndxpj7Af2TSXFtbteSt7otdcmGslW5D3dvc6DIirPY0Af2YG312WbROu/fBNwbg8sw/Kf/p//9VlwQX6Vhc20Vpd+8kevj2g+Zuf6twbx+v+c+O2FsnkVlD8kD76GUMDyyFfdTdOiHglxgYzlL0QAYlr9cdtxzgrfqCQvXicK0UahbrmDIO5mDdDZAgvv+TZqvCXWTETV5FzWb/Z9M3v9oohyi5QHBz6GsTnkVRhwsshGAvWNy0PDQY6dagtUgq5n2WZQlni5btfTsI42vtaGNwC0I9qgnStIQbELJ3NGzHmcgt7yvbD5uNrDO+Hb+eZQV8ebjkT8x6+Io3ull4gWXNKVK1UhHIfW7hsHlNkKo5KhyLUJTPhgBrKHcTsdzhglHg5N2VDBtFsDixkFB0GoqXLJSqpNDsFMDk2pgSPRu1NLbj8eCkrCAlKGdOH7EsN1Mpk5ZrnOZjZN61iMWLP6+ccsNxRGVVUpoUmsi8uBfpqXad3K6o4UJsQD3Lqi/XVywHvi4fErC/YYmU79J94VV24ptR7Zn+Kc5f+8++XtVPgx6KeVYdjjjWuI/fjRx6giS75EghtfJ83Cp3fb8HNB7dnNw/NLXvsRGmFn+/iEV4iDl4Vfv86gUZLuU4E+YgUGjLT10KmC9Q1xgspEL5thEQx4FxQpM+p7+cf/6d9U/HAQXJ+XSa3vH4KPNnPgr0Out1BQtSJDJFXqblX9SCWu8rmEXBJV+nkgSv3lIXmFkOWilJPQFMEmjkKV/q4b43VDOECik0R9okMHx9RRRk0HRLPnQj/tshW3H2i9re2rQ/nrbmpfbazz+rTKTD2J3IfNNlmOGaeaVu9M7UTQ76guI8P36jNHMLp+vbYl4Los99i5AVAqGCep0JkSMrM8OFdsbVdUBy5G5kf0aGtmSqFtvyZAA8kMAsIPt8zuHoucK74GGZU15SZlGiOGPkwbZchhwgM76M1Z9/vd3nSzSN5AemYRu33D3WZtmaF7ieYFN8UNyayeGG+C+JLegxw71ZUqSyFhYLApoz4SQNmwVrfuKIJZQZypDGmqitBY7NolQMK1oOtmA19E2iKljdahsrZIa6YAUfixQIugmeghAktc1UtM/2xGzG4k7lKSy+CzIJfv+561+k7kQyfgVbndH+PoGyKu9MgTmFd1HrkklNWCfv5ckN0nf5zhUgK3ygGK3C42bIPXwtJBtwV5dtJgPUlkmRaFPkZITK7yjq5GLpE0glOh27StZn1iRq71PJu+GZplVrGPOKIsT9oGxfB8Fkp9eD7nrH6Wx5CQ6Z09hrS3cFigS4hOMHkryuajNSosgY5oID3UztOxoAoc/RE5NgGvsFy6z84ilpSroviYkM2+XPmF4YdDTow9vTKr8QhwnrDt+d0cxRwDUCYg2jSQ+EQo4lNO6iytcoayQEgodSQCoqBmsoKmbmmViME1pFoaWAOSGlZT5bRQnSifC4AS4ii3r9zPbQ17hrlInTQYGD34qIiP//Rd5zgxkDXjYbu+v59wNh6ngrbUvhtZv+ERCYlfHmyRQey31xJVHnnHFqWnn6mEA6JbDSy3STSfCVSEsx3Ai/ElBJl8CwdsmfIRWKx0pUCXaV8guU6qt4OLvH2LaUJhEdgiYaZiEfl0ijWhZapsNIffQGUfXUUAVMNtBldQdro/SQPwAjCJ1s0+Ss7Rc6YksUMRpp/+4b8/Md9gGsCH4wDXH2K778DXY0CVk/vZESo3TwGiEhQ6u6WoC2HPVZmEjAcIjXuhgC80UrzaBOQ+ry3Xp9Dbpm8R119wH+5Bau3QtI3NVfgp5+ESd/Z21Gj2DQFDDy2dLpXD5QY1+K3nx9JSQ4pdOJWfhevUZug7miItBTNKn04+hVgBsugrtc0xjIE2WAfNzUaMPeotoHqoKOSHJolp/DgRTDkDTLfIm5MDj7PbBLuJz7EaxoJbwBr/LJiH/X9aLMOYQ8owKg0mb2MD8CMplC6ooRXWTCXqEoP3MlxdOkyhaj1T7NVZYkTzElj4niXmTYkgrHHXiSEuQBqgV+JBb+LqT2r9BthVmEeIPOX5jqlFQJvUFIopGt6RlU3w61bV7AaYApm8RhQlFj/DbDI3xFWHeooDLEN8u3vy3HXOyVzuaJ8icnC+2JkUHrnrasRNe/bIl6JYMwvHgiEJKPVvtQv8CUGI2g3FTLkGr7NOsviZEjEWq+qYLvoGEakNME2y9rqV8hBYBVRA/+tWfTBmg2UMDgxkMb8WXgVkMHhKxAjROrBkCEipMvEYY91xolsDTUcEdArkfgJJgIApfel5jnYp+Za+8MgrFxYJUEdnnNpjygCfew2apEAYXj+h6KJRQowColvhyjZ4U2U/oZsFx/iooUnvWaqdqjIDlTDXOYRI4YAZQMZ7wzF6Y0A0lV0l2AAaLRrh2QaoHEusGlBc4xpzmoCq3pJ7vK7AFfN8AweodN+qUvvUTWawTKnr8H4A6oMx1LSKUHBmsRBW+vVyWj56letdfAiTLWt7gqN7BlAd4KRwCgySsBRRMtssh2oVRuvVnq53rCuKJnpszWwIZEmlCFDWmbLQ3oWxhqxb8FYSAnmxnSoKWIe+VoEkmu0jAa0zQIOu69/545//i9NTv/MPWlZ3/qc1g5GkT1BhuVBZGasKAsDrsSTUIIY2cXOjJc6itgq4FJyFBIihncKSDMrSZA/dWaHI40JGxLL2VY+U1rNSF5paDQRpBudFO1AyW/eKibY9JBRTp15KUHoOROGolQmD0L7eqGBEuGKgnhJZF2BNbKPKEjUY9FKGbkB1tGikvN84Jy8V1LGgptAkdLKcOuAMbCZzhWZNSAHKdj7JvpeZ9gNsq3myfRrokCyaHLp3jUSw7JQdi3xiBM8Fo1TCvsdAsbyHpDhD2L2co8qF7MN542TZGfQZfn3HXNjJvuMkxcaSegzoCe6mnHN1inoAdcQwdGT61TIcLtst4rzIS6Lk8Qa8sxsYWdYmhGp2dhChLO/8YT0wyrDQJ+26uh/q6dwrs9dD2ZP91gv2+27aNvYkr0werkrnOt2EZw+xC6gR+gQucgMv3Q+gLAXPagcOiRbCt95YvimV+c5ZV/KQlU+btnNBHgWdIbQCBzzX4KygcYhn6hK4qfNmnxj+DAAXfgxvWVTxmqzxwVfYYtVB2OEa1J/kj8WPifqP/9wRBMl1TeB9Y6BcVbw2Wf7pyFDvT2+f3//0r3SiWb8ypN1VYfxcKnSM15d+hsz54ur9jkjyIu2MElj+KWU0sCYhZojamI0jk6Q+HG4vGKJSl6F/fq1T2zd85pyneczm6evAx+tRjv4+mf08SMJXkglNDc02vX3DLXklw0t/2w+XrLeokgsO4+v35vUpyz8Tvj3cFlt+Mfvrq3bUNKsQpaT/SDhn5sR+PHNPjrYg6GdsnNLN6yncvK+H0tWX9hbUFWPPsxKRxRg0hoFquVmTGF/9ocf8/kz6IWvWNuMLdySTh74pC8rH9GMrhgm4CFzd1MCtJSCPviCL7zPf9bt5Hw7plr3/0i7pI9jTFsL7tPc569PIZ3zt7dtTXqb5fUn4o3nOKq7TgXbUGsy7f4nOiz6jst+E9anO9/+/5DhQMircQWWEjTWDaLCGhyLhLptve13tCTsTzT6C7qjKWaZEq6VWInnNsu7X6rwg9rZU3Oxc45yauqBSDwb0OzYboSiukhiTyLGTjKD9gHuMcoWcCSoo4Zco7rmC/wO6JQiHdlelk5tZj9KgAjlNZa40WRWaY4B5ccnGbzRAEPmMK2WCHtyMT38QHXHf0yK+n4xD8iEHAQ5TseMCWGtBcYfYdJ0WZ+yYstdONSvbnFrLiMYF6YguJkFlFL2vCbUoibcuCgfHRIZm9XpidbQ0/VWJ5PIjqJpyyA3zj1HDRQIFOZzNfZgcfQkTvApoegzi76TqpaaoOEZlsAFGlcJjbQgec9tOhDYI8kzWNk5zf5jGAi+FjTRCUkXDY4+L1LKlgdSk/TxaZydKsINdxvrAeTFMyhRithgSOtRCFzhyPDUDuWxDK7cqTlOTrWgC8T4OErHVdZnrlLXRJG1QBXt5hNqUVjIcyMzwMSUOdA7mUhPrVh+2sclWNkuQyE31twwURZunMdZyLebf0mjT6cHXjlrYOxN9y41Ani/c1Ul/Yo+ez7Tqc0qYc/Mz7hjz2epC6aU2zhbf83lM7m/UCU3unyf2GOzugQ5cWSId6uJQGz8hW6hfbmV/lNJ+Ohma0FGt3Kv0xUQI8pjBMWdecU1X4uj5KOU5xXhKDO4lpC7oPjOxaDM9jiJu+qewwspj4ftkAAnSK85ozHqYHB9igCfMI96z+fXers/kr/sp+7fjea+N+LL8VhDr+BUAr5+A19AjXtMPuGyGGH+7ncDyHTv+lr3aX/1hXp9FIHOSFmt/V1mu9+foki36a+dbfLrkBgenq4cX47F8McpekEeSIcTzpHHHk0L6lVsECAaDZpfYXE83OTK+qG3j++5b6Ufrwz5dAa4ghEL1iEIKNEqiKIBYKKBE+xIeh5w3wkam4KzYFeq+ev314fBowPSp2IdVe5EZ8QiFZTuSMEM8B84a9voUe75jA8++K1NFCFGgpNb4dP9tLZWRomPTrLRoWexvRCT5GSl83cheQ7fEn32tH+gfpWvWNp1+PJpo+rbGQ7OW4rMdSoZJaTWYdTsA91kQ1ykvgSl2cncJfF17jAOZecAvFZvdN/lQ4IceHA5Vt91aliuS8odPgogKYU/clOhHtBGykAQftGWpsdu86RvXMyo8Im2qHr7QQFE7kKNFBdlg1H3cNUbld9u4+/T7Dft71IUAOZmwCcPV3M6J4NQRw4+x6BUASS6YCP6Fl5nSFBrBzutQUc3IfzrqR8miLgFD4sOi8hFgUVRyA9eia9ANzZQiok1aMT0S3bFFO5PT7CITWZv6HWVE2o8MpEzbsDCPYiIkzGPBvZmBnEyXQgJxs01gsrY81qAVpqqfDUJvwIKjqFwew5KtYyQjJ+EJszLwMHcLbHm7Th/ZmEugc8RxlTXbAT3tcdq65AR3gTTkozcNS7KdJoEGkMa9DnGAAbxx88zwZf/Nn5qyb0J/wxNOuL3RXRPaKeltqwrexRBs8W38fLdzlrOwvZJD2BSvvkeTMRQyMkjppsEeh6S+hOUSzx9F6TiZzD3kxlQJsiIx66OF9mlXaKCJmD/SJDuERFs0jySySaiPBRMJPmGG8OscFHOKLRiC1OWGv2y+U4kfEm+58cPeBL2+C0/7MyZzk3ZOuYUE2kwb9MuUYXekcLTZkKSyjS7ZkhONjFJ0MEU+Zt8loOqTPXcRCpPQSsm0zc6fFr2jUIetqzix/F7FzXZVjDR3kRXMLRoMUpJigTnN5+EX2/2IsMBSfhqBPqW7b8UYTi/+rspYpE8/a2H3yjLFtgVpIamCemgSBiKZJVEeCrwkJ7cdyeS4zV6F6GE8EtUcP5DTq85pXSfqThO2miSk9tIjnu8u+2SIr7K1UCyZdjKWalqNBUIAVpNR1vQOmaPFWoAwpbxERUKnCadHZm6rgdZqQaQ+ZFEu43w6ntupTE6QkWYh0JA/BagIVI+6A2c02NQbF8CAF1cscV9uq8ffcp8lwzeWvdUZLHQcUqmWpQIMaF7v2ZWgqtKUl5AoPMliRe0jG3u8A2CRoAwYDqyhKJcWVS7n3HAKlcm+YwODEICzAX6vJvJSiX3OPAHRyK0swQAyvOzXhGZnHWblQvtUCaiSo7RgbtGAWNWqSUEBhd1JRzQq4WzPuqrl5w1CZZAHIl9UPtSZLWFehG7BKbC9Fj6MRJOflaAM822Hhh0A2Rp9OhRruGlqiic7sbuulka9icj7oF4KBbbRXNJUcChEHyx1IywqqHoFCBWJMbLrgwqyXKfWmFyJsCxXUYOmrpw+JXEJg06HyywrSQzxAYWqtadGyip80rWd9JDGGaeM6AUavoMTUAtCYWJIo2x6AnW7kjERnUK2OMFwRIPWqCAW1RKUlpUPVKJIamQFaQ6VPW2uny3TGkbBkggmrCw0hgihYah2Sw8YrK+I8mtZyjj31BKLhjrrlYik1sB1j/WTXY6IPwa7ei02Y1J1mmUmmHE0Q51xwoRztIsmW2trz7tmHuLoLOtDJUIF3FKPbQgN1iy67UXDdbj10OuTatVPzHnJeD0OMCFwPWN+DHZvTns2rDBQlm3g1MMFKapussI2cNXsPkncn3MaN6ZkBGvMRcWnQUNDV9Rv4lxn9orH6jj1wabdUDZ1GC45TUtbpm6a0InOfWsrDk1V5mo7sZaEvIQucWfJ5qpXu24Uk6wrQ2+2V7j+nUa0FCczhfHNTO4sc4TYbozxfC4mcVK72CZeczFM1+BA0x9zHYJYJG/pcZ7pdmPs/kB8FLB5oz9KM4KMUZbCenUHp12KHDoeium6HAOqULq9DyL+xChSgVOcd0Yaj7Cixb45geH1mvwsWuRoPw1f4RY5Tar5SPq01EICatEFavpIJKEr06diawwI4ig//Ycp69YfpcIcNL2ni3uFNUQXloU7PPoigvpz2zNSShfpqqOKsmeHaD87aTx5z6UcvYc893dNlNUjxJuYWzq9zag30NMJojfJLMFbuTnAm+lFCHqRlj18izu7K87gotvaViA290Ad+e0+zthYZLyhZHg8JapV/qTWf4+jqmR+YwwEWj2yuwjvfBUAqKoIFwduWY1NBLaYFidAWtoangIVw7lLZjfoQTRbUQfINn2mh4+nBSxCk3LxliuEc8qU3FmJzRQO7TRz01mApa1L5sDVbtjJAc2ZM7zuDfx1u0vdZceGCqvDHUN9FlsCQvdcQz0RqFet6WtN06S1aTA1UrjDoSTAj3dZ1VKsljGhDYe148ppse2nOQADOZsK57lkZLigpPikzEQOlGaro/DeXtB6pxeoXKb72ifn2ifM7l+547qY5oXF04fwQNyuOdJeiHqd17GImC7tRoOA8nRcwowr3F5Gzn7OJuddKx3RQMPMYN1phiJ5I8KouMw+n2DbgsFPidioyAB2OMdLWOkwgCrchTmcjytkkAw5Z2lj7uqKpimG4DFFgcWUqG60lg6pQJObs3g2QqgbpzvYi3LZbgsRcNgxsA8kAY6FUDw6Hm2Zy6o5fQVCAFYvoUHD9PLqnq0P5jKcosHYFkuOXkc4vkBi46depWEKqqdM8RxFI+fOlmLjLQhqqz0Jz8iFfxtPoosucZyL7PwGjw2meIoC3oBtYczGPBXAvu9C5f4ClG+inSiliLxLozry07w0WQFf73rYXfTHeXP456KZQ4MmM5CB+9rsc79nAQdXXbZMbJps0txPIcwY7mE5COGiZieXE/vfGxd00O1sHL4Bq9zY6c7vWn3juAC8ETVOm2Sv7t60uD5X3RPA+BOCA7kZ6LMGcsO4xA+hB2fAIHFqXl0DiIimRyMuNjQcUs2Wm8YuhdaZc6OZJF34zCJ29xkzLPUiIKQDTYscnjozZCcVQGcSA8U0DIRaeKN35mnISg95GAm5ey4NujA/RIaqVroqczivZDGpdVDIFf1Do+REfxmiDSRX3osInKmsXOaNj1dDq2vPaEMjSocOFUeYFtQBguKjmf9RCgaXESJKk5WuLBarrRREjNS6aDnTLjKa6PAXwZa1IRnix4+7xG24wy60EuKQLg5wwJRYwY9QI4IwlCzX1uDm/w7Q+D57fqXvBHLzs2qLfnmld07cLYU8R/p8TSdd0lnuA6UQFDiJJcrgyo0izcNdpjSYILEeN3UDTZHxhWXVp5YkQi4Grei8Y/8mQZArC4IoAUPSAlOMcIWt0Vi7mYFl9MA5ebcV0jP0IHA4MkwAnqaGgWVaEreGCi9KqfxSCenowfBWDyXlz4Ykjngr+bFqdAAFbqvWKYGVos7CX6nVwrnr2nRejbkEuJxXNFO1QeUr6ytwVOtztG6GClsNZRnVQaHjWm/FGXeUzGhCqfe4FBpYU9WDnTGHXVAtYGMZWfWDaul9P1jvT6nqNFFKnYQ7yH4jYWmgd0fNpCdKng2HAe2B1IC8DWzsy9dlA6gDqgMNVeb2mo2WqRZrE7LjdmBMGhk767S2ymR6uWLHznJfAQHH7KAms1MaQ01pNBvYmAU5UMzMjK21DAbSQnORYDREyPPYIX4hDSR4Epwt+NPhAUnUCiLCJvbSyFEu0q/sS2NkF7vVyB91xZ0I2TglO7HNq01Nxnl71beZwHWx7VVb31a2C6M6nWeTptlaub6I9IkKzkpWuch6Fsg2sAIhzQkIkbWqPvGMlbolcZKT+s3xbnOeYRWxRmgUEX4sertFQTIDFBo9ltg6t85RajA1iLlOKpzkjjmXnQCiUnCupOIJCDw+G+jDvdZXc6jckFV4gj/xWw+h3E4frOCspBqYijQqI+iPoOqvmNNanBWt61vJovhL+6djUJko9Bzu3Ho8m3hFegYMOS2E6HI7jxq+uQe/eNnpH7hiRbcHeygR7UjxoSydgdmHxpE/2u5o8K5ZzQY3XRo0sqbZ9sEvp8CqKpgdZ1XxriC/buBxXEvnjKSQygEpm/NfnReQv3/HqCgIclsBpnBO4YzhDPDkngGevPMB9am+szXQ+razNp6S5TqyUmAFZISrByjV6y3FwubXu5qwtmpIytqGESyDeG7uD8ZOcdwpnDEJ20owf02ZjBcgwaN/oJUSw2pwtmIT6OThE0pvuw8P5ItWiGEyRCY1HKtzPOvHwt2/v6i7/3hWD9y5MfLFbM9Xo24ni8VE+Zi8VHYPNMjqzJZTSFlV201nf8959GscI72mUVOho40W0Wv93o0H9QYdamOL3mo/w7RGAKZhgDHd5lHqDc5f7ww92RngSf3Og5gd2ahwLiH+rhh8IPZYHNDtlzPV4Uv2Znj/yHUkdDWfk4Qf+TlLPFpzdCuYRL9MtvQYZdN5B/wUuDr3jLP/TnTrQ2Mvr79on2qP3d9fyODgF/G1UUMf/gzHBHovzKUa/8I+zD96nY50xsda/77//wazQf1emF/h6zHMO4vJetwYb4wr9iPTjnor9TrSAjRLklqbhUVCiMC4Isbs0A3dHySfj3V2cIF1WEh+QpX8UDO0etSC4fAAmcoMgOk9aeBDWQcMd7rCaF5VZw75cPkXM5wiZcypglpRnrzRu1TEE26HqHMSHpcjvU8f3L0L21HK1j78rWm7CJckhFpmDW11ZE+YpH3z6q4v2NuI1Xh6j9QRqpWt3x79diFssHgGNdmED6PrumaQYNQX78DhnVkQ/XKxxaPMDPEPIHlttkVQ8IwhZ8fjtPuASbm6/PsiYkW9jYmyFqWBOSGZ9lSZWhbPOViE85L9nB/asJhZUHQfyvxPrrqlVQ5qSWod6w/yYxrZPmL9715JVLpAcvku/XzZQBL17DTWuUE3mChyS8m1euUoFgRSnVR4IAvNhmP6r3IgRa0baQ8ifuJSpGbPcDM8BfPRCxHOli7BqjiHH+AiE6K+R7laJXHZU208eBK4FQ04azBQ+CUcjlFfEF2awC1Z38Mn4WdwSf4B6k7RSIvaun+X+4izvFR2MPx6YrPSDyKQZ+t4UPgG5HEkWGEfz9g36AYDXRs++Lmf3+Z4vT+U10NwcwQXowtWLOiYUAhepBkAFwVtu4UUjVOr2VpK40mzcIFBPoGbljGGoj+KhMAapYU+yYw11YykEPXVMmS3qZJhhrX8ABMzdDjZzFyyVbUlkAx+zRU4OrOjTxuzftqegBQZFa+RUmSsrq1zy/apilvBYeRYmuEyyMXV6YN2GctO2QLOEQhPrUKogQ5bXEtfvL0kszcx6qiZs6TXjWLDCENrwV1m66iO27uihRpGJtBxclVT1KVpTvjH2GF0KWYvtfPr+QkD5ixOYi5QQLR9291xrf0awYcxjtMoBgIivv1SjisxLu5cX2a0UYxMbMcnjem7h5C8LCcsLuWy0WZ4Ru21DHmFQTJ/kIVsYFajXNZ3w/X1mS+Tv0Emk69qai4uvcSaljhUyptOF5+y16q5kJfvlPHD+wc+/K6fjkLpcnJ98/j04uUPhizqHQkDWmjpz8kYeDfb1WhBKGgQZymKJQSwhgp+nOp2lB1Gyr1+/u+mkza3MW+rqnbT4HR8Xmxvm61IF08jTi3STdqNBWji3RbeLdYFA4QX+z6nG0YLT1NoQfDkKmrg5HgFNHOEbZgR1Rfx/qIv4dGbcP+C2WZYPeU2PzgAck85vlYi5ITQ2BfF6erR0Gq97/O//c+M9M542EusJSx3t7aPk65ejZjnDtcSP33BQfg+hOhbeKmsrghcDZqkoAGk3PD3c8MP7mE6zdyKHet/SGPmbJg564xw5OGfj8s4aV6gxezkeNicHImUZcWO8TqtmcXAn3HKWg5tlwmq4eiJab8+pXPeoYTQIr1GezPbvrMq/iPFvRDfC+1RPRagiZTqnhtcsqO90HNzhahNyHH2ZmEFDAtrwNP/6YQTnhIKbA3iljpEZbstQq1qiXPm4lydrdDFeePxqBztThV/khTY2xu9dQ/QjTNDfdLJmEtbcoiCVAaayeV59kPFdSru31XjYcNQyxMLP/qh2Fq1nzztbAuqRcWES1p2/MRv3wnf+d2mijt5KHX/XbNqvIUjnOyWahpKMNzvQXytRknxob5OJczk4S3asXXkQI0Y9MvfSmavGkNGo3qPBZEMPPSQehoi/TelTBSy/oFi0Cv1DLayncmY9BJIsM+LzcTUZOR21UzRcOgBzM9H2mf+Q8m15RnN0084SYjvdl/hpGLm00lfjvnws++L+nZ6jvaJgt7wCS1fX54Tvj2RPhf3KtIP7RU0R1fGY1l+Jz0fOWd9mDaiZeft2Ll5K1ZO3oiR0oiYXaSei9+wbpPjUL5YXqm2e9H1xIr64ezhvpC3PO4r6ASC0hjfqDUaxn5VUTeRNPMl6/MBonKNRKHG0zTBq/RuCURhuOcQFwvUI5p9WjEc5kxuWxTQLrZ6gNTF27sHV+R9YWuBoWrRxc8IjweIFI4WWEUQ2/IZBHSP9IcJIdEDukijqaF/P4HIgIo3Z/W3Xaz41U1un4eAFktnoXUSLtiCnmFrROMn9PbarB7SWVoJFDGTvuF5bXpgZeT9GuT36vF/9fMISxjI05k+Ke25i2fHsE/bbZJ32T2+oG1VYK+HYWukKWHtAN95YG2BQyPmQzgrko2AXO6NPNMEPOVaEx4hh0jd30n8GqdOISDkDaAHA8ygzUujBWkcLPUD2/YBel5ezsMqhTeOFRjnLr0zVw+H7opu3loxg5tGZTvN8YxmqxC32sawyZCHWrQzPljNQcwNepK2YPGGcXrjgbXlYf7StZ+3x7vNVucIdq2F5SIc8VHZRRbHDrVltZ9OG5HHHZbHTjP+RStMpzqJy/9f3j5n9CD6Nq7s6DFjz9hGiC/jqqHldjxvgMS1kboVYhzoyQsjy6RbIVp7Y89kmFLcbPShu+2ka1w3T8V8zZ0bioK5koQpmjno7f3taNZTU/rnszld1pvFQcLyppO1Rfg4RIzHLpDqHqTxMH2oDEQuWmdoPGRFkqkcFEEQ90w4gIJzL5W2iM5QX2hPkC1YKlCtjBLrO0jTdLVHtHTaeJEKzq+cTpG9yIRl8vjaTR6CBhmp2Kj4OJVKW0qM8pOd7oOR5sANJC3YLl1UQWnwoXxM3TQqnxAhM/ZgX9BWREVbtwXyCSS2tCLRKQTbnHVJsyaimy0opXu2NaSZejopdIwqQ4MUvpayMDRBP/2IlKQcolUU6KTAbt1HqO6VzyuMAkWnhejHWkU/RaawFCtwFQNwu4+PmfXvUElKQLt4Uzlja/1CArdgCjO9MzbFKG+RXoWdR1AAwhIKSP6sppChZWABErOJkBxiHo25JU8zMrj5UFgNnuQ0tVVOvVuMgXKuDaxhHtOi0YKFMctY+1JvRZKSTQUNSKhZBRY8GT/wIBAWeCVVxGvUbIzs4rlt0LwVVpUNuea/KuP3JoeTkUT4DtPOFhDQ5RBNAMlGhG/tcVM3kzQUfebZPhR/LW8BvHeyNb83GIQ1feLLIPqLuShisi5O9YFbL9MJlJZcBdm1djN8XqUNZscZQ2dd95mDlBsvwOdNMNaKSNPRk6+t0bI1yOmQ1hUtM2grUKseVKTYjmWci3BCKhUKCuT5SJJQj9E/AYTDUcKM6m0ljLeRFT0HZZ/wXGrfQ5o9zaHDyZuyKongMytOFlzrzyM8OinEteoyF1zmTQVg5ooWubWsnW/AF+xM0xQE2YEhJEspKJI2LEXK0XEdd76kBjkL0NkHTj0kQHob6IsfpT5hPhSZtLAlDfWTBJTms+jayFLkqKya4PU0G3MQZyYpgK3Zglxd0FiQDBOJ2ZMQaPZJNgciYdaDqo1jloE5sVOT6WqYHnbpKN3rqDFBqxmBl3w2wQ3Wd4JS9GNtXYeUaDkPU9JT3BjA3DtJIKZ32oAM042uBVHJQMmW4WokEtX8poqR+DeFUKzQcwMi2o+0X6WeRjVSeg0KU7VuvQZNLbdYM/oq5cjUw553cF6fkDSBIDk1F75tZzG3CClUA03Zxd9dfUCtqIYVGuUe0mtZJAIfmEpfNAfAqW+sp12HYagmI4lrXqo76mwitRPXnLz3zMZ1zWJCKzghe1WjrievsB7gHkaXyv72rLAlTUYXu4/AbGggEsWOQ7aaVvathyCoDNNxtxdgTbA66fKYTCTN5eGYZhCpaCdDwW1tcBqoOhmFRnSQRw8jfWKHrjaFCwsqxiDw1riQnGUzHJpLpCBwFWKS5BK2GXL4+E3QJx9hgEroD55xnnuOte8AM3GqgBlf9nm+CHj/eAFZTs+uH/Zbbw9Xy2k3cMQgatxwiHjI5eO6UAde9pe77uxKZGR/MWbZSmnANlLagZPjUg/W6atB7/TvTZ2Qtj+08aEdfF5dtYTtdBy86++Joek0y8/G3PbTcmLSsX3MfdCxS7Ej/Ohd6fqD8US2m0lMI02g1QeYomCQXbL74POQHBDoOgAE0XmKIUky7fOR7WeIGTeqBIPlGNjitY/aM2TfrAgmjyO1UQVdSWfkPtfemJt67lzC7aA14LcN5Kr6E+2mF3KhiWoxN5WY7l7apTutEe9W1dafzeF7uoa2D0xeL2zSVdjelllc2WpwBjGwpNcuGColr2K3jDl5OEvXbTGILr6DotmUcwdEskBpYglIZ601eA8entlCWZsYeF7kY6lACWOmQmaXqdVRnVuoliOObBsGlGNjeRuAdm1WCqtlNI0V0rM3YZrvZwEaZuUZsOSwJUbSzY/CJS2kn9BjiZaAhrXjJ3sF4bJDzHEYtWMVFSa+gxwxZOep/X7yv/679YeO21uPGPzlh25dr8RmGKXMfazfzDu2j4/n9ctg81PazWg8m7cfs+bgTPsBtOx9ip1aqRPvUzHOU/W41wSyk11QIKJQRcgrbHusnponDuMHVmWGz4ih7I6+1tYH3dbayTO+DLucDIAM6WUB0zBAPUiuGgXnklUPL/Ypa9tOnMJyIj7j4kqswtZIV7IOpaNHkzC2+ZydoDQSURCEezda3DLB853/A5eytyYADHHr/FGgLBK8ussqEtppfwNIDOyy/E5NpXv0P3tKdH6+TzxFd/Qynqm7nPpXGhfHjciZf2QQkt0itV8NTPTihTGRBGulMQo3ykgZnkzTpiPqHVmaRqYbIKXLVank+Ayjj5EO6PnxJjRNtHUaH/V1/j47dT+Lv/6Ub7r/J/tfHQMe5k/Ia/7p01PQf7NOL/zbmrT3Hb6b/8Vuyr/Trw/k33NQL/7ynXo90l+E+AHeGf1djO8vbMH8+Pktfdg0ZCSIdyFYzU89SAIbVgbbeT4wukUrSDftuMy3BdeKRzRGFJXL1LlG8TYKhdQdCH4pCS6vrjKtFLANhPLuPtuupfQeJ9bRPcMD3q2l724IVGIqOxlI5Z17QG6ILZb7JCZcsFuDPUQ85oUPvoOWZK/O0eWpiMyd3XsUZ1tv/PnZzsPWkBPcFXYX0+m9X62bdOPYdJllL2Z+bq7piRQxkWuMB0Tv9rHXorfK5KCdlJQFojOaLDAUpdGxY3jRhX430QTq5/tltA01M5lj04fQ47TfZpvQ+f406x18zkvz25WM9oXSKEUJb7yoRmCZNDox3OSzg+JdA2u2BODSfuodG3CURfuI59qDk82Dq4UcWWsPkEUkJprZl2TJytbMh//7dbpBWxio0/+X+je0IEwvao3YyMdc6HTsPM6112uyydF40wA+NgbiKdbHBpA3feaxzfcJ5aErYQfLH2/n7Q8YLI2fI42Hag2S8NOIh+fkfLN2vEW5oMWp9Lc/wNvMN8nm+bOtw/vwWNhvPj6+3e7W9uNLat7SdTjFhvXGcWOTlOU0P9RQj9tAVQVwT9r0F7mP/d6F0Apvrgd4rkY7PnbWkPORJYGrZm5wLOFpOS3QPFT+b7pxXj+mJnOBEJcu96khv9tzLs4SlvBFzzKCOnum8wN5ydMZaJn69CNjC3XApTLSchAYSH9Bn+J2ilblIhrmwt4iQmh7B/JBYUFYIt5F8TYi/nbE/QY3HO641CDCR+rPZ8mF/BSBYYayUKFAzVOjV2B0FDeF6zqFduZ4+LJ5/HCt3CEG37T0NPeJOo8c6cLqoQVquJHPx1M9Mwao2fuWpPqzpGWFkbnFZj60sbKXq7r5MwPLECHbRba7FFo0zA7Kno0Ntm6dIzWgj69EubPCAIACAt21krXmiGxB9qKDoip6eKLpNHvcep/6oPK4aoowZ9+ZeYp0y106/diviKYHt/h9ZpOIuHvu61jSYnUwWRZ6NTeKws5dxmwrx3bRPl8gJpQhDKxbO/6TGOKxrHQHFca3RJ2gOH6Xo6BdKLykIzJvqSkknu/J8+4p7TxC/jnrVgq+jO7KgFwIJFKWJrxGF95eEmi3z1XbP2LK1oYNZCol12dh74bITGiiqtLAhpQTi+HxOBlJY9qip+Ko+tyw2aYppDrrUYYgWw6c2AYogYEGnMTTchiaREc6udxeXHP8hi7oOtVWWH0s+Elfpyx37wQnI2AOllv6Vx5RFboRbHRQbsovPxBk0Qcmh0PInT21a1MUdXhPHbZHasMwCSjBRHL2jWpQyEuRiJtb+zo6U+sP9s6PlEfSfROvz/tL8Tppz79MfV+1s/BYrW/WJlxUSm1//nkujqBwWRDMH5YRSy31ZYjih47KNQTp+vqkyYFEXwNHBIwJXjx/209JK5jnR6stjp+hI9InwZsKxwsg4HnR0hlQosB+DLb7C5TzeCbsTnM5pP7WW4zFXgoxrsJqrsRarMSOUt+6S7aCh0blU6XzLqpreuTIT50454JLrsERUj/6fOPRIByLqpdDh9B6oM3yhdsxHsi2Y7tyN/Sv1YaZ835kVqr2tQ2G3cqsOS98QY1xgpnHLCCuFJqU9IJq84Vym3UNduUmQV3GX9u3fRJexFntoeQG+k7ace8mF+QPE3YMzsn9q6hNA+nMPMQNjorSLISt1c+Pu3q9sacXu1B7jicBJEtwDKi1ezF2vktZeD8JU9cKRtDTQhDrJc7ZSOh6OKJDkPnoTxOAzXZdJkIRk1QKkOYymfZ5ICbV6bmsCh1qGEz9GGw90lhyO3aloVT2ce3x6BOxw2l6UWVk8icsAi6qMYZcQHa2j2RVlwL1Zv0fTUrCLy8pyR7xZkTi/dM//O8nNlUP0ea3/wfzT2/D+zd7b/qPEJ6O8jQ9HnJSlmi6ivbwgL2x3qiymoKfNLE/qFIku9mxXu9LLO8U0ZUjxhCs1GYnDmyfbKWy/Q9VEHmO8nvchrz/0yMGiIh90/htZchNP0y8y4Q2TxIrvDVV3v8deDbntxZm/K/89W3K9a/mmdTe0Bazu21nHg/xHPXIAbUk5u2eGuJ9uC7QipM0iok4Xy55RRQE+V91BfJHIZgpIW5bZn/5ENhSGCan9m+M4cUKa0dFpTUhyW1I6t9D5K9uKbW/4gS3TqzRkuoo5oXxq546uo3bk7W/EuggF/4twMln7+T1mXAK+ihU0YipYb08dr1E6N2t4Az+8U73OqH/Um69Sf76kNeAa2hTH+0PAuIB2rGb+/BUTUn6uyHh4Ncq2ia8Dw7k0xSdQvleK8NoQgajF1IARuv5jES9sjG6KDQ3561dfcAvAI+yMCTRpUOKo7tW1x2AECiocZa67lvm2w/wNYqYPB5vPCASlVpJFe1+M/haOGbNxxV25scYbtssU8r21tSn7RdlDjrjKP9vSY0Xoenc0DzOzpSTojudBk/KZSrUKHcff7447ame1svQfO1qkKSvpDWiC3a5HqCenbW8rvuutK9EjT2d9lw+Oy7qNTf1aGkmsBM38tLXikl+bOqyvqUiM7Gjh6eu6ZCGv4bBFqzCBJPzZ4vFV1vy6ZkN5LeCX0DXydSrnPk+If8D3+aPnUDfU1zZzK/193eb/m/+9I9h/zWw7yfqv+nUpzJLvZXh7aLFn4EZIZfuIYdccbs6PxFR7qdEQVV0HySh59t8dRS366oobv1qKCq5uW/pyife96P+JC3MAZr2YsNyyv+yzWb5uNfh6tkhlm2O9jSbPLQu6hFvYqKSTDu6uoijvd0xCYQ4YpAtADerI86BlblPQgXvit52ZfK4wt8BNhektcgFm4Xmx7nuThCZftpDTzsXOZk081VlFDw6k6vOEnIbO2mU1f6XYTY/UPYJ/OxLn/3ZcAC5iubNlQOdFxPlV0q4Ktm5HniBcDdHlBln9z27ybYUXKVFLv19PtqPB5nO7J21WRTM43o1lnFTN4BgHzjg7TaaSKbeLFGGbuAMFOiyn+Sg5EcfqHjR5b17hrPNszeu8zzu8Qa+0pwfoyYSWch7vMZbJgK3bzC/ym//eHOOhxqc1NPXys9seDtanuFg8p6Bf3tmHo5Wsd+GiZaPlpxpjVNthmWDm+T+bkrTVGXFjfw2JgOO+IDHG3iDaTQ+1o6FkIWob/n/2+zKo6KNxzzWwGr6yLdUVe6Dy733wDlDSrnFN8cKvm2vDUtq/13kirBozeToLy4sSRxFwfzzVlmbjV4rUB8ElJar/9Il35vjlVTy/4STmfFfdvSOt8Fr85Y4xw0H+CfFjma/7qwTYO6ympMkbysffqz0jRPqSnrrqgfH3X/vX6WNl+JLgWwheU5rTtVILUo8HvaChwuGZKJeFGgbVdBJJz3OtY09JFLjQpc9486BihiBjFml6+80j30Zscs7synkb3VZIyCdCa9o2uWGozxlljdMNedUviGv+5EubvXxJQOGHblLZstD+YqNuSW5jvf1JKd9eZ2fGyCjNNgUEneNiiw3iEWDIxGp7Sz5jUH84R6fMfFrV7MR8Jac4BygkbN08wdrVtcpJRvpD0f8ZxiemmJVQmz1yLwXwtcXGYqI2YisK8oIyWYK9eGKXVNDpuKYovjIXUNMDYcVqXgpidhQjrWqeEn/3PtFQp7QLUZ6k5V1yWOLUdH1kEUOKZlDLJONVzqT3BVE8vTStMhw0QMvKo9Zj59k45xgeAkqdsmZSTFudcUGl/jOKEX5pJPQKat1htXIj7wynIXsXpRZ9RBaKDowBjINbZEUNAyblTaDsyvl5T69wnEqDgIaVcJS64Fo2b04s0jQh0EHB7fGVvcHJAabsLm1WMmTO+VuQPPn3XIDgRbJP6orrArHuTOsXmU1AaKguSwfHKSB+cbEgDMgVRzrH8euMtUBZrOv5YaVZXgZvC0YRfi1UCtW0YlVcuTNfZXZLMEimfjQLy0BqGbyf8CPXQBZWv1uDQnDy6Hijw06gpSuLDGiT30l5RLoin+4lTVWK7ulDRYEG1D2Y4SqLcEaRTFYFmzjxgKKC2g2LhxfNJYDxIBU24P1XOsCsSB6hLTBTbYFZX19FIk+UT6KAdgAUASMASV1XtjyXB/bctNWRt7nncICBxQLR7CyAUXXNOY3VvgPHaUoX/+8KP9/U6719UXx/0dRvP5Q/rsHylx2yD7qScVfXfmmvetjz2vCjIc1iam74+vy9tyjS/zx2nJXSt3aCGsALjAbFMUH16Xj8cZsXpFz95H0DVqBKCBJdgLo6IsSOc1qhLEySDX8B1qus9b69KGvQFgv5RWf9EzDQUrfzmOCg02OsdsAM3sHl/fwVNlN7PEwzHx1Yzv9vEKesWK/dZKi3X2X1CTi2uYPvKHfStVP4dJlVgqf/NSXKSfkP9kpR1aCbdOElAZzLxJK7Pd7YAgfLtJnEW0p9vdOavkTqH2J8q1zkCLhysnhrlhfZto17LfCFZSWQ0LoI5OPRhMQjFTpqZiyoVDTkg4myUeo5AmCWXmiqWxqfylClrPKQqH0Nf39avmu8VVgRVOlvGmGOddZSKlc7fpefH7APGXDChCNpmQ5Wawz6w79WImV0PbieMdrNgpclCgsF+yzXGFuic8eBrNJYn6n4qHJn71xvCxdF2MSa6I12oYsKGousAd/Aok/j4ejgF7mq4xzvcVRNu1mq8+mpKopI76cceQKmmWoZ7prmNeqJqOQ40TleiMxywhmIAnMQGvFRvgs6YUeJ1LT7by15+ARSm0Gx20zm9iu8mO5l5/W5yzKjFt6icsC+YMCu8Y9TQcETdYcTf1gVjrjU3Oko6T8yZp7UlJQYO72n/7aJxJ3tA7ag/ygP2gABcoaFSU1T6T+XXQdjV2dr/QmDQVvHmJeeBmVNQ6U9EV8nnrDKW8QowEQAZ3ATrBiYRUimkWXLJlaxocNaBer58Lvm/CBuowAKx9BFU93V0CczTrcRWoeiEcUMJEj0kmdTR0J+AJCsJdFmpunsUja+hYj+wKoe9Yhi02GyBWVlxYWBUxTyoA9oAc2AXzcK50RbAgogl0A2fXFRbyHJWRiVTexwMuWMm8I5xnujIauKMJ5QjOHea5BynOC3DqSMUd5lS2bbGRUJ+5WAJWqEepZTDIqA0gEOU6NDNeqbvOgQBs7Or+dEBpjZgj0zD71lT5oC9GvZIDeVcF6eFREu0/d0afx580Odo9cGpdjKzSKi6PLmmznzAGYvIAa4BEB+ixA/qC4he4FqDiANwNwQAZWr66qluTOprzkRUI/SYrm53uc6YtU/mODz1jkPZalJoFCAQiNTIkZJqOOZUQXQD1M76HO8+Ol+MHHebBzzOfSkpvgYAKI+hTGD5J8DZHTn3s7svIHSE7QnGxc05nCUSaz7D2qx1Lne4+WE4eV4ecXGOHioFYrigpNIb/BFhH8hzj7OOixvCHKCQnHHfyopCzCWzIAOsuoKJBTYviXD+gJrD7KlMbkYGEuw3P3F3plJShD2WQq6wzptRnEvviwpwCnwInLC578Q1q04U89UdRulUyHu421g1wieaC2CnbK/pCc5Ar6qiXIvhi5HcP0csKDsozDOJwaJA7sPRWns4ms2NvKVrzXTxQ55gT6DtIvwq9IFRct88Di5VgTCORsz7LpYne5j1KBjDgRZdF6UIF41IKME9i+xMcbkbWJNi/HWjcW5oL6+O5+kfaRMpOBL9mibQeSaI5ewPn4XEle3inAO1LZDADlY6lHxsvuH4swuUqrGFkKq2PvnF/m4fcV9MBuEoFjJtn8JX1GMKvX5Z8UQ4hqRjHMEjq5Sjr7YMY1XlJzHLvcRgXdJMKYhGJYImiNS4Lxkct4JD2+MUo+HllLKZ8ySgmyxcilGOmuVRxF7PBikD5F6NkjAoPASAUQ6BkgCIATJ6OIVB7luo2gYnwbw4IlbQIm7GuTcFtsU+AL0gEV7lBVP5e0AGgJQBvBjsFtDK/gNgEn1rVJaNrbFFT3dn4VWnDQ4MtHkFSabheOkTsid67tz0+4AB7cuK9yTeC+WbMXTL8YUfdfAjDjB0bCmKQuIlsUnNF1A+j7iDsxDtKBWvWTo97u0G4XmAUHcpfS0Ff6uGB8AjEpL51STlxPlgFKn+8kU8tlq8k49qDbl3K0OJQLEMiDHTncJ0x0LJN7CK03seT92nWHyZpdv0qhQ9sLWYz2dhlCLv5dWvoAIGISJCEg8/tmgwj7LLPsOqrIJymy8U/ySq0aAoalQYx5ngScLFgRpFgM522QYac2F37zh0md5s3q4sRZLhd4GHMWLCNYtOQzV+tWrOrm5ocuWzZscvfVN+k8eXjMmxcfNXz58xMgULAgIUJ9ESZCuEjRogyrFStGnHgnTj0/Ol15vD4XKH31zvJmWgswnOQnU6g0OoPJYnO4KU8fXyAUiSVSmVyhVKk12lxrP+kNRpOVFr4jP/EFDYLS0fc3BAqDI5AoNAaLwxOIyQu5IVOi/65nMDHfzusLlCFKsezfc18gFIklUoEtM2qNwpaOinmUGZk6Vp7GlkoPGoIbIn1eXA6vV7ueLsIRSBQag9XawgW8NIlModLoblu4jbpLJMjen5/K5AplQONOjeeWuYZGplsqrIgnJdZ9LK0iUoPeiAFjtFMJ4TNrYGRiZoHBEaxs7Opb7OXn2PJbDENPOP7oBgkKlUZnMFlsDpfHBxBhQhkXsqJqumGKcXlx+kEYxUma5UVZ1U3b9cM4zYsul4ETAONStyJoEOek57TnrD86XhAlWVE13TAFuuguRxuEBIriJM3yoqxqmy6f6X4Yp3lZt/04L68uNgCadeEIGhjLUTTDcrwgOnZ5zBRV0w3PLnYQmnbZlKSZbJcXZlU3bdcPhqPxZDqbL5ar9Wa7w5W9ghdeRV5H3sTfa214CKsP8wNdsdrsDqfL7fH6/AAiTCjjQlZUOy9Pnx+EUZykWV6UVd20oZDtYRT2YiyEjsTMal5mtZf9cDqTzXVWsWiKgbJoo9lqd/Tpf+tfNUOemnphwKBpYpMuftD+0czrsTHjX4x8nc1dtS9XuZl/Uibr2+F4OitRptR3ufJVaJajQKFnv6+3++P5eke7FgRvxTTDcrwgSrKiarphWrbjen4QRnGSZnlRVnXTdv1gOBpPprP5Yrlab7a7falcqdbqjSb8fLzd6fb6g+FoPAGGnIRU09l8sVwxMl8sV9BxvdnuUmYhRoDsN7aT1UxQeIKnADoIHhCgiEgwZBA93GA0mS3WNrZ29g6OTs4uF9eW9hMArOnyGqDcK9CroTnfDGoMG63aDdDI8JP6SVilFHyJqLvc06EaV81oxUzWmWG1CUtguPtTYyiox69bPOx3aYyed9KPH+KulzLrwTnLquGJ3BXUaEYCPRYWStoYGwU0aEwIFdajUxIhxSdGNqZzJuYhHHx8KimqhulXo6iTK9IfXyL149I6NLNG0Y4YQ3Ro+s5QMr8N6D4wR9o3wY4tjlktn3xeqmThh9hzv0Gmpkd3h7PTYpatnkdhzxPT86sRG/Z7NH8k5MVpsbi1ENdLn/pFJmWV+OgYXAhLH8KdXonWG0tC2/ux0A9N9fQPj3WRxz22gYQZB9qszNoo01vCvJB2JeX9yJ1VLPnKqNB+HhWHdM2TpGCkCSR1mIM0prM5BLsdyw5aoVHy0I/CVcOr/IJ5w24J267q/8K2p/HGfwSBmn15A6H3awNra7kW/NX98rW/nhFXlDNR3luFYL6jxrdJuEVuAzZWjo2Vc4e7y1/Zz+pvHP+/kzKC6Oz+fTJgdO56zdpUQZCybwHOEWu7z1LvGZQiI9+hebB30zyDxXsJ3m77LR6ME0IyBHRroozK3DTK5M+2XNwoDGtbWwZlkdLgrQS1yGIh+UwKU1mm1mwj7vpNMDfOpupARGbeOAyIWldhuennDezYXCxqr3gI3VBoIaLV0UKsjkOQqbVuJTiEgIegNorBUQSJCTO9Q276VcJCPRSbrjDRDY5ZS85KPff6SnajjIw0pRrstArHS0zj8f7jXhgXTFmF9Qm300p1akqgEtd6auzVP0ftldEnb8bSvpJnN8ONfHSD7zv3NPpa4Moeaw72xe9jU1YJGe8Zdv+wX/gttuO5nu/HT7nlPR6WOgaP0ScAYTwxvsSpKiJMKOOiZDU49MtajSZK34HdIAxqBBGhLDsjhIMbIJwaGGOMCSGEEEIIGdbAGGPTAREmlHFRsgZAhEmiEEJIKaWUkQ0uj+bQbhtfcrdJEGFCGRchGKkfXiQ5FeLJtYRBZtpSYJKTNqmIMi6kMkzLjk6HBwttvynXjovJK+JCKsO07OgMgAgTyoRUhmnZt15sD3ErvZZLyZhQxoVUhmnZ0VkAESaUcSGVYVp2dA6ACBPKuJDKMC07OidAhAllXEhlmJYdnQsgwoQyXl2O95CKKgYsy7Ls2t4SwoQyLqQyTMsud6211lprrbXWWkd3FLYAESaUcSGVYVp2AQhhE19w21tjYPL+6UP1t//1cPnWy3P1/dK8vJ+rd7z38wVti70VuBBhQhkXUhmmZUfnAIgwoYwLqQzTsqNzAkSYUMaFVIZp2dG5ACJMKONCKsO07OjcABEmlHEhlWFadnQ2/OLBOHFPt2WJLI1rrXX0tGVdSCdXowu6CBPKuJAqRiLQNI4XKdtl37768/HWC98R0+NumtaxNz8u7Ndf74Z7RwWBLeWrH3778Tb0XUJ3pJoe6oNR4YUO0robeh73N19ffbtNkuPa7gkuNfrFXPx+dViTP9+I2nDH/PBC7p0Khc2GJIFOiDyLlc5SxNPON/R3QsOzPt7EfEpx9M81hP+DfhMxHp1Ao8beq9m2ye4pA9BPfq6Tlt0tDcYEVWP6kRFH3/PeteOyyIdbmyOTehclpKQMMrVFSREFCgxYtiuVc8ZtxHQfFqJK9USBxDKW5roUcX2x30xuHP5kS4gd2hHQLxGKiNKeYmL6UGv554mSa8jDtYjGCJSn8zZN00m8ucrW1sstYUGtdszjLFU7hSTfJXRm3NzIsQ9ZgxBXNWKNmPctF6ozH1ZbzRqagcoN+YI6LsT44wGcFUQnuc6vt8nyxGhOK5By5QXlHSopK9GdQWUJ9m5RkqBsiZxX6uaMD8w/0YbInBVxM8Mk0RnnmXYZB9FBS6bHoSRK26JQc6NMFqFRJ4l8Yd2+EhQdkVIFXKQg6NqIdfrguQEh5c/ULMCQArDBPQ4JqlknzvBeazHqA44slDdnuy3rxOpd4CXJsyjKVShki5LEPnWJkkQVTBTEc61I6DX3S2pxyuiKBIo5gQODVoxvk1mqSMYFu4FWJKilHDkRRwxFo4/HPesW/BCP4SIPCVNnmDG76m/XkMZmqMHb3dsyDo4wAHTT9u/jOMOyFgn3LXHIKDHmcXnkyPqRtou7Rd5qf7lXRvuwQlQ0kvQLqDHPbKfOvP2zy0PCnPawcEhSSRXV1OTtDVqQ0MBSQCCAbACCpHYs54vJ0X+0/MPTozjIIHC6v7k2zCRqoPTiRk0fHilLMqN8ySINSsRPwwZDW3Wt6clSGgMrrARC93+KRE9JWvSKTqL+t1T4Dy/gQcIPo2cQ9FwkD/CirILQ85R5DRAvs0AqeUAMJf9wSEkGIz9PRlRMEiB8AmBMUoNuruF9imgPFuwQv/MoYEB5ZDGAX+4R7x+QmD24qEh3SZg7KFgrVtSbZNc8ULHUDlRUF9Rr/IrygGq2ojigDCjyA4qGSEPlyHrwTNh1aO9pNLdaiu6AdlQh9un6HiqA4AEAAAA=) format('woff2');
}

#label * {
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
}

  #label {
    width: 400px;
    height: 400px;
    background: white;
    border: 0px dashed #333;
    border-radius: 50%;
    padding: 20px 0px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    position: relative;
    font-size: 9px;
    line-height: 1.1;
    overflow: hidden;
  }

  .label-warning-ready {
    font-family: 'Roboto Condensed';
    font-size: 9px;
    line-height: 1.1;
    padding: 2px 5px;
    text-align: center;
    max-width: 95%;
    position: relative;
    z-index: 2;
}

.fixed-warning-ready {
    font-size: 9px;
    line-height: 1.1;
    padding: 2px 5px;
    text-align: center;
    max-width: 95%;
    position: relative;
    z-index: 2;
}

  .warning-line {
    white-space: nowrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    hyphens: auto;
    text-align: center;
    margin: 1px;
  }

  #ufiGreenLogo {
    position: absolute;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    pointer-events: none;
    width: 50%;
    z-index: 1;
  }

  .ufiGreenLogo-ready {
    position: absolute;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    pointer-events: none;
    width: 50%;
    z-index: 1;
}

#label-ufi {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    font-size:  10.5px;
    font-weight: 600;
}

#piktogramWykrzyknik {
    width: 56px;
    position: absolute;
    bottom: 33px;
    left: 85px;
}

#piktogramSrodowisko {
    width: 56px;
    position: absolute;
    bottom: 60px;
    left: 45px;
}

#label-warning-2 {
    position: relative;
    font-size: 9px;
    line-height: 1.1;
    padding: 5px;
    margin-left: 20px;
    margin-right: 20px;
    text-align: left;
}

.pcn-label {
    position: absolute;
    bottom: 5px;
    color: #fff;
    z-index: 2;
}

  #label-product {
    font-weight: bold;
    text-align: center;
    margin-bottom: 5px;
    line-height: 1.2;
  }

  .piktogramy {
  width: auto;
  position: relative;
}

.piktogramyico {
    width: auto;
    max-height: 40px;
    height: 40px;
    margin: 5px auto;
    position: relative;
}

  #product-line-1,
  #product-line-2 {
    font-size: 12px;
  }

  #company-name-block,
  #company-contact-block {
    font-size: 10.5px;
    line-height: 1.2;
    text-align: center;
    z-index: 2;
  }

  #label-weight {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    z-index: 2;
  }

  #label-batch {
    font-weight: 600;
    font-size: 11px;
    line-height: 11px;
    margin: 0;
    z-index: 2;
  }

`;

        const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <link rel="preload" href="https://clpgenerator.brzezinski.studio/clp-generator/nowa-wersja/roboto-condensed.woff2" as="font" type="font/woff2" crossorigin="anonymous">
  <style>${styles}</style>
</head>
<body style="margin:0;padding:0;">
  <div style="display:flex;justify-content:center;align-items:center;height:100vh;">
    ${cloned.outerHTML}
  </div>
</body>
</html>`;

        fetch('https://clp-label-final.onrender.com/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ html })
        })
            .then(res => {
                if (!res.ok) throw new Error('Błąd odpowiedzi serwera');
                return res.blob();
            })
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'etykieta-clp.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                downloadButton.textContent = "Pobierz PDF";
                downloadButton.disabled = false;
                downloadButton.style.backgroundColor = "";
                downloadButton.style.cursor = "pointer";
            })
            .catch(error => {
                console.error('Błąd eksportu PDF przez Puppeteer:', error);
                alert('Coś poszło nie tak przy generowaniu PDF.');
            });
            
    });


})