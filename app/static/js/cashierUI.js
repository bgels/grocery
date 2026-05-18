export function initCashierPage({
    advanceGame,
    processPayment
}) {
    const page = document.body.dataset.page;
    const main = document.getElementById("main");
    const gameMain = document.getElementById("main2");
    const changeInput = document.getElementById("changeInput");
    const submitChangeButton = document.getElementById("submitChange");
    const advanceButton = document.getElementById("advanceGame");

    advanceButton.addEventListener("click", advanceGame);

    submitChangeButton.addEventListener("click", function(){
        const change = Number(changeInput.value);
        processPayment(change);
        changeInput.value = "";
    });

    return {
        main,
        gameMain,
        changeInput,
        submitChangeButton,
        advanceButton
    };
}