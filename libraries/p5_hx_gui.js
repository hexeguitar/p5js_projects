class Knob {
	constructor(p, px, py, sizePx, val, valMin, valMax, rangeDg, name, color) {
		this.p = p;
		this.posX = px;
		this.posY = py;
		if (rangeDg > 360) rangeDg = 360;
		this.label = name;
		this.minAngle = (360 - rangeDg) / 2;
		this.maxAngle = this.minAngle + rangeDg;
		this.rot = p.map(val, 0, 1, this.minAngle, this.maxAngle);
		this.value = val;
		this.minValue = valMin;
		this.maxValue = valMax;
		this.scaled_value = this.p.map(this.value, 0.0, 1.0, this.minValue, this.maxValue);
		this.c_body_light = 15;
		this.c_body_dark = 0;
		this.c_stroke = 255;
		this.size = sizePx;
		this.ctrl_sf_ratio = 1.8;
		this.color = color;
	}
	update() {
		if (this.p.mouseIsPressed) this.mousePressed();
	}
	mousePressed() {
		let x = this.p.mouseX - this.posX;
		let y = this.p.mouseY - this.posY;
		if (this.overEvent() == false) return false;

		this.p.push();
		this.p.translate(this.posX, this.posY);
		this.rot = this.calcRealAngleFromXY(x, y) - 90;
		if (this.rot < 0) this.rot += 360;
		this.rot = this.p.constrain(this.rot, this.minAngle, this.maxAngle);
		this.value = this.p.map(this.rot, this.minAngle, this.maxAngle, 0, 1); // scaled output value
		this.scaled_value = this.p.map(this.value, 0.0, 1.0, this.minValue, this.maxValue);
		this.p.pop();
		return true;
	}
	overEvent() {
		let disX = this.posX - this.p.mouseX;
		let disY = this.posY - this.p.mouseY;
		if (
			this.p.sqrt(this.p.sq(disX) + this.p.sq(disY)) <
			(this.size * this.ctrl_sf_ratio) / 2
		) {
			return true;
		} else return false;
	}
	setVal(newVal) {
		if (newVal < 0) newVal = 0;
		if (newVal > 1.0) newVal = 1.0;
		this.value = newVal;
		this.rot = this.p.map(newVal, 0, 1, this.minAngle, this.maxAngle);
		this.scaled_value = this.p.map(this.value, 0.0, 1.0, this.minValue, this.maxValue);
	}
	getVal() {
		return this.scaled_value;
	}
	draw() {
		this.p.ellipseMode(this.p.CENTER);
		this.p.rectMode(this.p.CENTER);
		this.p.push();
		this.p.translate(this.posX, this.posY);
		// draw a scale
		this.p.noStroke();
		this.p.fill(this.color);
		this.p.ellipse(
			0,
			0,
			this.size * this.ctrl_sf_ratio,
			this.size * this.ctrl_sf_ratio
		);                                                  // knob scale
		this.p.stroke(192);
		this.p.line(                                        // min angle
			((this.size * this.ctrl_sf_ratio * 0.8) / 2) *
			this.p.sin(this.p.radians(this.minAngle)),
			((this.size * this.ctrl_sf_ratio * 0.8) / 2) *
			this.p.cos(this.p.radians(this.minAngle)),
			((this.size * this.ctrl_sf_ratio) / 2) *
			this.p.sin(this.p.radians(this.minAngle)),
			((this.size * this.ctrl_sf_ratio) / 2) *
			this.p.cos(this.p.radians(this.minAngle))
		);
		this.p.line(                                        // max angle
			((this.size * this.ctrl_sf_ratio * 0.8) / 2) *
			this.p.sin(this.p.radians(this.maxAngle)),
			((this.size * this.ctrl_sf_ratio * 0.8) / 2) *
			this.p.cos(this.p.radians(this.maxAngle)),
			((this.size * this.ctrl_sf_ratio) / 2) *
			this.p.sin(this.p.radians(this.maxAngle)),
			((this.size * this.ctrl_sf_ratio) / 2) *
			this.p.cos(this.p.radians(this.maxAngle))
		);
		this.p.line(                                        // mid scale
			((this.size * this.ctrl_sf_ratio * 0.8) / 2) *
			this.p.sin(this.p.radians(180)),
			((this.size * this.ctrl_sf_ratio * 0.8) / 2) *
			this.p.cos(this.p.radians(180)),
			((this.size * this.ctrl_sf_ratio) / 2) * this.p.sin(this.p.radians(180)),
			((this.size * this.ctrl_sf_ratio) / 2) * this.p.cos(this.p.radians(180))
		);
		this.p.rotate(this.p.radians(this.rot));

		this.p.fill(this.c_body_light);
		this.p.strokeWeight(2);
		this.p.stroke(60);
		this.p.ellipse(0, 0, this.size, this.size);          // knob shape
		this.p.fill(this.c_body_dark);
		if (this.size > 50) {
			this.p.rect(0, 0, this.size / 3, this.size * 0.97, this.size / 10); // pointer type knob for >50px
		}
		this.p.stroke(this.c_stroke);
		this.p.strokeWeight(6);
		this.p.line(0, 0, 0, this.size / 2 - (this.size / 2) * 0.15);
		this.p.strokeWeight(2);
		this.p.pop();
		this.p.rectMode(this.p.CORNER);
		// value text
		this.p.fill(204);
		let txtSize = this.size / 2.5;
		if (txtSize > 16) txtSize = 16;
		this.p.textSize(txtSize);
		this.p.textAlign(this.p.CENTER);
		this.p.text(this.label, this.posX, this.posY - this.size * 1.1);
		this.p.text(this.p.nf(this.scaled_value, 1, 2), this.posX, this.posY + this.size * 0.7); 

	}
	calcRealAngleFromXY(px, py) {
		let a = this.p.degrees(this.p.atan2(py, px));
		if (a < 0) {
			a += 360;
		}
		return a;
	}
}
// Diagram class
class Diagram {
	constructor(p, xp, yp, dw, dh, grd, xlbl, ylbl) {
		this.p = p;
		this.dheight = dh;
		this.dwidth = dw;
		this.xpos = xp;
		this.ypos = yp;
		this.grid = grd;
		this.xlabel = xlbl;
		this.ylabel = ylbl;
	}
	display() {
		if (this.grid > 1) {
			this.p.stroke(128, 128, 128);
			for (let i = 1; i < this.grid; i++) {
				this.p.line(
					this.xpos,
					this.ypos + i * (this.dheight / this.grid),
					this.xpos + this.dwidth,
					this.ypos + i * (this.dheight / this.grid)
				);
				this.p.line(
					this.xpos + i * (this.dwidth / this.grid),
					this.ypos,
					this.xpos + i * (this.dwidth / this.grid),
					this.ypos + this.dheight
				);
			}
		}
		// frame
		this.p.stroke(204);
		this.p.noFill();
		this.p.strokeWeight(2);
		this.p.rect(this.xpos, this.ypos, this.dwidth, this.dheight);
		// y values
		this.p.fill(204);
		this.p.textAlign(this.p.RIGHT, this.p.CENTER);
		this.p.textSize(14);
		this.p.strokeWeight(0);
		this.p.text('0%', this.xpos - 5, this.ypos + this.dheight);
		this.p.text('50%', this.xpos - 5, this.ypos + this.dheight / 2);
		this.p.text('100%', this.xpos - 5, this.ypos);
		// x, y labels
		this.p.textAlign(this.p.CENTER);
		if (this.xlabel != '') {
			this.p.text(
				this.xlabel,
				this.xpos + this.dwidth / 2,
				this.ypos + this.dheight + this.p.textSize()
			);
		}
		if (this.xlabel != '') {
			this.p.push();
			this.p.translate(
				this.xpos + this.dwidth + this.p.textSize(),
				this.ypos + this.dheight / 2
			);
			this.p.rotate(this.p.radians(270));
			this.p.text(this.ylabel, 0, 0);
			this.p.pop();
		}
		this.p.strokeWeight(1);
	}
}

class Led {
	constructor(p, px, py, sizePx, color) {
		this.p = p;
		this.xpos = px;
		this.ypos = py;
		this.size = sizePx;
		this.c_on = color;
		this.state = 0;
	}
	draw() {
		let led_color = this.c_on;
		let color_black = this.p.color(0, 0, 0);
		if (this.state == 0) {      // led off
			led_color = this.p.lerpColor(this.c_on, color_black, 0.66);
		}
		this.p.fill(led_color);
		this.p.strokeWeight(1);
		this.p.stroke(60);
		this.p.ellipse(this.xpos, this.ypos, this.size, this.size);
	}
	set() {
		this.state = 1;
	}
	reset() {
		this.state = 0;
	}
}

class Footswitch {
	constructor(p, px, py, sizePx, ft_mode) {
		this.p = p;
		this.posX = px;
		this.posY = py;
		this.size = sizePx;
		this.state = 0;
		this.mode = ft_mode;
	}
	draw() {

	}
	update() {
		if (this.p.mouseIsPressed) this.mousePressed();
	}
	mousePressed() {
		let x = this.p.mouseX - this.posX;
		let y = this.p.mouseY - this.posY;
		if (this.overEvent() == false) return false;

		return true;
	}
	overEvent() {
		let disX = this.posX - this.p.mouseX;
		let disY = this.posY - this.p.mouseY;
		if (
			this.p.sqrt(this.p.sq(disX) + this.p.sq(disY)) <
			(this.size * this.ctrl_sf_ratio) / 2
		) {
			return true;
		}
		else return false;
	}
}