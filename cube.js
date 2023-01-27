/*
corners  _.-'-._                 edges    _.-'-._
     _.-'-._3_.-'-._                  _.-'-._ _.-'-._
 _.-'-._ _.-'-._ _.-'-._          _.-'-._1_.-'-._3_.-'-._
|-._ _.-'-._U_.-'-._ _.-|        |-._ _.-'-._U_.-'-._ _.-|
| 1 |-._ _.-'-._ _.-| 2 |        |   |-._ _.-'-._ _.-|   |
|-._|   |-._ _.-|   |_.-|        |-._| 0 |-._ _.-| 2 |_.-|
|   |-._|   0   |_.-|   |        | 9 |-._|   |   |_.-| 10|
|-._| F |-._|_.-| R |_.-|        |-._| F |-._|_.-| R |_.-|
| 5 |-._|   |   |_.-| 6 |   5--> |   |-._|  8|   |_.-|   | <--7
'-._|   |-._|_.-|   |_.-'        '-._| 4 |-._|_.-| 6 |_.-'
    '-._|   |   |_.-'                '-._|   |   |_.-'
        '-._4_.-'                        '-._|_.-'

U       F        R       L       B       D
up    front    right    left    back    down
*/

function _CN(e,t,r,n=null){var o=document.createElement(e);if("object"==typeof t)for(var a in t)o.setAttribute(a,t[a]);return Array.isArray(r)&&r.forEach(e=>{o.appendChild("string"==typeof e||"number"==typeof e?document.createTextNode(e):e)}),null!==n&&n.appendChild(o),o}

const layers = {
	u: {corners: [0, 1, 3, 2], edges: [0, 1, 3, 2]},
	f: {corners: [1, 0, 4, 5], edges: [0, 8, 4, 9]},
	r: {corners: [0, 2, 6, 4], edges: [6, 8, 2, 10]},
	l: {corners: [3, 1, 5, 7], edges: [1, 9, 5, 11]},
	b: {corners: [2, 3, 7, 6], edges: [3, 11, 7, 10]},
	d: {corners: [4, 6, 7, 5], edges: [4, 6, 7, 5]}
};

let cubeInstance = 0;

class Cube
{
	#_ready;
	#_moves;
	#_scene;
	#_cube;
	#_css;
	#_scrambleSpeed = 0.15;
	#_moveSpeed = 1.3;
	#_combiDiv = null;
	#_clickDiv = null;
	#_animations = null;
	#_cssCubeLayer = "";

	constructor(element)
	{
		this.#_cssCubeLayer = "cube-layer" + cubeInstance++;
		this.#_scene = _CN("div", {class:"scene", style:"opacity:0.05;"}, null, element);
		this.#_ready = false;
		this.#_moves = [];
		this.#_cube = _CN("div", {class:"cube"}, null, this.#_scene);
		this.#_css = new CSSStyleSheet();
		this.#_combiDiv = _CN("div", {class:"combinations"}, ["-"], element);
		this.#_clickDiv = _CN("div", {class:"click-button"}, ["PLAY"], element);
		document.adoptedStyleSheets.push(this.#_css);

		this.#createCube();
		this.#initCube();

		window.addEventListener("load", ()=>{
			const r = element.getBoundingClientRect();
			element.style.setProperty("--unit", parseInt(Math.min(r.width, r.height) / 50) + "px");
			
			this.#_scene.style.opacity = 1.0;
		});
		this.#_clickDiv.addEventListener("click", ()=>{
			this.#_clickDiv.style.display = "none";
			this.#playAnimation("click");
		});
	}

	setAnimation(a)
	{
		this.#_animations = a;
		this.#_animations.index = 0;
		a.forEach(a2=>{
			if(a2.solve)
			{
				this.#_combiDiv.textContent = a2.solve;
			}
		});
		this.#playAnimation();
	}

	scramble(s)
	{
		this.#setReady(false);
		this.setMoves(s);
	}

	// Example: "F B R L U D F' B' R' F2 B2' D2"
	setMoves(s)
	{
		if(this.#_moves.length > 0) this.#setReady(false);
		this.#_combiDiv.textContent = this.#_ready ? s : "...";
		s.split(" ").forEach(v=>{
			switch(v.length)
			{
				case 1: this.#addMove(v.toLowerCase() + "1"); break;
				case 2: 
					if(Number.parseInt(v[1]) > 0)
					this.#addMove(v.toLowerCase());
					else
					this.#addMove(v[0].toLowerCase() + "3");
					break;
				case 3:	// MOVE + "2'"
				this.#addMove(v[0].toLowerCase() + "3");
				this.#addMove(v[0].toLowerCase() + "3");
					break;
				default:
					console.error("Undefined move: " + v);
			}
		});
		this.#nextMove();
	}

		// array of stickers: ["ufr-r", "dr-d", "rdf-a", ...]
		// set "XXX-a" for all stickers on this cubie
	removeStickers(stickers)
	{
		stickers.forEach(s=>{
			const sc = s.split("-")[0].split('');
			const sf = s.split("-")[1];
			let c = this.#getCubie(sc);
			if(c)
			{
				const ca = c.querySelectorAll(".cubie-face");
				ca.forEach(ca2=>{
					if(sf=='a' || ca2.classList.contains("sticker-" + sf))
					{
						ca2.classList.add('hide-sticker');
					}
				});
			}
		});
	}

	blinkStickers(stickers, qty=6)
	{
		stickers.forEach(s=>{
			const sc = s.split("-")[0].split('');
			const sf = s.split("-")[1];
			let c = this.#getCubie(sc);
			if(c)
			{
				const ca = c.querySelectorAll(".cubie-face");
				ca.forEach(ca2=>{
					if((sf=='a' || ca2.classList.contains("sticker-" + sf)) && !ca2.classList.contains("hide-sticker"))
					{
						this.#setReady(false);
						let b = qty;
						let i = setInterval(()=>{
							b--;
							if((b % 2) == 0)
							{
								ca2.classList.add('blink-sticker');
							}
							else
							{
								ca2.classList.remove('blink-sticker');
								if(b < 0) 
								{
									clearInterval(i);
									this.#setReady(true);
								}
							}
						}, 200);
					}
				});
			}
		});
	}

		// array of faces
	#getCubie(faces)
	{
		let ret = null;
		const cubies = this.#_cube.querySelectorAll('.cubie');
		cubies.forEach(c=>{
			if(c.childNodes.length < 6) return;	// not a cubie
			if(c.querySelectorAll(".cubie-sticker").length != faces.length) return; // not the wanted cobie
			var valid = true;
			faces.forEach(face=>{
				if(!c.querySelector(".sticker-" + face)) valid = false; // has not the requested face
			});
			if(valid) ret = c;;
		});		
		return ret;
	}

	#move(turn)
	{
		const side = turn[0];
		const layer = layers[side];
		const m = this.#_cube.querySelector('.cubie-middle-' + side);
		const cubies = [m.parentNode];
		for(var i=0; i<layer.corners.length; ++i) {
			const c = this.#_cube.querySelector('.cubie-corner-position-' + layer.corners[i]);
			cubies.push(c?.parentNode);
		}
		for(var i=0; i<layer.edges.length; ++i) {
			const e = this.#_cube.querySelector('.cubie-edge-position-' + layer.edges[i]);
			cubies.push(e?.parentNode);
		}
		for(var i=0; i<cubies.length; ++i) {
			cubies[i]?.classList.add('turn');
			cubies[i]?.classList.add('turn-' + turn);
		}
	}

	#createCube()
	{
		var ind = 0;
		// create 8 corners
		['ufr', 'ulf', 'urb', 'ubl', 'drf', 'dfl', 'dbr', 'dlb'].forEach(c=>
		{
			let dl = _CN("div", {class:"cubie cubie-corner-orientation-0"});
			var j = 0;
			Object.keys(layers).forEach( k => {
				_CN("div", {class:"cubie-face face-" + k + (c[j] ? " cubie-sticker sticker-" + c[j] : " cubie-hidden")}, null, dl);
				j++;
			});
			_CN("div", {class:this.#_cssCubeLayer}, [_CN("div", {class:"cubie cubie-corner-position-"+ind}, [dl])], this.#_cube);
			ind++;
		});
		ind = 0;
		// create 12 edges
		['uf', 'ul', 'ur', 'ub', 'df', 'dl', 'dr', 'db', 'fr', 'fl', 'br', 'bl'].forEach(e=>
		{
			let dl = _CN("div", {class:"cubie cubie-edge-orientation-0"});
			var j = 0;
			Object.keys(layers).forEach( k => {
				_CN("div", {class:"cubie-face face-" + k + (e[j] ? " cubie-sticker sticker-" + e[j] : " cubie-hidden")}, null, dl);
				j++;
			});
			_CN("div", {class:this.#_cssCubeLayer}, [_CN("div", {class:"cubie cubie-edge-position-"+ind}, [dl])], this.#_cube);
			ind++;
		});
		// create 6 middles
		['0r', '1l', '2f', '3b', '4u', '5d'].forEach(m=>
		{
			let dl = _CN("div", {class:"cubie cubie-middle-" + m[1]});
			Object.keys(layers).forEach( k => {
				_CN("div", {class:"cubie-face face-" + k + (m[1]==k ? " cubie-sticker sticker-" + m[1] : " cubie-hidden")}, null, dl);
			});
			_CN("div", {class:this.#_cssCubeLayer}, [dl], this.#_cube);
		});
	}

	#getNewCubeCSS(speed)
	{
		let css = `.${this.#_cssCubeLayer} { transform-style: preserve-3d; transform-origin:  calc(var(--unit) * 5) calc(var(--unit) * 5); } `;
		if(speed > 0.2)
			css += `.${this.#_cssCubeLayer}.turn {transition: transform ${speed}s cubic-bezier(0.445, 0.05, 0.55, 0.95);}`;
		else 
			css += `.${this.#_cssCubeLayer}.turn {transition: transform ${speed}s linear;}`;
		return css;
	}

	#initCube()
	{
		const layerDivs = this.#_cube.querySelectorAll(`.${this.#_cssCubeLayer}`);
		for(let i=0; i<layerDivs.length; ++i) 
		{
			layerDivs[i].addEventListener('transitionend', ()=>{this.#updateCubie(layerDivs[i])});
			layerDivs[i].addEventListener('transitionend', ()=>{this.#nextMove()});
		}

		this.#_css.replace(this.#getNewCubeCSS(this.#_moveSpeed));
	}
	
	#updateCubie(el) 
	{
		var match = el.className.match(/turn\-(..)/);
		if(!match) return;
		el.classList.remove('turn');
		el.classList.remove(match[0]);
		
		const step = +match[1][1];
		const side = match[1][0];
		const layer = layers[side];
		let div = el.children[0];
		
		let re = /(cubie-corner-position-)(\d+)/;
		if(match = div.className.match(re)) {
			const idx = layer.corners.indexOf(+match[2]);
			var newVal = layer.corners[(idx + step)&3];
			div.className = div.className.replace(re, '$1' + newVal);
			
			div = div.children[0];
			re = /(cubie-corner-orientation-)(\d+)/;
			match = div.className.match(re);
			newVal = (+match[2] + (side!='u' && side!='d') * (step&1) * (1+(idx&1))) % 3;
			div.className = div.className.replace(re, '$1' + newVal);
		}
		
		re = /(cubie-edge-position-)(\d+)/;
		if(match = div.className.match(re)) {
			const idx = layer.edges.indexOf(+match[2]);
			var newVal = layer.edges[(idx + step)&3];
			div.className = div.className.replace(re, '$1' + newVal);
			
			div = div.children[0];
			re = /(cubie-edge-orientation-)(\d+)/;
			match = div.className.match(re);
			newVal = +match[2]^(side=='f' || side=='b')&step;
			div.className = div.className.replace(re, '$1' + newVal);
		}
	}

	#nextMove()  
	{
			// Still turning...
		if(this.#_cube.querySelector(`.${this.#_cssCubeLayer}.turn`)) 
			return;

		if(this.#_moves.length > 0)
		{
			console.log("next move...", this.#_moves);
			let nMove = this.#_moves.shift();
			setTimeout(()=>{this.#move(nMove);}, 10);
		}
		else
		{
			if(!this.#_ready) this.#setReady(true);
		}
	};

	#setReady(ready)
	{
		this.#_css.replace(this.#getNewCubeCSS(ready ? this.#_moveSpeed : this.#_scrambleSpeed));
		this.#_ready = ready;
	}

	#addMove(m)
	{
		this.#_moves.push(m);
	}

	#playAnimation(event)
	{
		if(!this.#_ready) 
		{
			setTimeout(()=>{this.#playAnimation();}, 200);
			return;
		}
		const a = this.#_animations[this.#_animations.index];
		this.#_animations.index = (this.#_animations.index + 1) % this.#_animations.length;
		if(a.event)
		{
			if(a.event.type != event)
			{
				if(a.event.type == "click")
				{
					this.#_clickDiv.style.display = "block";
					return;
				}
				else if(a.event.type == "sleep")
				{
					setTimeout(()=>{this.#playAnimation("sleep");}, a.event.sleep);
					return;
				}
			}
		}
		else if(a.blink) // blink lamps
		{
			if(a.blink.faces?.length) this.blinkStickers(a.blink.faces, a.blink.qty);
			setTimeout(()=>{
				this.#playAnimation();
			}, a.blink.qty * 200 + 500);
		}
		else if(a.scramble || a.solve)
		{
			if(a.scramble)
				this.scramble(a.scramble);
			else if(a.solve)
				this.setMoves(a.solve);

			setTimeout(()=>{
				this.#playAnimation();
			}, a.scramble ? this.#_scrambleSpeed * a.scramble.length * 1000 : this.#_moveSpeed * a.solve.length * 1000);
		}
		else
		{
			console.error("Invalid animation", a);
			this.#showError("Inavlid animation");
		}	
	}

	#showError(error)
	{
		_CN("div", {class:"cubeerror"}, [error], this.#_scene);
		console.error("error");
	}

};

