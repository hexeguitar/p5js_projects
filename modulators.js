// BitCrusher 3 Studio LFO depth emulation

const sketch = p => {
	let canvas_w = 1000;
	let canvas_h = 550;
	let diagramSizeX = 500;
	let diagramSizeY = 400;
	let diagramPosX = 250;
	let diagramPosY = 70;
	let diagramMinorAxis = 8;

	let xspacing = 1; // How far apart should each horizontal location be spaced
	let w; // Width of entire wave

	let theta = 0.0; // Start angle at 0
	//let amplitude = diagramSizeY; // Height of wave
	let period = diagramSizeX / 2; // How many pixels before the wave repeats
	let dx; // Value for incrementing X, a function of period and xspacing
	let volData = []; // Using an array to store height values for the wave
	let panData = [];

	let wave_ampl = 0;
	let sinPointSize = 5;
	let volWaveColor = 0;
	let panWaveColor = 0;

	let knobSizePx = 100;
	let knobPosX;
	let knobPosY;
	let knobValue = 0.5;

	let dg, knob_Vol, knob_Trem, knob_Pan, knob_Autopan;

	p.setup = () => {
		let paramCtrlcanvas = p.createCanvas(canvas_w, canvas_h);
		let knobPadx = p.width * 0.1;
		let knobPady = p.height * 0.25;
		knobSizePx = p.width * p.height * 0.00018;

		volWaveColor = p.color('#03FF22');
		panWaveColor = p.color('#F79D65');
		diagramSizeX = p.width * 0.5;
		diagramSizeY = p.height * 0.8;
		diagramPosX = p.width - diagramSizeX-20;
		diagramPosY = p.height/2 - diagramSizeY/2;

		knobPosX = knobSizePx;
		knobPosY = knobSizePx+knobPady/2;

		knob_Vol = new Knob(p, knobPosX, knobPosY, knobSizePx, knobValue, 0.0, 1.0, 300,'Volume', '#263121');
		knob_Trem = new Knob(p, knobPosX, knobPosY + knobSizePx+knobPady, knobSizePx, knobValue, -1.0, 1.0, 300, 'Trem', '#263121');
		knob_Pan = new Knob(p, knobPosX*2+knobPadx, knobPosY, knobSizePx, knobValue, 0.0, 1.0, 300,'Pan', '#4E2004');
		knob_Autopan = new Knob(p, knobPosX*2+knobPadx, knobPosY + knobSizePx+knobPady, knobSizePx, knobValue, -1.0, 1.0, 300, 'Autopan', '#4E2004');

		dg = new Diagram(
			p,
			diagramPosX,
			diagramPosY,
			diagramSizeX,
			diagramSizeY,
			diagramMinorAxis,
			'Pan',
			'Volume'
		);
		w = p.width + sinPointSize;
		h = p.height + sinPointSize
		dx = (p.TWO_PI / period) * xspacing;
		volData[w / xspacing - 1] = 0;
		panData[h / xspacing - 1] = 0;
	}

	p.draw = () => {
		p.background(47, 38, 38);
		knob_Vol.update();
		knob_Vol.draw();
		knob_Trem.update();
		knob_Trem.draw();
		knob_Pan.update();
		knob_Pan.draw();

		knob_Autopan.update();
		knob_Autopan.draw();

		dg.display();
		p.calcWave(knob_Vol.getVal(), knob_Trem.getVal(), knob_Pan.getVal(), knob_Autopan.getVal());
		p.renderWave();
		
		p.textSize(24);
		p.textAlign(p.CENTER);
		p.fill(204);
		p.text('Volume/Pan with modulation', diagramPosX + diagramSizeX/2, 40);
		p.textSize(16);
		p.text('(c)2024 www.hexefx.com',  diagramPosX + diagramSizeX/2, canvas_h - 20);
	}

	p.calcWave = (knobVolPos, knobTremPos, knobPanPos, knobAutopanPos) => {
		theta += 0.02;
		let sign = 1;
		// Volume waveform
		if (knobTremPos < 0) sign = -1.0;
		if (knobVolPos + p.abs(knobTremPos)/2 > 1.0) {
			knobVolPos = 1.0 - p.abs(knobTremPos)/2;
		}
		if (knobVolPos - p.abs(knobTremPos)/2 < 0.0) {
			knobTremPos = knobVolPos*2*sign;
		}	
		wave_ampl = knobTremPos * 0.5;
		// For every x value, calculate a y value with sine function
		let x = theta;
		for (let i = 0; i < volData.length; i++) {
			volData[i] = p.sin(x) * wave_ampl * diagramSizeY + (1.0-knobVolPos) * diagramSizeY;
			x += dx;
		}
		// Panorama waveform
		if (knobAutopanPos < 0) sign = -1.0;
		else 					sign = 1.0;
		if (knobPanPos + p.abs(knobAutopanPos)/2 > 1.0) {
			knobPanPos = 1.0 - p.abs(knobAutopanPos)/2;
		}
		if (knobPanPos - p.abs(knobAutopanPos)/2 < 0.0) {
			//knobAutopanPos = knobPanPos*2*sign;
			knobPanPos = p.abs(knobAutopanPos)/2;
		}	
		wave_ampl = knobAutopanPos * 0.5;
		x = theta;
		for (let i = 0; i < panData.length; i++) {
			panData[i] = p.sin(x) * wave_ampl * diagramSizeX + knobPanPos * diagramSizeX;
			x += dx;
		}		

	}
	p.renderWave = () => {
		p.noStroke();
		p.fill(volWaveColor);

		for (let x = 0; x < volData.length; x++) {
			p.ellipse(
				diagramPosX + (x / volData.length) * diagramSizeX,
				diagramPosY + volData[x],
				sinPointSize,
				sinPointSize
			);
		}
		p.fill(panWaveColor);
		for (let y = 0; y < panData.length; y++) {
			p.ellipse(
				diagramPosX + panData[y],
				diagramPosY + (y / panData.length) * diagramSizeY,
				sinPointSize,
				sinPointSize
			);
		}		


	}
}


let paramCtrl = new p5(sketch);
