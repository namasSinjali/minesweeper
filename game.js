const fieldArea = document.getElementById("field_area");
const messageFlex = document.getElementById("message_flex");
const levelSelect = document.querySelector("select[name=difficulty]");
const flagCounter = document.querySelector("#flag_counter span");
const newGame = document.querySelector("#message_flex button");
const autoSolveBtn = document.querySelector("#game_flex .header button");
var nColumn = 6;
var nRow = 12;
var nBomb = 10;

var inspectingTile;

levelSelect.addEventListener("change", function(){
	initiate();
})

newGame.addEventListener("click", function(){
	messageFlex.removeAttribute("class");
	fieldArea.removeAttribute("class");
	initiate();
});

autoSolveBtn.addEventListener("click", autoSolve)

initiate();


function initiate(){
	isGameEnd = false;
	let titleWidth;//In px
	let fontSize;
	let difficulty = levelSelect.value;
	switch (difficulty){
		case "easy":
			nColumn = 6;
			nRow = 12;
			nBomb = 10;
			tileWidth = 50;
			fontSize = 40;
			break;
		case "medium":
			nColumn = 10;
			nRow = 20;
			nBomb = 35;
			tileWidth = 35;
			fontSize = 30;
			break;
		case "hard":
			nColumn = 14;
			nRow = 27;
			nBomb = 75;
			tileWidth = 25;
			fontSize = 20;
			break;
	}
	remainingTiles = nRow * nColumn;

	fieldArea.style.gridTemplateRows = `repeat(${nRow}, ${tileWidth}px`;
	fieldArea.style.gridTemplateColumns = `repeat(${nColumn}, ${tileWidth}px`;
	fieldArea.style.fontSize = fontSize+"px";

	flagCounter.textContent = nBomb;
	createTiles();
	setupbomb();
}
function createTiles() {
	
	tiles=[];
	fieldArea.innerHTML = null;
	for(let r = 0; r <= nRow+1; r++) {
		let rowTiles = [];
		for(let c = 0; c <= nColumn+1; c++){
			let newDiv = fieldArea.appendChild(document.createElement("div"));
			rowTiles.push(newDiv);
			newDiv.addEventListener("click", function() {tileClicked(r, c)});
			newDiv.addEventListener("contextmenu", function(e) {e.preventDefault();flagTile(r, c)});
			newDiv.addEventListener("dblclick", function() {shoveTile(r, c)});

			if(r===0 || r===nRow+1 || c===0 || c===nColumn+1) {
				newDiv.style.display = "none";
			}

			if((r+c)%2 === 0) {
				newDiv.setAttribute("class", "light");
			} else {
				newDiv.setAttribute("class", "dark")
			}
		}
		tiles.push(rowTiles);
	}
}

function setupbomb() {
	var list = [];
	let nearBomb = [];
	for(let i = 0; i<=nRow+1; i++){
		let row=[];
		for(let j = 0; j<=nColumn+1; j++){
			row.push(0);
		}
		nearBomb.push(row);
	}
	while(list.length < nBomb) {
		var rnd = Math.floor(Math.random() * remainingTiles) + 1
		var toPush = true;
		for(i in list) {
			if(list[i] === rnd){
				toPush = false;
			}
		}
		if(toPush){
			let c = rnd % nColumn;
			c = c === 0? nColumn : c;
			let r = (rnd-c) / nColumn + 1;
			tiles[r][c].className += " bomb";
			list.push(rnd);

			for(let i=r-1; i<=r+1; i++){
				for(let j=c-1; j<=c+1; j++){
					nearBomb[i][j]++;
				}
			}
		}
	}

	for(let i = 0; i <=nRow+1; i++) {
		for(let j = 0; j <= nColumn+1; j++) {
			tiles[i][j].className += " near" + nearBomb[i][j];
		}
	}
	
}

function tileClicked(r, c) {
	let clickedTile = tiles[r][c];
	if(clickedTile.innerHTML !== "" || clickedTile.getAttribute("class").search("shoved") >= 0){
		clickedTile.innerHTML = null;
		return
	}
	let btndiv = clickedTile.appendChild(document.createElement("div"));
	let closeBtn = btndiv.appendChild(document.createElement("button"));
	let shoveBtn = btndiv.appendChild(document.createElement("button"));
	let flagBtn = btndiv.appendChild(document.createElement("button"));
	btndiv.className = "button-container";
	closeBtn.className = "close-btn";
	shoveBtn.className = "shove-btn";
	flagBtn.className = "flag-btn";
	if(c>nColumn/2){
		btndiv.style.flexDirection = "row-reverse";
		btndiv.style.right = "0";
	} else{
		btndiv.style.flexDirection = "row";
		btndiv.style.left = "0";
	}
	if(r>=nRow){
		btndiv.style.top = "-50px";
	}else{
		btndiv.style.bottom = "-50px";
	}
	btndiv.addEventListener("click", function(e){
		let clckdBtn = e.target;
		if(clckdBtn === shoveBtn){
			shoveTile(r,c);
		} else if(clckdBtn === flagBtn){
			flagTile(r,c)
		}
	})
}


function flagTile(r, c) {
	let clsName = tiles[r][c].getAttribute("class");
	let len = clsName.length;
	let newCls = "flagged " + clsName;
	let currFlag = flagCounter.textContent;
	let newFlag = currFlag - 1;

	if(clsName.search("shoved") >= 0){return};

	if(len > 8) {
		let first8 = clsName.substr(0, 8);
		if(first8 === "flagged ") {
			newCls = clsName.substr(8, len - 8);
			newFlag = newFlag + 2;
		}
	}

	tiles[r][c].setAttribute("class", newCls);
	flagCounter.textContent = newFlag;
}

function shoveTile(r, c) {
	let clsName = tiles[r][c].getAttribute("class");

	if(clsName.search("near0") < 0 && remainingTiles === nRow*nColumn){
		createTiles();
		setupbomb();
		shoveTile(r,c);
		return;
	}
	if(clsName.search("flagged") >= 0 || clsName.search("shoved") >= 0 || r===0 || c===0 || r===nRow+1 || c===nColumn+1){
		return
	}
	tiles[r][c].setAttribute("class", clsName + " shoved");
	remainingTiles--;
	if(remainingTiles === nBomb){endGame("win");}
	if(clsName.search("bomb") >= 0){
		endGame("lose");
	}else if(clsName.search("near0") >= 0){
		for(let i = r-1; i <= r+1; i++){
			for(let j = c-1; j <=c+1; j++){
				if(!(i===r && j===c)){
					shoveTile(i,j);
				}
			}
		}
	}
}

function endGame(state){
	isGameEnd = true;
	if (state === "win") {
		fieldArea.setAttribute("class", state);
		setTimeout(function(){
		messageFlex.setAttribute("class", state);
		},
		3000);
	} else if(state === "lose"){
		let delay = 200;
		for(let r = 0; r <= nRow; r++){
			for(let c = 0; c <= nColumn; c++){
				let clsName = tiles[r][c].getAttribute("class");
				if(clsName.search("bomb") >= 0){
					setTimeout(function(){
						tiles[r][c].setAttribute("class", clsName + " shoved")
					}, delay);
					delay +=200;
				}
			}
		}
		setTimeout(function(){
		messageFlex.setAttribute("class", state);
		},
		delay);
	}
}

function autoSolve1(){
	alert("Auto solve is not available yet. Developers are working very hard on it. Please wait until next version for this function.")
}
function autoSolve(){
	solvedTiles = [];
	let shoveRandom = true;
	for(let r = 0; r <= nRow+1; r++){
		let dummy = [];
		for(let c = 0; c<=nColumn+1; c++){
			dummy.push(false);
			if(tiles[r][c].getAttribute("class").search("shoved") >= 0){
				shoveRandom = false;
			}
		}
		solvedTiles.push(dummy);
	}

	let rndR = Math.floor(Math.random()*nRow)+1;
	let rndC = Math.floor(Math.random()*nColumn)+1;

	if(inspectingTile){tiles[inspectingTile[0]][inspectingTile[1]].style.border = null;}

	inspectingTile = [rndR, rndC];
	tiles[inspectingTile[0]][inspectingTile[1]].style.border = "2px solid red";

	if(shoveRandom){shoveTile(rndR, rndC)}
	inspectTile(rndR, rndC)
}
function inspectTile(r, c){
	let radius = 0;
	let currTile;
	let clsName;
	while(remainingTiles >= nBomb && radius < nRow && !isGameEnd){
		for(let i = r-radius; i <= r+radius; i++){
			if(i>0 && i<=nRow){
			for(let j = c-radius; j <= c+radius; j++){
				if(j>0 && j<=nColumn && !solvedTiles[i][j] && (i===r+radius || i===r-radius || j===c-radius || j===c+radius)){
					let clsName = tiles[i][j].getAttribute("class");
					if(clsName.search("shoved") >= 0 && clsName.search("near0") < 0){
						let nNearBomb = clsName.charAt(clsName.search("near") + 4);
						let nNearFlag = 0;
						let nNearUnshoved = 0;
						let nearUnflaggedTiles = [];

						tiles[inspectingTile[0]][inspectingTile[1]].style.border = null;
						inspectingTile = [i, j];
						tiles[inspectingTile[0]][inspectingTile[1]].style.border = "2px solid red";

						let nextInspect = [];
						let doInspect = false;
						let delay = 500;

						for(let a = i-1; a <= i+1; a++){
						if(a>0 && a<=nRow){
							for(let b = j-1; b <= j+1; b++){
							if(b>0 && b<=nColumn){
								let newCls = tiles[a][b].getAttribute("class");
								if(newCls.search("shoved") < 0){
									nNearUnshoved++;
									if(newCls.search("flagged") >= 0){
										nNearFlag ++;
									} else {
										nearUnflaggedTiles.push([a, b]);
									}
								}
							}
							}
						}
						}

						
						if(nNearFlag == nNearUnshoved){
							solvedTiles[i][j] = true;
						}else if(nNearBomb == nNearFlag){
							let len = nearUnflaggedTiles.length;
							for(let a = 0; a < len; a++){
								solvedTiles[i][j] = true;
								nextInspect = [i, j];
								doInspect = true;
								setTimeout(function(){
									shoveTile(nearUnflaggedTiles[a][0], nearUnflaggedTiles[a][1]);
								}, delay);
								delay += 500;
							}
						}else if(nNearBomb == nNearUnshoved){
							let len = nearUnflaggedTiles.length;
							for(let a = 0; a < len; a++){
								solvedTiles[i][j] = true;
								nextInspect = [i, j];
								doInspect = true;
								setTimeout(function(){
									flagTile(nearUnflaggedTiles[a][0], nearUnflaggedTiles[a][1]);
								}, delay);
								delay += 500;
							}
						}else if(nNearUnshoved-nNearFlag <= 2){
							let nRemBomb = nNearBomb - nNearFlag;
							let nRemTiles = nearUnflaggedTiles.length;
							let tileValue = {};
							if(nRemBomb+1 == nRemTiles){
								let insTiles = [];
								for(let a = 0; a < nRemTiles; a++){
									let rval = nearUnflaggedTiles[a][0];
									let cval = nearUnflaggedTiles[a][1];
									tileValue[rval] = tileValue[rval] || {};
									tileValue[rval][cval] = 1;

									if(tiles[rval+1][cval].getAttribute("class").search("shoved") >= 0 && tiles[rval+1][cval].getAttribute("class").search("near0")<0){
										insTiles.push([rval+1, cval]);
									}
									if(tiles[rval-1][cval].getAttribute("class").search("shoved") >= 0 && tiles[rval-1][cval].getAttribute("class").search("near0")<0){
										insTiles.push([rval-1, cval]);
									}
									if(tiles[rval][cval+1].getAttribute("class").search("shoved") >= 0 && tiles[rval][cval+1].getAttribute("class").search("near0")<0){
										insTiles.push([rval, cval+1]);
									}
									if(tiles[rval][cval-1].getAttribute("class").search("shoved") >= 0 && tiles[rval][cval-1].getAttribute("class").search("near0")<0){
										insTiles.push([rval, cval-1]);
									}
								}

								let l = insTiles.length;
								for(let a = 0; a < l; a++){
									let currR = insTiles[a][0];
									let currC = insTiles[a][1];
									let clsName = tiles[currR][currC].getAttribute("class")
									let nNearBomb = clsName.charAt(clsName.search("near") + 4);
									let nNearUnshoved = 0;
									let nNearFlag = 0;
									let nearUnflaggedTiles = []
									let flagVal = 0;

									tiles[inspectingTile[0]][inspectingTile[1]].style.border = null;
									inspectingTile = [currR, currC];
									tiles[inspectingTile[0]][inspectingTile[1]].style.border = "2px solid red";

									for(let x = currR-1; x <= currR+1; x++){
									if(x >0 && x<=nRow){
										for(let y = currC-1; y <= currC+1; y++){
										if(y>0 && y<=nColumn){
											let newCls = tiles[x][y].getAttribute("class");
											if(newCls.search("shoved")<0){
												nNearUnshoved++;
												if(newCls.search("flagged") >= 0){
													nNearFlag++;
												} else if(tileValue[x] && tileValue[x][y]){
													flagVal += tileValue[x][y];
												} else {
													nearUnflaggedTiles.push([x, y])
												}
											}
										}
										}
									}
									}

									if(flagVal >=2){nNearFlag++}

									if(nNearFlag == nNearUnshoved){
										solvedTiles[currR][currC] = true;
									}else if(nNearBomb == nNearFlag){
										let len = nearUnflaggedTiles.length;
										for(let a = 0; a < len; a++){
											solvedTiles[currR][currC] = true;
											nextInspect = [currR, currC];
											doInspect = true;
											setTimeout(function(){
												shoveTile(nearUnflaggedTiles[a][0], nearUnflaggedTiles[a][1]);
											}, delay);
											delay += 500;
										}
									}else if(flagVal >= 2 && nNearBomb-nNearFlag == nearUnflaggedTiles.length){
										let len = nearUnflaggedTiles.length;
										for(let a = 0; a < len; a++){
											solvedTiles[currR][currC] = true;
											nextInspect = [currR, currC];
											doInspect = true;
											setTimeout(function(){
												flagTile(nearUnflaggedTiles[a][0], nearUnflaggedTiles[a][1]);
											}, delay);
											delay += 500;
										}
									}
								}
							}
						}

						if(doInspect){
							setTimeout(function(){
								inspectTile(nextInspect[0], nextInspect[1]);
							}, delay);
							return;
						}
					}
				}
			}
			}
		}
		radius++;
	}

	if(remainingTiles > nBomb && flagCounter.textContent == 0){
		for(let i = 1; i <= nRow; i++){
			for(let j = 1; j <= nColumn; j++){
				let clsName = tiles[i][j].getAttribute("class");
				if(clsName.search("shoved") < 0 && clsName.search("flagged") < 0){
					shoveTile(i, j);
				}
			}
		}
	}
}
