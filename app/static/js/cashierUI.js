export function initCashierPage({
    advanceGame,
    processPayment
}) {
    const page = document.body.dataset.page;
    const main = document.getElementById("main");
    const gameMain = document.getElementById("main2");
    const numIds = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "decimal"];
    const advanceButton = document.getElementById("advanceGame");
    const clearBtn = document.getElementById("numpad_clear");
    const sumbitBtn = document.getElementById("numpad_submit");


    advanceButton.addEventListener("click", advanceGame);

    let currentChange = "";
    let display = document.getElementById("changeDisplay");
    if (!display) {
        display = document.createElement("div");
        display.id = "changeDisplay";
        display.className = "text-3xl text-green-200 font-bold mb-4 bg-black/40 px-4 py-2 border border-black-600 min-h-[50px] flex items-center justify-center select-none pointer-events-none";
        display.style = "background-image: url('{{ url_for('static', filename='images/keypad/keypadDisplay.png') }}'); image-rendering: pixelated;"
        display.innerText = "Change: $0.00";
        
        const keypad = document.getElementById("keypad-container");
        keypad.parentNode.insertBefore(display, keypad);
    }

    function updateChangeDisplay(){
        display.innerText = currentChange === "" ? "$0.00" : `$${currentChange}`;
    }

    numIds.forEach(id => {
        const btn = document.getElementById(`numpad_${id}`);
        if(btn){
            btn.addEventListener("click", ()=>{
                const val = btn.value;
                // just formatting and safety checks for decimal and zeros
                if(val === "." && currentChange.includes(".")) return;
                if (currentChange.includes(".")) {
                    const decimalPart = currentChange.split(".")[1];
                    if (decimalPart && decimalPart.length >= 2) return;
                }
                if (val === "0" && currentChange === "0") return;
                if (val === "." && currentChange === "") {
                    currentChange = "0.";
                } else {
                    currentChange += val;
                }

                updateChangeDisplay();
            })
        }
    })

    clearBtn.addEventListener("click", ()=> {
        currentChange = "";
        updateChangeDisplay();
    })

    sumbitBtn.addEventListener("click", () =>{
        if(sumbitBtn){
            if(currentChange === "" || currentChange === ".") return;
            const changeAmount = Number(currentChange);
            processPayment(changeAmount);

            currentChange = "";
            updateChangeDisplay();
        }
    })

    // keyboard keypresess
    document.addEventListener("keydown", (event) => {
        const key = event.key;
        if (/^[0-9]$/.test(key)) {
            const btn = document.getElementById(`numpad_${key}`);
            if (btn) btn.click();
        }
        else if (key === ".") {
            const btn = document.getElementById("numpad_decimal");
            if (btn) btn.click();
        }
        else if (key === "Enter") {
            if (submitBtn) submitBtn.click();
        }
        else if (key === "Backspace" || key === "Escape" || key.toLowerCase() === "c") {
            currentChange = "";
            updateChangeDisplay();
        }
    });
    return {
        main,
        gameMain,
        advanceButton
    };
}