# CSS Rubik's Cube

This is a 3D Rubik's Cube demo made with CSS3.
It is a fork from the luka's project: https://github.com/lukapopijac/css-rubiks-cube/

The entire animation is made with CSS3. No math libs, no Javascript libs, just CSS.

This javascript-class will allow you to insert a cube inside your webpage and animate it with some simple moves (no solve functionality).

**[View Demo](https://adrianotiger.github.io/css-rubiks-cube/)**

**[Some examples](https://adrianotiger.github.io/css-rubiks-cube/examples.html)**

## How use this script
### Install
Copy `cube.js`, `cube.css`, `cubetools.css` and `stickers.svg` in a folder.  
Add a new html file `index.html`  

### Configure
Write this code inside `index.html`:
```
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="cube.css">
	<link rel="stylesheet" type="text/css" href="cubetools.css">
	<script src="cube.js"></script>
  </head>
  <body>
    <div style="width:800px;height:800px;display:" id="cubeExample">
    </div>
    <script>
      let c = new Cube(document.getElementById("cubeExample"));
    </script>
  </body>
</html>
```

You can create multiple cubes on the same page. See [Some examples](https://adrianotiger.github.io/css-rubiks-cube/examples.html).  

### API usage
Once you created the cube object, you can remove some stickers, let rotate some faces or let blink some cubies.  
#### removeStickers(array stickers)
calling `cube.removeStickers(["ufr-r", "dr-d", "rdf-a", ...])` the stickers on the cubies will disappear.  
Parameter: array of stickers.  
ufr-r =>  cube: *u*p/*f*ront/*r*ight - sticker: *r*ight
dr-a  =>  cube: *d*own/*r*ight - sticker: *a*ll

#### blinkStickers(array stickers, int qty)
Same as `removeStickers`, but instead of remove them, they will blink `qty` times.

#### setMoves(string moves)
Now the main function: this will move the faces with a sequence of moves.  
The string is a standard string used to describe the cube moves.  
Example: `F B R L U D F' B' R' F2 B2' D2`  
Where: *F* = Front, *B* = Back, *R* = Right, *L* = Left, *D* = Down, *U* = Up  
And `'` means anticlockwise and `2` means a double turn (single turn is 90°).

#### scramble(string moves)
Same as `setMoves` but will be executed 10x faster

#### setAnimation(object animation)
Play a sequence of commands. `animation` is an array of objects. 
Every step is an action, like scramble, set moves or wait for an event.  
Example code:
```
let c = new Cube(div);
const animation = 
[
    {   scramble: "F' U' F U",                          },
    {   event: { type: "click", title: "PLAY" }			},
    {   blink: { faces: ["f-f", "frd-f"], qty: 6 }      },
    {   blink: { faces: ["frd-d"], qty: 6}              },
    {   solve: "R U R'"                                 },
    {   event: { type: "sleep", sleep: 2500 }           }
];
c.setAnimation(animation);
```
I am still playing with this structure... It may change in future.


## Credits
Original project: https://github.com/lukapopijac/

## License
This software is released under the MIT license.
