// @ts-nocheck I like doing weird things in js, vscode does not
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}
let gridWidth = 4;
let gridHeight = 4;
let maxGridSize = 18;
let selected;
let money =30;
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const alphabet = ["A","B","C","D","E","F","G","H","I","J"]
const greek = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ"]
const series = [romanNumerals,alphabet,greek]
const colors = ["red","blue","yellow"]
let unselectedColor = 'grey'
let selectedColor = 'teal'
function resizeGrid () {
    let grid = document.getElementById("item-grid");
    let maxHeight = document.getElementById("middle-panel").offsetHeight * .9;
    let maxWidth = document.getElementById("middle-panel").offsetWidth * .9;
    let minItemSize = 40; // Minimum item size
    let maxItemSize = 100; // Maximum item size

    let itemHeight = Math.min(Math.floor(maxHeight / (gridHeight * 1.12)), maxItemSize);
    let itemWidth = Math.min(Math.floor(maxWidth / (gridWidth * 1.12)), maxItemSize);
    //#TODO disble the buttons one step earlier
    if (itemHeight < minItemSize || gridHeight > maxGridSize) {
        gridHeight--;
        document.getElementById("upgradeHeight").disabled = true;
        return;
    }
    if (itemWidth < minItemSize|| gridWidth > maxGridSize) {
        gridWidth--;
        document.getElementById("upgradeWidth").disabled = true;
        return;
    }
    // Set the grid size
    grid.style.gridTemplateColumns = `repeat(${ gridWidth }, ${ Math.min(itemWidth, itemHeight) }px)`;
    grid.style.gridTemplateRows = `repeat(${ gridHeight }, ${ Math.min(itemWidth, itemHeight) }px)`;

    // Clear and add items #TODO don't clear, just add
    // grid.innerHTML = ''; // Clear existing slots
    for (let i = grid.childElementCount; i < gridWidth * gridHeight; i++) {
        let itemSlot = document.createElement('div');
        itemSlot.className = 'item-slot';
        //A nice little random filling when you expand the grid, very simple
        let randomSeries = Math.floor(Math.random() * series.length)
        itemSlot.innerText = series[randomSeries][0];
        itemSlot.style.color = colors[randomSeries]
        itemSlot.style.backgroundColor = unselectedColor
        itemSlot.onclick = function(){
            if(selected == null){
                selected = itemSlot;
                itemSlot.style.backgroundColor = itemSlot.style.backgroundColor == unselectedColor ? selectedColor: unselectedColor;
                return
            }else if(itemSlot == selected){
                selected = null;
                itemSlot.style.backgroundColor = itemSlot.style.backgroundColor == unselectedColor ? selectedColor: unselectedColor;
                return;
            }
            if(itemSlot.innerText == selected.innerText){
                let result =getMergeResult(itemSlot,selected)
                selected.innerText = "";
                selected.style.backgroundColor = unselectedColor
                itemSlot.innerText = series[result.newSeries][result.value];
                itemSlot.color = colors[result.newSeries]
                selected = null
                addMoney(Math.pow(2,result.value + 1))
            }
        }
        grid.appendChild(itemSlot);
    }
    document.getElementById("gridSize").textContent = `${ gridWidth }x${ gridHeight }`
}
function getMergeResult(one, two){
    if(one.innerText == two.innerText){
        let matchedSeries = colors.findIndex((val) => val == one.style.color); 
        let index = series[matchedSeries].findIndex((val) => val == one.innerText); 
        if(index == 9){
            //#TODO what do when out of merges
            throw new Error("PANIC")
        }
        return {newSeries: matchedSeries,value: index+1}
    }
}
function addMoney(value){
    money += value;
    document.getElementById('money').innerText = money
}
// Call the function initially
resizeGrid();
document.getElementById("upgradeWidth").onclick = function () {
    gridWidth++;
    resizeGrid();
}
document.getElementById("upgradeHeight").onclick = function () {
    gridHeight++;
    resizeGrid();
}
document.getElementById("sortGrid").onclick = function () {
    // #TODO Make it so you have to buy this first then remove the cost text
    let button = document.getElementById("sortGrid");
    if(button.parentNode.childNodes.length > 1){
        if(money < 20)
            return
        addMoney(-20)
        button.parentNode.childNodes[1].remove()
        button.parentNode.childNodes[1].remove()
    }
    sortGrid()
}
function sortGrid(){
    const itemGrid = document.querySelector("#item-grid");
    for(let i = 0; i < series.length;i++){
        //Lamda functions are fun
        //In order this, gets the itemgrid as a htmlcollection, turns it into an array, filters it for each series, then sorts based on that series, then appends it to the itemgrid thus moving them to all be in order
        // Interestingly enough because I am sorting it by just moving the elements around on the page, the currently selected grid also accurately moves without me having to do anything extra
        Array.from(itemGrid.children).filter((item)=>item.style.color == colors[i] && item.innerText != "").sort((a,b)=>series[i].indexOf(a.innerText)-series[i].indexOf(b.innerText)).forEach((item)=> itemGrid.appendChild(item))
    }
    // A last one for the empty spaces
    let emptyChildren = Array.from(itemGrid.children).filter((item)=>item.innerText == "").forEach((item)=> itemGrid.appendChild(item))
}
