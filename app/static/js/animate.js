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