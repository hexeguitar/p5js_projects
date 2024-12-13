// BitCrusher 3 Studio LFO depth emulation

const sketch = p => {
	let canvas_w = 800;
	let canvas_h = 550;
	let diagramSizeX = 500;
	let diagramSizeY = 400;
	let diagramPosX = 250;
	let diagramPosY = 70;
	let diagramMinorAxis = 8;

	let xspacing = 1; // How far apart should each horizontal location be spaced
	let w; // Width of entire wave

	let theta = 0.0; // Start angle at 0
	let amplitude = diagramSizeY; // Height of wave
	let period = diagramSizeX / 2; // How many pixels before the wave repeats
	let dx; // Value for incrementing X, a function of period and xspacing
	let yvalues = []; // Using an array to store height values for the wave
	let bias = 0;
	let wave_ampl = 0;
	let sinPointSize = 5;
	let sinWaveColor = 0;

	let knobSizePx = 100;
	let knobPosX;
	let knobPosY;
	let knobValue = 0.5;

	let dg, kbias, kmod;

	p.setup = () => {
		let paramCtrlcanvas = p.createCanvas(canvas_w, canvas_h);
		sinWaveColor = p.color('#03FF22');
		knobPosX = 120;
		knobPosY = 150;
		kbias = new Knob(p, knobPosX, knobPosY, knobSizePx, knobValue, 0.0, 1.0, 300,'Value');
		kmod = new Knob(p, knobPosX, knobPosY + knobSizePx+150, knobSizePx, knobValue, -1.0, 1.0, 300, 'Mod');
		dg = new Diagram(
			p,
			diagramPosX,
			diagramPosY,
			diagramSizeX,
			diagramSizeY,
			diagramMinorAxis,
			'Time',
			'Control Signal'
		);
		w = p.width + sinPointSize;
		dx = (p.TWO_PI / period) * xspacing;
		yvalues[w / xspacing - 1] = 0;
		dir = 1;
	}

	p.draw = () => {
		p.background(47, 38, 38);
		kbias.update();
		kbias.draw();
		kmod.update();
		kmod.draw();
		dg.display();
		p.calcWave(kbias.getVal(), kmod.getVal());
		p.renderWave();
		
		p.textSize(24);
		p.textAlign(p.CENTER);
		p.fill(204);
		p.text('Parameter control with modulation', diagramPosX + diagramSizeX/2, 40);
		p.textSize(16);
		p.text('(c)2024 www.hexefx.com',  diagramPosX + diagramSizeX/2, canvas_h - 20);
	}

	// p.mousePressed = () => {
	// 	if (kb.mousePressed() == true) dir = 0;

	// }

	p.calcWave = (knobBiasPos, knobModPos) => {
		theta += 0.02;
		let sign = 1;
		if (knobModPos < 0) sign = -1.0;
		if (knobBiasPos > 0.5) {
			if (knobBiasPos + p.abs(knobModPos)/2 > 1.0) {
				knobBiasPos = 1.0 - p.abs(knobModPos)/2;
			}
		}
		else {
			if (knobBiasPos - p.abs(knobModPos)/2< 0.0) {
				knobModPos = knobBiasPos*2*sign;
			}			
		}
		wave_ampl = knobModPos * 0.5;
		// For every x value, calculate a y value with sine function
		let x = theta;
		for (let i = 0; i < yvalues.length; i++) {
			yvalues[i] = p.sin(x) * wave_ampl * diagramSizeY + (1.0-knobBiasPos + bias) * diagramSizeY;
			x += dx;
		}
	}
	p.renderWave = () => {
		p.noStroke();
		p.fill(sinWaveColor);

		for (let x = 0; x < yvalues.length; x++) {
			p.ellipse(
				diagramPosX + (x / yvalues.length) * diagramSizeX,
				diagramPosY + yvalues[x],
				sinPointSize,
				sinPointSize
			);
		}

	}
}


let paramCtrl = new p5(sketch);
