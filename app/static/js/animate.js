function letterHover() {
    const elements = document.querySelectorAll(".letter-hover-text");

    elements.forEach(element => {
        const originalText = element.textContent;
        element.innerHTML = "";
        for (const char of originalText) {
            const span = document.createElement("span");
            if (char === " ") {
                span.innerHTML = "&nbsp;";
            } else {
                span.textContent = char;
            }
            span.classList.add("hover-letter");
            element.appendChild(span);
        }
    });
}

document.addEventListener("DOMContentLoaded", letterHover);

const options = {
    body: ['body-yellow', 'body-red', 'body-pink', 'body-blue', 'body-green'],
    eyes: ['eyes-special', 'eyes-sideways', 'eyes-evil', 'eyes-joyful', 'eyes-sleepy', 'eyes-asian', 'eyes-heart'],
    mouth:['mouth-p', 'mouth-line', 'mouth-o', 'mouth-3', 'mouth-sad', 'mouth-slant', 'mouth-u'],
    accessories:['accessories-brownHat', 'accessories-necklace', 'accessories-hair1', 'accessories-cat_ears']
};

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomCharacter(container) {
    const body = pick(options.body);
    const eyes = pick(options.eyes);
    const mouth = pick(options.mouth);
    const acc = pick(options.accessories);

    container.querySelector('[data-art-layer="body"]').src = `/static/images/body/${body}.png`;
    container.querySelector('[data-art-layer="eyes"]').src = `/static/images/eyes/${eyes}.png`;
    container.querySelector('[data-art-layer="mouth"]').src = `/static/images/mouth/${mouth}.png`;
    container.querySelector('[data-art-layer="accessories"]').src = `/static/images/accessories/${acc}.png`;
}

    document.querySelectorAll('.character').forEach(randomCharacter);
