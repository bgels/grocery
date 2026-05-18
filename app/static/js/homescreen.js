const continueBtn = document.getElementById("continue");
const save = localStorage.getItem("saveFile");
if(save){
    console.log("Save file ok!");
    continueBtn.className = "flex bg-black/10 hover:bg-gray-400 text-gray-500 text-[2.5rem] font-bold py-4 px-4 select-none";
}else{
    console.warn("WARNING! Save file could not be located in localStorage!");
    continueBtn.className = "flex bg-black/10 hover:bg-gray-400 text-gray-500 text-[2.5rem] font-bold py-4 px-4 select-none";
}
