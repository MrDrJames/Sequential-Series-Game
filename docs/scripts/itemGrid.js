let gridWidth = 2;
let gridHeight = 2;
function resizeGrid() {
    let grid = document.getElementById("item-grid");
    let maxHeight = document.getElementById("middle-panel").offsetHeight * .9;
    let maxWidth = document.getElementById("middle-panel").offsetWidth * .9;

    let minItemSize = 40; // Minimum item size
    let maxItemSize = 100; // Maximum item size

    let itemHeight = Math.min(Math.floor(maxHeight / (gridHeight * 1.12)), maxItemSize);
    let itemWidth = Math.min(Math.floor(maxWidth / (gridWidth * 1.12)), maxItemSize);
    //#TODO disble the buttons one step earlier
    if(itemHeight < minItemSize){
        gridHeight--;
        // @ts-ignore I know this is a button but it's being annoying and giving red squigglies, I don't like
        document.getElementById("upgradeHeight").disabled = true;
        return;
    }
    if(itemWidth < minItemSize){
        gridWidth--;
        // @ts-ignore Same as above
        document.getElementById("upgradeWidth").disabled = true;
        return;
    }
    // Set the grid size
    grid.style.gridTemplateColumns = `repeat(${gridWidth}, ${Math.min(itemWidth,itemHeight)}px)`;
    grid.style.gridTemplateRows = `repeat(${gridHeight}, ${Math.min(itemWidth,itemHeight)}px)`;

    // Clear and add items
    grid.innerHTML = ''; // Clear existing slots
    for (let i = 0; i < gridWidth * gridHeight; i++) {
        let itemSlot = document.createElement('div');
        itemSlot.className = 'item-slot';
        grid.appendChild(itemSlot);
    }
    document.getElementById("gridSize").textContent =`${gridWidth}x${gridHeight}`
}

// Call the function on window resize
window.addEventListener('resize', resizeGrid);

// Call the function initially
resizeGrid();
document.getElementById("upgradeWidth").onclick = function(){
    gridWidth++;
    resizeGrid();
}
document.getElementById("upgradeHeight").onclick = function(){
    gridHeight++;
    resizeGrid();
}